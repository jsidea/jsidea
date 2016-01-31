<?php
function send_command($command) {
	$host = "localhost";
	$port = "3008";
	$timeout = 15; // timeout in seconds
	
	$socket = socket_create ( AF_INET, SOCK_STREAM, SOL_TCP ) or die ( "Unable to create socket\n" );
	
	// socket_set_nonblock ( $socket ) or die ( "Unable to set nonblock on socket\n" );
	
	set_time_limit ( 0 );
	
	$time = time ();
	if (! @socket_connect ( $socket, $host, $port )) {
		$err = socket_last_error ( $socket );
		// if ($err == 115 || $err == 114) {
		// if ((time () - $time) >= $timeout) {
		// socket_close ( $socket );
		// die ( "Connection timed out.\n" );
		// }
		// sleep ( 1 );
		// continue;
		// }
		die ( socket_strerror ( $err ) . " - ERRORED\n" . $err );
	}
	
	$in = $command;
	$file = "PUT YOUR ABSOLUTE OR RELATIVE PATH HERE";
	$line_number = 105;
	$in = array (
			'plugin' => 'filesystem',
			'method' => 'openFile',
			'options' => array (
					'file' => $file,
					'line-number' => $line_number 
			) 
	);
	$in = json_encode ( $in );
	
	// socket_send($socket, $buf, $len, $flags);
	socket_write ( $socket, $in, strlen ( $in ) );
	
	// socket_set_block ( $this->socket ) or die ( "Unable to set block on socket\n" );
}
send_command ( "TEST" );
?>