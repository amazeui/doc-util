'use strict';

var format = require('util').format;
var gulp = require('gulp');
var webpack = require('webpack-stream');
var $ = require('gulp-load-plugins')();
var markJSON = require('gulp-marked-json');
var docUtil = require('./index');
var pkg = require('./package.json');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var paths = {
  less: './template/less/app.less',
  js: './template/js/app.js'
};

var headerTpl = format('/*! %s v%s | built on <%= date %> */\n', pkg.name, pkg.version);

gulp.task('less', function() {
  return gulp.src(paths.less)
    .pipe($.less())
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe($.csso())
    .pipe($.header(headerTpl, {date: new Date().toString()}))
    .pipe($.rename(function(file) {
      file.extname = '.min.css';
    }))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('js', function() {
  return gulp.src(paths.js)
    .pipe(webpack({
      output: {
        filename: 'app.js',
      },
    }))
    .pipe($.uglify())
    .pipe($.rename(function(file) {
      file.extname = '.min.js'
    }))
    .pipe($.header(headerTpl, {date: new Date().toString()}))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('test', function(){
  return gulp.src('./test/*.md')
    .pipe(markJSON(docUtil.markedOptions))
    .pipe(docUtil.applyTemplate(null, {
      pluginTitle: 'Amaze UI Plugin',
      pluginDesc: 'Just another Amaze UI plugin.'
    }))
    .pipe($.rename({extname: '.html'}))
    .pipe(gulp.dest('./dist'));
});

// upload docs assets to Qiniu
gulp.task('qn', function() {
  gulp.src(['dist/**/*.min.*'])
    .pipe($.qndn.upload({
      prefix: 'assets/plugin',
      qn: {
        accessKey: process.env.qnAK,
        secretKey: process.env.qnSK,
        bucket: process.env.qnBucketUIS,
        domain: process.env.qnDomainUIS
      }
    }));
});

gulp.task('watch', function() {
  gulp.watch('template/less/**/*.less', ['less']);
});

gulp.task('default', ['less', 'js', 'watch']);
