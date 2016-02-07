// @see https://github.com/nDmitry/grunt-autoprefixer
// @see https://github.com/ai/autoprefixer#browsers
// @see https://github.com/gruntjs/grunt-contrib-cssmin
// @see https://github.com/gruntjs/grunt-contrib-uglify
module.exports = function(grunt) {
	var projectName = grunt.option("projectname");
	var outputFolder = grunt.option("projectbin");

	outputFolder = outputFolder.replace(/\\/gi, "/") + "/";

	grunt.log.writeln(projectName + " : Run Grunt on directory : "
			+ outputFolder);

	var tasks = [];
	var npmTasks = [];
	var config = {};

	// setup autoprefixer
	if (grunt.option("autoprefixer") == "1") {
		grunt.log.writeln(projectName + " : Prefix CSS");
		tasks.push("autoprefixer");
		npmTasks.push('grunt-autoprefixer');
		config.autoprefixer = {
			build : {
				src : outputFolder + 'css/' + projectName + '.css',
				dest : outputFolder + 'css/' + projectName + '.css'
			},
			options : {
				browsers : [ 'last 6 version', 'ie 8', 'ie 9' ]
			}
		};
	}

	// setup typedoc
	if (grunt.option("typedoc") == "1") {
		tasks.push("typedoc");
		npmTasks.push('grunt-typedoc');
		config.typedoc = {
			build : {
				options : {
					out : outputFolder + 'docs/typescript',
					name : '' + projectName + '',
					target : 'es3'
				},
				src : [ '../../' + projectName + '/references.ts' ]
			}
		};
	}

	// setup cssmin
	if (grunt.option("cssmin") == "1") {
		grunt.log.writeln(projectName + " : Minify CSS");
		tasks.push("cssmin");
		npmTasks.push('grunt-contrib-cssmin');
		var files = {};
		files[outputFolder + 'css/' + projectName + '.min.css'] = [ outputFolder
				+ 'css/' + projectName + '.css' ];
		config.cssmin = {
			options : {
				shorthandCompacting : false,
				roundingPrecision : -1,
			// sourceMap:true
			},
			target : {
				files : files
			}
		};
	}

	// setup uglifyjs (jsmin)
	if (grunt.option("jsmin") == "1") {
		grunt.log.writeln(projectName + " : Minify JavaScript");
		tasks.push("uglify");
		npmTasks.push('grunt-contrib-uglify');
		var files = {};
		files[outputFolder + 'ts/' + projectName + '.min.js'] = [ outputFolder
				+ 'ts/' + projectName + '.js' ];
		config.uglify = {
			options : {
				mangle : false
			},
			my_target : {
				files : files
			}
		};
	}

	// run grunt
	grunt.initConfig(config);
	for (var i = 0; i < npmTasks.length; ++i)
		grunt.loadNpmTasks(npmTasks[i]);
	grunt.registerTask('default', tasks);
}