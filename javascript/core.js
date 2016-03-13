"use strict";

window.core = (function(window, document){

	var mergeObjects = function(){
			if(arguments.length < 2) return arguments[0];

			var object = {},
				attribute;
			for(var i = 0; i < arguments.length; i++)
			{
				for(attribute in arguments[i])
				{
					if(typeof arguments[i][attribute] == 'object')
					{
						if(Object.prototype.toString.call(arguments[i][attribute]) == '[object Array]')
						{
							if(object[attribute])
							{
								object[attribute] = [].concat(object[attribute], arguments[i][attribute]);
							}
							else
							{
								object[attribute] = arguments[i][attribute];
							}

						}
						else
						{
							object[attribute] = mergeObjects(object[attribute], arguments[i][attribute]);
						}
					}
					else
					{						
						object[attribute] = arguments[i][attribute];
					}
				}
			}
			return object;
		},
		dimensions = function(element, outerSize)
		{
			var box = element.getBoundingClientRect(),
				top = box.top + window.pageYOffset,
				left = box.left + window.pageXOffset,
				dimensions = {
					'height'    : box.height,
					'left'      : left,
					'offsetLeft': element.offsetLeft,
					'offsetTop' : element.offsetTop,
					'top'       : top,
					'width'     : box.width
				};

			if(outerSize)
			{
				var styles = window.getComputedStyle(element),
					margin = {
						'bottom': parseFloat(styles.marginBottom),
						'left'  : parseFloat(styles.marginLeft),
						'right' : parseFloat(styles.marginRight),
						'top'   : parseFloat(styles.marginTop)
					};

				dimensions.outerHeight = box.height + margin.top + margin.bottom;
				dimensions.outerWidth = box.width + margin.left + margin.right;
				dimensions.collapsedHeight = box.height + (margin.top >= margin.bottom ? margin.top : margin.bottom);
			}
			return dimensions;
		},
		each = function(object, fn, bind)
		{
			var bind = (typeof bind == 'undefined') ? true : bind;
			if (Object.prototype.toString.call(object) === '[object Object]')
			{
				for (var property in object)
				{
					if(Object.prototype.hasOwnProperty.call(object, property))
					{
						var boundFn = bind ? fn.bind(object[property]) : fn;
						if (boundFn(object[property], property) === true)
						{
							return true;
						}
					}
				}
			}
			else if(object.length)
			{	
				for (var ol = object.length, i = 0,	boundFn; i < ol; i++)
				{
					boundFn = bind ? fn.bind(object[i]) : fn;
					if(boundFn(i, object[i]) === true)
					{
						return true;
					}
				}
			}
			return false;
		},
		debounce = function(callback, delay, scope){
			var timer = null;
			delay || (delay = 100);
			return function() {
				var context = scope || this,
					args = arguments;
				clearTimeout(timer);
				timer = setTimeout(function(){
					callback.apply(context, args);
				}, delay);
			};
		},
		throttle = function(callback, scope){
			var request = null,
				args = null,
				context = null,
				frameFunction = function(){
					if(args && context)
					{
						callback.apply(context, args);
						request = window.requestAnimationFrame(frameFunction);
					}
					else
					{
						request = null;
					}
					args = context = null;
				};
			return function(){
				request || (request = window.requestAnimationFrame(frameFunction));
				args = arguments;
				context = scope || this;
			};
		},
		delay = function(callback, delay)
		{
			delay || (delay = 100);
			return setTimeout(callback, delay);
		},
		request = function(options){
			var request = new XMLHttpRequest(),
				defaultOptions = {
					'async': true,
					'contentType': 'application/x-www-form-urlencoded',
					'data': false,
					'method': 'post',
					'responseType': '',
					'timeout': 0,
					'url': false,
					'onAbort': null,
					'onError': null,
					'onLoad': null,
					'onLoadEnd': null,
					'onLoadStart': null,
					'onProgress': null,
					'onTimeout': null,
				},
				options = mergeObjects(defaultOptions, options),
				send = function(data)
				{
					var data = data || null;

					if(!options.url) return false;
					
					data = options.data ? options.data : data;

					/*if(options.hook)
					{
						if(typeof(options.hook) == 'string')
						{
							options.hook = [options.hook];
						}

						if(data && typeof(data.append) == 'function')
						{
							core.each(options.hook, function(){
								data.append('soda-hook[]', this);
							});
						}
						else
						{
							data = data +  '&soda-hook=' + options.hook; // ???
						}
					}*/

					
					request.open(options.method, options.url, options.async);

					request.responseType = options.responseType;
					
					//request.setRequestHeader('Content-type', options.contentType);
					request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
					
					request.send(data);
					
					return true;
				},
				abort = function()
				{
					request.abort();
				},
				setOption = function(option, value){
					if(typeof options[option] != 'undefined')
					{
						options[option] = value;
					}
				},
				getResponse = function(type){
					switch(type)
					{
						case 'json':
							try
							{
								return JSON.parse(request.responseText);
							}
							catch (error)
							{
								console.log('Error: Response is not a valid json string.', request.responseText);
								return null;
							}
						case 'raw':
							return request.response;
						default:
							return request.responseText
					}
				};
			
			request.onabort = options.onAbort;
			request.onerror = options.onError;
			request.onload = options.onLoad;
			request.onloadend = options.onLoadEnd;
			request.onloadstart = options.onLoadStart;
			request.onprogress = options.onProgress;
			request.ontimeout = options.onTimeout;
						
			return {
				abort: abort,
				getResponse: getResponse,
				send: send,
				setOption: setOption
			};
		};

	return {
		debounce: debounce,
		delay: delay,
		dimensions: dimensions,
		each: each,
		mergeObjects: mergeObjects,
		request: request,
		throttle: throttle
	}

})(window, document);