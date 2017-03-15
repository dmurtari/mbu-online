var gulp = require('gulp');
var spawn = require('child_process').spawn;
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');

var node;
var paths = {
  srcJs: './src/**/*.js',
  srcUnit: './src/**/*Spec.js',
  srcIntegration: './tests/**/*.js'
};

gulp.task('src', function() {
  if (node){
    node.kill();
  }
  node = spawn('node', ['./src/app.js'], {stdio: 'inherit'});
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task('serve', ['env:dev', 'src'], function() {
  gulp.watch([paths.srcJs], ['src']);
});

gulp.task('test:unit', ['env:test'], function() {
  gulp.src([paths.srcUnit])
    .pipe(mocha())
    .on('error', gutil.log);
});

gulp.task('test:api', ['env:test'], function() {
  gulp.src([paths.srcIntegration])
    .pipe(mocha())
    .on('error', gutil.log);
});

gulp.task('test:unit:watch', ['test:unit'], function() {
  gulp.watch([paths.srcUnit, paths.srcJs], ['test:unit']);
});

gulp.task('test:api:watch', ['test:api'], function() {
  gulp.watch([paths.srcIntegration, paths.srcJs], ['test:api']);
});

gulp.task('env:dev', function() {
  process.env.PORT = 3000;
  return process.env.NODE_ENV = 'development';
});

gulp.task('env:test', function() {
  process.env.PORT = 3001;
  return process.env.NODE_ENV = 'test';
});

gulp.task('env:prod', function() {
  return process.env.NODE_ENV = 'production';
});

gulp.task('default', ['serve']);

process.on('exit', function() {
  if (node) {
    node.kill();
  }
});
