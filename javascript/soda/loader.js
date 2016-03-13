window.soda.loader = function(options)
{
	var defaultOptions = {
		'loaderClass' : 'Loader',
		'doneClass' : 'done',
		'removeDelay' : 1000
		},
		loaderElement = document.createElement('div'),
		progressElement = document.createElement('div'),
		done = false,
		options = core.mergeObjects(defaultOptions, options);

	loaderElement.appendChild(progressElement);
	loaderElement.className = options.loaderClass;
	
	this.init = function(parentElement)
	{
		done = false;
		loaderElement.className = options.loaderClass;
		progressElement.style.transform = 'scaleX(0)';
		parentElement.appendChild(loaderElement);
	}

	this.setProgress = function(value, max)
	{
		var value = (value / max).toPrecision(2);
		value = value < 0 ? 0 : value;
		value = value > 1 ? 1 : value;
		progressElement.style.transform = 'scaleX(' + value + ')';
	}

	this.shutdown = function(hard)
	{
		var parent = loaderElement.parentElement;
		if (done)
		{
			return;
		}

		done = true;

		if (hard)
		{
			parent.removeChild(loaderElement);
			return;
		}

		loaderElement.className += ' ' + options.doneClass;
		core.delay(function(){
			if(done && parent)
			{
				parent.removeChild(loaderElement);
			}
		}, options.removeDelay);
	};


	return this;
};