<?php
function send_command($plugin, $method, $options) {
	$host = "localhost";
	$port = "3009";
	
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
	
	// Write the request.
	socket_write ( $socket, $in, strlen ( $in ) );
	// Get the response.
	$response = socket_read ( $socket, 8192 );
	$json_result = json_decode($response, true);
	
	//If the result is async, just wait for the response
	if($json_result['kind'] == 'async')
	{
		// Get the response.
		$async_response = socket_read ( $socket, 8192 );
//  		$async_response = mb_convert_encoding($async_response, "UTF-8");
		$json_result = json_decode($async_response, true);
	}
	
	socket_close ( $socket );
	
	print_r($json_result);
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
// 'message' => 'HELLO WORLD FROM PHP'
// ) );
// send_command ( 'console', 'clear', array (
// 'message' => 'HELLO WORLD FROM PHP'
// ) );
// send_command ( 'console', 'error', array (
// 'message' => 'HELLO WORLD FROM PHP'
// ) );
// send_command ( 'console', 'log', array (
// 'message' => 'HELLO WORLD FROM PHP',
// 'color' => 0x00FF00
// ) );
header('Content-Type: text/html; charset=utf-8');
send_command ( 'prompt', 'messageBox', array (
		'message' => 'HELLO WORLD FROM PHP' 
) );
?>