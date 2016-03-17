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
			texturePath : 'quakeworld_tube/models/textures/'
		},
		options = core.mergeObjects(defaultOptions, options),

		loader = new soda.loader(),
		modelsToLoad = [],
		models = [],
		sounds = [],

		fillModelList = function(modelList)
		{
			modelsToLoad = modelsToLoad.concat(modelList);
		},

		loadModels = function()
		{

			var loadedBytesPerModel = new Array(modelsToLoad.length),
				loadedModels = 0,
				totalBytesPerModel = new Array(modelsToLoad.length),
				totalModels = 0,

				cube = new THREE.BoxGeometry(28, 28, 28),

				overallProgress = function()
				{
					var loadedBytes = loadedBytesPerModel.reduce(function(a, b){return a + b}),
						totalBytes = totalBytesPerModel.reduce(function(a, b){return a + b});

					options.onProgress(loadedBytes, totalBytes, loadedModels, totalModels);
				},

				overallLoad = function()
				{
					if(loadedModels == totalModels)
					{
						//console.log(models);
						options.onLoad();
					}
				},

				loadModel = function(modelIndex, modelName, path)
				{
					var loader = new THREE.OBJLoader(),
						onLoad = function(object)
						{
							object.name = modelName;
							models[modelIndex] = object;

							loadedModels++;

							overallLoad();
						},
						onProgress = function()
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

					if(modelIndex == 1) // map
					{
						loader.load(path + modelName + '.obj', onLoad, onProgress, onError);
						return;
					}

					loader.load(path + modelName + '.obj', onLoad, onProgress, onError);
				};

			if(modelsToLoad.length < 1)
			{
				return;
			}

			modelsToLoad.forEach(function(modelName, index){

				index++; // Index starts at 1

				if(modelName.charAt(0) == 'v') // viewmodels are skipped, maybe later
				{
					return;
				}

				totalModels++;
				
				if(index == 1 || modelName.charAt(0) == '*') // map
				{
					if(modelName.charAt(0) == '*') // moveable map parts
					{
						modelName = modelsToLoad[1] + '_' + modelName.substr(1);
					}

					loadModel(index, modelName, options.mapPath);

					return;
				}


				if(modelName == 'player')
				{
					loadModel(index, modelName + '_0', options.modelPath);
					return;
				}
				
				loadModel(index, modelName, options.modelPath);
				

			});



			options.onLoadStart();

		};

	return {
		models: models,
		sounds: sounds,

		fillModelList: fillModelList,

		loadModels: loadModels
	}

}