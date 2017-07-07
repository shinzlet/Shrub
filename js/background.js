/*
	Node
	Nodes contain a url and a list of their child nodes. They also have access to their parent node.
*/
function Node(par, loc) {
	var object = {
		children: [],
		location: loc,
		parent: par,
		getParent: function() {
			return this.parent;
		},
		hasChildren: function() {
			return children === undefined;
		},
		getChildren: function() {
			return children;
		},
		appendChild: function(child) {
			this.children.push(child);
		},
		getLocation: function() {
			return this.location;
		},
		setLocation: function(newLocation) {
			this.location = newLocation;
		}
	};

	return object;
}

/*
	Tree
	A tree stores only two pieces of information, the root node of the tree, and the node which is currently being traversed.
*/
function Tree(node) {
	return {
		root: node,
		activeNode: node,
		getActiveNode: function() {
			return this.activeNode;
		},
		setActiveNode: function(n) {
			this.activeNode = n;
		},
		appendChildToActive: function(child) {
			this.activeNode.appendChild(child);
			this.activeNode = child;
		}
	}
}

/*
	This associative array stores a tab's key along with the tree for that tab.
*/
var trees = {}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		let name = `${sender.tab.id}`;
		let url = sender.tab.url;
		switch(request.action) {
			default: break;
		}
	}
);

/*
	Creates a new history tree.
*/
function beginTree(name, url) {
	trees[name] = new Tree( new Node(undefined, url) );
}

/*
	This event is fired when a new tab is created. When this happens, a new history
	tree is created for this tab.
*/
chrome.tabs.onCreated.addListener((tab) => {
	let name = `${tab.id}`;
	let url = tab.url;
	beginTree(name, url);
});

/*
	When a tab is closed, it becomes detached from the history tree. This function
	just deletes the stray tree.
*/
chrome.tabs.onRemoved.addListener((tab) => {
	let name = `${tab.id}`;
	delete trees[name];
});

/*
	This event is called whenever a webpage is loaded. To properly do tree stuff,
	we need to tell if this action was intentional (e.g. not an iframe loading),
	and follow the user by stepping through the tree.

	This also is run when the user presses the forward or back button, which requires
	a different protocol. I'm not going to go over it twice, it's commented below.

	Notes:
		Redirect links that do not stay in the browser history will cause the back detection to misfire,
		causing a forward button event. This destroys the tree, and is heavily undesirable. Because of this,
		we must check for all client_redirect transitionQualifiers, and if one is detected we have to replace the
		location of the last node with the new url, rather than appending a node.
*/
chrome.webNavigation.onCommitted.addListener((tab) => {
	let name = `${tab.tabId}`;
	let url = tab.url;
	let transition = tab.transitionType;
	let tree = trees[name];

	if(!tree) {
		// This might happen in mass tab restoration, or in the session where the extension was first installed,
		// As neither of those events would neccessarily lead to the new tab creation listener.
		beginTree(name, url);
		console.log("1 | Tree created");
		return; // If we let the last half of the code run we risk duplicating this node.
	}

	// This is a bit of a workaround, as chrome doesn't seem to let me tell the difference between forward / back easily (forward is not allowed)
	if(tab.transitionQualifiers && tab.transitionQualifiers.indexOf("forward_back") !== -1) {
		let parent = tree.getActiveNode().getParent();

		if(parent && url === parent.getLocation()) {
			// This means the user went back, which doesn't violate tree coherence.
			tree.setActiveNode(parent); // All we have to do is step back.
			console.log("2 | Backed up");
		} else {
			// This only happens when the user decides to go forwards or back beyond the tree root.
			delete trees[name]; // The tree is dead, now. Are you happy?
			beginTree(name, url); // We still want a tree, though.
			console.log("3 | Deleted tree");
		}

		return; // the transition is either 'link' or 'typed', so we aren't going to risk node duplication / removal
	}

	switch(transition) {
		case "link":
			if(tab.transitionQualifiers && tab.transitionQualifiers.indexOf("client_redirect") !== -1) {
				tree.getActiveNode().setLocation(url);
				console.log("4.1 | Redirect link");
			} else {
				let child = new Node(tree.getActiveNode(), url);
				tree.appendChildToActive(child);
				console.log("4 | Link");
			}
			break;
		case "typed":
			delete trees[name]; // Manually navigating away from the tree severs it from the structure
			beginTree(name, url);
			console.log("5 | Typed");
			break;
	}
});