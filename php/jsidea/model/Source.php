<?php

namespace jsidea\model;

class Source {
	private static $_project = '';
	public static function rglob($pattern, $flags = 0) {
		$files = glob ( $pattern, $flags );
		foreach ( glob ( dirname ( $pattern ) . '/*', GLOB_ONLYDIR | GLOB_NOSORT ) as $dir ) {
			$files = array_merge ( $files, self::rglob ( $dir . '/' . basename ( $pattern ), $flags ) );
		}
		return $files;
	}
	public static function run() {
		// check if there is a project parameter set
		if (! isset ( $_GET ['project'] ) || ! trim ( $_GET ['project'] ))
			self::error_out ( 'Missing parameter project.' );
		$project = $_GET ['project'];
		
		$workspace = str_replace ( '\\', '/', realpath ( dirname ( __FILE__ ) . '/../../../..' ) );
		if (! file_exists ( $workspace ))
			self::error_out ( "Could not find workspace: " . $workspace );
		
		$project_dir = $workspace . '/' . $project;
		if (! file_exists ( $project_dir ))
			self::error_out ( "Could not find project '$project' directory: " . $project_dir );
		
		self::$_project = $project;
		
		$settings_dir = $project_dir . '/.settings';
		if (! file_exists ( $settings_dir ))
			self::error_out ( 'Could not find project-specific settings directory: ' . $settings_dir );
		
		$project_settings_file = $project_dir . '/.project';
		if (! file_exists ( $project_settings_file ))
			self::error_out ( 'Could not find project settings: ' . $project_settings_file );
		
		$project_prefs_file = $project_dir . '/.project';
		if (! file_exists ( $project_prefs_file ))
			self::error_out ( 'Could not find Project settings under: ' . $project_prefs_file );
		
		$typescript_prefs_file = $settings_dir . '/com.palantir.typescript.prefs';
		if (! file_exists ( $typescript_prefs_file ))
			self::error_out ( 'Could not find Palantir TypeScript settings under: ' . $typescript_prefs_file );
		
		$php_prefs_file = $settings_dir . '/org.eclipse.php.core.prefs';
		if (! file_exists ( $php_prefs_file ))
			self::error_out ( 'Could not find PHP-PDT settings under: ' . $php_prefs_file );
		
		$config_file = "$project_dir/base.source.json";
		if (! file_exists ( $config_file ))
			self::error_out ( 'Could not find source config: ' . $config_file );
		
		$typescript_prefs = self::load_prefs ( $typescript_prefs_file );
		$export_folder_key = 'build.path.exportedFolder';
		if (! isset ( $typescript_prefs [$export_folder_key] ))
			self::error_out ( "Erros parsing TypeScript preferences. Could not find $export_folder_key property." );
		
		$export_folder_dir = $project_dir . '/' . $typescript_prefs [$export_folder_key];
		if (! file_exists ( $export_folder_dir ))
			self::error_out ( 'Could not find TypeScript export directory: ' . $export_folder_dir );
		
		$config_json_string = file_get_contents ( $config_file );
		$config_json = json_decode ( $config_json_string, true );
		
		if (! $config_json || ! is_array ( $config_json ))
			self::error_out ( "Erros parsing config json: " . $config_file );
		
		$props = array (
				'css',
				'js',
				'php',
				'ts' 
		);
		foreach ( $props as $prop ) {
			if (! isset ( $config_json [$prop] ))
				self::error_out ( "Could not find $prop property in config: $config_file" );
			$errors = self::validate_files ( $config_json [$prop], $project_dir . '/' );
			if ($errors)
				self::error_out ( "There are some missing file/s in config ($prop): " . implode ( ', ', $errors ) );
		}
		
		foreach ( $props as $prop ) {
			$config_json [$prop] = self::load_files ( $config_json [$prop], $project_dir . '/' );
		}
		
		$config_out_json_string = json_encode ( $config_json );
		
		echo $config_out_json_string;
		// print_r ( $config_out_json_string );
	}
	private static function error_out($message) {
		$project = self::$_project ? '[' . self::$_project . ']' : '[UNKNOWN] ';
		die ( '{"error":"' . htmlspecialchars ( print_r ( $message, true ) ) . '"}' );
	}
	private static function load_files($pathes, $prefix = '') {
		$files_loaded = array ();
		foreach ( $pathes as $key => $path ) {
			if ($path [0] == '!')
				continue;
			$filename = $prefix . $path;
			array_push ( $files_loaded, array (
					'name' => $filename,
					'code' => file_get_contents ( $filename ),
					'size' => filesize ( $filename ) 
			) );
		}
		return $files_loaded;
	}
	private static function validate_files($pathes, $prefix = '') {
		$errors = array ();
		
		if (! is_array ( $pathes )) {
			array_push ( $errors, 'The given value is not an array.' );
			return $errors;
		}
		
		foreach ( $pathes as $path ) {
			if ($path [0] == '!')
				continue;
			if (! file_exists ( $prefix . $path ))
				array_push ( $errors, $prefix . $path );
		}
		return $errors;
	}
	private static function load_prefs($filename) {
		$ini = file_get_contents ( $filename );
		$lines = explode ( "\n", $ini );
		$r = array ();
		foreach ( $lines as $line ) {
			if (! trim ( $line ))
				continue;
			$entry = explode ( '=', $line );
			$key = isset ( $entry [0] ) ? trim ( $entry [0] ) : '';
			$value = isset ( $entry [1] ) ? trim ( $entry [1] ) : '';
			if ($key)
				$r [$key] = $value;
		}
		return $r;
	}
}
Source::run ();
?>