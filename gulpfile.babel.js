// the new way to import modules
import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import cssnano from 'gulp-cssnano';
import sourcemaps from 'gulp-sourcemaps';

// This plugin can be used to automatically load the plugins without importing them explicitly!
import gulpLoadPlugins from 'gulp-load-plugins';
const $ = gulpLoadPlugins();

// the old way to import modules
import babel from 'gulp-babel';
import clean from 'gulp-clean';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import webpack from 'gulp-webpack';

const dirs = {
  src: 'src/',
  dist: 'build/',
};

const paths = {
  html: ['index.html'],
  scripts: ['scripts/**/*.js', '!scripts/libs/**/*.js'],
  libs: ['scripts/libs/**/*.js'], // 3rd-party JS
  styles: ['styles/**/*.css', 'styles/**/*.scss'],
  extras: [
    'crossdomain.xml', 'humans.txt', 'manifest.appcache',
    'robots.txt', 'favicon.ico',
  ], // other static files to be copied to the dist/
};

function createPath(dir, pathArray) {
  return pathArray.map((path) => dir + path);
}

// Delete the dist directory
gulp.task('clean', () => {
  gulp
    .src(dirs.dist)
    .pipe(clean());
});

/** SASS **/
const autoprefixerOptions = {
  browsers: [],
};
const sassOptions = {
  outputStyle: 'compressed',
  errLogToConsole: true,
};
gulp.task('sass', () => {
  gulp
    .src(paths.styles, { cwd: dirs.src })
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(concat('styles.min.css'))
    .pipe(cssnano())
    .pipe($.size({ title: 'styles' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${dirs.dist}styles/`));
});
gulp.task('sass:prod', () => {
  gulp
    .src(paths.styles, { cwd: dirs.src })
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(concat('styles.min.css'))
    .pipe(cssnano())
    .pipe($.size({ title: 'styles' }))
    .pipe(gulp.dest(`${dirs.dist}styles/`));
});

/** SCRIPTS **/
// Process scripts and concatenate them into one output file
gulp.task('scripts', () => {
  gulp
    .src(paths.scripts, { cwd: dirs.src })
    .pipe(babel())
    .pipe(concat('bundle.js'))
    .pipe(uglify())
    .pipe($.size({ title: 'scripts' }))
    .pipe(gulp.dest(`${dirs.dist}scripts/`));
});

gulp.task('webpack', () => {
  gulp
    .src('build/scripts/bundle.js')
    .pipe(clean());
  
  gulp
    .src('src/scripts/main.js')
    .pipe(webpack(Object.assign(require('./webpack.config.js'), { output: { filename: 'bundle.js'}})))
    .pipe(gulp.dest('build/scripts/'));
});

// Copy all other files to dist directly
gulp.task('copy', () => {
  // Copy html
  gulp
    .src(paths.html, { cwd: dirs.src })
    .pipe(gulp.dest(dirs.dist));

  // Copy extra files
  gulp
    .src(paths.extras, { cwd: dirs.src })
    .pipe(gulp.dest(dirs.dist));
});

/** WATCHER **/
gulp.task('watch', () => {
  function eventHandler(event) {
    console.log(`File ${event.path} was ${event.type}, running tasks...`);
  }
  gulp
    .watch(createPath(dirs.src, paths.styles), ['sass'])
    .on('change', eventHandler);

  gulp
    //.watch(createPath(dirs.src, paths.scripts), ['scripts'])
    .watch(createPath(dirs.src, paths.scripts), ['webpack'])
    .on('change', eventHandler);

  gulp
    .watch(createPath(dirs.src, paths.html), ['copy'])
    .on('change', eventHandler);

  gulp
    .watch(createPath(dirs.src, paths.extras), ['copy'])
    .on('change', eventHandler);
});

/** Task to change scripts used in the HTML. **/
// http://tylermcginnis.com/reactjs-tutorial-pt-2-building-react-applications-with-gulp-and-browserify/

//gulp.task('dev', ['sass', 'scripts', 'copy']);
gulp.task('dev', ['sass', 'webpack', 'copy']);
gulp.task('release', ['sass:prod', 'webpack', 'copy']);

gulp.task('default', ['dev']);
