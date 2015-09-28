<?php
class Build {
	public static $projectPath;
	public static $projectURL;
	private static function resolvePathes($projectName) {
		self::$projectPath = realpath ( dirname ( __FILE__ ) . "/../../$projectName" );
		$abs = str_replace ( '\\', '/', self::$projectPath );
		$root = $_SERVER ['DOCUMENT_ROOT'];
		$root = str_replace ( '\\', '/', $root );
		self::$projectURL = str_replace ( $root, '', $abs ) . "/";
	}
	public static function debug($projectName) {
		self::resolvePathes ( $projectName );
		$content = file_get_contents ( self::$projectPath . "/$projectName.source.json" );
		$build = json_decode ( $content );
		
		foreach ( $build->css as $key => $url )
			echo self::encodeCSS ( self::$projectURL . "css/" . $url );
		
		foreach ( $build->libs as $key => $url )
			echo self::encodeJavaScript ( self::$projectURL . "libs/" . $url );
		
		foreach ( $build->src as $key => $url )
			echo self::encodeJavaScript ( self::$projectURL . "src/" . $url );
	}
	private static function encodeCSS($url) {
		return "<link type='text/css' rel='stylesheet' href='$url' >\n";
	}
	private static function encodeJavaScript($url) {
		return "<script type='text/javascript' src='$url'></script>\n";
	}
}
?>