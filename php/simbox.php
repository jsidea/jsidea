<!DOCTYPE html>
<html lang="de">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<!-- <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /> -->
<title>jsidea</title>
<?php include (realpath ( dirname ( __FILE__ ) . '/../php/Build.php')); jsidea\build\Build::debug ( "jsidea" );?>
</head>
<body data-plugin="Simbox">
	<select id="camera-select">
		<option>camStatic</option>
		<option>camDynamicTip</option>
		<option>camDynamicHandle</option>
		<option>camEgo</option>
	</select>
	<select id="tip-select">
		<option>positionTip</option>
		<option>positionHandle</option>
		<option>positionInjection</option>
		<option>positionNearest</option>
		<option>positionNext</option>
	</select>
	<select id="handle-select">
		<option>positionHandle</option>
		<option>positionTip</option>
		<option>positionInjection</option>
		<option>positionNearest</option>
		<option>positionNext</option>
	</select>
	<div id="crosshair">
		<div id="line-vert"></div>
		<div id="line-horz"></div>
		<div id="tip"></div>
		<div id="handle"></div>
	</div>
</body>
</html>