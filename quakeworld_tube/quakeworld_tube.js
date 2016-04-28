/*
 * QuakeWorldTube
 *
 * Copyright (C) 2012-2013 Florian Zwoch <fzwoch@gmail.com>
 *
 *
 * Credits:
 *
 * Quake Revitalization Project (http://qrp.quakeone.com/)
 * three.js (https://github.com/mrdoob/three.js/)
 */

'use strict';

var QuakeWorldTube = {};

QuakeWorldTube.init = function(container, url, options)
{
	var defaultOptions = {
			'path': 'quakeworld_tube/'
		},
		options = core.mergeObjects(defaultOptions, options),

		stats = new Stats(),

		mvdLoader = new soda.loader(),

		timer,

		qwTube = this,

		loop = function(timestamp)
		{
			var messages = [],
				message = null,
				previousTimestamp = qwTube.demo.time,
				fac;

			stats.begin();

			requestAnimationFrame(loop);

			if(!timer.updateTime(timestamp))
			{
				stats.end();
				return;
			}

			fac = qwTube.mvd.parseFrame(qwTube.demo.time);

			qwTube.qw.updateEntities(fac, qwTube.demo.time, qwTube.demo.time - previousTimestamp);

			qwTube.renderer.updateCameraPosition(qwTube.qw.getPlayerCoords(), false, timestamp);

			qwTube.renderer.particleSystem.update(qwTube.demo.time);

			qwTube.renderer.render();

			stats.end();
		};

	stats.setMode(0); // 0: fps, 1: ms, 2: mb

	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = 0;
	stats.domElement.style.top = 0;
	stats.domElement.style.zIndex = 1;

	container.appendChild(stats.domElement);
		
	this.demo = {
		duration: 0,
		lerp: false,
		pause: false,
		frameByFrame: false,
		speed: 1,
		time: 0,
	};

	this.flags = {
		assetsLoaded: false,
		mapInitialized: false,
		mapLoaded: false,
		pauseForLoad: false,
	};


	this.assets = QuakeWorldTube.assets({
		'onLoad': function(){
			qwTube.qw.updateBaseline(qwTube.assets.models);
			qwTube.flags.pauseForLoad = false;
			//console.log(qwTube.flags);
		}
	});
	this.commandParser = QuakeWorldTube.commands(this);
	this.console = QuakeWorldTube.console.bind(this)(container);
	this.controls = QuakeWorldTube.controls(container, this);
	this.hud = QuakeWorldTube.hud(container);
	this.mvd = QuakeWorldTube.mvd(this, this.commandParser);
	this.qw = QuakeWorldTube.qw(this);
	this.renderer = QuakeWorldTube.renderer(container);
	this.stats = QuakeWorldTube.stats();

	timer = QuakeWorldTube.timer(this.demo, this.flags),

	
	this.mvd.streamMVD(url, {
		'onLoadEnd': mvdLoader.shutdown,
		'onLoadStart': function(){mvdLoader.init(container);},
		'onProgress': mvdLoader.setProgress
	});

	this.mvd.getMVDDuration({
		'onProgress': function(elapsedTime, percentageRead){
			/*console.log('Time: ', elapsedTime);
			console.log('position: ', position);
			console.log('estimated length: ', ((1/ position) * elapsedTime)*.001);*/
			this.demo.duration = (1 / percentageRead) * elapsedTime; // estimate
			this.controls.updateDuration(this.demo.duration);
		}.bind(this),
		'onComplete': function(elapsedTime, frames){
			console.log(elapsedTime, frames);
			this.demo.duration = elapsedTime;
			this.controls.updateDuration(this.demo.duration);
		}.bind(this)
	});

	/*this.mvd.parseGameData({
		'onComplete': function(gameData){
			console.log(gameData);
			this.assets.loadModels(gameData.modelList);
			//qw.init();
		}.bind(this)
	});*/
	requestAnimationFrame(loop);
}

QuakeWorldTube.timer = function(demo, flags)
{
	var previousTimestamp = performance.now(),

		updateTime = function(timestamp)
		{
			if(demo.pause || flags.pauseForLoad)
			{
				previousTimestamp = timestamp;
				return false;
			}

			demo.time += (timestamp - previousTimestamp) * demo.speed;

			previousTimestamp = timestamp;

			if(demo.frameByFrame)
			{
				demo.pause = true;
			}

			return true;
		};

	return {
		updateTime: updateTime
	}
}

QuakeWorldTube.console = function(container)
{
	var qwTube = this,
		log = function(string)
		{
			if(!qwTube.flags.mapInitialized && string.substr(0, 5) == 'skins')
			{
				qwTube.flags.pauseForLoad = true;
				qwTube.assets.loadModels();
				console.log('Start the show!');
				return;
			}
			console.log('console: ' + string);
		};

	return {
		log: log
	}
}

QuakeWorldTube.hud = function()
{

}

QuakeWorldTube.stats = function()
{

}

QuakeWorldTube.controls = function(container, qwTube)
{
	var controls = document.createElement('div'),
		progress = document.createElement('div'),
		buffered = document.createElement('div'),

		frameByFrameButton = document.getElementById('frameByFrame'),
		playPauseButton = document.getElementById('playPause'),

		switchButton = document.getElementById('switch'),
		speedSelect = document.getElementById('speed'),


		frameByFrame = function()
		{
			qwTube.demo.frameByFrame = true;
			qwTube.demo.pause = false;
		},

		switchPlayer = function()
		{
			qwTube.qw.switchPlayer();
		},

		playPause = function()
		{
			qwTube.demo.frameByFrame = false;
			qwTube.demo.pause = qwTube.demo.pause ? false : true;
		},

		setTime = function(newTime)
		{
			if(!qwTube.flags.mapInitialized || newTime < 0 || newTime > qwTube.demo.duration)
			{
				return;
			}

			while(qwTube.mvd.isParsing){} // experimental

			qwTube.demo.time = qwTube.mvd.setDemoTime(newTime);
		},
		setSpeed = function(newSpeed)
		{
			qwTube.demo.speed = Math.min(Math.max(parseFloat(newSpeed), .1), 5);
		},


		updateDuration = function(duration)
		{

		};

	frameByFrameButton.addEventListener('click', frameByFrame);
	playPauseButton.addEventListener('click', playPause);
	switchButton.addEventListener('click', switchPlayer);
	speedSelect.addEventListener('change', function(){
		setSpeed(speedSelect.value);
	});

	return {
		'updateDuration': updateDuration
	}
}


QuakeWorldTube.updateUserInfo = function(playerId, userInfo)
{
	console.log('updateUserInfo', playerId, userInfo);
	/*player[id].name = "";
		player[id].team = "";
		player[id].spec = 0;
		
		scene.remove(player[id]);
		
		if (string.length)
		{
			var tmp = string.split("\\");
			
			for (var i = 1; i < tmp.length; i += 2)
			{
				switch (tmp[i])
				{
					case "name":
						player[id].name = tmp[i + 1];
						break;
					case "team":
						player[id].team = tmp[i + 1];
						break;
					case "*spectator":
						player[id].spec = tmp[i + 1];
						break;
					default:
						break;
				}
			}
		}
			
		if (player[id].name.length > 0 && player[id].spec == 0)
		{
			scene.add(player[id]);
		}*/
}

QuakeWorldTube.updatePing = function(playerId, ping)
{
	//console.log('updatePing', playerId, ping);
}

QuakeWorldTube.updateFrags = function(playerId, frags)
{
	console.log('updateFrags', playerId, frags);
}

QuakeWorldTube.dispatcher = function()
{
	//console.log(arguments);
}
