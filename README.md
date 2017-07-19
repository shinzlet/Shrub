# Shrub <img src="https://github.com/shinzlet/Shrub/blob/master/icons/shrub-icon-128.png?raw=true" width="1em" height="1em">
A chrome extension providing a tree based browsing history.

# Important Note
I had the idea for Shrub a few months prior to beginning it's development. In the interim, I forgot several
key aspects of it's functionality. Only after talking to a friend with better memory than I did I realize that
what I've been writing this whole time isn't what I meant to write. That said, I think that this version of shrub
might have it's uses as a more lightweight experience. Considering that what I intended to create is going to
require a full rewrite regardless, I've decided to patch Shrub up and just let it exist in case anybody wants it.
I'm going to develop the other extension as well, under a different name (which I'll link to when I create it).

# How It Works
In a conventional browser, history is very linear. If you start on some root page, and navigate to several
of it's children, the browser will only let you press forward (or backward) into the most recent of those pages.
Shrub is a small extension that aims to do this better. With Shrub installed, you are able to see every
subdirectory you've visited on a page, and navigate to any of them with one click.

# Screenshots
![Shrub's history menu.](http://i.imgur.com/C97tFJc.png "Shrub's history menu, brought up by pressing both alt keys.")

# Non-destructive Navigation
Shrub has benefits, but it also comes with some limitations of it's own. None of these impede regular browsing, but there
are some conditions that cause Shrub to break down.
For example, when the user enters a URL, Shrub will delete the history tree of the previous pages. Why? Shrub is designed
to keep true to linking structure, and as a URL is not a page link, it would violate the authenticity of a tree. In future versions, I intend to have Shrub save the tree instead of deleting it, allowing the user to return to a "dead" tree later on.

Currently, there are several types of navigation that are non destructive. The user can press the back button, which is just stepping back one node in the tree. You can also press forward, if the page in front of the current one has been indexed before.
