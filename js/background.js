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
			return children.length > 0;
		},
		getChildren: function() {
			return children;
		},
		appendChild: function(child) {
			this.children.push(child);
		},
		getLocation: function() {
			return this.location;
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
		let name = `${sender.tab.windowId}${sender.tab.id}`;
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
	trees[name] = new Tree( new Node(null, url) );
}

/*
	This event is fired when a new tab is created. When this happens, a new history
	tree is created for this tab.
*/
chrome.tabs.onCreated.addListener((tab) => {
	let name = `${tab.windowId}${tab.id}`;
	let url = tab.url;
	beginTree(name, url);
});

/*
	When a tab is closed, it becomes detached from the history tree. This function
	just deletes the stray tree.
*/
chrome.tabs.onRemoved.addListener((tab) => {
	let name = `${tab.windowId}${tab.id}`;
	delete trees[name];
});

/*
	This event is called whenever a webpage is loaded. To properly do tree stuff,
	we need to tell if this action was intentional (e.g. not an iframe loading),
	and follow the user by stepping through the tree.

	This also is run when the user presses the forward or back button, which requires
	a different protocol. I'm not going to go over it twice, it's commented below.
*/
chrome.webNavigation.onCommitted.addListener((tab) => {
	let name = `${tab.windowId}${tab.id}`;
	let url = tab.url;
	let transition = tab.transitionType;
	let tree = trees[name];

	if(!tree) {
		// This might happen in mass tab restoration, or in the session where the extension was first installed,
		// As neither of those events would neccessarily lead to the new tab creation listener.
		beginTree(name, url);
		return; // If we let the last half of the code run we risk duplicating this node.
	}

	// This is a bit of a workaround, as chrome doesn't seem to let me tell the difference between forward / back easily (forward is not allowed)
	if(tab.transitionQualifier && tab.transitionQualifier.indexOf("forward_back") !== -1) {
		let parent = tree.getActiveNode().getParent();
		if(url === parent.getLocation()) {
			// This means the user went back, which doesn't violate tree coherence.
			tree.setActiveNode(parent); // All we have to do is step back.
		} else {
			// This only happens when the user decides to go forwards or back beyond the tree root.
			delete trees[name]; // The tree is dead, now. Are you happy?
			beginTree(name, url); // We still want a tree, though.
			return; // the transition is still technically 'link', so we aren't going to risk node duplication
		}
	}

	switch(transition) {
		case "link":
			let child = new Node(tree.getActiveNode, url);
			tree.appendChildToActive(child);
			break;
		case "typed":
			delete trees[name]; // Manually navigating away from the tree severs it from the structure
			beginTree(name, url);
			break;
	}
});
