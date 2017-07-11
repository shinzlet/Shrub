pageWrapper = () => document.getElementById("page-wrapper");

attachButtonListeners();
fixLinks();

function attachButtonListeners() {
	let tabs = document.getElementsByClassName("tab");
	for(let i = 0; i < tabs.length; i++) {
		tabs[i].addEventListener("click", tabClicked);
		tabs[i].setAttribute("data-index", `${i}`);
	}
}

function tabClicked() {
	pageWrapper().style.transform = `translateY(-${this.getAttribute("data-index") * 100}vh)`;
}

function fixLinks() { // I'm kinda shocked that this is something we have to do
	let links = document.getElementsByTagName("a");
	for(var i = 0; i < links.length; i++) {
		links[i].addEventListener("click", followLink);
	}
}

function followLink() {
	let href = this.href;
	chrome.tabs.create({url: href});
}
