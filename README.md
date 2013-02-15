Meltdown (Markdown Extra Live Toolbox)
======================================

A JQuery plugin that adds Markdown Extra live previews, and a toolbar for common markdown actions. **Check out the [project page](http://iphands.github.com/Meltdown/) for a live demo**

##Usage
###Simple, standard, awesome
~~~
jQuery('some_selector').meltdown();
~~~
###Advanced, changing the preview slider timeout and adding an example widget, still awesome
~~~
jQuery('some_selector').meltdown({
  previewTimeout: 4000,
  examples['test'] = {
    label: "Test",
    altText: "A test example/opt",
    markdown: "this is a test"
  }
});
~~~

##Libraries that Meltdown uses
* [jQuery](http://jquery.com/)
* [jQuery UI](http://jqueryui.com/) [1]
* [js-markdown-extra](https://github.com/tanakahisateru/js-markdown-extra "Github link to js-markdown-extra")
* [rangyinputs](http://code.google.com/p/rangyinputs/ "Google code link to rangyinputs") [1]

[1] jQuery UI and rangyinputs are optional. For now Meltdown will still function without these plugins.

##License
Copyright (c) 2013 Ian Page Hands and Mark Caron. Licensed under the GPLv3 license.
