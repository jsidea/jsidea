<?php
function send_command($plugin, $method, $options) {
	$host = "localhost";
	$port = "3008";
	
	$socket = socket_create ( AF_INET, SOCK_STREAM, SOL_TCP ) or die ( "Unable to create socket\n" );
	
	$time = time ();
	if (! @socket_connect ( $socket, $host, $port )) {
		$err = socket_last_error ( $socket );
		die ( socket_strerror ( $err ) . " - Call aborted\n" . $err );
	}
	
	$in = array (
			'plugin' => $plugin,
			'method' => $method,
			'options' => $options 
	);
	$in = json_encode ( $in );
	
	socket_write ( $socket, $in, strlen ( $in ) );
	$buffer = socket_read ( $socket, 8192 );
	socket_close ( $socket );
	echo $buffer;
}

// TEST EDITOR
// $file = "G:/software/xampp-portable/htdocs/eventfive/";
// $file .= "/wfb/sixcms_template_checkout_dir/bo-framework/sites/wfb/components/views/wfb_navigation_v1_v_d.cmst";
// $line_number = 131;
// send_command ( 'editor', 'openFile', array (
// 'file' => $file,
// 'line-number' => $line_number
// ) );

// TEST CONSOLE
// send_command ( 'console', 'log', array (
// 		'message' => 'HELLO WORLD FROM PHP' 
// ) );
 send_command ( 'console', 'clear', array (
 		'message' => 'HELLO WORLD FROM PHP'
 ) );
?>