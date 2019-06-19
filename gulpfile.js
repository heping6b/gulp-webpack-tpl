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

const prjectName = process.env.PROJECT_NAME || 'demo';
const prjectMode = process.env.NODE_ENV || 'development';

console.log('process.env', process.env);

function getSrc(file) {
  return path.resolve(__dirname, `src/${prjectName}/${file}`);
}

function getDest(file) {
  return path.resolve(__dirname, file ? `dist/${prjectName}/${file}` : `dist/${prjectName}/`);
}

const filePath = {
  htmls: {
    src: getSrc('index.html'),
    dest: getDest()
  },

  styles: {
    src: getSrc('index.less'),
    dest: getDest('css')
  },

  scripts: {
    src: getSrc('index.js'),
    dest: getDest('js')
  },

  mds: {
    src: 'docs/**/*.md',
    dest: path.resolve(__dirname, `dist/${docs}`)
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
  return gulp.src(filePath.htmls.src)
    .pipe(gulp.dest(filePath.htmls.dest));
}


/*
 * Define our tasks using plain functions
 */
function css() {
  return gulp.src(filePath.styles.src)
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
    .pipe(gulp.dest(filePath.styles.dest))
    .pipe(mincss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(filePath.styles.dest));
}


/*
 * js 异步打包，webpack的 watch 功能，会自动监视目标文件，有文件修改会自动重新打包
 */
function js() {
  webpack(
    merge(webpackConfig, {
      entry: {
        index: filePath.scripts.src
      },
      output: {
        path: filePath.scripts.dest
      },
      mode: prjectMode,
    })
  ).watch(200, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('buildjs', err);
    }
    gutil.log('[gulp]', stats.toString({ colors: true }));
  });
}

function md() {
  return gulp.src(filePath.mds.src)
    .pipe(markdown())
    .pipe(gulp.dest(filePath.mds.dest));
}

function watch() {
  gulp.watch(filePath.scripts.src, js);
  gulp.watch(filePath.styles.src, css);
}

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
const build = gulp.series(clean, gulp.parallel(html, css, md, js));

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean;
exports.html = html;
exports.styles = css;
exports.md = md;
exports.scripts = js;
exports.watch = watch;

/*
 * Define default task that can be called by just running `gulp` from cli
 */
exports.default = build;