var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var nodemon = require('gulp-nodemon');

var jsFiles = ['*.js', 'api/**/*.js'];

//gulp.task('serve', ['inject'], function() {
gulp.task('serve', function() {
    var options = {
        script: './bin/www',
        delayTime: 1,
        env: {
            'PORT': 3500
        },
        watch: jsFiles
    }

    return nodemon(options)
        .on('restart', function(ev){
            console.log('Restarting...');
        })
});