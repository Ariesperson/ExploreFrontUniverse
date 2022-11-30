module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // copy: {
        //     src: {
        //         files: [{
        //             expand: true,
        //             cwd: 'src/kayak/common/',
        //             src: ['**'],
        //             dest: 'dist/kayak/common/'
        //         }, {
        //             expand: true,
        //             cwd: 'src/kayak/widgets/',
        //             src: ['**'],
        //             dest: 'dist/kayak/widgets/'
        //         }]
        //     }
        // },
        // 压缩js
        uglify: {
            options: {
                mangle: {
                    except: ['require']
                },
                compress: {
                    drop_console: false, //删除全部console信息
                    pure_funcs:['console.log']
                },
            },
            compressJs: {
                files: {
                    'dist/kayak/plugin/plugin.js': [
                        'src/kayak/plugin/seajs-css.js',
                        'src/kayak/plugin/seajs-kayak-combo.js',
                        'src/kayak/plugin/seajs-kayak-dom.js'
                    ],
                    'dist/kayak/core/kayak.js': [
                        'src/kayak/core/config.js',
                        'src/kayak/core/classes/class.js',
                        'src/kayak/core/classes/module.class.js',
                        'src/kayak/core/router/action.mod.js',
                        'src/kayak/core/localdata.js',
                        'src/kayak/core/events.js',
                        'src/kayak/core/utils.js',
                        'src/kayak/core/router/deckinterface.js',
                        'src/kayak/core/link/link.js',
                        'src/kayak/core/router/router.js',
                        'src/kayak/core/dom.js',
                        'src/kayak/core/moduleloader/moduleloader.js',
                        'src/kayak/core/kayak.js',
                        'src/kayak/core/translate/translate.js'
                    ]
                }
            },
            compressAllJs: {
                files: [{
                    expand: true,
                    cwd: 'src/kayak/common', //js目录下
                    src: '**/*.js', //所有js文件
                    dest: 'dist/kayak/common' //输出到此目录下
                }, {
                    expand: true,
                    cwd: 'src/kayak/widgets', //js目录下
                    src: '**/*.js', //所有js文件
                    dest: 'dist/kayak/widgets' //输出到此目录下
                }]
            }
        },
        // 压缩css代码
        cssmin: {
            options: {
                process: function(content, srcpath) {
                    console.log(content);
                    return content.replace(/[sad ]/g, '_');
                }
            },
            target: {
                files: [{
                    expand: true,
                    cwd: 'src/kayak/widgets', //js目录下
                    src: '**/*.css', //所有css文件
                    dest: 'dist/kayak/widgets' //输出到此目录下
                }]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true, //清除HTML注释
                    collapseWhitespace: true, //压缩HTML
                    collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
                    removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
                    removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
                    removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
                    minifyJS: true, //压缩页面JS
                    minifyCSS: true //压缩页面CSS
                },
                files: [{
                    expand: true,
                    cwd: 'src/kayak/widgets', //js目录下
                    src: '**/*.tpl', //所有tpl文件
                    dest: 'dist/kayak/widgets' //输出到此目录下
                }]
            }
        },
        // 清理字符
        copy: {
            // 替换css内部图片地址
            fixCss: {
                expand: true,
                cwd: 'dist',
                src: '**/*.css',
                dest: 'dist',
                options: {
                    process: function(content, srcpath) {
                        return content.replace(/\/src\//g, '/dist/');
                    }
                }
            },
            image: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.{png,jpg,jpeg,gif,webp,svg}'],
                    dest: 'dist'
                }]
            }
        },
        // 清空文件
        clean: {
            all: 'dist/*'
        }
    });

    // 加载包含 "uglify" 任务的插件。
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-license');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');

    grunt.registerTask('build', [
        'clean',
        // 压缩js
        'uglify',
        'cssmin',
        'htmlmin',
        'copy'
    ]);

    // 默认被执行的任务列表。
    grunt.registerTask('default', ['build']);

};
