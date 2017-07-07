# Shrub
A chrome extension providing a tree based browsing history.

# How It Works
To explain what shrub does, here's an example of how an example scenario would play out with a regular browser.
Imagine opening a webpage, which we'll call A. It has two links, B and C. If you navigate to page B, an accurate
representation of what you have browsed (A-B) is still present. If you then press back and return to page A, information
is still retained: you can press forward to go to B. However, navigating to page C will erase this history. Shrub will retain this data in a tree where B and C are children of the history node A. In more realistic, complex
cases with numerous tabs, this can be extremely useful.
