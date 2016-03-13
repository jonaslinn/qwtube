
window.soda.app.setHooks(['metatags', 'coremain', 'coremenu', 'coresubmenu']);

window.soda.app.registerContentFunction('metatags', function(content, messages){
	var meta = document.getElementsByTagName('meta');

	try
	{
		content = JSON.parse(content);
	}
	catch(error)
	{
		return;
	}

	document.title = content.title;

	meta['keywords'].setAttribute('content', content.keywords);

	meta['description'].setAttribute('content', content.description);
});

window.soda.app.registerInitFunction('coremenu', function(root, messages){

	var menutoggle = document.getElementById('menutoggle'),
		menu = document.getElementById('mainMenu'),
		links = menu.getElementsByTagName('a');
	
	menutoggle.addEventListener('click', function(){
		menu.classList.toggle('hidden');
		menutoggle.classList.toggle('open');
	}, false);

	core.each(links, function(){
		this.addEventListener('click', function(event){
			event.preventDefault();
			menu.classList.toggle('hidden');
			window.soda.app.requestPage(this.getAttribute('href'));
			
		});
	});

});

window.soda.app.registerInitFunction('coremain', function(root, messages){
	var sodaLists = document.querySelectorAll('.js-sodalist');

	if(sodaLists.length)
	{
		core.each(sodaLists, function(){
			var buttons = this.getElementsByTagName('button'),
				command = new soda.command({
					'tokenName': this.dataset.tokenName,
					'token': this.dataset.token,
					'url': this.dataset.url,
					'hook': ['coremain', 'metatags'],
					'actions': {
						'delete': {
							'onBeforeSend': function(command, element){
								soda.modal({
									'buttons': {
										'yes': {
											'label': 'Yes',
											'value': true
										},
										'cancel': {
											'label': 'No'
										}
									},
									'content' : element.getAttribute('data-modal'),
									}, function(result){
										if(result === true)
										{
											command.sendRequest();
										}
										else
										{
											command.abort();
										}
									}
								);
							}
						}
					}
				});

			core.each(buttons, function(){
				this.addEventListener('click', function(){
					command.execute(this);
				});
			});
		});
	}
	

	//testRequest.send();

	

	
	var sodaFlux = document.querySelectorAll('.sodaFlux'),
		sodaTags = document.querySelectorAll('.Tags');

	core.each(sodaFlux, soda.flux);
	core.each(sodaTags, function(){
		soda.tags(this);
	});

	var menutoggle = document.getElementById('menutoggle');

	/*var baseMenu = document.getElementById('baseMenu'),
		baseMenuOffset = baseMenu.offsetTop;

	menutoggle.addEventListener('click', function(){
		var menu = document.getElementById('mainMenu');
		menu.classList.toggle('hidden');
		menutoggle.classList.toggle('open');
	}, false);*/

	/*window.addEventListener('scroll', function(){
		if(window.scrollY >= baseMenuOffset)
		{
			baseMenu.classList.add('sticky');
		}
		else
		{
			baseMenu.classList.remove('sticky');
		}
	}, false);*/

	var sectionMenu = document.getElementById('sectionMenu'),
		main = document.getElementsByTagName('main')[0],
		sections = main.getElementsByTagName('section'),
		screenheight = window.innerHeight;

	if(sectionMenu)
	{	
		/*core.each(sectionMenu.getElementsByTagName('a'), function(){
			var section = this.getAttribute('href').slice(1),
				sectionElement = document.getElementById(section);
			sectionElement.style.minHeight = screenheight + 'px';
			sectionElement.menuItem = this;
		});*/
	

		/*var sectionMenuController = function(event)
		{
			var activeElement = false;
			core.each(sections, function(){
				this.menuItem.classList.remove('active');
				if(this.offsetTop < window.scrollY)
				{
					activeElement = this.menuItem;
					activeElement.classList.add('active');
					return true;
				}
			});			
		}*/

		//window.addEventListener('scroll', sectionMenuController);

		sectionMenu.addEventListener('click', function(event){
			
			

			core.each(sectionMenu.getElementsByTagName('a'), function(){
				//this.classList.remove('active');
			});


			//event.target.classList.add('active');

			
			
		}, true);
	}

	/*sectionMenuToggle.addEventListener('click', function(event){
		event.preventDefault();
		main.classList.toggle('reveal');
	}, false);*/





/*window.onpopstate = function(event)
{
console.log('atat', event.state);
}

var stateObj = { foo: "bar" };
history.pushState(stateObj, "page 2", "bar.html");
history.pushState(stateObj, "page 2", "bar2.html");

history.back();*/


	//var ajaxForms = document.querySelectorAll('[data-soda]');



	/*core.each(ajaxForms, function(){
		this.onsubmit = function(event){
			event.preventDefault();
			var options = {
				'onLoad': function(e){
					console.log(this.response);
				},
				'url': this.action
				},
				request = core.request(options);
			console.log(this.action);
			request.send(new FormData(this));
		}
	});*/

	//console.log(ajaxForms);
});

window.soda.app.init();

(function(){

	/*window.sodaToken = new soda.token;

		
	var options = {
		'onLoad': function(e){
			//console.log(e);
			console.log(this.response);
		},
		'onError': function(){console.log('oh no!')},
		'url': 'http://127.0.0.1/sodacore/webroot/core.css'
		},
		testRequest = core.request(options);

	var sodaLists = document.querySelectorAll('.js-sodalist');

	if(sodaLists.length)
	{
		core.each(sodaLists, function(){
			soda.list(this);
			console.log(this);
		});
	}*/

	

		
	
})();