'use strict';
// Use the following line to call the gulpfile-ts.tsx which is written in TypeScript
//eval(require("typescript").transpile(require("fs").readFileSync("./gulpfile-ts.tsx").toString()));

const gulp = require('gulp');
const gutil = require('gulp-util');

const exec = require('child_process').exec;
const del = require('del');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const concat = require('gulp-concat');
const size = require('gulp-size');
const uglify = require('gulp-uglify');

//const sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack');
const es = require('event-stream');

const ws = {
    srcDir: './src',
    buildDir: './build'
};

const PATHS = {
    html: ['index.html'],
    scripts: ['scripts/**/*.js', 'scripts/**/*.tsx'],
    libs: ['libs/**/*.js'], // 3rd-party JS
    styles: ['styles/**/*.css', 'styles/**/*.scss'],
    extras: [
        'humans.txt', 'robots.txt', 'favicon.ico',
    ], // other static files to be copied to the dist/
};

/** SASS **/
const autoprefixerOptions = {
      browsers: ['> 5%'],
};
const sassOptions = {
    outputStyle: 'compressed',
    errLogToConsole: true,
};

function createPath(dir, pathArray) {
    return pathArray.map((path) => dir + path);
}

gulp.task('clean', (cb) => {
    return del([ws.buildDir + "/**"], cb);
});

gulp.task('sass', ['clean'], () => {
    return gulp
        .src(PATHS.styles, { cwd: ws.srcDir })
        //.pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(concat('styles.min.css'))
        .pipe(cssnano())
        .pipe(size({ title: 'styles' }))
        //.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(`${ws.buildDir}/styles/`));
});

gulp.task('webpack',  ['clean'], () => {
    /*exec('npm run webpack', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (stderr.trim() !== '') {
            cb(Promise.reject(stderr));
        } else {
            cb(err);
        }
    });*/
    //webpack(require('./webpack.config.js')).run(cb);
    return new Promise(function(resolve, reject) {
        webpack(require('./webpack.config.js'), function(err, stats) {
            if (err) { 
                //throw new gutil.PluginError("webpack", err); 
                return reject(new gutil.PluginError("webpack", err));
            }
            // webpack does not exit with 0 so check errors manually
            const jsonStats = stats.toJson() || {};
            const errors = jsonStats.errors || [];
            if (errors.length) {
                const errorMessage = errors.reduce(function (resultMessage, nextError) {
                    resultMessage += nextError.toString();
                    return resultMessage;
                }, '');
                return reject(new gutil.PluginError("webpack", errorMessage));
            }
            gutil.log("[webpack]", stats.toString({
                colors: gutil.colors.supportsColor
            }));
            return resolve();
        });
    });
});

gulp.task('copy', ['clean'], () => {
    return es.merge(
        // Copy 3P libs
        gulp.src(PATHS.libs, { cwd: ws.srcDir }).pipe(gulp.dest(ws.buildDir)),
        // Copy html
        gulp.src(PATHS.html, { cwd: ws.srcDir }).pipe(gulp.dest(ws.buildDir)),
        // Copy extra files
        gulp.src(PATHS.extras, { cwd: ws.srcDir }).pipe(gulp.dest(ws.buildDir))
    );
});

gulp.task('build', ['copy', 'sass', 'webpack'], () => {});

