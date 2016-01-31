<?php
function send_command($plugin, $method, $options) {
	$host = "localhost";
	$port = "3008";
	
	$socket = socket_create ( AF_INET, SOCK_STREAM, SOL_TCP ) or die ( "Unable to create socket\n" );
	
	$time = time ();
	if (! @socket_connect ( $socket, $host, $port )) {
		$err = socket_last_error ( $socket );
		die ( socket_strerror ( $err ) . " - ERRORED\n" . $err );
	}
	
	$in = array (
			'plugin' => $plugin,
			'method' => $method,
			'options' => $options 
	);
	$in = json_encode ( $in );
	
	socket_write ( $socket, $in, strlen ( $in ) + 1 );
	$buffer = socket_read ( $socket, 8192 );
	socket_close($socket);
	echo $buffer;
}

$file = "/wfb/sixcms_template_checkout_dir/bo-framework/sites/wfb/components/views/wfb_navigation_v1_v_d.cmst";
$line_number = 132;
send_command ( 'filesystem', 'openFile', array (
		'file' => $file,
		'line-number' => $line_number 
) );
?>