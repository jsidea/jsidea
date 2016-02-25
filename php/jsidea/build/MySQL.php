<?php

namespace jsidea\build;

use jsidea\core\File;

class MySQL {
	public static function dump($options) {
		// For windows operation systems
		$mysqldump = '';
		if (strtoupper ( substr ( PHP_OS, 0, 3 ) ) === 'WIN') {
			$mysqldump = $_SERVER ['DOCUMENT_ROOT'] . '/../mysql/bin/mysqldump.exe';
		} else {
			$mysqldump = '/usr/bin/mysqldump';
		}
		
		if (! file_exists ( $mysqldump )) {
			return 'Could not find mysqldump: ' . $mysqldump;
		}
		
		$props = [ 
				'user',
				'password',
				'host',
				'database',
				'file' 
		];
		
		$missing_props = array ();
		foreach ( $props as $prop ) {
			if (! isset ( $options [$prop] ) || ! trim ( $options [$prop] )) {
				$missing_props [] = $prop;
			}
		}
		
		if (count ( $missing_props ) > 0) {
			return "Missing props: " . implode ( ', ', $missing_props ) . '.';
		}
		
		$user = $options ['user'];
		$password = $options ['password'];
		$host = $options ['host'];
		$database = $options ['database'];
		$file = $options ['file'];
		
		ignore_user_abort ( 1 );
		$cmd = "$mysqldump -u $user -p$password -h $host $database";
// 		$tab = ' --tab ' . __DIR__ . '/test';
		
		$result = self::run_process ( $cmd );
		
		if (isset ( $result ['error'] )) {
			print_r ( $result ['error'] );
			return;
		}
		
		$sql_string = $result ['out'];
		
		// save the sql-file
		if ($sql_string) {
			file_put_contents ( $file, $sql_string );
		} else {
			return "File empty";
		}
		
		return 'Done';
	}
	public static function import($options) {
		// For windows operation systems
		$mysql = '';
		if (strtoupper ( substr ( PHP_OS, 0, 3 ) ) === 'WIN') {
			$mysql = $_SERVER ['DOCUMENT_ROOT'] . '/../mysql/bin/mysql.exe';
		} else {
			$mysql = '/usr/bin/mysql';
		}
		
		if (! file_exists ( $mysql )) {
			return 'Could not find mysql: ' . $mysql;
		}
		
		$props = [ 
				'user',
				'password',
				'host',
				'database',
				'file' 
		];
		
		$missing_props = array ();
		foreach ( $props as $prop ) {
			if (! isset ( $options [$prop] ) || ! trim ( $options [$prop] )) {
				$missing_props [] = $prop;
			}
		}
		
		if (count ( $missing_props ) > 0) {
			return "Missing props: " . implode ( ', ', $missing_props ) . '.';
		}
		
		$user = $options ['user'];
		$password = $options ['password'];
		$host = $options ['host'];
		$database = $options ['database'];
		$file = $options ['file'];
		$port = isset($options ['port']) ? $options ['port'] : '3306';
		
		$cmd = "$mysql -u $user -p$password -h $host --port=$port $database < $file";
// 		$cmd = "$mysql -u $user -p$password -h $host --port=$port $database < $file";
// 		$cmd = "$mysql -u $user -p$password -f --default-character-set=utf8 -A -D$database < $file";
		$result = self::run_process ( $cmd );
		
		if (isset ( $result ['error'] )) {
			print_r ( $result ['error'] );
			return;
		}
		
		print_r($result);
		
		return 'Done';
	}
	private static function run_process($cmd) {
		$process = proc_open ( $cmd, array (
				array (
						"pipe", // STDIN
						"r" 
				),
				array (
						"pipe", // STOUT
						"w" 
				),
				array (
						"pipe", // STERR
						"w" 
				) 
		), $pipes );
		
		$result = array ();
		
		// Output std-out and std-error
		$sql_string = stream_get_contents ( $pipes [1] );
		// echo $sql_string;
		$err = stream_get_contents ( $pipes [2] );
		if ($err) {
			$result ['error'] = $err;
			return $result;
		}
		
		// close out/error
		fclose ( $pipes [1] );
		fclose ( $pipes [2] );
		
		// close process
		proc_close ( $process );
		
		// reset ignore user abort
		ignore_user_abort ( 0 );
		
		$result ['out'] = $sql_string;
		
		return $result;
	}
}
?>