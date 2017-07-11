# Shrub
A chrome extension providing a tree based browsing history.

# How It Works
In a conventional browser, history is very linear. If you start on some root page, and navigate to several
of it's children, the browser will only let you press forward (or backward) into the most recent of those pages.
Shrub is a small extension that aims to do this better. With Shrub installed, you are able to see every
subdirectory you've visited on a page, and navigate to any of them with one click.

# Screenshots
![Shrub's history menu.](http://i.imgur.com/gFr2bzH.png "Shrub's history menu, brought up by pressing both alt keys.")

# Non-destructive Navigation
Shrub has benefits, but it also comes with some limitations of it's own. None of these impede regular browsing, but there
are some conditions that cause Shrub to break down.
For example, when the user enters a URL, Shrub will delete the history tree of the previous pages. Why? Shrub is designed
to keep true to linking structure, and as a URL is not a page link, it would violate the authenticity of a tree. In future versions, I intend to have Shrub save the tree instead of deleting it, allowing the user to return to a "dead" tree later on.

Currently, there are several types of navigation that are non destructive. The user can press the back button, which is just stepping back one node in the tree. You can also press forward, if the page in front of the current one has been indexed before.
