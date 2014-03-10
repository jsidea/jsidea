<?php
class Ressource {
	public static function importAll($projectName) {
		echo self::importCSS ( $projectName );
		echo self::importJavaScript ( $projectName );
		echo self::importTypeScript ( $projectName );
	}
	public static function importCSS($projectName, $referencesFileName = "references.css.xml") {
		return self::parseXML ( array (
				'Ressource',
				'encodeCSS' 
		), "CSS", $projectName, $referencesFileName );
	}
	public static function importJavaScript($projectName, $referencesFileName = "references.javascript.xml") {
		return self::parseXML ( array (
				'Ressource',
				'encodeJavaScript' 
		), "JavaScript", $projectName, $referencesFileName );
	}
	public static function importTypeScript($projectName, $referencesFileName = "references.typescript.ts") {
		$result = "<!-- $projectName/TypeScript -->\n";
		$projectPathRelative = self::resolveProjectPathRelative ( $projectName );
		$projectPath = self::resolveProjectPathAbsolute ( $projectName );
		$refs = file_get_contents ( $projectPath . "/" . $referencesFileName );
		preg_match_all ( "/path.*\=.*[\"\'].*[\"\']/i", $refs, $out );
		$res = $out [0];
		for($i = 0; $i < count ( $res ); ++ $i) {
			$importPath = $res [$i];
			$importPath = preg_replace ( "/path.*\=[\"\']/i", "", $importPath );
			$importPath = preg_replace ( "/\.ts.*[\"\']*/i", ".js", $importPath );
			if (strpos ( $importPath, ".." ) === false && strpos ( $importPath, "definitions/" ) === false)
				$result .= "<script type='text/javascript' src='$projectPathRelative/$importPath'></script>\n";
		}
		return $result;
	}
	public static function importJavaScriptOnline($url) {
		return "<script type='text/javascript' src='$url'></script>\n";
	}
	private static function encodeCSS($projectPathRelative, $importPath) {
		return "<link type='text/css' rel='stylesheet' href='$projectPathRelative/css/$importPath' >\n";
	}
	private static function encodeJavaScript($projectPathRelative, $importPath) {
		return "<script type='text/javascript' src='$projectPathRelative/libs/$importPath'></script>\n";
	}
	private static function resolveProjectPathAbsolute($projectName) {
		return realpath ( dirname ( __FILE__ ) . "/../../" . $projectName );
	}
	private static function resolveProjectPathRelative($projectName) {
		$abs = self::resolveProjectPathAbsolute ( $projectName );
		$abs = str_replace ( '\\', '/', $abs );
		$root = $_SERVER ['DOCUMENT_ROOT'];
		$root = str_replace ( '\\', '/', $root );
		return str_replace ( $root, '', $abs );
	}
	private static function parseXML($encoderFunction, $type, $projectName, $referencesFileName = "references.css.xml") {
		$result = "<!-- $projectName/$type -->\n";
		$projectPathRelative = self::resolveProjectPathRelative ( $projectName );
		$projectPath = self::resolveProjectPathAbsolute ( $projectName );
		$bui = file_get_contents ( $projectPath . "/" . $referencesFileName );
		$bui = preg_replace ( "/\<\!\-\- *.* *\-\-\>/s", "", $bui );
		preg_match_all ( "/src.*src/i", $bui, $out );
		$res = $out [0];
		for($i = 0; $i < count ( $res ); ++ $i) {
			$importPath = $res [$i];
			if (strpos ( $importPath, ".." ) !== false)
				continue;
			$importPath = preg_replace ( "/.*src.*\>/i", "", $importPath );
			$importPath = preg_replace ( "/\< *\/ *src.*/i", "", $importPath );
			$result .= $encoderFunction ( $projectPathRelative, $importPath );
		}
		return $result;
	}
}
?>