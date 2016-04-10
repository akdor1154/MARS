var gulp = require('gulp')
  , cssnano = require('gulp-cssnano')
  , concat = require('gulp-concat')
  , debug = require('gulp-debug')
  , gutil = require('gulp-util')
  , htmlmin = require('gulp-htmlmin')
  , ignore = require('gulp-ignore')
  , livereload = require('gulp-livereload')
  , plumber = require('gulp-plumber')
  , rename = require('gulp-rename')
  , sourcemaps = require('gulp-sourcemaps')
  , templateCache = require('gulp-angular-templatecache')
  , uglify = require('gulp-uglify');
  
  
var config = {
  JS: [
    'client/app/**/*.module.js', 
    'client/app/**/*.js',
    'client/plugins/**/*plugin.js',
    'client/plugins/**/*.js',
    '!client/app/app.min.js'
  ],
  CSS: [
    'client/app/**/*.css',
    'client/assets/css/**/*.css',
    'client/plugins/**/*.css',
    '!client/assets/css/app.min.css'
  ],
  HTML: [
    'client/app/**/*.html',
    'client/plugins/**/*.html'
  ]
};

  
  
/**
 * Default task
 *
 */
gulp.task('default', ['build']);

/**
 * Run all build tasks
 *
 */
gulp.task('build', [
  'build-angular-clipboard',
  'build-css',
  'build-js',
  'build-socket.io'
]);

/**
 * Minify angular-clipboard.js
 * 
 */
gulp.task('build-angular-clipboard', function() {
  return gulp.src(['client/assets/bower_components/angular-clipboard/angular-clipboard.js' ])
    .pipe(rename('client/assets/bower_components/angular-clipboard/angular-clipboard.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('.'));
});

/**
 * Concat and minify app and plugin css
 *
 */
gulp.task('build-css', function() {
  return gulp.src(config.CSS)
    .pipe(plumber(onError))
    .pipe(sourcemaps.init())
      .pipe(concat('app.min.css'))
      .pipe(cssnano())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('client/assets/css/'))
    .pipe(livereload());
});

/**
 * Concat and minify app and plugin javascript
 *
 */
gulp.task('build-js', ['build-template-cache'], function() {
  return gulp.src(config.JS)
    .pipe(plumber(onError))
    .pipe(sourcemaps.init())
      .pipe(concat('app.min.js'))
      .pipe(uglify().on('error', gutil.log))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('client/app/'))
    .pipe(livereload());
});

/**
 * Minify socket.io.js
 * 
 */
gulp.task('build-socket.io', function() {
  return gulp.src(['client/assets/bower_components/socket.io-client/socket.io.js' ])
    .pipe(rename('client/assets/bower_components/socket.io-client/socket.io.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('.'));
});

/**
 * Minify and concatenate html files into an angular $templateCache
 *
 */
gulp.task('build-template-cache', function() {
  return gulp.src(config.HTML)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(templateCache({ 
      filename: 'templates.js',
      module: 'app.templates',
      standalone: true,
      transformUrl: function(url) {
        return 'app/' + url;
      }
    }))
    .pipe(gulp.dest('client/app/core/templates'));
});

/**
 * Watch for changes to files, run any necessary build actions then livereload.
 */
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(config.JS, ['build-js']);
  gulp.watch(config.CSS, ['build-css']);
  gulp.watch(config.HTML, ['build-js']);
});



/**
 * Log errors and allow the stream to continue.
 */
function onError(err) {
  console.error(err);
  this.emit('end');
}