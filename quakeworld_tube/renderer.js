QuakeWorldTube.renderer = function(container)
{
	var camera,
	    far = 2000,
	    fov = 75,
	    near = 1,
	    pixelRatio = window.devicePixelRatio,
	    particleSystem,
	    renderer,
	    scene,

	    particleOptions = {
	    	'missile': {
				color: 0xff0000,
				colorRandomness: .1,
				lifetime: 2000,
				position: new THREE.Vector3(),
				positionRandomness: .1,
				size: 5,
				sizeRandomness: 1,
				turbulence: .5,
				velocity: new THREE.Vector3(),
				velocityRandomness: .01,
			},
			'grenade': {
				color: 0xaa88ff,
				colorRandomness: .2,
				lifetime: 2,
				position: new THREE.Vector3(),
				positionRandomness: .3,
				size: 5,
				sizeRandomness: 1,
				turbulence: .5,
				velocity: new THREE.Vector3(),
				velocityRandomness: .5,
			},
			'spawnerOptions': {
				spawnRate: 100,
				horizontalSpeed: 1.5,
				verticalSpeed: 1.33,
				timeScale: 1
			}
	    },

	    onResize = function()
	    {
	    	var height = renderer.domElement.parentNode.clientHeight * pixelRatio,
	    		width  = renderer.domElement.parentNode.clientWidth * pixelRatio,

	    		aspect = width / height;

	    	renderer.setSize(width, height, (pixelRatio == 1));
	    	//renderer.setPixelRatio(window.devicePixelRatio); Mal nachlesen, könnte so besser sein

	    	camera.aspect = aspect;
	    	camera.updateProjectionMatrix();
	    },

	    fireParticles = function(type, position, delta)
	    {
	    	var options = particleOptions[type];

	    	options.position.copy(position);

	    	for (var x = 0; x < particleOptions.spawnerOptions.spawnRate; x++) {
				// Yep, that's really it.	Spawning particles is super cheap, and once you spawn them, the rest of
				// their lifecycle is handled entirely on the GPU, driven by a time uniform updated below
				particleSystem.spawnParticle(options);
			}
	    },

	    render = function()
	    {
	    	renderer.render(scene, camera);
	    },

	    shutdown = function()
	    {
	    	container.removeChild(renderer.domElement);
	    	window.removeEventListener('resize', onResize);
	    },

	    setPixelRatio = function(ratio)
	    {
	    	pixelRatio = ratio;
	    	onResize();
	    }

	    updateCameraPosition = function(coords)
	    {
	    	camera.position.copy(coords.position);
	    	camera.position.z += 20;   	//move the camera from the belly button to the eyes 

	    	camera.rotation.x = Math.PI/2 - coords.rotation.x;
	    	camera.rotation.y = coords.rotation.y;
	    	camera.rotation.z = -Math.PI/2 + coords.rotation.z;
	    };

	renderer = new THREE.WebGLRenderer();

	THREE.Euler.DefaultOrder = 'ZXY';

	scene  = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(fov, container.clientWidth / container.clientHeight, near, far);

	particleSystem = new THREE.GPUParticleSystem({
		maxParticles: 250000
	});

	scene.add(particleSystem);

	
	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.8 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 500, 0 );
	scene.add( hemiLight );

	dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set( -1, 1.75, 1 );
	dirLight.position.multiplyScalar( 50 );
	scene.add( dirLight );
	dirLight.castShadow = true;
	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;
	var d = 50;
	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;
	dirLight.shadow.camera.far = 3500;
	dirLight.shadow.bias = -0.0001;

	//scene.add(new THREE.AmbientLight(0xffffff));

	window.addEventListener('resize', onResize);
	
	container.appendChild(renderer.domElement);

	onResize();

	return {
		render         : render,
		scene          : scene,
		setPixelRatio  : setPixelRatio,
		particleSystem : particleSystem,
		fireParticles  : fireParticles,
		shutdown       : shutdown,
		updateCameraPosition: updateCameraPosition,
	}
}