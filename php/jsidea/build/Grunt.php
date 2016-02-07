<?php

namespace jsidea\build;

class Grunt {
	public static function setup() {
		$workspace_relative = __DIR__ . '/../../../../';
		$workspace_dir = realpath ( $workspace_relative );
		$project_build_dir = $workspace_dir . '/jsidea/build';
		
		$shell_cmd = '';
		// For windows operation systems
		if (strtoupper ( substr ( PHP_OS, 0, 3 ) ) === 'WIN') {
			$app_data_dir = realpath ( getenv ( 'appdata' ) );
			$npm_dir = $app_data_dir . '/npm';
			$grunt_cli = $npm_dir . '/grunt.cmd';
			$grunt_file = $project_build_dir . '/Gruntfile.js';
			// $shell_cmd = "cd \"$project_build_dir\" && ";
			// $shell_cmd = $grunt_cli . " --base \"$project_build_dir\" --gruntfile \"$grunt_file\"";
			
			// lookup the npm.cmd
			$path_str = getenv ( 'path' );
			$pathes = explode ( ';', $path_str );
			$npm_cmd = '';
			foreach ( $pathes as $path ) {
				$path = realpath ( $path );
				$filename = $path . '/npm.cmd';
				if (file_exists ( $filename )) {
					
					$npm_cmd = $filename;
				}
			}
			
			if (! $npm_cmd) {
				$npm_cmd = 'cmd';
				echo ('Could not find npm.cmd try using npm (non absolute path). Is nodejs (and npm) installed?');
			}
			
			$shell_cmd = "cd \"$project_build_dir\" && \"$npm_cmd\" install 2>&1";
		} else {
			$modules_dir = '/usr/local/lib/node_modules';
			// $grunt_file = $modules_dir . '/grunt-cli/bin/grunt';
		}
		print_r ( shell_exec ( $shell_cmd ) );
		
		return 'done'; // $workspace;
	}
}
?>