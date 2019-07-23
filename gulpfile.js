const fs = require('fs');
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

const prjectName = process.env.MY_PROJECT_NAME || 'src';
const prjectMode = process.env.NODE_ENV || 'development';

console.log('process.env', process.env);

// 项目配置
const config = {
  package: {
    scripts: {
      src: { index: `${prjectName}/index.js` },
      dest: `dist/${prjectName}/js`
    },
    mds: {
      src: 'docs/**/*.md',
      dest: path.resolve(__dirname, 'dist/docs')
    }
  },

  src: {
    htmls: {
      src: `${prjectName}/index.html`,
      dest: `dist/${prjectName}/`
    },

    styles: {
      src: `${prjectName}/css/index.less`,
      dest: `dist/${prjectName}/css`
    },

    scripts: {
      src: { index: `${prjectName}/js/index.js` },
      dest: `dist/${prjectName}/js`
    },

    mds: {
      src: 'docs/**/*.md',
      dest: path.resolve(__dirname, 'dist/docs')
    }
  },

};

const filePath = config[prjectName] || {};

const htmlEntry = filePath.htmls && filePath.htmls.src;
const htmlOutput = filePath.htmls && filePath.htmls.dest;

const styleEntry = filePath.styles && filePath.styles.src;
const styleOutput = filePath.styles && filePath.styles.dest;

const scriptEntry = filePath.scripts && filePath.scripts.src;
const scriptOutput = filePath.scripts && filePath.scripts.dest;

const mdEntry = filePath.mds && filePath.mds.src;
const mdOutput = filePath.mds && filePath.mds.dest;

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
  return gulp.src(htmlEntry)
    .pipe(gulp.dest(htmlOutput));
}

/*
 * Define our tasks using plain functions
 */
function css() {
  return gulp.src(styleEntry)
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
    .pipe(gulp.dest(styleOutput))
    .pipe(mincss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(styleOutput));
}

/*
 * js 异步打包，webpack的 watch 功能，会自动监视目标文件，有文件修改会自动重新打包
 */
function js() {
  webpack(
    merge(webpackConfig, {
      entry: scriptEntry,
      output: {
        path: scriptOutput
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
  return gulp.src(mdEntry)
    .pipe(markdown())
    .pipe(gulp.dest(mdOutput));
}

function watch() {
  if (htmlEntry) {
    gulp.watch(htmlEntry, html);
  }
  if (scriptEntry) {
    gulp.watch(scriptEntry, js);
  }
  if (mdEntry) {
    gulp.watch(mdEntry, mds);
  }
  if (styleEntry) {
    gulp.watch(styleEntry, css);
  }
}

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
const build = gulp.series(
  clean,
  gulp.parallel(
    /*  htmlEntry ? html : '',
     styleEntry ? css : '',
     scriptEntry ? js : '',
     mdEntry ? md : '', */
    // js,
    styleEntry,
    watch
  )
);

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean;
if (htmlEntry) {
  exports.html = html;
}
if (styleEntry) {
  exports.css = css;
}
if (scriptEntry) {
  exports.js = js;
}
if (mdEntry) {
  exports.md = md;
}
exports.watch = watch;

/*
 * Define default task that can be called by just running `gulp` from cli
 */
exports.default = build;