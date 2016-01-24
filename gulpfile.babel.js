'use strict';

// the new way to import modules
import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import cssnano from 'gulp-cssnano';
import sourcemaps from 'gulp-sourcemaps';

// This plugin can be used to automatically load the plugins without importing them explicitly!!! ($.size)
import gulpLoadPlugins from 'gulp-load-plugins';
const $ = gulpLoadPlugins();

// the old way to import modules
var babel = require("gulp-babel");
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

const dirs = {
  src: 'src/',
  dist: 'build/'
};

const paths = {
  html: ['index.html'],
  scripts: ['scripts/**/*.js', '!scripts/libs/**/*.js'],
  libs: [], // 3rd-party JS
  styles: ['styles/**/*.css', 'styles/**/*.scss'],
  extras: ['crossdomain.xml', 'humans.txt', 'manifest.appcache', 'robots.txt', 'favicon.ico'] // other static files to be copied to the dist/
};

function createPath(dir, pathArray) {
  return pathArray.map( (path) => { return dir + path; } );
}

// Delete the dist directory
gulp.task('clean', function() {
  return gulp
    .src(dirs.dist)
    .pipe(clean());
});

/** SASS **/
const autoprefixerOptions = {
  browsers: []
};
const sassOptions = { 
  outputStyle: 'compressed', 
  errLogToConsole: true 
};
gulp.task('sass', () => {
  return gulp
    .src(paths.styles, {cwd: dirs.src})
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(concat('styles.min.css'))
    .pipe(cssnano())
    .pipe($.size({title: 'styles'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dirs.dist + 'styles/'));
});
gulp.task('sass-prod', () => {
  return gulp
    .src(paths.styles, {cwd: dirs.src})
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(concat('styles.min.css'))
    .pipe(cssnano())
    .pipe($.size({title: 'styles'}))
    .pipe(gulp.dest(dirs.dist + 'styles/'));
});

/** SCRIPTS **/
// Process scripts and concatenate them into one output file
gulp.task('scripts', function() {
  gulp
    .src(paths.scripts, {cwd: dirs.src})
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe($.size({title: 'scripts'}))
    .pipe(gulp.dest(dirs.dist + 'scripts/'));
});

// Copy all other files to dist directly
gulp.task('copy', function() {
  // Copy html
  gulp
    .src(paths.html, {cwd: dirs.src})
    .pipe(gulp.dest(dirs.dist));

  // Copy extra files
  gulp
    .src(paths.extras, {cwd: dirs.src})
    .pipe(gulp.dest(dirs.dist));
});

/** WATCHER **/
gulp.task('watch', function() {
  gulp
    .watch(createPath(dirs.src, paths.styles), ['sass'])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });

  gulp
    .watch(createPath(dirs.src, paths.scripts), ['scripts'])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });

  gulp
    .watch(createPath(dirs.src, paths.html), ['copy'])
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

/** Task to change scripts used in the HTML. **/
// http://tylermcginnis.com/reactjs-tutorial-pt-2-building-react-applications-with-gulp-and-browserify/

gulp.task('dev', ['sass', 'scripts', 'copy']);
gulp.task('release', ['sass-prod', 'scripts', 'copy']);

gulp.task('default', ['dev']);