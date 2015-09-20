<?php
class Ressource {
	public static function debug($build) {
		echo self::importCSS ( $build );
		echo self::importJavaScript ( $build );
		echo self::importTypeScript ( $build );
	}
	public static function build($build) {
		$projectPathRelative = self::resolveProjectPathRelative ();
		echo self::importCSSOnline ( "$projectPathRelative/bin/$build/css/$build.min.css" );
		echo self::importJavaScriptOnline ( "$projectPathRelative/bin/$build/js/$build.libs.min.js" );
		echo self::importJavaScriptOnline ( "$projectPathRelative/bin/$build/js/$build.min.js" );
	}
	private static function importCSS($build) {
		return self::parseXML ( array (
				'Ressource',
				'encodeCSS' 
		), "CSS", $build, "build/" . $build . "/" . $build . ".css.xml" );
	}
	private static function importJavaScript($build) {
		return self::parseXML ( array (
				'Ressource',
				'encodeJavaScript' 
		), "JavaScript", $build, "build/" . $build . "/" . $build . ".javascript.xml" );
	}
	private static function importTypeScript($build) {
		$result = "<!-- $build/TypeScript -->\n";
		$projectPathRelative = self::resolveProjectPathRelative ();
		$projectPath = self::resolveProjectPathAbsolute ();
		$refs = file_get_contents ( $projectPath . "/src/" . $build . ".ts" );
		preg_match_all ( "/path.*\=.*[\"\'].*[\"\']/i", $refs, $out );
		$res = $out [0];
		for($i = 0; $i < count ( $res ); ++ $i) {
			$importPath = $res [$i];
			$importPath = preg_replace ( "/path.*\=[\"\']/i", "", $importPath );
			$importPath = preg_replace ( "/\.ts.*[\"\']*/i", ".js", $importPath );
			// if (strpos ( $importPath, ".." ) === false && strpos ( $importPath, "definitions/" ) === false)
			if (strpos ( $importPath, "definitions/" ) === false)
				$result .= "<script type='text/javascript' src='$projectPathRelative/src/$importPath'></script>\n";
		}
		return $result;
	}
	private static function importJavaScriptOnline($url, $condition) {
		return self::wrapCondition ( "<script type='text/javascript' src='$url'></script>\n", $condition );
	}
	private static function importCSSOnline($url, $condition) {
		return self::wrapCondition ( "<link type='text/css' rel='stylesheet' href='$url' >\n", $condition );
	}
	private static function encodeCSS($projectPathRelative, $importPath, $condition) {
		return self::wrapCondition ( "<link type='text/css' rel='stylesheet' href='$projectPathRelative/css/$importPath' >\n", $condition );
	}
	private static function encodeJavaScript($projectPathRelative, $importPath, $condition) {
		return self::wrapCondition ( "<script type='text/javascript' src='$projectPathRelative/libs/$importPath'></script>\n", $condition );
	}
	private static function resolveProjectPathAbsolute() {
		return realpath ( dirname ( __FILE__ ) . "/../../jsidea" );
	}
	private static function wrapCondition($result, $condition) {
		if ($condition)
			return "<![if $condition]>\n$result<![endif]>\n";
		return $result;
	}
	private static function resolveProjectPathRelative() {
		$abs = self::resolveProjectPathAbsolute ();
		$abs = str_replace ( '\\', '/', $abs );
		$root = $_SERVER ['DOCUMENT_ROOT'];
		$root = str_replace ( '\\', '/', $root );
		return str_replace ( $root, '', $abs );
	}
	private static function parseXML($encoderFunction, $type, $build, $referencesFileName) {
		$result = "<!-- $build/$type -->\n";
		$projectPathRelative = self::resolveProjectPathRelative ();
		$projectPath = self::resolveProjectPathAbsolute ();
		$xmlString = file_get_contents ( $projectPath . "/" . $referencesFileName );
		$scripts = new SimpleXMLElement ( $xmlString );
		$sources = $scripts->src;
		for($i = 0; $i < count ( $sources ); ++ $i) {
			$filename = $sources [$i];
			$condition = $sources [$i] ["condition"];
			$result .= $encoderFunction ( $projectPathRelative, $filename, $condition );
		}
		return $result;
	}
}
?>