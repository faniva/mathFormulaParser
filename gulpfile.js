const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require("gulp-rename");
const header = require('gulp-header');

// const concat = require('gulp-concat');
// const less = require('gulp-less');
// const minifyCSS = require('gulp-minify-css');

/*
    TOP LEVEL FUNCTIONS

   gulp.task - Define tasks
   gulp.src - Point to files to use
   gulp.dest - Points to folder to output
   gulp.watch - Watch files and folders for changes
 */

// Logs Message
gulp.task('message', function(){
    return console.log('Gulp is running...');
});

// using data from package.json
var pkg = require('./package.json');
var banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @author <%= pkg.author %>',
    ' * @license <%= pkg.license %>',
    ' * @lastModified <%= new Date() %>',
    ' */',
    ''].join('\n');


// Minify JS
gulp.task('minifyjs', function(){
    gulp.src('src/*.js')
        .pipe(uglify())
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist'));
});

// Watch for changes
gulp.task('watch', function(){
    gulp.watch('src/*.js', ['minifyjs']);
});
