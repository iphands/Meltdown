Meltdown (Markdown Extra Live Toolbox)
======================================

A JQuery plugin that adds Markdown Extra live previews, and a toolbar for common markdown editions. **Check out the [project page](http://iphands.github.com/Meltdown/) for a live demo.**

It also features a fullscreen and a side-by-side mode (vertically split screen). The editor and the preview can be resized with your mouse (in browsers supporting the CSS `resize` property).


## Usage

### Simple, standard, awesome

~~~
jQuery('texterea').meltdown();
~~~

### Advanced, fullscreen with preview on the side, still awesome

~~~
jQuery('#my_textarea').meltdown({
  fullscreen: true,
  openPreview: true,
  sidebyside: true
});
~~~


## Options

Option  |  Default  |  Description
------  |  -------  |  -----------
`fullscreen`  | `false`   | Set to `true` to go in fullscreen mode.
`openPreview`  | `false`   | Set to `true` to open the preview area.
`previewHeight`  | `"editorHeight"`   | With `"editorHeight"` the preview will have the same height as the textarea. With `"auto"` its height will adapt to its content. Also accepts any CSS height value (like `"300px"`).
`previewCollapses`  | `true`   | If set to `false`, the editor will expand over the preview when the preview is toggled.
`sidebyside`  | `false`   | Set to `true` to go in side-by-side editing mode.
`autoScrollPreview`  | `true`   | Keeps the preview area scrolled at the bottom when you are typing text. Set to `false` to disable.
`parser`  | `window.Markdown`   | `window.Markdown` is the parser function from [js-markdown-extra](https://github.com/tanakahisateru/js-markdown-extra "Github link to js-markdown-extra"). `false` will directly parse the text as HTML. A parser function takes a text string as input and returns an HTML formatted string. _(More infos in the Parser section below.)_

Note: the default options can be changed in: `jQuery.meltdown.defaults`


## API

Calling a method:

~~~
$("#my_textarea").meltdown("methodName", arg1, arg2);
~~~

Note: methods are chainnable.


### Methods

### `update([force])`

Update the preview with the content of the editor. Set `force` to `true` to force the the update even if the content of the editor is the same as the last update.

### `updateWith(text, [force])`

Update the preview with the given `text`. The `text`will be parsed before being rendered. Set `force` to `true` to force the the update even if the `text` is the same as the last update.

#### `isPreviewOpen()`

Returns `true` if the preview is open. Otherwise `false`.

#### `togglePreview([open])`

If `open` is `true`, open the preview, if `false` close it. If `undefined` or not given, toggle preview.

#### `isFullscreen()`

Returns `true` if meltdown is in fullscreen. Otherwise `false`.

#### `toggleFullscreen([full])`

If `full` is `true`, go fullscreen, if `false` leave fullscreen. If `undefined` or not given, toggle fullscreen.

#### `isSidebyside()`

Returns `true` if meltdown is in side-by-side. Otherwise `false`.

#### `toggleSidebyside([sidebyside])`

If `sidebyside` is `true`, go side-by-side, if `false` leave side-by-side. If `undefined` or not given, toggle side-by-side.


## Parser

By default, uses the [js-markdown-extra](https://github.com/tanakahisateru/js-markdown-extra "Github link to js-markdown-extra") parser. You can change it to any parser you want (even a non Markdown parser).


## Requirements

* A modern browser: any recent version of Firefox, Chrome, IE 9+, Safari or Opera. _Note: works in IE 8 but with some disabled features._
* jQuery 1.9.1+ _Note: works with jQuery 1.7.2+, but with some disabled features._

## Changelog

* **v0.2** (??-APR-2014)
  
  * Fullscreen mode
  * Side-by-side mode
  * Editor and preview can be resized with the mouse
  * Customizable parser
  * Debounced preview updates (while typing)
  * Renamed and added init options
  * Added API to control meltdown from JavaScript (Now the parser must be loaded before jquery.meltdown.js)
  * Dropped IE 6-7 support
  * Removed jQuery-ui dependency

* **v0.1**


## Libraries used

* [js-markdown-extra](https://github.com/tanakahisateru/js-markdown-extra "Github link to js-markdown-extra"): provides the markdown extra parser.
* [Rangyinputs](http://code.google.com/p/rangyinputs/ "Google code link to rangyinputs"): manipulation of text selections.
* [element_resize_detection](http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/): detects `resize` events on any DOM element.


## License

Copyright (c) 2013 Ian Page Hands and Mark Caron. Licensed under the GPLv3 license.
