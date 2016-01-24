<!DOCTYPE html>
<html lang="de">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<!-- <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /> -->
<title>jsidea</title>
<link
	href='https://fonts.googleapis.com/css?family=Open+Sans:400,300italic,600,600italic'
	rel='stylesheet' type='text/css'>
<?php
include (realpath ( dirname ( __FILE__ ) . '/../php/jsidea/build/Build.php' ));
echo jsidea\build\Build::debug ( "jsidea" );
?>
</head>
<body data-plugin="Builder">
</body>
</html>