<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>QuakeWorldTube - Gehenna</title>
	
	<link href="css/soda/reset.css" rel="stylesheet">
	<link href="css/soda/columns.css" rel="stylesheet">
	<link href="css/soda/icon.css" rel="stylesheet">
	<link href="css/soda/loader.css" rel="stylesheet">
	<link href="css/soda/messages.css" rel="stylesheet">
	<link href="css/quakeworld_tube.css" rel="stylesheet">
	<link href="css/hud.css" rel="stylesheet">
	<link href="css/controls.css" rel="stylesheet">
		
</head>
<body>
<main class="Columns thirds">
	<section class="two">
		<div id="player">

		</div>
	</section>
	<section id="list">
		<?php require_once('demo_listing.php'); ?>
		<ul>
			<?php foreach ($files as $file) { ?>
			<li onclick="demo_play('<?php echo $file['name']?>');">
				<?php echo $file['team1']; ?> -vs- <?php echo $file['team2']; ?> [<?php echo $file['map']; ?>] <a class="Icon l" href="<?php echo $_SERVER['REQUEST_URI'] ?>demos/<?php echo $file['name']?>"><svg><use></svg></a>
				<time datetime=""><?php echo $file['date']; ?></time>
			</li>
			<?php } ?>
		</ul>
	</section>
	<section id="meta">
	</section>
	<section id="scoreboard">
		<div id="controls">
			<div class="progress">
				<div class="buffered"></div>
				<div class="current"></div>
			</div>
			
		</div>
		<button id="playPause">Play/Pause</button>
		<button id="frameByFrame">FrameByFrame</button>
		<button id="switch">next player</button>
		<label>
			Demo Speed
			<select id="speed">
				<option value=".1">.1</option>
				<option value=".25">.25</option>
				<option value=".5">.5</option>
				<option value=".75">.75</option>
				<option value="1" selected>1</option>
				<option value="1.5">1.5</option>
				<option value="2">2</option>
				<option value="3">3</option>
				<option value="5">5</option>
			</select>
		</label>
		<div id="player_name"></div>
		<div id="team_scores"></div>
	</section>
</main>
<script src="three/three.min.js"></script>
<script src="three/stats.min.js"></script>
<script src="three/MTLLoader.js"></script>
<script src="three/OBJLoader.js"></script>
<script src="three/GPUParticleSystem.js"></script>
<script src="javascript/core.js"></script>
<script src="javascript/soda/soda.js"></script>
<script src="javascript/soda/loader.js"></script>
<script src="quakeworld_tube/quakeworld_tube.js"></script>
<script src="quakeworld_tube/commands.js"></script>
<script src="quakeworld_tube/renderer.js"></script>
<script src="quakeworld_tube/assets.js"></script>
<script src="quakeworld_tube/mvd.js"></script>
<script src="quakeworld_tube/qw.js"></script>
<script>

	var MyQuakeWorldTube = null;

	var playPause = document.getElementById('playPause');

	/*playPause.addEventListener('click', function(){

		QuakeWorldTube.pause = QuakeWorldTube.pause ? false : true;
		console.log('PlayPause: ', QuakeWorldTube.pause);
	});*/
	
	function demo_play(demo)
	{
		if (MyQuakeWorldTube)
		{
			MyQuakeWorldTube.shutdown();
			MyQuakeWorldTube = null;
		}
		
		document.getElementById('player_name').innerHTML = '';
		document.getElementById('team_scores').innerHTML = '';
		
		MyQuakeWorldTube = new QuakeWorldTube.init(document.getElementById('player'), 'demos/' + demo);
	}
	
	function player_switch()
	{
		if (MyQuakeWorldTube == null)
		{
			return;
		}
		
		document.getElementById('player_name').innerHTML = MyQuakeWorldTube.player_switch();
	}
	
	function team_scores()
	{
		if (MyQuakeWorldTube == null)
		{
			return;
		}
		
		document.getElementById('team_scores').innerHTML = MyQuakeWorldTube.team_scores();
	}
</script>
</body>
</html>
