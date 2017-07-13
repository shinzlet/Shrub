// Initialize variables
let documentReady = false;
let ui = {};

{ // Begin UI sequence

	ui = new UI();
	ui.load({callback: ui.build()});

}

// Document event listeners
document.addEventListener("DOMContentLoaded", );

/*
	UI:
		Encapsulates functions which can be sequentially used to build up the Shrub UI,
		and later on acts as a delegate for interaction.
*/
function UI() {
	this.content = {
		html: undefined,
		links: undefined
	};

	// Loads content required to assemble the Shrub UI. (links & interface)
	this.load = function(ops) {
		if(!ops) ops = {};

		let context = this; // required to get access 'this' from the correct scope later
		loadXML({
			callback: function(response) {
				context.content.html = response;
			}
		});

		if(ops.callback)
			ops.callback();
	};
	// Assembles the previously loaded content into an injectable DOM structure.
	this.build = function() {

	};
	// Attaches event handlers to UI components.
	this.bind = function() {

	};
	// Injects the assembled content into the parent element (probably 'document.body').
	this.inject = function(parent) {

	};
}

/*
	loadXML:
		Returns the XML located at a path.
*/
function loadXML(ops) {
	if(!ops || !ops.path || !ops.callback) return; // We need a path and a callback
	if(ops.path[0] !== '/') ops.path = '/' + ops.path; // The relative path for an extension needs a preceding slash

	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if(request.readyState === 4) { // 4 = DONE
			ops.callback(request.response);
		}
	};

	request.open('GET', chrome.extension.getURL(ops.path), true);
	request.send(''); // Send the request. (this calls request.onreadystatechange^)
}
