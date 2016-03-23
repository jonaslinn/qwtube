'use strict';

QuakeWorldTube.commands = function(qwTube)
{
	var SVC_NOP                 =  1,
		SVC_DISCONNECT          =  2,
		SVC_UPDATESTAT          =  3,
		SVC_SETVIEW             =  5,
		SVC_SOUND               =  6,
		SVC_PRINT               =  8,
		SVC_STUFFTEXT           =  9,
		SVC_SETANGLE            = 10,
		SVC_SERVERDATA          = 11,
		SVC_LIGHTSTYLE          = 12,
		SVC_UPDATEFRAGS         = 14,
		SVC_STOPSOUND           = 16,
		SVC_DAMAGE              = 19,
		SVC_SPAWNSTATIC         = 20,
		SVC_SPAWNBASELINE       = 22,
		SVC_TEMP_ENTITY         = 23,
		SVC_SETPAUSE            = 24,
		SVC_CENTERPRINT         = 26,
		SVC_KILLEDMONSTER       = 27,
		SVC_FOUNDSECRET         = 28,
		SVC_SPAWNSTATICSOUND    = 29,
		SVC_INTERMISSION        = 30,
		SVC_FINALE              = 31,
		SVC_CDTRACK             = 32,
		SVC_SELLSCREEN          = 33,
		SVC_SMALLKICK           = 34,
		SVC_BIGKICK             = 35,
		SVC_UPDATEPING          = 36,
		SVC_UPDATEENTERTIME     = 37,
		SVC_UPDATESTATLONG      = 38,
		SVC_MUZZLEFLASH         = 39,
		SVC_UPDATEUSERINFO      = 40,
		SVC_DOWNLOAD            = 41,
		SVC_PLAYERINFO          = 42,
		SVC_CHOKECOUNT          = 44,
		SVC_MODELLIST           = 45,
		SVC_SOUNDLIST           = 46,
		SVC_PACKETENTITIES      = 47,
		SVC_DELTAPACKETENTITIES = 48,
		SVC_MAXSPEED            = 49,
		SVC_ENTGRAVITY          = 50,
		SVC_SETINFO             = 51,
		SVC_SERVERINFO          = 52,
		SVC_UPDATEPL            = 53,
		SVC_NAILS2              = 54,

		DF_ORIGIN1     = (1 << 0),
		DF_ORIGIN2     = (1 << 1),
		DF_ORIGIN3     = (1 << 2),
		DF_ANGLE1      = (1 << 3),
		DF_ANGLE2      = (1 << 4),
		DF_ANGLE3      = (1 << 5),
		DF_EFFECTS     = (1 << 6),
		DF_SKINNUM     = (1 << 7),
		DF_WEAPONFRAME = (1 << 10),
		DF_MODEL       = (1 << 11),

		U_ANGLE1   = (1 << 0),
		U_ANGLE3   = (1 << 1),
		U_MODEL    = (1 << 2),
		U_COLORMAP = (1 << 3),
		U_SKIN     = (1 << 4),
		U_EFFECTS  = (1 << 5),
		U_ORIGIN1  = (1 << 9),
		U_ORIGIN2  = (1 << 10),
		U_ORIGIN3  = (1 << 11),
		U_ANGLE2   = (1 << 12),
		U_FRAME    = (1 << 13),
		U_REMOVE   = (1 << 14),
		U_MOREBITS = (1 << 15),

		DEM_READ     = 1,
		DEM_SET      = 2,
		DEM_MULTIPLE = 3,
		DEM_SINGLE   = 4,
		DEM_STATS    = 5,
		DEM_ALL      = 6,


		flush_string = function(mvd)
		{
			var string = '';

			while (mvd.buffer.getUint8(mvd.offset) != 0)
			{
				var val = mvd.buffer.getUint8(mvd.offset);

				/* converts all funky colored characters to plain ASCII text */
				if (val >= 18 && val <= 27)
				{
					val += 30;
				}
				else if (val >= 146 && val <= 155)
				{
					val -= 98;
				}
				else
				{
					val &= ~128;
				}

				string += String.fromCharCode(val);

				mvd.offset++;
				mvd.msg_size--;
			}

			mvd.offset++;
			mvd.msg_size--;

			return string;
		},

		commands = {};

	commands[SVC_NOP] = function(){}

	commands[SVC_DISCONNECT] = function(mvd)
	{
		flush_string(mvd);
	}

	commands[SVC_UPDATESTAT] = function(mvd)
	{
		mvd.offset += 2;
		mvd.msg_size -= 2;
	}

	commands[SVC_SETVIEW] = function(){}

	commands[SVC_SOUND] = function(mvd)
	{
		var tmp = mvd.buffer.getUint16(mvd.offset, true),
			soundId;

		mvd.offset += 2;
		mvd.msg_size -= 2;

		if (tmp & (1 << 15)) // SND_VOLUME
		{
			mvd.offset++;
			mvd.msg_size--;
		}

		if (tmp & (1 << 14))  // SND_ATTENUATION
		{
			mvd.offset++;
			mvd.msg_size--;
		}

		soundId = mvd.buffer.getUint8(mvd.offset, true);

		mvd.offset += 7;
		mvd.msg_size -= 7;
	}

	commands[SVC_PRINT] = function(mvd)
	{
		var tmp = mvd.buffer.getUint8(mvd.offset);

		mvd.offset++;
		mvd.msg_size--;

		qwTube.console.log(flush_string(mvd));
	}

	commands[SVC_STUFFTEXT] = function(mvd)
	{
		//var text = flush_string(mvd);
		//QuakeWorldTube.console.add(text);
		qwTube.console.log(flush_string(mvd));
	}

	commands[SVC_SETANGLE] = function(mvd)
	{
		mvd.offset += 4;
		mvd.msg_size -= 4;
	}

	commands[SVC_SERVERDATA] = function(mvd)
	{
		var mapName;

		mvd.offset += 8;
		mvd.msg_size -= 8;
		
		flush_string(mvd); // gamedir
		
		mvd.offset += 4;
		mvd.msg_size -= 4;
		
		mapName = flush_string(mvd); // Mapname
			
		mvd.offset += 40;
		mvd.msg_size -= 40;

		return mapName;
	}

	commands[SVC_LIGHTSTYLE] = function(mvd)
	{
		mvd.offset++;
		mvd.msg_size--;
		
		flush_string(mvd);
	}

	commands[SVC_UPDATEFRAGS] = function(mvd)
	{
		var playerId = mvd.buffer.getUint8(mvd.offset);
				
		mvd.offset++;
		mvd.msg_size--;

		QuakeWorldTube.updateFrags(playerId, mvd.buffer.getInt16(mvd.offset, true));
			
		mvd.offset += 2;
		mvd.msg_size -= 2;
	}

	commands[SVC_STOPSOUND] = function(mvd)
	{
		mvd.offset += 2;
		mvd.msg_size -= 2;
	}

	commands[SVC_DAMAGE] = function(mvd)
	{
		mvd.offset += 8;
		mvd.msg_size -= 8;
	}

	commands[SVC_SPAWNSTATIC] = function(mvd)
	{
		var modelId = mvd.buffer.getUint8(mvd.offset),
			coords = {
				position: {},
				rotation: {}
			};


		mvd.offset++;
		mvd.msg_size--;

		mvd.offset += 3;
		mvd.msg_size -= 3;

		coords.position.x = mvd.buffer.getInt16(mvd.offset, true) / 8;

		mvd.offset += 2;
		mvd.msg_size -= 2;

		coords.rotation.x = (360 * mvd.buffer.getUint8(mvd.offset) / 256) * Math.PI / 180;

		mvd.offset++;
		mvd.msg_size--;

		coords.position.y = mvd.buffer.getInt16(mvd.offset, true) / 8;

		mvd.offset += 2;
		mvd.msg_size -= 2;

		coords.rotation.y = (360 * mvd.buffer.getUint8(mvd.offset) / 256) * Math.PI / 180;

		mvd.offset++;
		mvd.msg_size--;

		coords.position.z = mvd.buffer.getInt16(mvd.offset, true) / 8;

		mvd.offset += 2;
		mvd.msg_size -= 2;

		coords.rotation.z = (360 * mvd.buffer.getUint8(mvd.offset) / 256) * Math.PI / 180;

		mvd.offset++;
		mvd.msg_size--;

		qwTube.qw.spawnStatic(modelId, coords);
	}

	commands[SVC_SPAWNBASELINE] = function(mvd)
	{
		var baselineId = mvd.buffer.getUint16(mvd.offset, true),
			modelId,
			coords = {
				position: {},
				rotation: {}
			};

		mvd.offset += 2;
		mvd.msg_size -= 2;

		modelId = mvd.buffer.getUint8(mvd.offset);

		mvd.offset++;
		mvd.msg_size--;

		//baseline[id] = new THREE.Mesh(models[tmp].geometry, models[tmp].material);

		/* dafaq? */
		/*if (id == 0)
		{
			scene.add(baseline[id]);
		}*/

		mvd.offset += 3;
		mvd.msg_size -= 3;

		coords.position.x = mvd.buffer.getInt16(mvd.offset, true) / 8;

		mvd.offset += 2;
		mvd.msg_size -= 2;

		coords.rotation.x = (360 * mvd.buffer.getUint8(mvd.offset) / 256) * Math.PI / 180;

		mvd.offset++;
		mvd.msg_size--;

		coords.position.y = mvd.buffer.getInt16(mvd.offset, true) / 8;

		mvd.offset += 2;
		mvd.msg_size -= 2;

		coords.rotation.y = (360 * mvd.buffer.getUint8(mvd.offset) / 256) * Math.PI / 180;

		mvd.offset++;
		mvd.msg_size--;

		coords.position.z = mvd.buffer.getInt16(mvd.offset, true) / 8;

		mvd.offset += 2;
		mvd.msg_size -= 2;

		coords.rotation.z = (360 * mvd.buffer.getUint8(mvd.offset) / 256) * Math.PI / 180;

		mvd.offset++;
		mvd.msg_size--;

		qwTube.qw.spawnBaseline(baselineId, modelId, coords);
	}

	commands[SVC_TEMP_ENTITY] = function(mvd)
	{
		if (mvd.buffer.getUint8(mvd.offset) == 2 || mvd.buffer.getUint8(mvd.offset) == 12)
		{
			mvd.offset++;
			mvd.msg_size--;
		}
		else if (mvd.buffer.getUint8(mvd.offset) == 5 || mvd.buffer.getUint8(mvd.offset) == 6 || mvd.buffer.getUint8(mvd.offset) == 7)
		{
			mvd.offset += 8;
			mvd.msg_size -= 8;
		}
		
		mvd.offset += 7;
		mvd.msg_size -= 7;
	}

	commands[SVC_SETPAUSE] = function(){}

	commands[SVC_CENTERPRINT] = function(mvd)
	{
		console.log(flush_string(mvd));
	}

	commands[SVC_KILLEDMONSTER] = function(){}

	commands[SVC_FOUNDSECRET] = function(){}

	commands[SVC_SPAWNSTATICSOUND] = function(mvd)
	{
		mvd.offset += 9;
		mvd.msg_size -= 9;
	}

	commands[SVC_INTERMISSION] = function(mvd)
	{
		mvd.offset += 9;
		mvd.msg_size -= 9;
	}

	commands[SVC_FINALE] = function(){}

	commands[SVC_CDTRACK] = function(mvd)
	{
		mvd.offset++;
		mvd.msg_size--;
	}

	commands[SVC_SELLSCREEN] = function(){}

	commands[SVC_SMALLKICK] = function(){}

	commands[SVC_BIGKICK] = function(){}

	commands[SVC_UPDATEPING] = function(mvd)
	{
		var playerId = mvd.buffer.getUint8(mvd.offset);

		mvd.offset++;
		mvd.msg_size--;

		QuakeWorldTube.updatePing(playerId, mvd.buffer.getUint16(mvd.offset, true));

		mvd.offset += 2;
		mvd.msg_size -= 2;
	}

	commands[SVC_UPDATEENTERTIME] = function(mvd)
	{
		mvd.offset += 5;
		mvd.msg_size -= 5;
	}

	commands[SVC_UPDATESTATLONG] = function(mvd)
	{
		mvd.offset += 5;
		mvd.msg_size -= 5;
	}

	commands[SVC_MUZZLEFLASH] = function(mvd)
	{
		mvd.offset += 2;
		mvd.msg_size -= 2;
	}

	commands[SVC_UPDATEUSERINFO] = function(mvd)
	{
		var playerId = mvd.buffer.getUint8(mvd.offset) + 1,
			userInfo = '';
				
		mvd.offset += 5
		mvd.msg_size -= 5;

		userInfo = flush_string(mvd);

		if(userInfo.length)
		{
			qwTube.qw.spawnPlayer(playerId, userInfo);
		}
	}

	commands[SVC_DOWNLOAD] = function(){}

	commands[SVC_PLAYERINFO] = function(mvd)
	{
		var tmp,
			playerId = mvd.buffer.getUint8(mvd.offset) + 1,
			coords = {
				'position': {},
				'rotation': {}
			};

		mvd.offset++;
		mvd.msg_size--;

		tmp = mvd.buffer.getUint16(mvd.offset, true);
		
		mvd.offset += 3;
		mvd.msg_size -= 3;
			
		/*if (player_id == -1)
		{
			this.player_switch();
		}*/
			
		if (tmp & DF_ORIGIN1)
		{
			coords.position.x = mvd.buffer.getInt16(mvd.offset, true) / 8;
			
			mvd.offset += 2;
			mvd.msg_size -= 2;
		}
		
		if (tmp & DF_ORIGIN2)
		{
			coords.position.y = mvd.buffer.getInt16(mvd.offset, true) / 8;
			
			mvd.offset += 2;
			mvd.msg_size -=2;
		}
		
		if (tmp & DF_ORIGIN3)
		{
			coords.position.z = mvd.buffer.getInt16(mvd.offset, true) / 8;
			
			mvd.offset += 2;
			mvd.msg_size -= 2;
		}
		
		if (tmp & DF_ANGLE1)
		{
			coords.rotation.x = (360 * mvd.buffer.getUint16(mvd.offset, true) / 65536) * Math.PI / 180;
			
			mvd.offset += 2;
			mvd.msg_size -= 2;
		}
		
		if (tmp & DF_ANGLE2)
		{
			coords.rotation.z = (360 * mvd.buffer.getUint16(mvd.offset, true) / 65536) * Math.PI / 180;
			
			mvd.offset += 2;
			mvd.msg_size -= 2;
		}
		
		if (tmp & DF_ANGLE3)
		{
			coords.rotation.y = (360 * mvd.buffer.getUint16(mvd.offset, true) / 65536) * Math.PI / 180;
			
			mvd.offset += 2;
			mvd.msg_size -= 2;
		}
			
		if (tmp & DF_MODEL)
		{
			mvd.offset++;
			mvd.msg_size--;
		}
		
		if (tmp & DF_SKINNUM)
		{
			mvd.offset++;
			mvd.msg_size--;
		}
		
		if (tmp & DF_EFFECTS)
		{
			mvd.offset++;
			mvd.msg_size--;
		}
		
		if (tmp & DF_WEAPONFRAME)
		{
			mvd.offset++;
			mvd.msg_size--;
		}

		qwTube.qw.updateEntityCoords( playerId, coords );
	}

	commands[SVC_CHOKECOUNT] = function(mvd)
	{
		mvd.offset++;
		mvd.msg_size--;
	}

	commands[SVC_MODELLIST] = function(mvd)
	{
		var modelList = [],
			modelName;

		mvd.offset++;
		mvd.msg_size--;

		while (mvd.buffer.getUint8(mvd.offset) != 0)
		{
			modelName = flush_string(mvd);
			modelList.push(modelName.replace(/^.*\/|\.[^.]*$/g, ""));
		}

		mvd.offset += 2;
		mvd.msg_size -= 2;

		qwTube.assets.fillModelList(modelList);
	}

	commands[SVC_SOUNDLIST] = function(mvd)
	{
		var soundList = [],
			soundName;

		mvd.offset++;
		mvd.msg_size--;
		
		while (mvd.buffer.getUint8(mvd.offset) != 0)
		{
			soundName = flush_string(mvd);
			soundList.push(soundName.replace(/^.*\/|\.[^.]*$/g, ""));
		}
		
		mvd.offset += 2;
		mvd.msg_size -= 2;

		return soundList;
	}

	commands[SVC_PACKETENTITIES] = function(mvd)
	{
		var tmp, coords, entityId;
		while (true)
		{

			tmp = mvd.buffer.getUint16(mvd.offset, true);
			
			mvd.offset += 2;
			mvd.msg_size -= 2;

			if (!tmp)
			{
				break;
			}

			coords = {
				'position': {},
				'rotation': {}
			};
			entityId = tmp & 0x1ff;
			tmp &= ~0x1ff;

			if (tmp & U_MOREBITS)
			{
				tmp |= mvd.buffer.getUint8(mvd.offset);
				
				mvd.offset++;
				mvd.msg_size--;
			}

			if (tmp & U_REMOVE)
			{
				qwTube.qw.removeEntity(entityId);
			}
			
			if (tmp & U_MODEL)
			{
				qwTube.qw.spawnEntity(entityId, mvd.buffer.getUint8(mvd.offset));

				mvd.offset++;
				mvd.msg_size--;

			}

			if (tmp & U_FRAME)
			{
				mvd.buffer.getUint8(mvd.offset);
				mvd.offset++;
				mvd.msg_size--;
			}
			
			if (tmp & U_COLORMAP)
			{
				mvd.offset++;
				mvd.msg_size--;
			}
			
			if (tmp & U_SKIN)
			{
				mvd.offset++;
				mvd.msg_size--;
			}
			
			if (tmp & U_EFFECTS)
			{
				mvd.offset++;
				mvd.msg_size--;
			}
			
			if (tmp & U_ORIGIN1)
			{

				coords.position.x = mvd.buffer.getInt16(mvd.offset, true) / 8;

				mvd.offset += 2;
				mvd.msg_size -= 2;
			}

			if (tmp & U_ANGLE1)
			{

				coords.rotation.x = (360 * mvd.buffer.getUint8(mvd.offset) / 256) * Math.PI / 180;

				mvd.offset++;
				mvd.msg_size--;
			}
				
			if (tmp & U_ORIGIN2)
			{
				coords.position.y = mvd.buffer.getInt16(mvd.offset, true) / 8;
				
				mvd.offset += 2;
				mvd.msg_size -= 2;
			}

			if (tmp & U_ANGLE2)
			{
				coords.rotation.z = (360 * mvd.buffer.getUint8(mvd.offset) / 256) * Math.PI / 180;

				mvd.offset++;
				mvd.msg_size--;
			}
				
			if (tmp & U_ORIGIN3)
			{
				coords.position.z = mvd.buffer.getInt16(mvd.offset, true) / 8;
				
				mvd.offset += 2;
				mvd.msg_size -= 2;
			}

			if (tmp & U_ANGLE3)
			{
				coords.rotation.y = (360 * mvd.buffer.getUint8(mvd.offset) / 256) * Math.PI / 180;

				mvd.offset++;
				mvd.msg_size--;
			}

			qwTube.qw.updateEntityCoords(entityId, coords)
		}
	}

	commands[SVC_DELTAPACKETENTITIES] = function(mvd)
	{
		mvd.offset++;
		mvd.msg_size--;
		commands[SVC_PACKETENTITIES](mvd);
	}

	commands[SVC_MAXSPEED] = function(mvd)
	{
		mvd.offset += 4;
		mvd.msg_size -= 4;
	}

	commands[SVC_ENTGRAVITY] = function(){}

	commands[SVC_SETINFO] = function(mvd)
	{
		mvd.offset++;
		mvd.msg_size--;
		
		QuakeWorldTube.dispatcher('SVC_SETINFO', flush_string(mvd));
		QuakeWorldTube.dispatcher('SVC_SETINFO', flush_string(mvd));
	}

	commands[SVC_SERVERINFO] = function(mvd)
	{
		QuakeWorldTube.dispatcher('SVC_SERVERINFO', flush_string(mvd));
		QuakeWorldTube.dispatcher('SVC_SERVERINFO', flush_string(mvd));
	}

	commands[SVC_UPDATEPL] = function(mvd)
	{
		var playerId = mvd.buffer.getUint8(mvd.offset);

		mvd.offset++;
		mvd.msg_size--;

		QuakeWorldTube.dispatcher('SVC_UPDATEPL', playerId, mvd.buffer.getUint8(mvd.offset));
			
		mvd.offset++;
		mvd.msg_size--;
	}

	commands[SVC_NAILS2] = function(mvd)
	{
		var tmp = mvd.buffer.getUint8(mvd.offset);
						
		mvd.offset += 7 * tmp;
		mvd.msg_size -= 7 * tmp;
	}

	commands.flush_string = flush_string;

	return commands;
};