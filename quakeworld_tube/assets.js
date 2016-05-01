QuakeWorldTube.assets = function(options)
{
	var defaultOptions = {
			onLoad: function(){},
			onLoadEnd: function(){},
			onLoadStart: function(){},
			onProgress: function(){},

			mapPath     : 'quakeworld_tube/maps/',
			modelPath   : 'quakeworld_tube/models/',
			soundPath   : 'quakeworld_tube/sounds/',
		},
		options = core.mergeObjects(defaultOptions, options),

		loader = new soda.loader(),
		requests = [],
		modelsToLoad = [],
		soundsToLoad = [],
		models = [],
		sounds = [],

		fillModelList = function(modelList)
		{
			modelsToLoad = modelsToLoad.concat(modelList);
		},

		fillSoundList = function(soundList)
		{
			soundsToLoad = soundsToLoad.concat(soundList);
		},

		shutdown = function()
		{
			requests.forEach(function(request){
				request.abort();
			});
		},

		loadModels = function()
		{

			var loadedBytesPerModel = Array.apply(null, Array(modelsToLoad.length)).map(Number.prototype.valueOf,0),
				loadedTextureBytesPerModel = loadedBytesPerModel,
				loadedModels = 0,
				totalBytesPerModel = loadedBytesPerModel,
				totalTextureBytesPerModel = loadedBytesPerModel,
				totalModels = modelsToLoad.length,

				cube = new THREE.BoxGeometry(28, 28, 28),

				overallProgress = function()
				{
					var loadedBytes = loadedBytesPerModel.reduce(function(a, b){return a + b}),
						totalBytes = totalBytesPerModel.reduce(function(a, b){return a + b}),
						loadedTextureBytes = loadedTextureBytesPerModel.reduce(function(a, b){return a + b}),
						totalTextureBytes = totalTextureBytesPerModel.reduce(function(a, b){return a + b});

					console.log(totalTextureBytes, loadedTextureBytes, loadedModels, totalModels);

					options.onProgress(loadedBytes, totalBytes, loadedModels, totalModels);
				},

				overallLoad = function()
				{
					if(loadedModels >= totalModels)
					{
						//console.log(models);
						options.onLoad();
						console.log(requests);
					}
				},

				loadMaterial = function(modelIndex, modelName, path, mtlName)
				{
					var loader = new THREE.MTLLoader(),
						mtlName = mtlName || modelName,
						onLoad = function(material)
						{
							material.preload();

							loadModel(modelIndex, modelName, path, material);

						},
						onProgress = function(total)
						{
							loadedTextureBytesPerModel[modelIndex] = event.loaded;
							totalTextureBytesPerModel[modelIndex] = event.total;
							overallProgress();
						},
						onError = function()
						{
							console.log('Error:', modelName);
							loadModel(modelIndex, modelName, path, null);
						};

					loader.setBaseUrl(path);

					requests.push(loader.load(path + mtlName + '.mtl', onLoad, onProgress, onError));
				},

				loadModel = function(modelIndex, modelName, path, material)
				{
					var loader = new THREE.OBJLoader(),
						onLoad = function(object)
						{
							var materials = [],
								singleGeometry = new THREE.Geometry(),
								singleGeometry2 = new THREE.BufferGeometry(),
								model = new THREE.Group();

							model.name = modelName;

							switch (model.name)
							{
								case 'b_batt0':
								case 'b_batt1':
								case 'b_bh10':
								case 'b_bh100':
								case 'b_bh25':
								case 'b_nail0':
								case 'b_nail1':
								case 'b_rock0':
								case 'b_rock1':
								case 'b_shell0':
								case 'b_shell1':
									model.lerp = false;
									break;
								case 'armor_0':
								case 'g_light':
								case 'g_nail':
								case 'g_nail2':
								case 'g_rock':
								case 'g_rock2':
								case 'g_shot':
								case 'invisibl':
								case 'invulner':
								case 'quaddama':
									model.lerp = false;
									model.hover = true;
									break;
								default:
									model.lerp = true;
									model.hover = false;
									break;
							}

							object.children.forEach(function(mesh)
							{
								var new_geo = new THREE.Geometry().fromBufferGeometry(mesh.geometry),
									new_mesh = new THREE.Mesh(new_geo);

								new_mesh.updateMatrix();
								singleGeometry.merge(new_mesh.geometry, new_mesh.matrix, materials.length);
								materials.push(mesh.material);
							});

							if (modelIndex == 1) // map
							{
								model.lerp = false;
								
								model.add(new THREE.Mesh(singleGeometry, new THREE.MeshLambertMaterial({color: 0x333333})));
							}
							else
							{
								model.add(new THREE.Mesh(singleGeometry, new THREE.MeshFaceMaterial(materials)));
							}

							


							/*object.children.forEach(function(mesh)
							{
								singleGeometry2.merge(mesh.geometry);
								materials.push(mesh.material);
							});*/
							//model.add(new THREE.Mesh(singleGeometry2, new THREE.MeshNormalMaterial()));
							console.log(model);
							console.log(object);

							models[modelIndex] = model;

							loadedModels++;

							overallLoad();
						},
						onProgress = function(event)
						{
							loadedBytesPerModel[modelIndex] = event.loaded;
							totalBytesPerModel[modelIndex] = event.total;
							overallProgress();
						},
						onError = function(event)
						{
							models[modelIndex] = new THREE.Mesh(cube, new THREE.MeshNormalMaterial());
							models[modelIndex].name = modelName;
							loadedModels++;
							console.log('Error loading: ' + event.target.responseURL);
							overallLoad();
						};

					if(modelIndex == 1) // map; maybe do something special?
					{
						loader.setMaterials(material);
						loader.load(path + modelName + '.obj', onLoad, onProgress, onError);
						return;
					}

					loader.setMaterials(material);

					requests.push(loader.load(path + modelName + '.obj', onLoad, onProgress, onError));
				};

			if (modelsToLoad.length < 1)
			{
				return;
			}

			modelsToLoad.forEach(function(modelName, index){

				index++; // Index starts at 1

				if (modelName.charAt(0) == 'v') // viewmodels are skipped, maybe later
				{
					totalModels--;
					return;
				}
				
				if (index == 1 || modelName.charAt(0) == '*') // map
				{
					if(modelName.charAt(0) == '*') // moveable map parts
					{
						modelName = modelsToLoad[0] + '_' + modelName.substr(1);
					}

					loadMaterial(index, modelName, options.mapPath, modelsToLoad[0]);

					return;
				}

				if (modelName == 'player')
				{
					loadMaterial(index, modelName + '_0', options.modelPath, 'player');
					return;
				}

				if (modelName == 'armor')
				{
					loadMaterial(index, modelName + '_0', options.modelPath);
					return;
				}
				
				loadMaterial(index, modelName, options.modelPath);
				
			});

			options.onLoadStart();

		};

	return {
		models: models,
		sounds: sounds,

		fillModelList: fillModelList,
		fillSoundList: fillSoundList,

		loadModels: loadModels,

		shutdown: shutdown
	}

}