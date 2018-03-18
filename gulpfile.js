const gulp = require('gulp');
const args = require('yargs').argv;
const path = require('path');
const hash = require('gulp-hash-filename');
// All gulp plugins are automatically loaded into this constant, provided they're in package.json
const plugins = require('gulp-load-plugins')({
    rename: {
        'gulp-clean-css': 'cleanCss'
    }
});
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');

const packageJson = require('./package.json');

const hashManifest = {};

gulp.task('clean-css',  () => {
    return gulp.src('dist/css')
        .pipe(plugins.clean());
});

/**
 * Process the SASS files
 */
gulp.task('sass', ['clean-css'], () => {
    return gulp.src(['src/scss/main.scss'])
        .pipe(plugins.plumber())
        .pipe(plugins.if(args.debug, plugins.debug({title: 'SASS'})))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer())
        .pipe(plugins.if(!args.dev, plugins.cleanCss()))
        .pipe(hash({
            "format": "styles.{hash}{ext}"
        }))
        .pipe(plugins.intercept((file) => {
            const fileParts = file.path.split('\\');
            const filename = fileParts[fileParts.length - 1]
            const hash = filename.split('.')[1];
            hashManifest.styles = hash;
            return file;
        }))
        // .pipe(plugins.concat('styles.' + hashManifest.styles + '.css'))
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('clean-js',  () => {
    return gulp.src('dist/js')
        .pipe(plugins.clean());
});

/**
 * Process the JS files
 */
gulp.task('js', ['clean-js'], () => {
    const webpackPlugins = [];

    if (!args.dev) {
        webpackPlugins.push(new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            output: { comments: false },
            sourceMap: true
        }));
    }

    webpackPlugins.push(function () {
        this.plugin('done', stats => {
            const assetsByChunkName = stats.toJson().assetsByChunkName.main;
            const scriptParts = assetsByChunkName[0].split('.')
            hashManifest.scripts = scriptParts[1];
        });
    });

    webpackPlugins.push(new HtmlReplaceWebpackPlugin([
        {
            pattern: '[[applicationVersion]]',
            replacement: packageJson.version
        }
    ]));

    //App scripts
    return gulp.src('src/js/*.js')
        .pipe(plugins.plumber())
        .pipe(plugins.if(args.debug, plugins.debug({title: 'JS'})))
        .pipe(webpackStream({
            resolve: {
                modules: [
                    path.resolve('./src/js'),
                    path.resolve('./node_modules')
                ]
            },
            devtool: 'source-map',
            plugins: webpackPlugins,
            module: {
                loaders: [{
                    loader: 'babel-loader'
                }]
            },
            output: {
                filename: 'scripts.[hash].js'
            }
        }, webpack))
        .pipe(plugins.replace('[[applicationVersion]]', () => {
            return packageJson.version;
        }))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('html', ['js', 'sass'], () => {
    return gulp.src('src/index.html')
        .pipe(plugins.replace('[[scriptsHash]]', () => {
            return hashManifest.scripts;
        }))
        .pipe(plugins.replace('[[stylesHash]]', () => {
            return hashManifest.styles;
        }))
        .pipe(plugins.replace('[[applicationVersion]]', () => {
            return packageJson.version;
        }))
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

gulp.task('generate-service-worker', ['js', 'sass'], () => {
    return gulp.src(['src/sw.js'])
        .pipe(plugins.replace('[scriptsHash]', () => {
            return hashManifest.scripts;
        }))
        .pipe(plugins.replace('[stylesHash]', () => {
            return hashManifest.styles;
        }))
        .pipe(gulp.dest('dist'))
});

/**
 * Build the application.
 * This will be run when developing
 */
gulp.task('build', ['sass', 'js', 'html', 'images', 'other', 'vendorFiles', 'generate-service-worker']);

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

        gulp.watch([
            "src/sw.js"
        ], ['generate-service-worker']);
    }
});
