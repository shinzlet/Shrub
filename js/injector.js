let UI = {
	elem: function(){return undefined}, // elem is set to a function in initializeUI
	browser: function(){return undefined},
	title: function(){return undefined},
	style: () => {
		return UI.elem().style;
	},
	toggle: function() {
		if(UI.visible) {
			UI.style().visibility = "hidden";
			UI.style().zIndex = -99;
		} else {
			UI.style().visibility = "visible";
			UI.style().zIndex = 1000000; // This has to be really high due to several websites having huge z indecies
		}

		UI.visible = !UI.visible;
	},
	addLink: function(name, url, fullUrl) {
		var link = document.createElement("div");
		link.className = "shrub-browser-link";
		link.setAttribute("data-shrub-path", fullUrl);

		var inner = document.createElement("div");
		inner.className = "shrub-browser-link-text";

		var title = document.createElement("p");
		title.innerHTML = name;
		title.className = "shrub-link-header";

		var loc = document.createElement("p");
		loc.innerHTML = url;

		inner.appendChild(title);
		inner.appendChild(loc);

		link.appendChild(inner);
		link.addEventListener("click", linkClicked, false);
		UI.browser().appendChild(link);
	},
	visible: false,
	hover: false,
	maxNameLength: 30,
	maxUrlLength: 30,
	scrollLockPosition: 0
}

function KeyHandler(keyNames, callback) {
	let object = {
		keyComboStates: [],
		keyNameArray: keyNames,
		eventCallback: callback,
		init: function() {
			this.keyComboStates = this.keyNameArray.map(() => {
				return false;
			});

			document.body.addEventListener("keydown", (e) => {

				let index = this.keyNameArray.indexOf(e.code);
				if(index !== -1) { // If the key pressed is a part of the combo
					this.keyComboStates[index] = true;
				}

				var trigger = this.keyComboStates.every((elem) => {
					return elem;
				}) && this.keyComboStates[0] === true;

				if(trigger) { // All of the combo keys are down
					this.eventCallback();
				}
			});

			document.body.addEventListener("keyup", (e) => {
				let index = this.keyNameArray.indexOf(e.code);
				if(index !== -1) { // If the key released is a part of the combo
					this.keyComboStates[index] = false;
				}
			});

		}
	};

	object.init();

	return object;
}
// Code execution
buildUI();

// Event listeners:
new KeyHandler(["AltLeft", "AltRight"], UI.toggle);

document.body.addEventListener("click", function() { // If the user clicks outside of the interface, close it
	if(UI.visible && !UI.hover) {
		UI.toggle();
	}
});

window.addEventListener("scroll", () => {
	if(UI.hover) {
		document.body.scrollTop = UI.scrollLockPosition;
	}
});

// Loads ui from ui.html, then sends the html string into the injector to put it into the page
function buildUI() {
	{
		var request = new XMLHttpRequest();

		request.onreadystatechange = () => {
			if(request.readyState === 4) {
				injectUI(request.response);
			}
		};

		request.open('GET', chrome.extension.getURL("/html/ui.html"), true);
		request.send('');
	}
}

// Take the html string and inject it into the frame div
function injectUI(ui) {
	let frame = document.createElement("div");
	frame.id = "shrub-injection-frame";
	frame.innerHTML = ui;
	document.body.appendChild(frame);
	initializeUI();
}

// Performs final UI initialization.
function initializeUI() {
	UI.elem = () => {
		return document.getElementById("shrub-injection-frame");
	};

	UI.title = () => {
		return document.getElementById("shrub-title-bar");
	};

	UI.browser = () => {
		return document.getElementById("shrub-browser");
	};

	UI.browser().onmouseover = () => {
		UI.hover = true;
		UI.scrollLockPosition = document.body.scrollTop;
	}

	UI.browser().onmouseout = () => {
		UI.hover = false;
	}

	if(document.readyState == "complete") {
		populateUI();
	} else {
		window.addEventListener("load", populateUI);
	}
}

function populateUI() {
	chrome.runtime.sendMessage(
		{action: "fetchBranch"},
		function(response) {
			if(response.nodes && response.nodes.length > 0) {
				response.nodes.forEach(elem => {
					let name = elem.name;
					let url = elem.url;

					if(name.length > UI.maxNameLength) {
						name = name.substring(0, UI.maxNameLength - 3) + "...";
					}

					let len = url.length;
					if(len > UI.maxUrlLength) {
						url = "..." + url.substring(len - UI.maxUrlLength - 3, len)
					}
					UI.addLink(name, url, elem.url);
				});
			} else {
				let block = document.createElement("div");
				block.className = "shrub-browser-link";
				let text = document.createElement("div");
				text.className = "shrub-browser-link-text";
				let message = document.createElement("p");
				message.innerHTML = "Nothing here yet!";
				text.appendChild(message);
				block.appendChild(text);
				UI.browser().appendChild(block);
			}
		}
	);
}

function linkClicked() {
	window.location = this.getAttribute("data-shrub-path");
}
