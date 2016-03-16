QuakeWorldTube.renderer = function(container)
{
	var canvas = document.createElement('canvas'),
	    camera,
	    far = 2000,
	    fov = 75,
	    near = 1,
	    pixelRatio = window.devicePixelRatio,
	    renderer,
	    scene,

	    onResize = function()
	    {
	    	var height = canvas.parentNode.clientHeight * pixelRatio,
	    		width  = canvas.parentNode.clientWidth * pixelRatio,

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
	    	container.removeChild(canvas);
	    	window.removeEventListener('resize', onResize);
	    },

	    setPixelRatio = function(ratio)
	    {
	    	pixelRatio = ratio;
	    	onResize();
	    }

	    updateCameraPosition = function(coords)
	    {
	    	camera.position.set(coords.position.x, coords.position.y, coords.position.z + 16); /* move the camera from the belly button to the eyes */

	    	camera.rotation.setFromVector3(coords.rotation, 'ZXY');
	    };

	try
	{
		container.appendChild(canvas);
	}
	catch(error)
	{
		console.log('Container does not exist.');
		return false;
	}

	try
	{
		renderer = new THREE.WebGLRenderer( {
			canvas: canvas,
			alpha: false,
			antialias: true
		});
	}
	catch (e)
	{
		console.log('WebGL error');	
		return false;
	}

	THREE.Euler.DefaultOrder = 'ZXY';

	scene  = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(fov, container.clientWidth / container.clientHeight, near, far);

	onResize();

	scene.add(new THREE.AmbientLight(0xffffff));

	window.addEventListener('resize', onResize);

	return {
		updateCameraPosition: updateCameraPosition,
		render        : render,
		scene         : scene,
		setPixelRatio : setPixelRatio,
		shutdown      : shutdown
	}
}