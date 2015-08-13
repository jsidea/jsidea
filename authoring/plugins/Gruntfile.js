// @see https://github.com/nDmitry/grunt-autoprefixer
// @see https://github.com/ai/autoprefixer#browsers
module.exports = function(grunt) {
	var projectName = grunt.option("projectname");
	var tasks = [];
	var npmTasks = [];
	var config = {};
	var root = "../../../";

	// setup autoprefixer
	if (grunt.option("autoprefixer") == "on") {
		tasks.push("autoprefixer");
		npmTasks.push('grunt-autoprefixer');
		config.autoprefixer = {
			build : {
				src : root + projectName + '/bin/' + projectName + '/css/'
						+ projectName + '.css',
				dest : root + projectName + '/bin/' + projectName + '/css/'
						+ projectName + '.css'
			},
			options : {
				browsers : [ 'last 6 version', 'ie 8', 'ie 9' ]
			}
		}
	}

	// setup typedoc
	if (grunt.option("typedoc") == "on") {
		tasks.push("typedoc");
		npmTasks.push('grunt-typedoc');
		config.typedoc = {
			build : {
				options : {
					out : root + projectName + '/bin/' + projectName
							+ '/docs',
					name : projectName,
					target : 'es5'
				},
				src : [ root + projectName + '/references.typescript.ts' ]
			}
		}
	}

	// setup uglify
	if (grunt.option("uglify") == "on") {
		tasks.push("uglify");
		npmTasks.push('grunt-contrib-uglify');
		var dirJS = root + projectName + '/bin/' + projectName + '/js/' + projectName;
		var item = {
			my_target : {
				files : {}
			}
		};
		item.my_target.files[dirJS + ".min.js"] = [ dirJS + ".js" ];
		config.uglify = item;
	}

	// run grunt
	grunt.initConfig(config);
	for (var i = 0; i < npmTasks.length; ++i)
		grunt.loadNpmTasks(npmTasks[i]);
	grunt.registerTask('default', tasks);
}