<?php
function __autoload($class_name) {
	$path = preg_replace ( '/\\\/', '/', $class_name );
	include $path . '.php';
}
?>