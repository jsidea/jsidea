<?php

namespace jsidea\core;

class File {
	public static function workspace() {
		return self::realpath ( __DIR__ . '/../../../../' );
	}
	public static function htdocs() {
		return self::realpath ( $_SERVER ['DOCUMENT_ROOT'] );
	}
	public static function project($project) {
		$path = self::workspace () . '/' . $project;
		return self::realpath ( $path );
	}
	public static function toURL($file) {
		$file = self::realpath($file);
		$path = str_replace ( self::htdocs (), '', $file );
		$protocol = strpos ( strtolower ( $_SERVER ['SERVER_PROTOCOL'] ), 'https' ) === FALSE ? 'http' : 'https';
		$base = $protocol . '://' . $_SERVER ["SERVER_NAME"];
		if ($_SERVER ["SERVER_PORT"] != '80') {
			$base .= ':' . $_SERVER ["SERVER_PORT"];
		}
		return $base . $path;
	}
	private static function realpath($file) {
		if (! $file) {
			return '';
		}
		$path = realpath ( $file );
		if (! $path)
			$path = $file;
		return str_replace ( '\\', '/', $path );
	}
}
?>