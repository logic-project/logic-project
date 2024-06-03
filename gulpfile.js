const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const terser = require('gulp-terser');

const paths = {
  html: {
    src: 'src/**/*.html',
    dest: 'docs/'
  },
  styles: {
    src: 'src/styles/**/*.scss',
    mainFile: 'src/styles/style.scss',
    dest: 'docs/'
  },
  scripts: {
    src: 'src/js/main.js',
    dest: 'docs/'
  },
  assets: {
    src: 'src/assets/**/*',
    dest: 'docs/assets'
  }
};


// Copia a pasta assets para docs
function assets() {
  return gulp.src(paths.assets.src)
      .pipe(gulp.dest(paths.assets.dest));
}

// Copia o HTML para docs
function html() {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// Compila o Sass para CSS e copia para docs
function styles() {
  return gulp.src(paths.styles.mainFile)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Compila o JavaScript com Rollup e copia para docs
function scripts() {
  return rollup({
    input: paths.scripts.src,
    format: 'iife',
    name: 'MyBundle', 
    sourcemap: true
  })
    .pipe(source('bundle.js', paths.scripts.src))
    .pipe(buffer())
    // .pipe(terser())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// Observa mudanças nos arquivos e executa as tarefas correspondentes
function watchFiles() {
  gulp.watch(paths.assets.src, assets)
  gulp.watch(paths.html.src, html);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
}

// Inicializa o BrowserSync e serve a pasta docs
function serve() {
  browserSync.init({
    server: {
      baseDir: 'docs'
    },
    notify: false,
    open: false
  });
}

const watch = gulp.parallel(watchFiles, serve);
const build = gulp.series(gulp.parallel(assets, html, styles, scripts), watch);

exports.assets = assets;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.build = build;
exports.default = build;
