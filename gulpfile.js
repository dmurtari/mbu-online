var gulp = require('gulp');
var spawn = require('child_process').spawn;
var mocha = require('gulp-mocha');
var log = require('fancy-log');

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

gulp.task('env:dev', function(done) {
  process.env.PORT = 3000;
  process.env.NODE_ENV = 'development';
  done();
});

gulp.task('env:test', function(done) {
  process.env.PORT = 3001;
  process.env.NODE_ENV = 'test';
  done();
});


gulp.task('env:prod', function(done) {
  process.env.NODE_ENV = 'production';
  done();
});

gulp.task('serve', gulp.series(['env:dev', 'src'], function() {
  return gulp.watch([paths.srcJs], gulp.series(['src']));
}));

gulp.task('test:unit', gulp.series(['env:test'], function() {
  return gulp.src([paths.srcUnit])
    .pipe(mocha())
    .on('error', log);
}));

gulp.task('test:api', gulp.series(['env:test'], function() {
  return gulp.src([paths.srcIntegration])
    .pipe(mocha({ exit: true }));
}));

gulp.task('test:unit:watch', gulp.series(['test:unit'], function() {
  return gulp.watch([paths.srcUnit, paths.srcJs], gulp.series(['test:unit']));
}));

gulp.task('test:api:watch', gulp.series(['test:api'], function() {
  return gulp.watch([paths.srcIntegration, paths.srcJs], gulp.series(['test:api']));
}));

gulp.task('default', gulp.series(['serve']));

process.on('exit', function() {
  if (node) {
    node.kill();
  }
});
