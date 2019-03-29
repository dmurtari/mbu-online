var gulp = require('gulp');
var spawn = require('child_process').spawn;
var mocha = require('gulp-mocha');
var log = require('fancy-log');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('./tsconfig.json');

var node;
var paths = {
  srcJs: './src/**/*.js',
  srcTs: './src/**/*.ts',
  srcUnit: './src/**/*Spec.js',
  srcIntegration: './tests/**/*.js'
};

gulp.task('compile', () => {
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest('dist'));
});

gulp.task('src', gulp.series(['compile'], () => {
  startServer();
}));

gulp.task('env:dev', (done) => {
  process.env.PORT = 3000;
  process.env.NODE_ENV = 'development';
  done();
}); 

gulp.task('env:test', (done) => {
  process.env.PORT = 3001;
  process.env.NODE_ENV = 'test';
  done();
});


gulp.task('env:prod', (done) => {
  process.env.NODE_ENV = 'production';
  done();
});

gulp.task('serve', gulp.series(['env:dev', 'src'], () => {
  return gulp.watch([paths.srcJs, paths.srcTs], gulp.series(['src']));
}));

gulp.task('test:unit', gulp.series(['env:test'], () => {
  return gulp.src([paths.srcUnit])
    .pipe(mocha())
    .on('error', log);
}));

gulp.task('test:api', gulp.series(['env:test'], () => {
  return gulp.src([paths.srcIntegration])
    .pipe(mocha({ exit: true }));
}));

gulp.task('test:unit:watch', gulp.series(['test:unit'], () => {
  return gulp.watch([paths.srcUnit, paths.srcJs], gulp.series(['test:unit']));
}));

gulp.task('test:api:watch', gulp.series(['test:api'], () => {
  return gulp.watch([paths.srcIntegration, paths.srcJs], gulp.series(['test:api']));
}));

gulp.task('default', gulp.series(['serve']));

process.on('exit', () => {
  if (node) {
    node.kill();
  }
});

async function startServer() {
  if (node) {
    node.kill();
  }

  node = await spawn('node', ['./dist/app.js'], { stdio: 'inherit' });

  node.on('close', function (code) {
    if(code === 8) {
      console.log('Error detected, waiting for changes...');
    }
  });
}