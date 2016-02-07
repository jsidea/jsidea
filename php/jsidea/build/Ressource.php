<?php

namespace jsidea\build;

class Ressource {
	private static $projectPath;
	private static $projectURL;
	public static function debug($projectName) {
		self::resolvePathes ( $projectName );
		$content = file_get_contents ( self::$projectPath . "/base.source.json" );
		$build = json_decode ( $content, true );
		
		$output = '';
		foreach ( $build ['js'] as $key => $url )
			$output .= self::encodeJavaScript ( self::parseURL ( $url ) );
		
		foreach ( $build ['ts'] as $key => $url )
			$output .= self::encodeJavaScript ( self::parseURL ( str_replace ( '.ts', '.js', $url ) ) );
		
		foreach ( $build ['css'] as $key => $url )
			$output .= self::encodeCSS ( self::parseURL ( $url ) );
		return $output;
	}
	private static function resolvePathes($projectName) {
		// TODO: replace this ugly coding
		self::$projectPath = realpath ( dirname ( __FILE__ ) . "/../../../../$projectName" );
		$abs = str_replace ( '\\', '/', self::$projectPath );
		$root = $_SERVER ['DOCUMENT_ROOT'];
		$root = str_replace ( '\\', '/', $root );
		self::$projectURL = str_replace ( $root, '', $abs ) . "/";
	}
	private static function parseURL($url) {
		if (strpos ( $url, "!" ) === 0)
			return "";
		return self::$projectURL . $url;
	}
	private static function encodeCSS($url) {
		if (! $url)
			return "";
		return "<link type='text/css' rel='stylesheet' href='$url' >\n";
	}
	private static function encodeJavaScript($url) {
		if (! $url)
			return "";
		return "<script type='text/javascript' src='$url' defer></script>\n";
	}
}
?>