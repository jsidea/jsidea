// @see https://github.com/nDmitry/grunt-autoprefixer
// @see https://github.com/ai/autoprefixer#browsers
module.exports = function(grunt) {
	var build = grunt.option("build");
	var tasks = [];
	var npmTasks = [];
	var config = {};
	var root = "../../jsidea";

	// setup autoprefixer
	if (grunt.option("autoprefixer") == "on") {
		grunt.log.writeln(build + " : Prefix CSS");
		tasks.push("autoprefixer");
		npmTasks.push('grunt-autoprefixer');
		config.autoprefixer = {
			build : {
				src : root + '/bin/' + build + '/css/' + build + '.css',
				dest : root + '/bin/' + build + '/css/' + build + '.css'
			},
			options : {
				browsers : [ 'last 6 version', 'ie 8', 'ie 9' ]
			}
		}
	}

	// setup typedoc
	if (grunt.option("typedoc") == "on") {
		grunt.log.writeln(build + " : Create docs");
		tasks.push("typedoc");
		npmTasks.push('grunt-typedoc');
		config.typedoc = {
			build : {
				options : {
					out : root + '/bin/' + build + '/docs',
					name : build,
					target : 'es5'
				},
				src : [ root + '/src/' + build + '.ts' ]
			}
		}
	}

	// setup uglify
	if (grunt.option("uglify") == "on") {
		grunt.log.writeln(build + " : Uglify JavaScript");
		tasks.push("uglify");
		npmTasks.push('grunt-contrib-uglify');
		var dirJS = root + '/bin/' + build + '/js/' + build;
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