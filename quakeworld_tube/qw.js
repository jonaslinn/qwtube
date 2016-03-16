'use strict';

QuakeWorldTube.qw = function(qwTube)
{
	var baseline = [],
	    entityDeltaPrevious = [],
	    entityDeltaNext = [],
	    entities = [],
	    activePlayer = 0,

	    prevItem = new THREE.Vector3(),

	    cube = new THREE.BoxGeometry(28, 28, 28),

		spawnBaseline = function(baselineId, modelId, coords)
		{
			//baseline[baselineId] = new THREE.Mesh(qwTube.assets.models[modelId].geometry, qwTube.assets.models[modelId].material);
			baseline[baselineId] = new THREE.Mesh(cube, new THREE.MeshNormalMaterial());
		},

		updateEntityDelta = function(entityId, data, timestamp)
		{
			var next = {
					position: new THREE.Vector3( 0, 0, 0 ),
					rotation: new THREE.Vector3( 0, 0, 0 ),
					remove: data.remove ? data.remove : false,
					timestamp: timestamp
				},
				previous = {
					position: new THREE.Vector3( 0, 0, 0 ),
					rotation: new THREE.Vector3( 0, 0, 0 ),
					remove: data.remove ? data.remove : false,
					timestamp: timestamp
				};

			if (entityDeltaNext[entityId])
			{
				next.position.copy(entityDeltaNext[entityId].position);
				next.rotation.copy(entityDeltaNext[entityId].rotation);
			}

			next.position.setX(data.position.x ? data.position.x : next.position.x);
			next.position.setY(data.position.y ? data.position.y : next.position.y);
			next.position.setZ(data.position.z ? data.position.z : next.position.z);

			next.rotation.setX(data.rotation.x ? data.rotation.x : next.rotation.x);
			next.rotation.setY(data.rotation.y ? data.rotation.y : next.rotation.y);
			next.rotation.setZ(data.rotation.z ? data.rotation.z : next.rotation.z);


			if (!entityDeltaPrevious[entityId])
			{
				previous.position.copy(next.position);
				previous.rotation.copy(next.rotation);

				entityDeltaPrevious[entityId] = previous;
			}
			else
			{
				previous.position.copy(entityDeltaNext[entityId].position);
				previous.rotation.copy(entityDeltaNext[entityId].rotation);
				previous.timestamp = entityDeltaNext[entityId].timestamp;
				previous.remove = entityDeltaNext[entityId].remove;

				entityDeltaPrevious[entityId] = previous;
			}

			delete entityDeltaNext[entityId];
			entityDeltaNext[entityId] = next;

		},


		updateEntities = function(time, previousTime)
		{
			entityDeltaPrevious.forEach(function(entity, entityId){

				if (entityDeltaNext[entityId].remove && entityDeltaNext[entityId].timestamp <= time)
				{
					qwTube.renderer.scene.remove(entities[entityId]);

					delete entityDeltaPrevious[entityId];
					delete entityDeltaNext[entityId];
					delete entities[entityId];

					return true;
				}

				if (entity.modelId && entity.timestamp <= time)
				{
					if (entities[entityId])
					{
						qwTube.renderer.scene.remove(entities[entityId]);

						delete entityDeltaPrevious[entityId];
						delete entityDeltaNext[entityId];
						delete entities[entityId];
					}

					entities[entityId] = new THREE.Mesh(cube, new THREE.MeshNormalMaterial());

					entities[entityId].position.set(entity.position.x, entity.position.y, entity.position.z);
					entities[entityId].rotation.setFromVector3(entity.rotation);

					qwTube.renderer.scene.add(entities[entityId]);
					return true;
				}

				if (!entities[entityId] && baseline[entityId] && entity.timestamp <= time)
				{
					//entities[entityId] = baseline[entityId].clone();
					entities[entityId] = new THREE.Mesh(cube, new THREE.MeshNormalMaterial());

					entities[entityId].position.set(entity.position.x, entity.position.y, entity.position.z);
					entities[entityId].rotation.setFromVector3(entity.rotation);

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

					var delta = (time - entityDeltaNext[entityId].timestamp) / (entity.timestamp - entityDeltaNext[entityId].timestamp);

					entities[entityId].position.lerpVectors(entityDeltaNext[entityId].position, entity.position, delta);

					var bla = new THREE.Vector3();

					entities[entityId].rotation.setFromVector3(bla.lerpVectors(entityDeltaNext[entityId].rotation, entity.rotation, delta));
				}
				else
				{

					entities[entityId].position.set(entity.position.x, entity.position.y, entity.position.z);
					entities[entityId].rotation.setFromVector3(entity.rotation);

				}

				if(entityDeltaNext[entityId].timestamp < time)
				{
					delete entityDeltaPrevious[entityId];
					delete entityDeltaNext[entityId];
				}

				
			});
		},

		getPlayerCoords = function()
		{
			return {
				position: entities[activePlayer].position.clone(),
				rotation: entities[activePlayer].rotation.clone()
			}
		};

		
	return {
		getPlayerCoords: getPlayerCoords,
		spawnBaseline: spawnBaseline,
		updateEntityDelta: updateEntityDelta,
		updateEntities: updateEntities
	}

}