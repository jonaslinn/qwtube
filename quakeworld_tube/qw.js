'use strict';

QuakeWorldTube.qw = function(qwTube)
{
	var baseline = [],
	    entities = [],
	    activePlayer = 1,

	    prevItem = new THREE.Vector3(),

	    cube = new THREE.BoxGeometry(28, 28, 28),

		spawnBaseline = function(baselineId, modelId, coords)
		{
			//baseline[baselineId] = new THREE.Mesh(qwTube.assets.models[modelId].geometry, qwTube.assets.models[modelId].material);
			console.log(baselineId, modelId);
			var object = new THREE.Object3D();
	
			object.modelId = modelId;
		
			object.position_base = new THREE.Vector3( coords.position.x, coords.position.y, coords.position.z );
			object.rotation_base = new THREE.Vector3( coords.rotation.x, coords.rotation.y, coords.rotation.z );
			
			
			baseline[baselineId] = object;
		},

		updateBaseline = function(models)
		{
			baseline.forEach(function(item){
				console.log(item);
				if(!models[item.modelId])
				{
					return true;
				}
				item.name = models[item.modelId].name;
				models[item.modelId].children.forEach(function(mesh){
					item.add(new THREE.Mesh(mesh.geometry, mesh.material))
				});
			});
		},

		spawnMap = function()
		{
			qwTube.renderer.scene.add(qwTube.assets.models[1]);
		},

		respawn = function( playerId, userInfo)
		{
			console.log(playerId);
			qwTube.renderer.scene.remove(entities[playerId]);

			entities[playerId] = baseline[playerId];
			entities[playerId].position_curr = new THREE.Vector3();
			entities[playerId].rotation_curr = new THREE.Euler();
			entities[playerId].position_prev = new THREE.Vector3();
			entities[playerId].rotation_prev = new THREE.Euler();

			if( activePlayer == playerId )
			{
				return;
			}
			qwTube.renderer.scene.add(entities[playerId]);
		},

		spawnFromBaseline = function( entityId )
		{
			if( entities[entityId] || !baseline[entityId] )
			{
				return;
			}

			entities[entityId] = baseline[entityId].clone();

			entities[entityId].position_curr = new THREE.Vector3();
			entities[entityId].rotation_curr = new THREE.Euler();

			entities[entityId].position_curr.copy(baseline[entityId].position_base);
			entities[entityId].rotation_curr.copy(baseline[entityId].rotation_base);

			entities[entityId].position_prev = entities[entityId].position_curr.clone();
			entities[entityId].rotation_prev = entities[entityId].rotation_curr.clone();


			qwTube.renderer.scene.add(entities[entityId]);

		},

		spawnEntity = function( entityId, modelId )
		{
			if ( entities[entityId] )
			{
				qwTube.renderer.scene.remove( entities[entityId] );

				delete entities[entityId];
			}

			if ( !qwTube.assets.models[modelId] )
			{
				return; // fix
			}

			entities[entityId] = qwTube.assets.models[modelId].clone();

			/*entities[entityId].position_curr = new THREE.Vector3( entity.position_curr.x, entity.position_curr.y, entity.position_curr.z );
			entities[entityId].position_prev = entities[entityId].position_curr.clone();

			entities[entityId].rotation_curr = new THREE.Vector3( entity.rotation_curr.x, entity.rotation_curr.y, entity.rotation_curr.z );
			entities[entityId].rotation_prev = entities[entityId].rotation_curr.clone();*/

			qwTube.renderer.scene.add( entities[entityId] );
		},

		removeEntity = function( entityId )
		{
			qwTube.renderer.scene.remove(entities[entityId]);

			delete entities[entityId];
		},

		updateEntityCoords = function( entityId, coords )
		{
			if ( !entities[entityId] )
			{
				return;
			}

			if ( !entities[entityId].position_curr )
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

			if ( !entities[entityId].position_prev )
			{
				entities[entityId].position_prev = entities[entityId].position_curr.clone();
				entities[entityId].rotation_prev = entities[entityId].rotation_curr.clone();
			}
		},


		updateEntities = function( fac )
		{
			var prev = new THREE.Quaternion(),
			    curr = new THREE.Quaternion();

			entities.forEach(function( entity, entityId )
			{


				if ( entity.position_curr.distanceTo( entity.position_prev ) < 200 )
				{
					entities[entityId].position.lerpVectors( entity.position_prev, entity.position_curr, fac );
	
					prev.setFromEuler(entity.rotation_prev);
					curr.setFromEuler(entity.rotation_curr);
					
					THREE.Quaternion.slerp( prev, curr, entity.quaternion, fac );
				}
				else
				{
					entities[entityId].position.copy( entity.position_prev );
					entities[entityId].rotation.copy( entity.rotation_prev );
				}

				
			});
		},

		moveEntities = function()
		{
			entities.forEach(function( entity )
			{
				entity.position_prev.copy(entity.position_curr);
				entity.rotation_prev.copy(entity.rotation_curr);
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
		respawn: respawn,
		spawnBaseline: spawnBaseline,
		spawnEntity: spawnEntity,
		spawnFromBaseline: spawnFromBaseline,
		spawnMap: spawnMap,
		updateBaseline: updateBaseline,
		updateEntities: updateEntities,
		updateEntityCoords: updateEntityCoords,
	}

}