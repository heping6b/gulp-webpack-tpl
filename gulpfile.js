const del = require('del');
const path = require('path');
const gulp = require('gulp');
const less = require('gulp-less');
const webpack = require('webpack');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const merge = require('webpack-merge');
const mincss = require('gulp-clean-css');
const markdown = require('gulp-markdown');
const autoprefixer = require('gulp-autoprefixer');
const webpackConfig = require('./webpack.config');

const { prjectName, mode } = (() => {
  const data = { prjectName: 'demo', mode: 'development' };
  const [mode, prjectName] = process.env.NODE_ENV ? process.env.NODE_ENV.split(/\,/) : [];
  if (mode) data.mode = mode;
  if (prjectName) data.prjectName = prjectName;
  return data;
})();

const paths = {
  styles: {
    src: path.resolve(__dirname, `src/${prjectName}/css/index.less`),
    dest: path.resolve(__dirname, `dist/${prjectName}/css`)
  },
  scripts: {
    src: path.resolve(__dirname, `src/${prjectName}/js/index.js`),
    dest: path.resolve(__dirname, `dist/${prjectName}/js`)
  }
};

console.log('paths', paths);

/**
 * js 打包日志
 * @param {*} err 
 * @param {*} msg 
 */
function log(err, msg) {
  if (err) throw new gutil.PluginError('buildjs', err);
  gutil.log('[gulp]', msg.toString({ colors: true }));
}

/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */
function clean() {
  // You can use multiple globbing patterns as you would with `gulp.src`,
  // for example if you are using del 2.0 or above, return its promise
  return del(['dist']);
}

/*
 * Define our tasks using plain functions
 */
function css() {
  return gulp.src(paths.styles.src)
    .pipe(less({ javascriptEnabled: true }).on('error', (e) => {
      console.error(e.message);
      this.emit('end');
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(mincss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.styles.dest));
}


/*
 * js 异步打包，webpack的 watch 功能，会自动监视目标文件，有文件修改会自动重新打包
 */
function js() {
  webpack(
    merge(webpackConfig, {
      entry: {
        index: paths.scripts.src
      },
      output: {
        path: paths.scripts.dest
      },
      mode,
    })
  ).watch(200, (err, stats) => log(err, stats));
}

function md() {
  gulp.src(['doc/**/*.md'])
    .pipe(markdown())
    .pipe(gulp.dest(dst + 'doc/'));
}

function watch() {
  gulp.watch(paths.scripts.src, js);
  gulp.watch(paths.styles.src, css);
}

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean;
exports.styles = css;
exports.scripts = js;
exports.watch = watch;

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
const build = gulp.series(clean, gulp.parallel(css, js));

/*
 * You can still use `gulp.task` to expose tasks
 */
gulp.task('build', build);

/*
 * Define default task that can be called by just running `gulp` from cli
 */
gulp.task('default', build);