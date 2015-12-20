var gulp        = require('gulp'),
  prefix        = require('gulp-autoprefixer'),
  beep          = require('beepbeep'),
  bs            = require('browser-sync').create()
  concat        = require("gulp-concat"),
//  connect       = require('gulp-connect'),
  notify        = require('gulp-notify')
  cp            = require('child_process'),
  gulpif        = require('gulp-if');
  jade          = require('gulp-jade'),
  minifyCSS     = require('gulp-minify-css'),
  sass          = require('gulp-sass'),
  sequence      = require('run-sequence'),
  gutil         = require('gulp-util'),
  uglify        = require('gulp-uglify');
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
    return cp.spawn('jekyll.bat', ['build'], {stdio: 'inherit'})
        .on('close', done);
});


// Run jekyll build and reload browser
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    bs.reload();
});



// Compile Jade Files
gulp.task('jade', function() {
  gulp.src('_includes/jade/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('_includes'))
    .pipe(bs.stream());
});

// Compile Sass Files and autoprefix css
// Compile to '_site' and ''
gulp.task('sass', function() {
  gulp.src('assets/css/main.sass')
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
		.pipe(concat("scripts.min.js"))
		.pipe(uglify())
		.pipe(gulp.dest('assets/js'));
});


gulp.task('browser-sync', function(done) {
    bs.init({
        server: '_site',
        notify: false
    });
    done();
});
//Live reload with gulp-connect
// gulp.task('connect', function() {
//   connect.server({
//     root: '_site',
//     port: 3000,
//     livereload: true
//   });
// });

gulp.task('watch', ['build'], function() {
  gulp.watch('_includes/jade/*.jade', ['jade']);
  //watch for sass file changes
  gulp.watch('_sass/**/*.sass', ['sass']);
  gulp.watch('assets/css/*.sass', ['sass']);
  gulp.watch('assets/_js/*.js', ['js']);
  // Watch all html.files in root directory
  gulp.watch(['*.html', '_layouts/**/*.html', '_posts/**/*' ,'_includes/**/*', '_data/**/*'], ['jekyll-rebuild']);  //watch for js files in assets
});

gulp.task('build', function(done) {
  sequence(
    ['jade', 'sass','js'],
    'jekyll-rebuild',
    'browser-sync',
    done);
});



gulp.task('default', ['watch']);
