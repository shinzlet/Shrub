let prune = {
	populate: function(tabId, count) {
		if(trees[tabId]) {
			if(!count) count = 5;
			if(count > 0 && count === Math.floor(count)) {
				tree = trees[`${tabId}`];
				for(var i = 0; i < count; i++) {
					tree.getActiveNode().appendChild(new Node(tree.getActiveNode(), "dummy url"));
				}
				return this.affirm();
			} else {
				return this.deny("invalid count");
			}
		} else {
			return this.deny("invalid tab id");
		}
	},
	printTraffic: function() {
		if(!this.showingTraffic) {
			chrome.webNavigation.onCommitted.addListener((e) => console.log(e));
			this.showingTraffic = true;
		} else {
			return this.deny("traffic is already being shown");
		}

		return this.affirm();
	},
	sever: function() {
		trees = {};
		return this.affirm();
	},
	affirm: function() {
		return (["Gotcha!", "Alright!", "You betcha!", "Okey dokey."])[Math.floor(Math.random() * 4)];
	},
	deny: function(message) {
		return (["No can do!", "Nope!", "Not happening.", "Sorry, can't do that."])[Math.floor(Math.random() * 4)] + ` (${message})`;
	},
	showingTraffic: false
};
