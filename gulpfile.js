var gulp = require('gulp')
  , cssnano = require('gulp-cssnano')
  , concat = require('gulp-concat')
  , debug = require('gulp-debug')
  , gzip = require('gulp-gzip')
  , htmlmin = require('gulp-htmlmin')
  , ignore = require('gulp-ignore')
  , rename = require('gulp-rename')
  , templateCache = require('gulp-angular-templatecache')
  , uglify = require('gulp-uglify')
  , gutil = require('gulp-util');
  
/**
 * Default task
 *
 */
gulp.task('default', function() {
  gutil.log('Gulp is working!');
});

/**
 * Run all build tasks
 *
 */
gulp.task('build', [
  'build-css', 
  'build-template-cache',
  'build-js',
  'build-socket.io',
  'gzip'
]);

/**
 * Concat and minify app and plugin css
 *
 */
gulp.task('build-css', function() {
  return gulp.src([
    'client/app/**/*.css',
    'client/assets/css/**/*.css',
    'client/plugins/**/*.css',
    '!client/assets/css/app.min.css'
  ])
    .pipe(concat('app.min.css'))
    .pipe(cssnano())
    .pipe(gulp.dest('client/assets/css/'));
});

/**
 * Concat and minify app and plugin javascript
 *
 */
gulp.task('build-js', ['build-template-cache'], function() {
  return gulp.src([
    'client/app/**/*.module.js', 
    'client/app/**/*.js',
    'client/plugins/**/*plugin.js',
    'client/plugins/**/*.js',
    '!client/app/app.min.js'
  ])
    .pipe(concat('app.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('client/app/'));
});

/**
 * Minify socket.io.js
 * 
 */
gulp.task('build-socket.io', function() {
  return gulp.src(['client/assets/bower_components/socket.io-client/socket.io.js' ])
    .pipe(rename('client/assets/bower_components/socket.io-client/socket.io.min.js'))
    .pipe(debug())
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('.'));
});

/**
 * Minify and concatenate html files into an angular $templateCache
 *
 */
gulp.task('build-template-cache', function() {
  return gulp.src(['client/app/**/*.html', 'client/plugins/**/*.html'])
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
 * Compress static files
 *
 */
gulp.task('gzip', ['build-css', 'build-js', 'build-socket.io'], function() {
  return gulp.src([
    'client/**/*.min.js', 
    'client/**/*.min.css',
    'client/**/*.svg',
    'client/**/*.ttf',
    '!client/assets/bower_components/angular-material/demos/**/*.*',
    '!client/assets/bower_components/angular-material/modules/**/*.js',
    '!client/assets/bower_components/angular-material/modules/**/*.css'
  ])
    .pipe(gzip({ append: true, threshold: '1kb' }))
    .pipe(gulp.dest('client/'));
});