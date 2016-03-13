'use strict';

QuakeWorldTube.qw = function(qwTube)
{
	var baseline = [],
	    entityDeltas = [],
	    entities = [],
	    activePlayer = 0,

	    cube = new THREE.BoxGeometry(28, 28, 28),

		spawnBaseline = function(baselineId, modelId, coords)
		{
			//baseline[baselineId] = new THREE.Mesh(qwTube.assets.models[modelId].geometry, qwTube.assets.models[modelId].material);
			baseline[baselineId] = new THREE.Mesh(cube, new THREE.MeshNormalMaterial());
		},

		updateEntityDelta = function(entityId, data, timestamp)
		{
			entityDeltas[entityId] = data;

			entityDeltas[entityId].timestamp = timestamp;
		},

		updateEntities = function(time, previousTime)
		{
			entityDeltas.forEach(function(entity, entityId){

				if (entity.remove && entity.timestamp <= time)
				{
					//qwTube.renderer.scene.remove(entities[entityId]);
					delete entityDeltas[entityId];
					delete entities[entityId];
					qwTube.renderer.scene.remove(entities[entityId]);
					return true;
				}

				if (entity.modelId && entity.timestamp <= time)
				{
					if (entities[entityId])
					{
						//qwTube.renderer.scene.remove(entities[entityId]);
						delete entityDeltas[entityId];
						delete entities[entityId];
					}

					entities[entityId] = new THREE.Mesh(cube, new THREE.MeshNormalMaterial());
					entities[entityId].position.x = entity.position.x ? entity.position.x : entities[entityId].position.x;
					entities[entityId].position.y = entity.position.y ? entity.position.y : entities[entityId].position.y;
					entities[entityId].position.z = entity.position.z ? entity.position.z : entities[entityId].position.z;

					entities[entityId].rotation.x = entity.rotation.x ? entity.rotation.x : entities[entityId].rotation.x;
					entities[entityId].rotation.y = entity.rotation.y ? entity.rotation.y : entities[entityId].rotation.y;
					entities[entityId].rotation.z = entity.rotation.z ? entity.rotation.z : entities[entityId].rotation.z;

					qwTube.renderer.scene.add(entities[entityId]);
					return true;
				}

				if (!entities[entityId] && baseline[entityId] && entity.timestamp <= time)
				{
					//entities[entityId] = baseline[entityId].clone();
					entities[entityId] = new THREE.Mesh(cube, new THREE.MeshNormalMaterial());

					entities[entityId].position.x = entity.position.x ? entity.position.x : entities[entityId].position.x;
					entities[entityId].position.y = entity.position.y ? entity.position.y : entities[entityId].position.y;
					entities[entityId].position.z = entity.position.z ? entity.position.z : entities[entityId].position.z;

					entities[entityId].rotation.x = entity.rotation.x ? entity.rotation.x : entities[entityId].rotation.x;
					entities[entityId].rotation.y = entity.rotation.y ? entity.rotation.y : entities[entityId].rotation.y;
					entities[entityId].rotation.z = entity.rotation.z ? entity.rotation.z : entities[entityId].rotation.z;

					if(activePlayer != entityId)
					{
						qwTube.renderer.scene.add(entities[entityId]);
					}
					return true;
				}

				if(!entities[entityId])
				{
					return true;
				}

				if(qwTube.demo.lerp)
				{

					var delta = (time - previousTime) / (entity.timestamp - previousTime);
					console.log(delta);

					//lerp your ass off
					if(entity.position.x)
					{
						entities[entityId].position.x = (1 - delta) * entities[entityId].position.x + (delta * entity.position.x);
					}
					if(entity.position.y)
					{
						entities[entityId].position.y = (1 - delta) * entities[entityId].position.y + (delta * entity.position.y);
					}
					if(entity.position.z)
					{
						entities[entityId].position.z = (1 - delta) * entities[entityId].position.z + (delta * entity.position.z);
					}

					if(entity.rotation.x)
					{
						entities[entityId].rotation.x = (1 - delta) * entities[entityId].rotation.x + (delta * entity.rotation.x);
					}
					if(entity.rotation.y)
					{
						entities[entityId].rotation.y = (1 - delta) * entities[entityId].rotation.y + (delta * entity.rotation.y);
					}
					if(entity.rotation.z)
					{
						entities[entityId].rotation.z = (1 - delta) * entities[entityId].rotation.z + (delta * entity.rotation.z);
					}

				}
				else
				{

					entities[entityId].position.x = entity.position.x ? entity.position.x : entities[entityId].position.x;
					entities[entityId].position.y = entity.position.y ? entity.position.y : entities[entityId].position.y;
					entities[entityId].position.z = entity.position.z ? entity.position.z : entities[entityId].position.z;

					entities[entityId].rotation.x = entity.rotation.x ? entity.rotation.x : entities[entityId].rotation.x;
					entities[entityId].rotation.y = entity.rotation.y ? entity.rotation.y : entities[entityId].rotation.y;
					entities[entityId].rotation.z = entity.rotation.z ? entity.rotation.z : entities[entityId].rotation.z;
				}

				
				//console.log(entity, entityId, time);
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
		spawnBaseline: spawnBaseline,
		updateEntityDelta: updateEntityDelta,
		updateEntities: updateEntities
	}

}