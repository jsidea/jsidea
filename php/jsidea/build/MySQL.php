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
				'output' 
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
		$output = $options ['output'];
		
		ignore_user_abort ( 1 );
		$cmd = "$mysqldump -u $user -p$password -h $host $database";
		$tab = ' --tab ' . __DIR__ . '/test';
		// $cmd .= $tab;
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
		
		// Output std-out and std-error
		$sql_string = stream_get_contents ( $pipes [1] );
		// echo $sql_string;
		$err = stream_get_contents ( $pipes [2] );
		if ($err) {
			return 'Error: ' . print_r ( $err, true );
		}
		
		// close out/error
		fclose ( $pipes [1] );
		fclose ( $pipes [2] );
		
		// close process
		proc_close ( $process );
		
		// reset ignore user abort
		ignore_user_abort ( 0 );
		
		// save the sql-file
		if ($sql_string) {
			file_put_contents ( $output, $sql_string );
		} else {
			return "File empty";
		}
		
		return 'Done';
	}
}
?>