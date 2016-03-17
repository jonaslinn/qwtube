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
	    	/*camera.position.set(coords.position.x, coords.position.y, coords.position.z + 16);  move the camera from the belly button to the eyes 

	    	camera.rotation.copy(coords.rotation);*/
	    };

	renderer = new THREE.WebGLRenderer();



	//THREE.Euler.DefaultOrder = 'ZXY';

	scene  = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(fov, container.clientWidth / container.clientHeight, near, far);

	camera.position.z += 1000; // cam up down
	camera.position.y += -600; // cam north south
	camera.position.x += 500; // cam east west

	camera.rotation.x += 0.00000002; // head up down
	camera.rotation.y += 0.0; // head left right
	camera.rotation.z += 0.0; // head tilt/rotate left right

	scene.add(new THREE.AmbientLight(0xffffff));

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