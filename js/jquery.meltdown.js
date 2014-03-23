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
				"showpreview"
			]),
		
			// Should the preview be visible by default ?
			autoOpenPreview: true,
		
			// A CSS height or "editorHeight". "" mean that the height adjusts to the content.
			previewHeight: "editorHeight",
		
			// Duration of the preview toggle animation:
			previewTimeout: 400,
		
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
	
	function addToolTip(wrap) {
		var tip, controlPreview;

		if ($.qtip) {
			controlPreview = wrap.find('.meltdown_control-preview');
			// Disable the preview
			controlPreview.addClass('disabled');
			tip = controlPreview.qtip({
				content: "Warning this feature is a tech preview feature.<br/>"
						 + "There is a <a target=\"_blank\" href=\"https://github.com/iphands/Meltdown/issues/1\">known issue</a> with one of the libraries used to generate the live preview.<br/><br/>"
						 + "Live previews <b>can</b> cause the browser tab to stop responding.<br/><br/>"
						 + "This warning will be removed when <a href=\"#\" target=\"_blank\" href=\"https://github.com/iphands/Meltdown/issues/1\">the issue</a> is resolved.<br/></br>"
						 + "<input type=\"button\" class=\"meltdown_control-preview-enabler\" value=\"Click here\"> to remove this warning and enable live previews",
				show: {
					delay: 0,
					when: {
						event: 'mouseover'
					}
				},
				hide: {
					delay: 5000,
					when: {
						event: 'mouseout'
					}
				},
				position: {
					corner: {
						target: 'leftMiddle',
						tooltip: 'rightMiddle'
					}
				},
				api: {
					onRender: function () {
						$('.meltdown_control-preview-enabler').click(function () {
							tip.qtip('destroy');
							controlPreview.removeClass('disabled');
							controlPreview.click();
						});
					}
				},
				style: {
					classes: 'meltdown_techpreview-qtip',
					name: 'dark',
					lineHeight: '1.3em',
					padding: '12px',
					width: {
						max: 300,
						min: 0
					},
					tip: true
				}
			});
		}
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
	// If newState === state, return undefined (to tell that no state change is required)
	function checkToggleState(newState, state) {
		if (newState !== true && newState !== false) {
			return !state;
		}
		if (newState === state) {
			return undefined;
		}
		return newState;
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
			
			this.editorPreInitWidth = this.element.outerWidth();
			
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
			var previewHeight = _options.previewHeight;
			if (previewHeight === "editorHeight") {
				previewHeight = this.editor.outerHeight();
			}
			this.wrap.width(this.editorPreInitWidth);
			this.preview.height(previewHeight);
			
			// Build toolbar:
			buildControls(this, this._options.controls).appendTo(this.bar);
			addToolTip(this.wrap);
			
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
			
			// Setup initial state:
			if (_options.autoOpenPreview) {
				this.update(true);
			} else {
				this.previewWrap.hide();
				this.wrap.removeClass(plgName + 'previewvisible').addClass(plgName + 'previewinvisible');
			}
			
			// Store datas needed by fullscreen mode:
			this.fullscreenData = {};
			
			// Insert meltdown in the document:
			this.editor.after(this.wrap).appendTo(this.editorDeco);
			var editorHeight = this.editor.height();
			previewHeight = this.preview.height();
			
			// Define the wrap min height from the editor and the preview min heights:
			var wrapHeight = this.wrap.height(),
				minHeights = parseFloat(this.editor.css("minHeight")) + parseFloat(this.preview.css("minHeight"));
			this.wrap.css("minHeight", wrapHeight - editorHeight - previewHeight + minHeights);
			
			// Setup editor and preview resizing when wrap is resized:
			this.lastEditorPercentHeight = editorHeight / (editorHeight + previewHeight);
			this.lastWrapHeight = wrapHeight;
			addResizeListener(this.wrap[0], function() {
				var newHeight = self.wrap.height();
				if (newHeight !== self.lastWrapHeight) {
					self.adjustHeights(newHeight);
					self.lastWrapHeight = newHeight;
				}
			});
			
			return this;	// Chaining
		},
		options: function(name, value) {
			if (arguments.length === 1) {
				return this._options[name];
			} else if (arguments.length > 1) {
				this._options[name] = value;
				return this;
			}
		},
		update: function(force) {
			var text = this.editor.val();
			if (force === true || (this.isPreviewVisible() && text !== this.lastText)) {
				this.preview.html(this._options.parser(text));
				this.lastText = text;
			}
			return this;	// Chaining
		},
		isPreviewVisible: function() {
			return this.wrap.hasClass(plgName + 'previewvisible');
		},
		togglePreview: function(show, duration) {
			show = checkToggleState(show, this.isPreviewVisible());
			if (show === undefined) {
				return this;
			}
			if (duration === undefined) {
				duration = this._options.previewTimeout;
			}
			
			// Set height to prevent changes during animation:
			var originalWrapStyleHeight = this.wrap[0].style.height;
			this.wrap.height("+=0");
			
			// Function to resize the editor when the preview is resized:
			var self = this,
				editorHeight = this.editor.height(),
				previewWrapMargin = parseFloat(this.previewWrap.css("marginTop")),
				previewWrapHeight = show ? -previewWrapMargin : this.previewWrap.outerHeight(),
				availableHeight = editorHeight + previewWrapHeight,
				progress = function(animation, progress) {
					self.editor.height(availableHeight - self.previewWrap.outerHeight());
				};
			
			if (show) {
				this.wrap.removeClass(plgName + 'previewinvisible').addClass(plgName + 'previewvisible');
				this.update();
				// Check that preview is not too big:
				previewWrapHeight = this.previewWrap.outerHeight() + previewWrapMargin;
				if (previewWrapHeight > editorHeight - 15) {
					this.preview.height("-=" + (previewWrapHeight - (editorHeight - 15)));
				}
				this.previewWrap.stop().slideDown({
						duration: duration,
						progress: progress,
						complete: function() {
							self.wrap[0].style.height = originalWrapStyleHeight;
						}
					});
			} else {
				if (this.previewWrap.is(":visible") && duration > 0) {	// slideUp() doesn't work on hidden elements.
					this.previewWrap.stop().slideUp({
						duration: duration,
						progress: progress,
						complete: function() {
							self.editor.height("+=" + previewWrapMargin);
							self.wrap[0].style.height = originalWrapStyleHeight;
						}
					});
				} else {
					this.previewWrap.stop().hide();
					self.editor.height(availableHeight + previewWrapMargin);
					self.wrap[0].style.height = originalWrapStyleHeight;
				}
				this.wrap.removeClass(plgName + 'previewvisible').addClass(plgName + 'previewinvisible');
			}
			
			return this;
		},
		isFullscreen: function() {
			return this.wrap.hasClass('fullscreen');
		},
		toggleFullscreen: function(full) {
			full = checkToggleState(full, this.isFullscreen());
			if (full === undefined) {
				return this;
			}
			
			var data = this.fullscreenData;
			if (full) {
				// Keep height in case it is "auto" or "" or whatever:
				data.originalWrapHeight = this.wrap.height();
				data.originalWrapStyleHeight = this.wrap[0].style.height;
				
				this.wrap.addClass('fullscreen');
			} else {
				this.wrap.removeClass('fullscreen');
				
				// Insure that height is correctly reset:
				this.adjustHeights(data.originalWrapHeight);
				this.lastWrapHeight = data.originalWrapHeight;
				this.wrap[0].style.height = data.originalWrapStyleHeight;
			}
			
			return this;
		},
		// When the wrap height changes, this will resize the editor and the preview,
		// keeping the height ratio between them.
		adjustHeights: function(wrapHeight) {
			var isPreviewVisible = this.isPreviewVisible(),
				editorHeight = this.editor.height(),
				previewHeight = isPreviewVisible ? this.preview.height() : 0,
				availableHeight = editorHeight + previewHeight + (wrapHeight - this.lastWrapHeight),
				newEditorHeight = Math.round(this.lastEditorPercentHeight * availableHeight),
				newPreviewHeight = availableHeight - newEditorHeight;
			if (newEditorHeight < 15) {
				newPreviewHeight -= 15 - newEditorHeight;
				newEditorHeight = 15;
			} else if (newPreviewHeight < 15) {
				newEditorHeight -= 15 - newPreviewHeight;
				newPreviewHeight = 15;
			}
			if (!isPreviewVisible) {
				// Keep the newPreviewHeight for when the preview will slide down again.
				// But allow newEditorHeight to take the whole available height:
				newEditorHeight = editorHeight + (wrapHeight - this.lastWrapHeight);
			}
			this.editor.height(newEditorHeight);
			this.preview.height(newPreviewHeight);
			
			return this;
		}
	});
	
	// THE $(...).meltdown() function:
	$.fn.meltdown = function (arg) {
		// Get method name and method arguments:
		var methodName = $.type(arg) === "string" ? arg : "init",
			args = Array.prototype.slice.call(arguments, methodName === "init" ? 0 : 1);
		
		// Dispatch method call:
		for (var elem, meltdown, returnValue,	i = 0; i < this.length; i++) {
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