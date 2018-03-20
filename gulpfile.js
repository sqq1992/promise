var gulp = require('gulp');
var gutil = require('gulp-util');           //gulp中使输入的内容带上颜色
var uglify = require('gulp-uglify');
var watchPath = require('gulp-watch-path'); //gulp自动监听文件变化时，所产生的路径指定文件，以让一个文件变动时,单独让这个文件变动
var combiner = require('stream-combiner2'); //如果文件中有 js 语法错误时，gulp 会终止运行并报错，这个是用来防止gulp终止运行的
var sourcemaps = require('gulp-sourcemaps');//为生产环境的dist文件产生的,产生错误时，直接重新返回到开发环境src中去查看出错的文件
var minifycss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');//补全css的前缀
var less = require('gulp-less');
var sass = require('gulp-ruby-sass');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var rev = require('gulp-rev');              //生成md后缀名
var revCollector = require('gulp-rev-collector');   //模板上引用路径的替换
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var stripDebug = require('gulp-strip-debug');
var declare = require('gulp-declare');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var clean = require('gulp-clean');
var gulpSequence = require('gulp-sequence');    //让gulp的task构建任务依次同步执行


// 路径集合
var pathObj = {
    coreJs:'src/js/core/**/*.js',                  //框架js代码
    corePluginJs:'src/js/corePlugin/**/*.js',        //依赖core和jquery或者jquery插件的组件代码
    mainJs:'src/js/main/**/*.js',                  //启动文件mainJS代码
    moduleJs:'src/js/modules/**/*.js',             //功能模块的js代码
    pluginJs:'src/js/plugin/**/*.js',              //插件的js代码a
    shareJs:'src/js/share/**/*.js',                //共享的js代码
    watchJs:['src/js/main/**/*.js','src/js/modules/**/*.js'],  //被监听的自动化编译的js代码
    srcCss:'src/css/**/*.css',     //要编译的css代码
    srcLess:'src/less/common/quicloud.less',  //要编译的less代码
    watchLess:'src/less/**/*.less',    //自动编译less代码
    srcImg:'src/img/**/*'    //要编译的图片资源
};

//输出错误的function
var handleError = function (err) {
    var colors = gutil.colors;
    console.log('\n')
    gutil.log(colors.red('Error!'))
    gutil.log('fileName: ' + colors.red(err.fileName))
    gutil.log('lineNumber: ' + colors.red(err.lineNumber))
    gutil.log('message: ' + err.message)
    gutil.log('plugin: ' + colors.yellow(err.plugin))
}

/**
 * 初始化js的压缩和合并
 */
gulp.task('initJs', function () {

    //core框架js的压缩和合并
    var coreCombined = combiner.obj([
        gulp.src(pathObj.coreJs),
        sourcemaps.init(),
        uglify({
            mangle: {except: ['require']}//排除混淆关键字
        }),
        stripDebug({debugger: true, console: true, alert: false}),
        concat('core.js'),
        rename({ suffix: '.min' }),
        gulp.dest('dist/js/core')
    ]);

    //plugin.js的压缩和合并
    var pluginJs = combiner.obj([
        gulp.src(pathObj.pluginJs),
        sourcemaps.init(),
        uglify(),
        stripDebug({debugger: true, console: true, alert: false}),
        concat('plugin.js'),
        rename({ suffix: '.min' }),
        gulp.dest('dist/js/plugin')
    ]);
    
    //main.js的压缩
    var mainCombined = combiner.obj([
        gulp.src(pathObj.mainJs),
        sourcemaps.init(),
        uglify(),
        stripDebug({debugger: true, console: true, alert: false}),
        gulp.dest('dist/js/main')
    ]);

    //modulejs的压缩和合yas并
    var modulesCombined = combiner.obj([
        gulp.src(pathObj.moduleJs),
        sourcemaps.init(),
        uglify({
            mangle: {except: ['require']}//排除混淆关键字
        }),
        stripDebug({debugger: true, console: true, alert: false}),
        gulp.dest('dist/js/modules')
    ]);


    coreCombined.on('error', handleError);

});

/**
 *  自动化化编译和压缩 main文件下的js代码
 */
gulp.task('watchMainJs', function () {
    gulp.watch(pathObj.mainJs, function (event) {
        var paths = watchPath(event, 'src/', 'dist/')
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            uglify({
                mangle: {except: ['require']}//排除混淆关键字
            }),
            stripDebug({debugger: true, console: true, alert: false}),
            gulp.dest(paths.distDir)
        ])

        combined.on('error', handleError)
    })
});

/**
 *  自动化引用modules文件下的js代码
 */
gulp.task('watchMdJs', function () {
    gulp.watch(pathObj.moduleJs, function (event) {
        var paths = watchPath(event, 'src/', 'dist/')
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            uglify({
                mangle: {except: ['require']}//排除混淆关键字
            }),
            stripDebug({debugger: true, console: true, alert: false}),
            gulp.dest(paths.distDir)
        ])

        combined.on('error', handleError)
    })
});

//生产自动监听js文件的任务
// gulp.task('watchjs', function () {
//     gulp.watch('src/js/**/*.js', function (event) {
//         var paths = watchPath(event, 'src/', 'dist/')
//         /*
//          paths
//          { srcPath: 'src/js/log.js',
//          srcDir: 'src/js/',
//          distPath: 'dist/js/log.js',
//          distDir: 'dist/js/',
//          srcFilename: 'log.js',
//          distFilename: 'log.js' }
//          */
//         gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
//         gutil.log('Dist ' + paths.distPath)
//
//         var combined = combiner.obj([
//             gulp.src(paths.srcPath),
//             sourcemaps.init(),
//             uglify(),
//             sourcemaps.write('./'),
//             gulp.dest(paths.distDir)
//         ])
//
//         combined.on('error', handleError)
//     })
// })
//
// gulp.task('uglifyjs', function () {
//     var combined = combiner.obj([
//         gulp.src('src/js/**/*.js'),
//         sourcemaps.init(),
//         uglify(),
//         sourcemaps.write('./'),
//         gulp.dest('dist/js/')
//     ])
//     combined.on('error', handleError)
// })

gulp.task('watchcss', function () {

    gulp.watch('src/css/**/*.css', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(sourcemaps.init())
            .pipe(autoprefixer({
                browsers: 'last 2 versions'
            }))
            .pipe(minifycss())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('minifycss', function () {
    gulp.src('src/css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: 'last 2 versions'
        }))
        .pipe(minifycss())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/css/'))
})

gulp.task('watchless', function () {
    gulp.watch(pathObj.watchLess, function (event) {
        var paths = watchPath(event, 'src/less/', 'dist/css/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)
        var combined = combiner.obj([
            gulp.src(pathObj.srcLess),
            sourcemaps.init(),
            less(),
            minifycss(),
            concat('quicloud.css'),
            rename({suffix: '.min'}),
            sourcemaps.write('./'),
            gulp.dest('dist/css/common/')
        ]);
        combined.on('error', handleError)
    })
});

gulp.task('lesscss', function () {
    var combined = combiner.obj([
        gulp.src(pathObj.srcLess),
        sourcemaps.init(),
        less(),
        minifycss(),
        rename({suffix: '.min'}),
        sourcemaps.write('./'),
        gulp.dest('dist/css/common')
    ])
    combined.on('error', handleError)
});


gulp.task('watchsass', function () {
    gulp.watch('src/sass/**/*', function (event) {
        var paths = watchPath(event, 'src/sass/', 'dist/css/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)
        sass(paths.srcPath)
            .on('error', function (err) {
                console.error('Error!', err.message);
            })
            .pipe(sourcemaps.init())
            .pipe(minifycss())
            .pipe(autoprefixer({
                browsers: 'last 2 versions'
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('sasscss', function () {
    sass('src/sass/')
        .on('error', function (err) {
            console.error('Error!', err.message);
        })
        .pipe(sourcemaps.init())
        .pipe(minifycss())
        .pipe(autoprefixer({
            browsers: 'last 2 versions'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/css'))
})

gulp.task('watchimage', function () {
    gulp.watch('src/img/**/*', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(imagemin({
                progressive: true
            }))
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('image', function () {
    gulp.src('src/img/**/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('dist/img'))
})

gulp.task('watchcopy', function () {
    gulp.watch('src/fonts/**/*', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('copy', function () {
    gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/fonts/'))
})

gulp.task('watchtemplates', function () {
    gulp.watch('src/templates/**/*', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            handlebars({
                // 3.0.1
                handlebars: require('handlebars')
            }),
            wrap('Handlebars.template(<%= contents %>)'),
            declare({
                namespace: 'S.templates',
                noRedeclare: true
            }),
            gulp.dest(paths.distDir)
        ])
        combined.on('error', handleError)
    })
})

gulp.task('templates', function () {
    gulp.src('src/templates/**/*')
        .pipe(handlebars({
            // 3.0.1
            handlebars: require('handlebars')
        }))
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(declare({
            namespace: 'S.templates',
            noRedeclare: true
        }))
        .pipe(gulp.dest('dist/templates'))
})

//进行编译bootstrap中的less文件
gulp.task('bootstrapLess', function () {
    var combined = combiner.obj([
        gulp.src('src/bootstrapLess/bootstrap.less'),
        sourcemaps.init(),
        less(),
        minifycss(),
        rename(function(path) {
         path.basename += ".min";        //压缩后的名字
        }),
        sourcemaps.write('./'),
        gulp.dest('dist/css/')
    ])
    combined.on('error', handleError)
});

//进行删除dist生产代码
gulp.task('clean', function () {
     return gulp.src('./dist')
        .pipe(clean({force: true}));
});

gulp.task('default', ['watchMainJs','watchMdJs','watchless', 'watchcss','watchimage', 'watchcopy']);   //开启自动化编译

//gulp.task('init',gulpSequence('clean','bootstrapLess','lesscss','uglifyjs','minifycss','image','copy'));  //初始化编译

//初始化编译
// gulp.task('init', function (cb) {
//     gulpSequence('clean', ['bootstrapLess', 'lesscss', 'uglifyjs', 'minifycss', 'image', 'copy'], cb);
// });
gulp.task('init', function (cb) {
    gulpSequence(['bootstrapLess', 'lesscss', 'initJs', 'minifycss', 'image', 'copy'], cb);
});


//开启http服务器
gulp.task('connect', function () {
    connect.server();
});


