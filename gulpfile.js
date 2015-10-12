var gulp = require('gulp'),
    gutil = require('gulp-util'),
    babelify = require('babelify'),
    brfs = require('brfs'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    source = require('vinyl-source-stream'),
    partial = require('partial'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('gulp-babel'),
    buffer = require('vinyl-buffer')
    watch = require('gulp-watch'),
    mergeStream = require('merge-stream'),
    concat = require('gulp-concat');

var b = browserify({
    entries: 'index.js',
    basedir: 'src/',
    debug: true
  })
  .transform(babelify);

function watch_browser(){
  w = watchify(b);
  w.on("update", partial(updateBundle, w));
  updateBundle(w);
}
//
var updateBundle = function(b){
  b.bundle()
    //.on('error', gutil.log)
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist_browser'));
};

gulp.task('build_browser', partial(updateBundle, b));
gulp.task('watch_browser', watch_browser);
