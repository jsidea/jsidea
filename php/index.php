<?php
use jsidea\build\MySQL;
use jsidea\core\File;

function __autoload($class_name) {
	$path = preg_replace ( '/\\\/', '/', $class_name );
	include $path . '.php';
}

// echo MySQL::dump ( array (
// 		'user' => '',
// 		'password' => '',
// 		'host' => '127.0.0.1',
// 		'database' => '',
// 		'output' => File::project ( ' ) 
// ) );

echo File::toURL(File::project ( 'jsidea/sql/ecomat.sql' ));

?>