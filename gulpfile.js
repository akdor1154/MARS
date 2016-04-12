var gulp = require('gulp')
  , concat = require('gulp-concat')
  , cssnano = require('gulp-cssnano')
  , debug = require('gulp-debug')
  , es = require('event-stream')
  , gutil = require('gulp-util')
  , htmlmin = require('gulp-htmlmin')
  , ignore = require('gulp-ignore')
  , livereload = require('gulp-livereload')
  , remoteSrc = require('gulp-remote-src')
  , plumber = require('gulp-plumber')
  , rename = require('gulp-rename')
  , sourcemaps = require('gulp-sourcemaps')
  , streamify = require('gulp-streamify')
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
  ],
  MD_ICON_DEFS: 'https://design.google.com/icons/data/grid.json'
};

  
  
/**
 * Default task
 *
 */
gulp.task('default', ['build']);

/**
 * Append version number from package.json to urls for app.min.css
 * and app.min.js .
 * 
 * This forces clients to reload these files with each new release.
 * Fixes issue #57 
 */
gulp.task('append-version', function() {
  gulp.src('client/index.html')
    .pipe(change(appendVersion))
    .pipe(gulp.dest('client/'));
});

/**
 * Run all build tasks
 *
 */
gulp.task('build', [
  'build-angular-clipboard',
  'build-css',
  'build-js',
  'build-socket.io',
  'replace-ligatures',
  'append-version'
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
 * Download material design icon definitions and use them to generate a
 * map of ligatures to codepoints.
 *  
 */
gulp.task('build-md-ligatures', function() {
  return remoteSrc(config.MD_ICON_DEFS, { base: '' })
    .pipe(rename('md-ligatures.json'))
    .pipe(change(generateLigaturesMap))
    .pipe(gulp.dest('build/'));
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
 * Replace material design icon font ligatures with corresponding codepoints
 * 
 * Fixes issue #59
 * @see https://github.com/google/material-design-icons/issues/230 
 */
gulp.task('replace-ligatures', ['build-md-ligatures', 'build-js'], function() {
  mdLigatures = require('./build/md-ligatures.json');
  return gulp.src('client/app/app.min.js')
    .pipe(change(replaceMdLigatures))
    .pipe(gulp.dest('client/app/'));
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
 * Map of material design icon ligatures to codepoints.
 */
var mdLigatures = null;

/**
 * Append version number from package.json to urls for app.min.css
 * and app.min.js .
 * 
 */
function appendVersion(content) {
  var pjson = require('./package.json');
  return content
    .replace(/app.min.(js|css)(\?v=\d+\.\d+\.\d+)?/gi, 'app.min.$1?v=' + pjson.version);
}

/**
 * Change the contents of a vinyl file
 * 
 * The gulp-change module didn't like the File objects from gulp-remote-src.
 */
function change(callback) {
  return streamify(es.map(function(file, done) {
    var content = file.contents.toString();
    try {
      content = callback(content);
      file.contents = new Buffer(content);
      done(null, file);
    }
    catch(err) {
      return done(err);
    }
  }));
}

/**
 * Generate a ligatures map json file from an icon definition file.
 * 
 */
function generateLigaturesMap(content) {
  var iconDefs = JSON.parse(content)
    , ligatures = {};
  iconDefs.icons.forEach(function(icon) {
    ligatures[icon.ligature] = icon.codepoint;
  });
  return JSON.stringify(ligatures);
}

/**
 * Log errors and allow the stream to continue.
 */
function onError(err) {
  console.error(err);
  this.emit('end');
}

/**
 * Replace all ligatures wrapped in <md-icon> tags with codepoints.
 */
function replaceMdLigatures(content) {
  return content.replace(
    /<md-icon(.*?)>(.+?)<\/md-icon>/gi, 
    replaceLigatureWithCodepoint);
}

/**
 * Replace a ligature wrapped in <md-icon> tags with it's codepoint.
 * 
 */
function replaceLigatureWithCodepoint(match, attributes, ligature, offset, string) {
  ligature = ligature.trim();
  var codepoint = mdLigatures[ligature] 
    ? '&#x' + mdLigatures[ligature]
    : ligature;
  return '<md-icon' + attributes + '>' + codepoint + '</md-icon>'
}