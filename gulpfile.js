var fs = require('fs');
var del = require('del');
var path = require('path');
var gulp = require('gulp');
var less = require('gulp-less');
var webpack = require('webpack');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var merge = require('webpack-merge');
var mincss = require('gulp-clean-css');
var markdown = require('gulp-markdown');
var autoprefixer = require('gulp-autoprefixer');
var connect = require('gulp-connect');

var webpackConfig = require('./webpack.config');

var NODE_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development';

// console.log('process.env', process.env);

var _entry = 'src';
var _output = 'dist';

// 项目配置
var _config = {
  html: {
    src: _entry + '/**/*.html',
    dest: _output
  },
  styles: {
    src: _entry + '/styles/index.less',
    dest: _output + '/styles'
  },
  scripts: {
    src: _entry + '/scripts/index.js',
    dest: _output + '/scripts'
  },
  mds: {
    src: 'documents/**/*.md',
    dest: path.resolve(__dirname, 'docs')
  }
};

/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */
function clean() {
  // You can use multiple globbing patterns as you would with `gulp.src`,
  // for example if you are using del 2.0 or above, return its promise
  return del(['dist']);
}

function html() {
  return gulp.src(_config.html.src)
    .pipe(gulp.dest(_config.html.dest))
    .pipe(connect.reload());
}

/*
 * Define our tasks using plain functions
 */
function styles() {
  return gulp.src(_config.styles.src)
    .pipe(
      less({
        javascriptEnabled: true
      })
        .on('error', (e) => {
          console.error(e.message);
          this.emit('end');
        })
    )
    .pipe(autoprefixer())
    .pipe(gulp.dest(_config.styles.dest))
    .pipe(mincss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(_config.styles.dest));
}

/*
 * js 异步打包，webpack的 watch 功能，会自动监视目标文件，有文件修改会自动重新打包
 */
function scripts() {
  webpack(
    merge(webpackConfig, {
      entry: path.resolve(__dirname, _config.scripts.src),
      output: {
        path: path.resolve(__dirname, _config.scripts.dest),
        filename: '[name].js'
      },
      mode: NODE_ENV,
    })
  ).watch(200, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('buildjs', err);
    }
    gutil.log('[gulp]', stats.toString({ colors: true }));
  });
}

function mds() {
  return gulp.src(_config.mds.src)
    .pipe(markdown())
    .pipe(gulp.dest(_config.mds.dest));
}

function server() {
  connect.server({
    name: 'App',
    root: _output,
    port: 3030,
    livereload: true,
    index: 'index.html'
  });
}

function watch() {
  gulp.watch(_config.html.src, html);
  gulp.watch(_config.styles.src, scripts);
  gulp.watch(_config.styles.src, styles);
  gulp.watch(_config.mds.src, mds);
}

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var build = gulp.series(
  clean,
  gulp.parallel(
    html,
    styles,
    scripts,
    mds,
    watch,
    server
  )
);

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.mds = mds;
exports.watch = watch;
exports.server = server;

/*
 * Define default task that can be called by just running `gulp` from cli
 */
exports.default = build;