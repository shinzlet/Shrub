// Initialize variables
let ui = {};

{
	/*
		In the previous version of injector.js, this system was a set of chained processes (one function called the next).
		The implementation of it, however, was reliant on the document having loaded, causing a delay after page load before
		Shrub was usable. The injector is now run at doc start, which means that it can be more seamless. To allow for optimal
		performance, only events which depend on eachother are chained (using callbacks), and events which can more or less
		take care of themselves are called in the meantime. This allows for a faster, more seamless injection.
	*/

	ui = new UI();
	ui.load({callback: ui.build});
	ui.bind({
		callback: () => { ui.inject(document.body) }
	});
}

/*
	When the DOM is loaded, we want to inject the UI. If it's not done loading, though,
	it will eventually realize that it's not injected and the page is loaded, and do it itself.
*/
document.addEventListener("DOMContentLoaded", function() {
	if(ui.bound) {
		ui.inject(document.body);
	}
});

/*
	UI:
		Encapsulates functions which can be sequentially used to build up the Shrub UI,
		and later on acts as a delegate for interaction.
*/
function UI(ops) {
	if(!ops) ops = {maxNameLength: 30, maxUrlLength: 30};

	this.maxNameLength = ops.maxNameLength;
	this.maxUrlLength = ops.maxUrlLength;
	this.frame = undefined;
	this.browser = undefined;
	this.bound = false;
	this.content = {}; // will contains links and html.

	/*
		UI.load:
			Loads content required to assemble the Shrub UI. (links & interface)
	*/
	this.load = function(ops) {
		if(!ops || !ops.callback) return -1; // If ops is undefined later on, it'll throw an error.

		let context = this; // required to get access 'this' from the correct scope later

		// This will load the file 'html/ui.html' into 'content', where it can later be used.
		loadXML({
			callback: function(response) {
				context.content.html = response;
				// If the links are also loaded, we can progress to the next assembly step.
				if(context.content.links) {
					ops.callback.call(context);
				}
			},
			path: "/html/ui.html"
		});

		// This asks background.js for the links we want to display, and stores them in 'content'.
		fetchLinks({
			callback: function(response) {
				context.content.links = response;
				// If the html has been loaded, we can progress to the next assembly step.
				if(context.content.html) {
					ops.callback.call(context);
				}
			}
		});
	};
	/*
		UI.build:
			Assembles the previously loaded content into an injectable DOM structure.
			If build has been called before (this.frame !== undefined), we only want to
			reassemble the link structure.
	*/
	this.build = function() {
		this.frame = document.createElement('div');
		this.frame.id = 'shrub-injection-frame';
		this.frame.innerHTML = this.content.html;

		// We will later on need a reference to the browser.
		for(var n = 0; n < this.frame.children.length; n++)
			if(this.frame.children[n].id === 'shrub-browser') this.browser = this.frame.children[n];

		this.buildLinks();
	};
	/*
		UI.buildLinks:
			Removes old links from the browser, and populates it with whatever links are present in
			content.links.
	*/
	this.buildLinks = function() {
		this.content.links.forEach((elem) => {
			this.addLink(elem.name, elem.url);
		});
	};
	/*
		UI.addLink
				Adds a link to the browser. Takes a name and url.
	*/
	this.addLink = function(name, url) {
		let link = document.createElement('div');
		let text = document.createElement('div');
		let header = document.createElement('p');
		let cutUrl = document.createElement('p');
		let length = url.length;

		link.setAttribute('id', 'shrub-browser-link');
		link.setAttribute('shrub-data-path', url);
		text.setAttribute('id', 'shrub-browser-link-text');
		header.innerHTML = name.length < this.maxNameLength ? name : (name.substring(0, this.maxNameLength - 3) + "...");
		cutUrl.innerHTML = length < this.maxUrlLength ? name : ("..." + name.substring(length - this.maxUrlLength + 3, length));

		text.appendChild(header);
		text.appendChild(cutUrl);

		link.appendChild(text);

		// Now that the link has been fully put together, we need to attach it to the click handler.
		link.addEventListener('click', this.clickHandler);

		this.browser.appendChild(link);
	};
	/*
		UI.bind:
			Attaches event handlers for UI interaction.
	*/
	this.bind = function(ops) {
		if(!ops || !ops.callback) return; // We need to have a callback so that we can try to inject the ui after binding.



		this.bound = true;
		ops.callback();
	};
	/*
		UI.inject:
			Injects the assembled content into the parent element (probably 'document.body').
	*/
	this.inject = function(parent) {
		if(parent) { // If the page isn't loaded when inject is called, it won't do anything (parent will be undefined)
			parent.appendChild(this.frame); // Inject the injection frame into the parent.
		}
	};
	/*
		UI.clickHandler:
			Standard link followthrough implementation.
	*/
	this.clickHandler = function() {
		console.log(this);
	};
}

/*
	bindShortcut:

*/
function bindShortcut(ops) {
	if(!ops.callback || !ops.keys) return -1;
	({
		keystates: [],
		init: function() {
			this.keystates = ops.keys.map(() => false); // Fills 'keystates' with false, and makes it's length equal to the key count
			

		}
	}).init();
}

/*
	loadXML:
		Returns the XML located at a path.
*/
function loadXML(ops) {
	if(!ops || !ops.path || !ops.callback) return -1; // We need a path and a callback
	if(ops.path[0] !== '/') ops.path = '/' + ops.path; // The relative path for an extension needs a preceding slash

	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if(request.readyState === 4) { // 4 means done
			ops.callback(request.response);
		}
	};

	request.open('GET', chrome.extension.getURL(ops.path), true);
	request.send(''); // Send the request. (this calls back request.onreadystatechange^^^)
}

/*
	fetchLinks:
		Polls background.js for the children of the currently active node. To step back or forward,
		recede or advance must be called to navigate the tree.
		After the links are recieved, they are passed as an array into ops.callback.
*/
function fetchLinks(ops) {
	chrome.runtime.sendMessage({action: "fetchBranch"}, (reply) => {
		ops.callback(reply.nodes);
	});
}

/*
	recede:
		Instructs background.js to move the current active node to it's parent.
*/
function recede() {

}

/*
	advance
		Takes in {childIndex: #}, where # is the index of the node in the child array
		to navigate to. Instructs background.js to set that child as the active node.
*/
function advance(ops) {

}
