var gulp        = require('gulp'),
  prefix        = require('gulp-autoprefixer'),
  beep          = require('beepbeep'),
  bs            = require('browser-sync').create(),
  concat        = require('gulp-concat'),
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
  importCss     = require('gulp-import-css'),
  glob          = require('glob'),
  minifyHTML    = require('gulp-minify-html'),
  rename        = require('gulp-rename'),
  replace       = require('gulp-replace'),
  fs            = require('fs'),
  imagemin      = require('gulp-imagemin'),
  gm            = require('gm').subClass({imageMagick: true}),
  imageResize   = require('gulp-image-resize'),
  pngquant      = require('imagemin-pngquant'),
  jpegtran      = require('imagemin-jpegtran');
  /**
   * Project Configuration
   * =====================
   */

// -----------------------------------------------------------------------------
// Error handler
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// Jekyll
// -----------------------------------------------------------------------------
gulp.task('jekyll-build', function (done) {
    bs.notify('Running jekyll-build');
    // return cp.spawn('jekyll.bat', ['build','--incremental'], {stdio: 'inherit'})
    return cp.spawn('jekyll.bat', ['build'], {stdio: 'inherit'})
    // return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});


// Run jekyll build and reload browser
gulp.task('jekyll-rebuild', ['jekyll-build'], function (done) {
    bs.reload();
    sequence(
      'optimize-html',
      done);
});

// -----------------------------------------------------------------------------
// Jade
// -----------------------------------------------------------------------------
gulp.task('jade', function() {
  gulp.src('_includes/jade/**/*.jade')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(jade({
      doctype: 'html',
      pretty: true
    }))
    .pipe(gulp.dest('_includes'));
  gulp.src('_layouts/jade/*.jade')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(jade({
      doctype: 'html',
      pretty: true
    }))
    .pipe(gulp.dest('_layouts'))
    .pipe(bs.stream());
});



// -----------------------------------------------------------------------------
// Sass
// Compile Sass Files and autoprefix css
// Compile to '_site' and ''
// -----------------------------------------------------------------------------

gulp.task('sass', function() {
  gulp.src('assets/css/main.sass')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sass())
    .pipe(prefix(['last 2 versions', '> 1%', 'ie 8', 'ie 7', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'], {
      cascade: true
    }))
    //used for development
    .pipe(minifyCSS({keepBreaks:false}))
    .pipe(rename('main.min.css'))
    .pipe(bs.reload({stream:true}))
    .pipe(gulp.dest('assets/css'))
    .pipe(gulp.dest('_site/assets/css/'))
    //used for production
    .pipe(uncss({
    html: glob.sync('_site/**/*.html'),
    ignore: []
    }))
    .pipe(minifyCSS({keepBreaks:false}))
    .pipe(rename('critical.min.css'))
    .pipe(gulp.dest('assets/css'))
    .pipe(gulp.dest('_site/assets/css/'))
    ;
});

// -----------------------------------------------------------------------------
// Combine/minify JS
// -----------------------------------------------------------------------------
gulp.task('js', function () {
  gulp.src(['assets/_js/*.js'])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('assets/js'))
    .pipe(bs.stream());
});

//Compress Images
gulp.task('img', function () {
    return gulp.src('assets/_img/**/*')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant(), jpegtran()]
            // use: [pngquant()]
        }))
        .pipe(gulp.dest('assets/img'));
});

gulp.task('thumbnails', function () {
  gulp.src('assets/_post-thumbnails/*')
    .pipe(imageResize({
      width : 700,
      // height : 550,
      crop : false,
      upscale : false
    }))
    .pipe(gulp.dest('assets/img/posts/thumbnails'));
});

// -----------------------------------------------------------------------------
// Inline CSS
// -----------------------------------------------------------------------------

gulp.task('optimize-html', function() {
    return gulp.src('_site/**/*.html')
        .pipe(minifyHTML({
            quotes: true
        }))
        .pipe(replace(/<link href=\"\/assets\/css\/critical.min.css\"[^>]*>/, function(s) {
            var style = fs.readFileSync('_site/assets/css/critical.min.css', 'utf8');
            return '<style>\n' + style + '\n</style>';
        }))
        .pipe(gulp.dest('_site/'));
});

// -----------------------------------------------------------------------------
// BrowserSync
// -----------------------------------------------------------------------------
gulp.task('browser-sync', function(done) {
    bs.init({
        server: '_site',
        notify: true
    });
    done();
});


// -----------------------------------------------------------------------------
// Watch Files for auto reload
// -----------------------------------------------------------------------------
gulp.task('watch', ['build'], function() {
  gulp.watch(['_includes/jade/**/*.jade','_layouts/jade/*.jade'], ['jade']);
  //watch for sass file changes
  gulp.watch(['assets/**/*.sass'], ['sass']);
  gulp.watch('assets/**/*.js', ['js', 'jekyll-rebuild']);
  // Watch all html.files in root directory
  gulp.watch(['*.html', '*.md','*.yml', '_layouts/**/*.html', '_posts/**/*' ,'_includes/**/*', '_data/**/*'], ['jekyll-rebuild']);
  gulp.watch('assets/_img/**/*', ['img', 'jekyll-rebuild']);
  gulp.watch('assets/_img/posts/thumbnails', ['thumbnails', 'jekyll-rebuild']);
});

gulp.task('build', function(done) {
  sequence(
    'sass',
    ['jade','js','img','thumbnails'],
    'jekyll-rebuild',
    'browser-sync',
    done);
});


gulp.task('default', ['watch']);
