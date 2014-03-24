/*global jQuery, console, Markdown, addResizeListener*/

/*
 * Meltdown (Markup Extra Live Toolbox)
 * Version: 0.1 (13-FEB-2013)
 * Requires: jQuery v1.7.2 or later
 */

(function ($, window, document, undefined) {
	'use strict';

	var ver = '0.1',
		plgName = 'meltdown',
		dbg = true,
		body = $("body"),
		doc = $(document);
	
	function debug(msg) {
		if (window.console && dbg) {
			console.log(msg);
		}
	}
	
	// Helper for users that want to change the controls (For usage, see: $.meltdown.defaults.controls below)
	var controlsGroup = function(name, label, controls) {
		controls.name = name;
		controls.label = label;
		return controls;
	};
	
	$.meltdown = {
		// Expose publicly:
		controlsGroup: controlsGroup,
		
		// Default meltdown options:
		defaults: {
			// Use $.meltdown.controlsGroup() to make groups and subgroups of controls.
			// The available control names come from the keys of $.meltdown.controlDefs (see below)
			controls: controlsGroup("", "", [
				"bold",
				"italics",
				"ul",
				"ol",
				"table",
				controlsGroup("h", "Headers", ["h1", "h2", "h3", "h4", "h5", "h6"]),
				controlsGroup("kitchenSink", "Kitchen Sink", [
					"link",
					"img",
					"blockquote",
					"codeblock",
					"code",
					"footnote",
					"hr"
				]),
				"hidepreview",
				"showpreview",
				"fullscreen"
			]),
			
			// Should the preview be visible by default ?
			openPreview: true,
			
			// A CSS height or "editorHeight" or "auto" (to let the height adjust to the content).
			previewHeight: "editorHeight",
			
			// If true, meltdown manages the editor and the preview heights to prevent them from resizing the wrap.
			// This is mostly useful for when meltdown must be fitted in a restricted container.
			// For example, this is used internally for fullscreen.
			heightsManaged: false,
			
			// If true, when the preview is fully scrolled it will stay scrolled while typing.
			// Very convenient when typing/adding text at the end of the editor.
			autoScrollPreview: true,
			
			// Duration of the preview toggle animation:
			previewDuration: 400,
			
			// The parser. The function takes a string and returns an html formatted string.
			parser: Markdown
		},
		
		// Definitions for the toolbar controls:
		controlDefs: {
			bold: {
				label: "B",
				altText: "Bold",
				before: "**",
				after: "**"
			},
			italics: {
				label: "I",
				altText: "Italics",
				before: "*",
				after: "*"
			},
			ul: {
				label: "UL",
				altText: "Unordered List",
				preselectLine: true,
				before: "* ",
				placeholder: "Item\n* Item",
				isBlock: true
			},
			ol: {
				label: "OL",
				altText: "Ordered List",
				preselectLine: true,
				before: "1. ",
				placeholder: "Item 1\n2. Item 2\n3. Item 3",
				isBlock: true
			},
			table: {
				label: "Table",
				altText: "Table",
				before: "First Header  | Second Header\n------------- | -------------\nContent Cell  | Content Cell\nContent Cell  | Content Cell\n",
				isBlock: true
			},
			link: {
				label: "Link",
				group: "kitchenSink",
				groupLabel: "Kitchen Sink",
				altText: "Link",
				before: "[",
				placeholder: "Example link",
				after: "](http:// \"Link title\")"
			},
			img: {
				label: "Image",
				group: "kitchenSink",
				groupLabel: "Kitchen Sink",
				altText: "Image",
				before: "![Alt text](",
				placeholder: "http://",
				after: ")"
			},
			blockquote: {
				label: "Blockquote",
				group: "kitchenSink",
				groupLabel: "Kitchen Sink",
				altText: "Blockquote",
				preselectLine: true,
				before: "> ",
				placeholder: "Quoted text",
				isBlock: true
			},
			codeblock: {
				label: "Code Block",
				group: "kitchenSink",
				groupLabel: "Kitchen Sink",
				altText: "Code Block",
				preselectLine: true,
				before: "~~~\n",
				placeholder: "Code",
				after: "\n~~~",
				isBlock: true
			},
			code: {
				label: "Code",
				group: "kitchenSink",
				groupLabel: "Kitchen Sink",
				altText: "Inline Code",
				before: "`",
				placeholder: "code",
				after: "`"
			},
			footnote: {
				label: "Footnote",
				group: "kitchenSink",
				groupLabel: "Kitchen Sink",
				altText: "Footnote",
				before: "[^1]\n\n[^1]:",
				placeholder: "Example footnote",
				isBlock: true
			},
			hr: {
				label: "HR",
				group: "kitchenSink",
				groupLabel: "Kitchen Sink",
				altText: "Horizontal Rule",
				before: "----------",
				placeholder: "",
				isBlock: true
			},
			hidepreview: {
				label: "Hide",
				altText: "Hide preview",
				click: function(meltdown, def, control) {
					if (!control.hasClass('disabled')) {
						meltdown.togglePreview(false);
					}
				}
			},
			showpreview: {
				label: "Show",
				altText: "Show preview",
				click: function(meltdown, def, control) {
					if (!control.hasClass('disabled')) {
						meltdown.togglePreview(true);
					}
				}
			},
			fullscreen: {
				label: "Fullscreen",
				altText: "Fullscreen",
				click: function(meltdown, def, control) {
					meltdown.toggleFullscreen();
				}
			}
		}
	};
	
	// Add h1...h6 control definitions to $.meltdown.controlDefs:
	(function(controlDefs) {
		for (var pounds = "", i = 1; i <= 6; i++) {
			pounds += "#";
			controlDefs['h' + i] = {
				label: "H" + i,
				altText: "Header " + i,
				preselectLine: true,
				before: pounds + " "
			};
		}
	})($.meltdown.controlDefs);
	
	
	function addControlEventHandler(meltdown, def, control) {
		var editor = meltdown.editor,
			handler = function () {
				var text, selection, before, placeholder, after, lineStart, lineEnd, charBefore, charAfter;
				before = def.before || "";
				placeholder =  def.placeholder || "";
				after = def.after || "";
				if (editor.surroundSelectedText) {
					text = editor.val();
				
					// Extend selection if needed:
					selection = editor.getSelection();
					if (def.preselectLine) {
						lineStart = text.lastIndexOf('\n', selection.start) + 1;
						lineEnd = text.indexOf('\n', selection.end);
						if (lineEnd === -1) {
							lineEnd = text.length;
						}
						editor.setSelection(lineStart, lineEnd);
						selection = editor.getSelection();
					}
				
					// placeholder is only used if there is no selected text:
					if (selection.length > 0) {
						placeholder = selection.text;
					}
				
					// isBlock means that there should be empty line before and after the selection:
					if (def.isBlock) {
						for (var i = 0; i < 2; i++) {
							charBefore = text.charAt(selection.start - 1 - i);
							charAfter = text.charAt(selection.end + i);
							if (charBefore !== "\n" && charBefore !== "") {
								before = "\n" + before;
							}
							if (charAfter !== "\n" && charAfter !== "") {
								after = after + "\n";
							}
						}
					}
				
					// Insert placeholder:
					if (selection.text !== placeholder) {
						editor.replaceSelectedText(placeholder, "select");
					}
					// Insert before and after selection:
					editor.surroundSelectedText(before, after, "select");
				} else {
					debug('Failed to load surroundSelectedText');
					editor.val(before + placeholder + after + "\n\n" + editor.val());
				}
			};
		
		control.click(function (e) {
			if (def.click) {
				def.click(meltdown, def, control, handler);
			} else {
				handler();
			}
			editor.focus();
			editor.keyup();
			e.preventDefault();
		});
	}
	
	function addGroupClickHandler(control) {
		control.on('click', function () {
			control.siblings('li').removeClass(plgName + '_controlgroup-open').children('ul').hide();
			control.toggleClass(plgName + '_controlgroup-open').children('ul').toggle();
		});
	}
	
	function buildControls(meltdown, controlsGroup, subGroup) {
		var controlList = $('<ul />');
		if (subGroup) {
			controlList.css("display", "none");
			controlList.addClass(plgName + '_controlgroup-dropdown ' + plgName + "_controlgroup-" + controlsGroup.plgName);
		} else {
			controlList.addClass("meltdown_controls");
		}
		
		for (var i = 0; i < controlsGroup.length; i++) {
			var controlName = controlsGroup[i],
				control = $('<li />'),
				span = $('<span />').appendTo(control);
			if ($.type(controlName) === "string") {
				var def = $.meltdown.controlDefs[controlName];
				if (def === undefined) {
					debug("Control not found: " + controlName);
					continue;
				}
				control.addClass(plgName + '_control ' + plgName + "_control-" + controlName + ' ' + (def.styleClass || ""));
				span.text(def.label).attr("title", def.altText);
				addControlEventHandler(meltdown, def, control);
				
			} else if ($.isArray(controlName)) {
				control.addClass(plgName + '_controlgroup ' + plgName + "_controlgroup-" + controlName.name);
				span.text(controlName.label).append('<i class="meltdown-icon-caret-down" />');
				addGroupClickHandler(control);
				control.append(buildControls(meltdown, controlName, true));
			}
			controlList.append(control);
		}
		
		return controlList;
	}
	
	function addWarning(meltdown, element) {
		element.click(function(e) {
			var warning = $('<div class"' + plgName + '_warning"/>').html('<center><b>The preview area is a tech preview feature</b></center><br/>'
				 + 'Live previews <b>can</b> cause the browser tab to stop responding.<br/><br/>'
				 + 'There is a <a target="_blank" href="https://github.com/iphands/Meltdown/issues/1">known issue</a> with <a target="_blank" href="https://github.com/tanakahisateru/js-markdown-extra#notice">one of the libraries</a> used to generate the live preview.<br/><br/>'
				 + 'This warning will be removed when the issue is resolved.<br/><br/>'
				 + '<center><i>Click to continue.</i></center>').css({background: "#fdd", cursor: "pointer"});
			warning.on("click", function(e) {
				if (!$(e.target).is("a, a *")) {	// Ignore clicks on links
					meltdown.update(true);
				}
			});
			meltdown.preview.empty().append(warning);
			e.preventDefault();
		});
	}
	
	// Setup event handlers for the resize handle:
	function setupResizeHandle(resizeHandle, meltdown) {
		var firstElem, lastElem, startY, minY, maxY, originalFirstElemHeight, originalLastElemHeight;
		var moveEventHandler = function(e) {
				var delta = Math.min(Math.max(e.pageY , minY), maxY) - startY,
					firstElemHeight = originalFirstElemHeight + delta,
					lastElemHeight = originalLastElemHeight - delta;
				firstElem.height(firstElemHeight);
				lastElem.height(lastElemHeight);
				
				var editorHeight = firstElem[0] === meltdown.editor[0] ? firstElemHeight : lastElemHeight;
				meltdown.lastEditorPercentHeight = editorHeight / (firstElemHeight + lastElemHeight);
			};
		// Init dragging handlers only on mousedown:
		resizeHandle.on("mousedown", function(e) {
			// Sort elems in document order:
			var elems = meltdown.editor.add(meltdown.preview);
			// The first elem is assumed to be before resizeHandle, and the last is after:
			firstElem = elems.first();
			lastElem = elems.last();
			
			// Init dragging properties:
			startY = e.pageY;
			originalFirstElemHeight = firstElem.height();
			originalLastElemHeight = lastElem.height();
			minY = startY - originalFirstElemHeight + 15;
			maxY = startY + originalLastElemHeight - 15;
			
			// Setup event handlers:
			doc.on("mousemove", moveEventHandler).one("mouseup", function() {
				doc.off("mousemove", moveEventHandler);
				body.removeClass("unselectable");
			});
			// Prevent text selection while dragging:
			body.addClass("unselectable");
		});
	}
	
	function debounce(func, wait, returnValue) {
		var context, args, timeout,
			exec = function() {
				func.apply(context, args);
			};
		return function() {
			context = this;
			args = arguments;
			clearTimeout(timeout);
			timeout = setTimeout(exec, wait);
			return returnValue;
		};
	}
	
	// Return true, false or undefined.
	// If newState is undefined or not a boolean, return !state (this is the toggle action)
	// If newState === state, return newState or if force, return undefined (to tell that no state change is required)
	function checkToggleState(newState, state, force) {
		if (newState !== true && newState !== false) {
			return !state;
		}
		if (newState === state) {
			return force ? newState : undefined;
		}
		return newState;
	}
	
	function computeHeights(availableHeight, lastEditorPercentHeight) {
		var editorHeight = Math.round(lastEditorPercentHeight * availableHeight),
			previewHeight = availableHeight - editorHeight;
		if (editorHeight < 15) {
			previewHeight -= 15 - editorHeight;
			editorHeight = 15;
		} else if (previewHeight < 15) {
			editorHeight -= 15 - previewHeight;
			previewHeight = 15;
		}
		return {editorHeight: editorHeight, previewHeight: previewHeight};
	}
	
	
	// Meltdown base class:
	var Meltdown = $.meltdown.Meltdown = function(elem) {
			this.element = $(elem);
		};
	
	// The Meltdown methods.
	// Methods are publicly available: elem.meltdown("methodName", args...)
	$.meltdown.methods = $.extend(Meltdown.prototype, {
		init: function(userOptions) {
			var self = this,
				_options = this._options = $.extend({}, $.meltdown.defaults, userOptions);
			
			this.editorPreInitOuterWidth = this.element.outerWidth();
			
			// Setup everything detached from the document:
			this.wrap = $('<div class="' + plgName + '_wrap ' + plgName + 'previewvisible" />');
			this.topmargin = $('<div class="' + plgName + '_topmargin"/>').appendTo(this.wrap);
			this.editorWrap =  $('<div class="' + plgName + '_editor-wrap" />').appendTo(this.wrap);
			this.bar =  $('<div class="meltdown_bar"></div>').appendTo(this.editorWrap);
			this.editorDeco =  $('<div class="' + plgName + '_editor-deco" />').appendTo(this.editorWrap);
			this.editor = this.element.addClass("meltdown_editor");
			this.previewWrap =  $('<div class="' + plgName + '_preview-wrap"></div>').appendTo(this.wrap);
			this.previewHeader =  $('<span class="' + plgName + '_preview-header">Preview Area (<a class="meltdown_techpreview" href="https://github.com/iphands/Meltdown/issues/1">Tech Preview</a>)</span>').appendTo(this.previewWrap);
			this.preview =  $('<div class="' + plgName + '_preview"></div>').appendTo(this.previewWrap);
			this.bottommargin = $('<div class="' + plgName + '_bottommargin"/>').appendTo(this.wrap);
			
			// Setup meltdown sizes:
			this.wrap.outerWidth(this.editorPreInitOuterWidth);
			var previewHeight = _options.previewHeight;
			if (previewHeight === "editorHeight") {
				previewHeight = this.editor.height();
			}
			this.preview.height(previewHeight);
			
			// Build toolbar:
			buildControls(this, this._options.controls).appendTo(this.bar);
			addWarning(this, this.previewHeader.find(".meltdown_techpreview"));
			
			// editorDeco's CSS need a bit of help:
			this.editor.focus(function() {
				self.editorDeco.addClass("focus");
			}).blur(function() {
				self.editorDeco.removeClass("focus");
			});
			
			setupResizeHandle(this.previewHeader.addClass("meltdown_handle"), this);
			
			// Setup update:
			this.debouncedUpdate = debounce(this.update, 350, this);
			this.editor.on('keyup', $.proxy(this.debouncedUpdate, this));
			
			// Store datas needed by fullscreen mode:
			this.fullscreenData = {};
			
			// Insert meltdown in the document:
			this.editor.after(this.wrap).appendTo(this.editorDeco);
			
			// Setup options.openPreview and options.heightsManaged:
			this.togglePreview(true, 0, true, !_options.openPreview);
			if (_options.heightsManaged && _options.previewHeight === "auto") {
				this.preview.height("+=0");	// If heightsManaged, we cannot have a dynamic height.
			}
			this.toggleHeightsManaged(_options.heightsManaged, true);
			
			// Define the wrap min height from the editor and the preview min heights:
			var wrapHeight = this.wrap.height(),
				minWrapHeights = parseFloat(this.editor.css("minHeight")) + parseFloat(this.preview.css("minHeight")),
				editorHeight = this.editor.height();
			previewHeight = this.preview.height();
			this.wrap.css("minHeight", wrapHeight - editorHeight - previewHeight + minWrapHeights);
			
			// Setup editor and preview resizing when wrap is resized:
			this.lastEditorPercentHeight = editorHeight / (editorHeight + previewHeight);
			this.lastWrapHeight = wrapHeight;
			addResizeListener(this.wrap[0], function() {
				var newHeight = self.wrap.height();
				if (newHeight !== self.lastWrapHeight) {
					if (self._heightsManaged) {
						self.adjustHeights(newHeight);
					} else {
						var editorHeight = self.editor.height();
						self.lastEditorPercentHeight = editorHeight / (editorHeight + self.preview.height());
					}
					self.lastWrapHeight = newHeight;
				}
			});
			
			// Now that all measures where made, we can close the preview if needed:
			if (!_options.openPreview) {
				this.togglePreview(false, 0);
			}
			
			return this;	// Chaining
		},
		options: function(name, value) {
			if (arguments.length === 1) {
				return this._options[name];
			} else if (arguments.length > 1) {
				this._options[name] = value;
				return this;	// Chaining
			}
		},
		update: function(force) {
			var text = this.editor.val();
			if (force === true || (this.isPreviewVisible() && text !== this.lastText)) {
				// If the preview is scrolled to the bottom, keept it scrolled after update:
				var previewNode = this.preview[0],
					scrolledToBottom = previewNode.scrollHeight - previewNode.scrollTop === previewNode.clientHeight;
				this.preview.html(this._options.parser(text));
				if (scrolledToBottom) {
					previewNode.scrollTop = previewNode.scrollHeight;
				}
				this.lastText = text;
			}
			return this;	// Chaining
		},
		isPreviewVisible: function() {
			return this.wrap.hasClass(plgName + 'previewvisible');
		},
		togglePreview: function(show, duration, force, noUpdate) {
			show = checkToggleState(show, this.isPreviewVisible(), force);
			if (show === undefined) {
				return this;	// Chaining
			}
			if (duration === undefined) {
				duration = this._options.previewDuration;
			}
			
			// Function to resize the editor when the preview is resized:
			var self = this,
				editorHeight = this.editor.height(),
				previewWrapMargin = parseFloat(this.previewWrap.css("marginTop")),
				previewWrapHeightStart = show ? -previewWrapMargin : this.previewWrap.outerHeight(),
				availableHeight = editorHeight + previewWrapHeightStart,
				progress = this._heightsManaged ? function(animation, progress) {
					self.editor.height(availableHeight - self.previewWrap.outerHeight());
				} : $.noop;
			
			if (show) {
				this.wrap.removeClass(plgName + 'previewinvisible').addClass(plgName + 'previewvisible');
				if (!noUpdate) {
					this.update();
				}
				var previewWrapHeightUsed = this.previewWrap.outerHeight() + previewWrapMargin;
				// Check that preview is not too big:
				if (this._heightsManaged && previewWrapHeightUsed > editorHeight - 15) {
					this.preview.height("-=" + (previewWrapHeightUsed - (editorHeight - 15)));
				}
				this.previewWrap.stop().slideDown({
						duration: duration,
						progress: progress
					});
			} else {
				if (this.previewWrap.is(":visible") && duration > 0) {	// slideUp() doesn't work on hidden elements.
					this.previewWrap.stop().slideUp({
						duration: duration,
						progress: progress,
						complete: function() {
							if (self._heightsManaged) {
								self.editor.height("+=" + previewWrapMargin);
							}
						}
					});
				} else {
					this.previewWrap.stop().hide();
					if (this._heightsManaged) {
						this.editor.height(availableHeight + previewWrapMargin);
					}
				}
				this.wrap.removeClass(plgName + 'previewvisible').addClass(plgName + 'previewinvisible');
			}
			
			return this;	// Chaining
		},
		isFullscreen: function() {
			return this.wrap.hasClass('fullscreen');
		},
		toggleFullscreen: function(full) {
			full = checkToggleState(full, this.isFullscreen());
			if (full === undefined) {
				return this;	// Chaining
			}
			
			var data = this.fullscreenData;
			if (full) {
				data._heightsManaged = this._heightsManaged;
				if (data._heightsManaged) {
					data.originalWrapHeight = this.wrap.height();
				} else {
					data.availableHeight = this.editor.height() + this.preview.height();
				}
				// Keep height in case it is "auto" or "" or whatever:
				data.originalWrapStyleHeight = this.wrap[0].style.height;
				this.toggleHeightsManaged(true);
				
				this.wrap.addClass('fullscreen');
			} else {
				this.wrap.removeClass('fullscreen');
				
				if (data._heightsManaged) {
					this.adjustHeights(data.originalWrapHeight);
					this.lastWrapHeight = data.originalWrapHeight;
				} else {
					var heights = computeHeights(data.availableHeight, this.lastEditorPercentHeight);
					this.editor.height(heights.editorHeight);
					this.preview.height(heights.previewHeight);
				}
				this.toggleHeightsManaged(data._heightsManaged);
				this.wrap[0].style.height = data.originalWrapStyleHeight;
			}
			
			return this;	// Chaining
		},
		isHeightsManaged: function() {
			return this._heightsManaged;
		},
		toggleHeightsManaged: function(managed, force) {
			managed = checkToggleState(managed, this._heightsManaged, force);
			if (managed === undefined) {
				return this;	// Chaining
			}
			
			if (managed) {
				this.wrap.height("+=0").addClass("heightsManaged");
			} else {
				this.wrap.height("auto").removeClass("heightsManaged");
			}
			this._heightsManaged = managed;
			
			return this;	// Chaining
		},
		// When the wrap height changes, this will resize the editor and the preview,
		// keeping the height ratio between them.
		adjustHeights: function(wrapHeight) {
			var isPreviewVisible = this.isPreviewVisible(),
				editorHeight = this.editor.height(),
				previewHeight = isPreviewVisible ? this.preview.height() : 0,
				availableHeight = editorHeight + previewHeight + (wrapHeight - this.lastWrapHeight),
				heights = computeHeights(availableHeight, this.lastEditorPercentHeight);
			if (!isPreviewVisible) {
				// Keep the previewHeight for when the preview will slide down again.
				// But allow editorHeight to take the whole available height:
				heights.editorHeight = editorHeight + (wrapHeight - this.lastWrapHeight);
			}
			this.editor.height(heights.editorHeight);
			this.preview.height(heights.previewHeight);
			
			return this;	// Chaining
		}
	});
	
	// THE $(...).meltdown() function:
	$.fn.meltdown = function (arg) {
		// Get method name and method arguments:
		var methodName = $.type(arg) === "string" ? arg : "init",
			args = Array.prototype.slice.call(arguments, methodName === "init" ? 0 : 1);
		
		// Dispatch method call:
		for (var elem, meltdown, returnValue, i = 0; i < this.length; i++) {
			elem = this[i];
			// Get the Meltdown object or create it:
			meltdown = $.data(elem, "Meltdown");
			if (methodName === "init") {
				if (meltdown) continue;	// Don't re-init it.
				meltdown = new Meltdown(elem);
				$.data(elem, "Meltdown", meltdown);
			}
			// Call the method:
			returnValue = meltdown[methodName].apply(meltdown, args);
			// If the method is a getter, return the value
			// (See: http://bililite.com/blog/2009/04/23/improving-jquery-ui-widget-getterssetters/)
			if (returnValue !== meltdown) {
				return returnValue;
			}
		}
		
		return this;	// Chaining
	};
	
}(jQuery, window, document));