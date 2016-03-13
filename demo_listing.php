<?php
	function sort_func($a, $b)
	{
		if ($a['time'] == $b['time'])
		{
			return 0;
		}

		return ($a['time'] < $b['time']) ? 1 : - 1;
	}

	$dir = dirname(__FILE__) . '/demos';
	$handle = opendir($dir);
	$count = 0;

	while (($file = readdir($handle)) != false)
	{
		if (is_file($dir.'/'.$file) && preg_match('/.mvd$/i', $file) && filectime($dir.'/'.$file) + 60 < $_SERVER['REQUEST_TIME'])
		{
			sscanf($file, '%[^_]_%[^_]_vs_%[^[][%[^]]%[^.]', $files[$count]['mode'], $files[$count]['team1'], $files[$count]['team2'], $files[$count]['map'], $files[$count]['time']);

			$obj = date_parse_from_format('dmy-Hi', $files[$count]['time']);

			$files[$count]['time'] = mktime($obj['hour'], $obj['minute'], $obj['second'], $obj['month'], $obj['day'], $obj['year']);
			$files[$count]['date'] = date('D d.m.Y H:i', $files[$count]['time']);
			$files[$count]['name'] = $file;
			
			$count++;
		}
	}
	closedir($handle);

	usort($files, 'sort_func');

	$files = array_slice($files, 0, 15);