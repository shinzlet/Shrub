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
	addLink: function(name, url) {
		var link = document.createElement("div");
		link.className = "shrub-browser-link";

		var inner = document.createElement("div");
		inner.className = "shrub-browser-link-text";

		var title = document.createElement("p");
		title.innerHTML = name;

		var loc = document.createElement("p");
		loc.innerHTML = url;

		inner.appendChild(title);
		inner.appendChild(loc);

		link.appendChild(inner);
		UI.browser().appendChild(link);
	},
	visible: false,
	hover: false
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
		document.body.style.overflow = "hidden";
		UI.hover = true;
	}

	UI.browser().onmouseout = () => {
		document.body.style.overflow = "scroll";
		UI.hover = false;
	}
}
