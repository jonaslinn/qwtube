'use strict';

QuakeWorldTube.qw = function(qwTube)
{
	var baseline = [],
	    entities = [],
	    entitiesToUpdate = [],
	    players = {},
	    activePlayer = 1,

	    prevItem = new THREE.Vector3(),

	    cube = new THREE.BoxGeometry(28, 28, 28),

		spawnBaseline = function(baselineId, modelId, coords)
		{
			var object = new THREE.Object3D();
	
			object.modelId = modelId;
		
			object.position.copy(new THREE.Vector3(coords.position.x, coords.position.y, coords.position.z));
			object.rotation.copy(new THREE.Euler(coords.rotation.x, coords.rotation.y, coords.rotation.z));

			baseline[baselineId] = object;
		},

		updateBaseline = function(models)
		{
			baseline.forEach( function(item, baselineId)
			{

				if (!models[item.modelId])
				{
					return true; // continue
				}


				item.name = models[item.modelId].name;

				item.lerp = models[item.modelId].lerp;
				item.hover = models[item.modelId].hover;

				models[item.modelId].children.forEach(function(mesh)
				{
					item.add(new THREE.Mesh(mesh.geometry, mesh.material))
				});

				if (item.name != 'player_0')
				{
					spawnFromBaseline(baselineId);
				}

			});
		},

		spawnStatic = function(modelId, coords)
		{
			var object = new THREE.Mesh(cube, new THREE.MeshNormalMaterial());
	
			object.modelId = modelId;

			object.position.copy(new THREE.Vector3( coords.position.x, coords.position.y, coords.position.z ));
			object.rotation.copy(new THREE.Euler( coords.rotation.x, coords.rotation.y, coords.rotation.z ));

			qwTube.renderer.scene.add(object);
		},

		spawnPlayer = function(playerId, userInfo)
		{
			var userInfo = userInfo.split("\\");

			players[playerId] = {};

			for (var i = 1; i < userInfo.length; i += 2)
			{
				switch (userInfo[i])
				{
					case 'name':
						players[playerId].name = userInfo[i + 1];
						break;
					case 'team':
						players[playerId].team = userInfo[i + 1];
						break;
					case 'topcolor':
						players[playerId].topcolor = userInfo[i + 1];
						break;
					case 'bottomcolor':
						players[playerId].bottomcolor = userInfo[i + 1];
						break;
					case 'skin':
						players[playerId].skin = userInfo[i + 1];
						break;
					case '*spectator':
						players[playerId].spectator = true;
						break;
				}
			};

			entities[playerId] = baseline[playerId];
			entities[playerId].position_curr = new THREE.Vector3();
			entities[playerId].rotation_curr = new THREE.Euler();
			entities[playerId].position_prev = new THREE.Vector3();
			entities[playerId].rotation_prev = new THREE.Euler();

			if (activePlayer == playerId)
			{
				return;
			}

			qwTube.renderer.scene.add(entities[playerId]);
		},

		switchPlayer = function(playerId)
		{
			var playerId = playerId || activePlayer + 1;

			while (!players[playerId] || (players[playerId] && players[playerId].spectator))
			{
				playerId++;
				if (playerId > 31)
				{
					playerId = 1;
				}
			}

			qwTube.renderer.scene.add(entities[activePlayer]);
			qwTube.renderer.scene.remove(entities[playerId]);

			activePlayer = playerId;

			console.log('Now watching: ' + players[playerId].name);

			if (qwTube.demo.pause)
			{
				qwTube.renderer.updateCameraPosition(qwTube.qw.getPlayerCoords());
				qwTube.renderer.render();
			}
		},

		spawnFromBaseline = function(entityId)
		{
			if ((entities[entityId] && entities[entityId].name) || !baseline[entityId])
			{
				return;
			}

			entities[entityId] = baseline[entityId].clone();

			console.log(entities[entityId].name);

			entities[entityId].lerp = baseline[entityId].lerp;
			entities[entityId].hover = baseline[entityId].hover;

			if (entities[entityId].lerp)
			{
				entities[entityId].position_curr = baseline[entityId].position.clone();
				entities[entityId].rotation_curr = baseline[entityId].rotation.clone();

				entities[entityId].position_prev = baseline[entityId].position.clone();
				entities[entityId].rotation_prev = baseline[entityId].rotation.clone();
			}

			qwTube.renderer.scene.add(entities[entityId]);

		},

		spawnEntity = function(entityId, modelId)
		{
			if (entities[entityId])
			{
				qwTube.renderer.scene.remove(entities[entityId]);

				delete entities[entityId];
			}

			if (!qwTube.assets.models[modelId])
			{
				return; // fix
			}


			entities[entityId] = qwTube.assets.models[modelId].clone();

			entities[entityId].lerp = qwTube.assets.models[modelId].lerp;

			qwTube.renderer.scene.add(entities[entityId]);
		},

		spawnTempEntity = function(tempEntity, coords, big)
		{
			qwTube.renderer.fireParticles('missile', coords.position);
		},

		removeEntity = function(entityId)
		{
			qwTube.renderer.scene.remove(entities[entityId]);

			delete entities[entityId];
		},

		updateEntityCoords = function(entityId, coords)
		{
			if (!entities[entityId] || entities[entityId].lerp == false)
			{
				return;
			}

			if (!entities[entityId].position_curr)
			{
				entities[entityId].position_curr = new THREE.Vector3();
				entities[entityId].rotation_curr = new THREE.Euler();
			}

			entities[entityId].position_curr.x = coords.position.x || entities[entityId].position_curr.x;
			entities[entityId].position_curr.y = coords.position.y || entities[entityId].position_curr.y;
			entities[entityId].position_curr.z = coords.position.z || entities[entityId].position_curr.z;

			entities[entityId].rotation_curr.x = coords.rotation.x || entities[entityId].rotation_curr.x;
			entities[entityId].rotation_curr.y = coords.rotation.y || entities[entityId].rotation_curr.y;
			entities[entityId].rotation_curr.z = coords.rotation.z || entities[entityId].rotation_curr.z;

			if (!entities[entityId].position_prev)
			{
				entities[entityId].position_prev = entities[entityId].position_curr.clone();
				entities[entityId].rotation_prev = entities[entityId].rotation_curr.clone();
			}

		},


		updateEntities = function(fac, time, delta)
		{
			var prev = new THREE.Quaternion(),
			    curr = new THREE.Quaternion(),
			    entityId;

			entities.forEach(function(entity, entityId)
			{

				if (entity.lerp)
				{

					if (entities[entityId].position_curr.distanceTo(entities[entityId].position_prev) < 200)
					{
						entities[entityId].position.lerpVectors(entities[entityId].position_prev, entities[entityId].position_curr, fac);
		
						prev.setFromEuler(entities[entityId].rotation_prev);
						curr.setFromEuler(entities[entityId].rotation_curr);
						
						THREE.Quaternion.slerp(prev, curr, entities[entityId].quaternion, fac);
					}
					else
					{
						entities[entityId].position.copy(entities[entityId].position_prev);
						entities[entityId].rotation.copy(entities[entityId].rotation_prev);
					}

				
					if (entity.name == 'missile')
					{
						qwTube.renderer.fireParticles('missile', entity.position, delta);
					}
				}

				if (entity.hover)
				{
					entity.position.z += (0.25 * Math.sin(time * 0.004)) * qwTube.demo.speed;
					entity.rotation.z += 0.025 * qwTube.demo.speed;
				}
			});

		},

		moveEntities = function()
		{
			entities.forEach(function(entity)
			{
				if (entity.lerp)
				{
					entity.position_prev.copy(entity.position_curr);
					entity.rotation_prev.copy(entity.rotation_curr);
				}
			});
		},

		getPlayerCoords = function()
		{
			return {
				position: entities[activePlayer].position,
				rotation: entities[activePlayer].rotation
			}
		};

		
	return {
		getPlayerCoords: getPlayerCoords,
		moveEntities: moveEntities,
		removeEntity: removeEntity,
		spawnPlayer: spawnPlayer,
		spawnBaseline: spawnBaseline,
		spawnEntity: spawnEntity,
		spawnTempEntity: spawnTempEntity,
		spawnStatic: spawnStatic,
		spawnFromBaseline: spawnFromBaseline,
		switchPlayer: switchPlayer,
		updateBaseline: updateBaseline,
		updateEntities: updateEntities,
		updateEntityCoords: updateEntityCoords,
	}

}
