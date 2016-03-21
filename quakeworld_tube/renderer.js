QuakeWorldTube.renderer = function(container)
{
	var camera,
	    far = 2000,
	    fov = 75,
	    near = 1,
	    pixelRatio = window.devicePixelRatio,
	    renderer,
	    scene,

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

	scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
	scene.fog.color.setHSL( 0.6, 0, 1 );

	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
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
				dirLight.shadowMapWidth = 2048;
				dirLight.shadowMapHeight = 2048;
				var d = 50;
				dirLight.shadowCameraLeft = -d;
				dirLight.shadowCameraRight = d;
				dirLight.shadowCameraTop = d;
				dirLight.shadowCameraBottom = -d;
				dirLight.shadowCameraFar = 3500;
				dirLight.shadowBias = -0.0001;

	/*camera.position.z += 1000; // cam up down
	camera.position.y += -600; // cam north south
	camera.position.x += 500; // cam east west

	camera.rotation.x += 0.00000002; // head up down
	camera.rotation.y += 0.0; // head left right
	camera.rotation.z += 0.0; // head tilt/rotate left right*/

	//scene.add(new THREE.AmbientLight(0xffffff));

	window.addEventListener('resize', onResize);
	
	container.appendChild(renderer.domElement);

	onResize();

	return {
		updateCameraPosition: updateCameraPosition,
		render        : render,
		scene         : scene,
		setPixelRatio : setPixelRatio,
		shutdown      : shutdown
	}
}