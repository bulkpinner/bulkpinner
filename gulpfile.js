const gulp = require('gulp');
const args = require('yargs').argv;
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const path = require('path');
// All gulp plugins are automatically loaded into this constant, provided they're in package.json
const plugins = require('gulp-load-plugins')({
    rename: {
        'gulp-clean-css': 'cleanCss'
    }
});

const packageJson = require('./package.json');

/**
 * Process the SASS files
 */
gulp.task('sass', () => {
    return gulp.src(['src/scss/main.scss'])
        .pipe(plugins.plumber())
        .pipe(plugins.if(args.debug, plugins.debug({title: 'SASS'})))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer())
        // .pipe(plugins.if(!args.dev, plugins.cleanCss()))
        .pipe(plugins.concat('styles.css'))
        .pipe(plugins.cssimport())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'));
});

/**
 * Process the JS files
 */
gulp.task('webpack', () => {
    //App scripts
    return gulp.src('src/js/*.js')
        .pipe(plugins.plumber())
        .pipe(plugins.if(args.debug, plugins.debug({title: 'WEBPACK'})))
        .pipe(webpackStream({
            resolve: {
                modules: [
                    path.resolve('./src/js'),
                    path.resolve('./node_modules')
                ]
            },
            devtool: 'source-map',
            module: {
                loaders: [{
                    loader: 'babel-loader'
                }]
            },
            output: {
                filename: 'scripts.js'
            }
        }, webpack))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('js', ['webpack'], () => {
    return gulp.src('dist/js/scripts.js')
        .pipe(plugins.plumber())
        .pipe(plugins.if(args.debug, plugins.debug({title: 'JS'})))
        .pipe(plugins.if(!args.dev, plugins.uglify()))
        // .pipe(plugins.if(args.deploy, plugins.upload({
        //     server: 'https://upload.bugsnag.com',
        //     data: {
        //         apiKey: '856ea8cf87049704dbad28042ef0aa16',
        //         minifiedUrl: 'http*://bulkpinner.github.io/site/js/scripts.js',
        //         sourceMap: '@dist/js/scripts.js.map',
        //         overwrite: true,
        //         appVersion: packageJson.version
        //     },
        //     callback: (err, data, res) => {
        //         if (err) {
        //             console.error('Error: ' + err.toString());
        //         } else {
        //             console.log(data.toString());
        //         }
        //     }
        // })))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('html', () => {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'))
});

gulp.task('other', () => {
    return gulp.src(['CHANGELOG.md'])
        .pipe(gulp.dest('dist'))
});

gulp.task('images', () => {
    return gulp.src('src/img/**/*')
    .pipe(gulp.dest('dist/img'))
});

/**
 * This task will copy any third party vendor libraries/plugins that are self-hosted and not used as a node module
 * E.g. This had to be added to accommodate hosting Bugsnag, which would be blocked by adblockers when loaded over CDN
 * or hosted with the actual name of the plugin
 */
gulp.task('vendorFiles', () => {
    return gulp.src('src/vendor/**/*')
    .pipe(gulp.dest('dist/vendor'))
});

/**
 * Build the application.
 * This will be run when developing
 */
gulp.task('build', ['sass', 'js', 'html', 'images', 'other', 'vendorFiles']);

/**
 * Watch for file changes and trigger the build task, the update the web page
 */
gulp.task('default', ['build'], function () {
    if (args.dev) {
        gulp.watch(["src/js/**/*.js"], ['js']);

        gulp.watch([
            "src/scss/**/*.scss"
        ], ['sass']);

        gulp.watch([
            "src/*.html"
        ], ['html']);
    }
});
