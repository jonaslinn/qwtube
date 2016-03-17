'use strict';

QuakeWorldTube.mvd = function(qwTube, commandParser)
{
	var mvd = {
			arrayBuffer: null,
			buffer: null,
			time_curr: 0,
			time_prev: 0,
			offset: 0,

			duration: 0,
			seconds2bytes: {},
			time: 0,

			loadedBytes: 0,
			totalBytes: 0,
		},

		isStreaming = false,
		isParsing   = false,
		isFailing   = false,

		setDemoTime = function(time)
		{
			while(!mvd.seconds2bytes[time++]){}

			mvd.offset = mvd.seconds2bytes[time];
			mvd.demotime = time;

			return time;
		},

		parseFrame = function(time)
		{
			var	currentBytes,
				msgDelta = 0,
				messageSize = mvd.offset,
				type,
				cmd,


				message = null;

			if(mvd.buffer == null)
			{
				return 0;
			}

			isParsing = true;

			while(true)
			{

				if(isFailing)
				{
					console.log('Stopped parsing, due to mvd.isFailing.');
					return;
				}

				if(mvd.offset >= mvd.totalBytes)
				{
					break;
				}

				currentBytes = mvd.offset;

				if(currentBytes == messageSize)
				{
					msgDelta = mvd.buffer.getUint8(currentBytes);
					type = mvd.buffer.getUint8(currentBytes + 1) & 0x07;

					if(mvd.time_curr > time && msgDelta > 0)
					{
						console.log('nextframe', mvd.time_curr);
						break;
					}

					if ( msgDelta > 0 )
					{
						mvd.time_prev = mvd.time_curr;
						qwTube.qw.moveEntities();
					}

					mvd.time_curr += msgDelta;

					currentBytes += 2;

					if (type == 2) // DEM_SET
					{
						currentBytes += 8;
						mvd.offset = currentBytes; // sync
						continue;
					}

					if (type == 3) //DEM_MULTIPLE
					{
						currentBytes += 4;
					}

					messageSize = mvd.buffer.getUint32(currentBytes, true);
					currentBytes += 4;

					messageSize += currentBytes;

					if(isStreaming && messageSize > mvd.loadedBytes)
					{
						console.log('Not enough Bytes. Waiting...');
						
						isParsing = false;
						return false;
					}
				}

				mvd.offset = currentBytes; // sync

				cmd = mvd.buffer.getUint8(mvd.offset);
				mvd.offset++;

				try
				{
					//console.log('CMD: ' + cmd);
					commandParser[cmd](mvd);
				}
				catch( error )
				{
					isFailing = true;
					isParsing = false;

					if( typeof commandParser[cmd] == 'function' )
					{
						console.log('Error in CMD: ' + cmd, error);
					}
					else
					{
						console.log('CMD: ' + cmd + ' not defined.');
					}
					return;
				}

			}

			isParsing = false;


			return 1.0 - (mvd.time_curr - time) / (mvd.time_curr - mvd.time_prev);
		},

		/*parseGameData = function(options)
		{
			var defaultOptions = {
					'onComplete': function(){}
				},
				options = core.mergeObjects(defaultOptions, options),

				SVC_SPAWNSTATICSOUND = 29, // breakpoint
				messageSize = 0,

				gameData = {
					'deathmatch': 0,
					'hostname'  : '',
					'mapName'   : '',
					'modelList' : [],
					'soundList' : [],
					'teamplay'  : 0,
					'timelimit' : 0,
					'type'      : '',
				},

				commandParser = QuakeWorldTube.commands(),

				readFullServerInfo = function(serverInfo)
				{
					var infoArray = serverInfo.split('\\'),
					    fullServerInfo = {};

					infoArray.shift();
					infoArray.forEach(function(key, index){
						if(index % 2 === 0)
						{
							switch(key)
							{
								case 'deathmatch':
								case 'maxclients':
								case 'maxfps':
								case 'teamplay':
								case 'timelimit':
								case 'watervis':
									fullServerInfo[key] = parseInt(infoArray[index + 1]);
									break;
								default:
									fullServerInfo[key] = infoArray[index + 1];

							}
						}
					});
					return fullServerInfo;
				},


				parse = function()
				{
					var cmd,
					    currentBytes,
					    type;

					if(isFailing)
					{
						console.log('Stopped gathering gamedata, due to mvd.isFailing.');
						return false;
					}

					if(mvd.buffer == null)
					{
						requestAnimationFrame(parse); // wait until buffer is ready
						return;
					}

					while(true)
					{

						currentBytes = mvd.offset;

						if(currentBytes == messageSize)
						{

							currentBytes++;
							type = mvd.buffer.getUint8(currentBytes) & 0x07;

							currentBytes++;

							if (type == 2) // DEM_SET
							{
								currentBytes += 8;
								mvd.offset = currentBytes; // sync
								continue;
							}

							if (type == 3) //DEM_MULTIPLE
							{
								currentBytes += 4;
							}

							messageSize = mvd.buffer.getUint32(currentBytes, true);
							currentBytes += 4;

							messageSize += currentBytes;

							if(isStreaming && messageSize > mvd.loadedBytes)
							{

								messageSize = mvd.offset; // quick fix

								console.log(mvd.offset, currentBytes, messageSize, mvd.loadedBytes);
								console.log('Not enough Bytes. Waiting...');
								
								requestAnimationFrame(parse);

								return;
							}

						}

						cmd = mvd.buffer.getUint8(currentBytes);
						currentBytes++;

						if(cmd == SVC_SPAWNSTATICSOUND)
						{
							break;
						}

						mvd.offset = currentBytes; // sync

						try
						{
							console.log('CMD: ' + cmd);
							switch(cmd)
							{
								case 9:
									gameData = core.mergeObjects(readFullServerInfo(commandParser[cmd](mvd)), gameData);
									break;
								case 11:
									gameData.mapName = commandParser[cmd](mvd);
									break;
								case 45:
									gameData.modelList = gameData.modelList.concat(commandParser[cmd](mvd));
									break;
								case 46:
									gameData.soundList = gameData.soundList.concat(commandParser[cmd](mvd));
									break;
								default:
									commandParser[cmd](mvd);
							}

						}
						catch(error)
						{
							if(typeof commandParser[cmd] == 'function')
							{
								console.log('Error in CMD: ' + cmd, error);
							}
							else
							{
								console.log('CMD: ' + cmd + ' not defined.');
							}
							return;
						}

					}

					isParsing = false;

					options.onComplete(gameData);

				};

			isParsing = true;

			parse();

		},*/

		getMVDDuration = function(options)
		{
			var defaultOptions = {
					'onComplete': function(elapsedTime, frames){},
					'onProgress': function(elapsedTime, percentageProcessed){}
				},
				options = core.mergeObjects(defaultOptions, options),

				bytes = 0,
				elapsedTime = 0,
				frames = 0,

				seek = function()
				{
					var type,
					    currentBytes,
					    timeDelta;

					if(isFailing)
					{
						console.log('Stopped gathering gamedata, due to mvd.isFailing.');
						return;
					}

					if(mvd.buffer == null)
					{
						requestAnimationFrame(seek); // wait until buffer is ready
						return;
					}

					while(true)
					{
						if(bytes == mvd.totalBytes && mvd.totalBytes)
						{
							break;
						}

						currentBytes = bytes;

						timeDelta = mvd.buffer.getUint8(currentBytes);
						type = mvd.buffer.getUint8(currentBytes + 1) & 0x07;

						currentBytes += 2;

						if (type == 2) // DEM_SET
						{
							currentBytes += 8;
							continue;
						}

						if (type == 3) //DEM_MULTIPLE
						{
							currentBytes += 4;
						}

						currentBytes += mvd.buffer.getUint32(currentBytes, true);

						currentBytes += 4;

						if(isStreaming && currentBytes > mvd.loadedBytes)
						{
							console.log('Not enough Bytes. Waiting...');
							
							requestAnimationFrame(seek);

							return;
						}

						elapsedTime += timeDelta;

						if(elapsedTime % 1000 < 40)
						{
							mvd.seconds2bytes[elapsedTime] = bytes;
							options.onProgress(elapsedTime, bytes / mvd.totalBytes);
						}

						frames++;

						bytes = currentBytes;						

					}

					mvd.duration = elapsedTime;

					options.onComplete(mvd.duration, frames);
				};

			seek();
		},

		streamMVD = function(url, options)
		{
			var defaultOptions = {
				'onError': function(){},
				'onLoadEnd': function(){},
				'onLoadStart': function(){},
				'onProgress': function(){}
				},
				options = core.mergeObjects(defaultOptions, options),
				request = null;
			
			if(self.fetch)
			{
				isStreaming = true;
				request = new Request(url);

				fetch(request).then(function(response) 
				{
					var reader = response.body.getReader(),

						stream = function()
						{
							return reader.read().then(function(chunk)
							{

								if(chunk.done)
								{
									mvd.loadedBytes = mvd.totalBytes;
									options.onLoadEnd();
									return;
								}

								options.onProgress(mvd.loadedBytes, mvd.totalBytes);

								mvd.arrayBuffer.set(new Uint8Array(chunk.value.buffer), mvd.loadedBytes);

								mvd.loadedBytes += chunk.value.buffer.byteLength;

								return stream();
							});
						};

					mvd.totalBytes = response.headers.get('Content-Length');

					mvd.arrayBuffer = new Uint8Array(mvd.totalBytes);

					mvd.buffer = new DataView(mvd.arrayBuffer.buffer);
					
					stream();

					options.onLoadStart(mvd.totalBytes);
					
				});// todo catch failed promise

				return;
			}

			console.log('No streaming => ajax request');

			options.responseType = 'arraybuffer';
			options.url = url;

			var progressWrapper = options.onProgress;

			options.onProgress = function(event)
			{
				progressWrapper(event.loaded, event.total);
			}

			options.onLoad = function(event)
			{
				mvd.totalBytes = event.total;
				mvd.buffer = new DataView(request.getResponse('raw'));
			}

			request = core.request(options);

			request.send();

		};

		


	return {
		getMVDDuration : getMVDDuration,
		parseFrame     : parseFrame,
		setDemoTime    : setDemoTime,
		streamMVD      : streamMVD,

		isFailing   : isFailing,
		isParsing   : isParsing,
		isStreaming : isStreaming,

	}
}