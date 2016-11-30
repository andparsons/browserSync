const gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    rename       = require('gulp-rename'),
    postcss      = require('gulp-postcss'),
    scssSyntax   = require('postcss-scss'),
    stylelint    = require('stylelint'),
    autoprefixer = require('autoprefixer'),
    cssnano      = require('cssnano'),
    sourcemaps   = require('gulp-sourcemaps'),
    compiler     = require('google-closure-compiler-js').gulp(),
    browserSync  = require('browser-sync'),
    htmlInjector = require('bs-html-injector'),
    reload       = browserSync.reload;

//configs
var autoprefixerConfig = {
    browsers: [
        '> 0.7%',
        'IE >= 9'
    ]
};
var nanoConfig = {
    safe:false,
    autoprefixer: false
};


// This will output what browsers are considered and what properties will be prefixed


// Add a "help" task to output the available tasks
gulp.task('help', require('gulp-task-listing'));

gulp.task('supported', function() {
    console.log(autoprefixer(autoprefixerConfig).info());
});

gulp.task('browser-sync', function() {
    browserSync.use(htmlInjector, {
        files: "./dist/*.html"
    });
    browserSync.init({
        files: "_/*.css",
        server: {
            baseDir: "./dist"
        }
    });
});

gulp.task('style', function () {

    var preTransformations = [
        stylelint()
    ];
    var postTransformations = [
        autoprefixer(autoprefixerConfig),
        cssnano(nanoConfig)
    ];

    return gulp.src('./src/styles/main.scss')
        .pipe(postcss(preTransformations, {syntax:scssSyntax}))
//        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(postcss(postTransformations))
        .pipe(rename({
            basename: "s",
            extname: ".css"
        }))
//      .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/_'))
        .pipe(reload({stream:true}));
});


gulp.task('script', function() {
    return gulp.src('./src/scripts/c.js', {base: './'})
        .pipe(compiler({
            compilationLevel: 'SIMPLE',
            warningLevel: 'VERBOSE',
            outputWrapper: '(function(){\n%output%\n}).call(this)',
            jsOutputFile: 'c.js',  // outputs single file
            createSourceMap: true,
        }))
        .pipe(gulp.dest('./dist/_'));
});


gulp.task('html', function () {
    return gulp.src('./src/index.html')
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', ['style', 'script', 'html'], function() {
    gulp.watch('./src/styles/{,*/}*.scss', ['style'], function (file) {
        if (file.type === "changed") {
            reload(file.path);
        }
    });
    gulp.watch('./src/scripts/{,*/}*.js', ['script'], function (file) {
        if (file.type === "changed") {
            reload(file.path);
        }
    });
    gulp.watch('./src/index.html', ['html'], function (file) {
        htmlInjector();
    });
});


gulp.task('default', ['watch','browser-sync']);
