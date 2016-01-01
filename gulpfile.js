var gulp        = require('gulp'),
  prefix        = require('gulp-autoprefixer'),
  beep          = require('beepbeep'),
  bs            = require('browser-sync').create(),
  concat        = require("gulp-concat"),
  notify        = require('gulp-notify'),
  cp            = require('child_process'),
  gulpif        = require('gulp-if'),
  jade          = require('gulp-jade'),
  minifyCSS     = require('gulp-minify-css'),
  plumber       = require('gulp-plumber'),
  sass          = require('gulp-sass'),
  sequence      = require('run-sequence'),
  gutil         = require('gulp-util'),
  uglify        = require('gulp-uglify'),
  uncss         = require('gulp-uncss'),
  minifyHTML    = require('gulp-minify-html'),
  replace       = require('gulp-replace'),
  fs            = require('fs'),
  imagemin      = require('gulp-imagemin'),
  pngquant      = require('imagemin-pngquant'),
  jpegtran      = require('imagemin-jpegtran');
  /**
   * Project Configuration
   * =====================
   */

var prod = false;

// Error handler
var onError     = function(err) {
  var errorLine = (err.line) ? 'Line ' + err.line : '',
    errorTitle  = (err.plugin) ? 'Error: [ ' + err.plugin + ' ]' : 'Error';

  notify.logLevel(0);
  notify({
    title: errorTitle,
    message: errorLine
  }).write(err);
  beep();
  gutil.log(gutil.colors.red('\n' + errorTitle + '\n\n', err.message));
  this.emit('end');
};

// Jekyll build
gulp.task('jekyll-build', function (done) {
    bs.notify('Running jekyll-build');
    return cp.spawn('jekyll.bat', ['build','--incremental'], {stdio: 'inherit'})
        .on('close', done);
});


// Run jekyll build and reload browser
gulp.task('jekyll-rebuild', ['jekyll-build'], function (done) {
  sequence(
    'optimize-css',
    'optimize-html',
    done);
    bs.reload();
});

// Inline CSS
gulp.task('optimize-css', function() {
   return gulp.src('_site/assets/css/main.css')
       .pipe(uncss({
           html: ['_site/**/*.html'],
           ignore: []
       }))
       .pipe(minifyCSS({keepBreaks: false}))
       .pipe(gulp.dest('_site/assets/css/critical/'));
});

gulp.task('optimize-html', function() {
    return gulp.src('_site/**/*.html')
        .pipe(minifyHTML({
            quotes: true
        }))
        .pipe(replace(/<link href=\"\/assets\/css\/critical\/main.css\"[^>]*>/, function(s) {
            var style = fs.readFileSync('_site/assets/css/critical/main.css', 'utf8');
            return '<style>\n' + style + '\n</style>';
        }))
        .pipe(gulp.dest('_site/'));
});

// Compile Jade Files
gulp.task('jade', function() {
  gulp.src('_includes/jade/*.jade')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(jade({
      doctype: 'html',
      pretty: true
    }))
    .pipe(gulp.dest('_includes'))
    .pipe(bs.stream());
});

// Compile Sass Files and autoprefix css
// Compile to '_site' and ''
gulp.task('sass', function() {
  gulp.src('assets/css/main.sass')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sass())
    .pipe(prefix(['last 2 versions', '> 1%', 'ie 8', 'ie 7', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'], {
      cascade: true
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('_site/assets/css'))
    .pipe(gulp.dest('assets/css'))
    .pipe(bs.stream());
});


gulp.task('js', function () {
	gulp.src(['assets/_js/*.js'])
    .pipe(plumber({ errorHandler: onError }))
		.pipe(concat("scripts.min.js"))
		.pipe(uglify())
		.pipe(gulp.dest('assets/js'))
    .pipe(bs.stream());
});


gulp.task('img', function () {
    return gulp.src('assets/img/**/*')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(imagemin({
            progressive: false,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant(), jpegtran()]
        }))
        .pipe(gulp.dest('assets/img'));
});

gulp.task('browser-sync', function(done) {
    bs.init({
        server: '_site',
        notify: false
    });
    done();
});


gulp.task('watch', ['build'], function() {
  gulp.watch('_includes/jade/*.jade', ['jade']);
  //watch for sass file changes
  gulp.watch('_sass/**/*.sass', ['sass']);
  gulp.watch('assets/css/*.sass', ['sass']);
  gulp.watch('assets/_js/*.js', ['js', 'jekyll-rebuild']);
  // Watch all html.files in root directory
  gulp.watch(['*.html', '*.md','*.yml', '_layouts/**/*.html', '_posts/**/*' ,'_includes/**/*', '_data/**/*'], ['jekyll-rebuild']);
  gulp.watch('assets/_img/**/*', ['img', 'jekyll-rebuild']);  //watch for js files in assets
});

gulp.task('build', function(done) {
  sequence(
    ['jade', 'sass','js', 'img'],
    'jekyll-rebuild',
    'browser-sync',
    done);
});


gulp.task('default', ['watch']);
