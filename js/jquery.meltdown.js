/*global jQuery, console, Markdown*/

/*
 * Meltdown (Markup Extra Live Toolbox)
 * Version: 0.1 (13-FEB-2013)
 * Requires: jQuery v1.7.2 or later
 */

(function ($, window, undefined) {
	'use strict';

	var ver, name, dbg;
	ver = '0.1';
	name = 'meltdown';
	dbg = true;

	function debug(msg) {
		if (window.console && dbg) {
			console.log(msg);
		}
	}

	function addEventHandler(editor, example, control) {
		control.click(function (e) {
			var text, selection, before, placeholder, after, lineStart, lineEnd, charBefore, charAfter;
			before = example.before || "";
			placeholder =  example.placeholder || "";
			after = example.after || "";
			if (editor.surroundSelectedText) {
				text = editor.val();
				selection = editor.getSelection();
				if (example.lineSelect) {
					lineStart = text.lastIndexOf('\n', selection.start) + 1;
					lineEnd = text.indexOf('\n', selection.end);
					if(lineEnd === -1) {
						lineEnd = text.length;
					}
					editor.setSelection(lineStart, lineEnd);
					selection = editor.getSelection();
				}
				if(selection.length > 0) {
					placeholder = selection.text;
				}
				if (example.isBlock) {
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
				if (selection.text !== placeholder) {
					editor.replaceSelectedText(placeholder, "select");
				}
				editor.surroundSelectedText(before, after, "select");
			} else {
				debug('Failed to load surroundSelectedText');
				editor.val(before + placeholder + after + "\n\n" + editor.val());
			}
			e.preventDefault();
			editor.focus();
			editor.keyup();
		});
	}

	function buildControls(options, editor, controls) {
		var controlList, example, control, tuple, t, groupClass, group, outer;
		controlList = [];

		for (example in options.examples) {
			if (options.examples.hasOwnProperty(example)) {
				example = options.examples[example];

				control = $('<li><span>' + example.label + '</span></li>');
				control.addClass(name + '_control');
				if (example.styleClass) {
					control.addClass(example.styleClass);
				}

				control.children(":first").attr('title', example.altText);
				addEventHandler(editor, example, control);

				tuple = {};
				tuple.example = example;
				tuple.control = control;
				controlList.push(tuple);
			}
		}

		function addClickHandler(outer) {
			outer.on('click', function () {
                var element = $(this);
				element.siblings('li').removeClass(name + '_controlgroup-open').children('ul').hide();
				element.toggleClass(name + '_controlgroup-open').children('ul').toggle();
			});
		}

		for (t in controlList) {
			if (controlList.hasOwnProperty(t)) {
				t = controlList[t];
				if (t.example.group && t.example.groupLabel) {
					groupClass = name + "_controlgroup-" + t.example.group;
					group = controls.find("ul." + groupClass);
					outer = $('<li />');
					if (group.length === 0) {
						group = $('<ul style="display: none;" />');
						group.addClass(name + '_controlgroup-dropdown ' + groupClass);
						outer.addClass(name + '_controlgroup ' + groupClass);
						outer.append('<span>' + t.example.groupLabel + ' <i class="meltdown-icon-caret-down"></i></span><b></b>');
						outer.append(group);
						controls.append(outer);
					}
					group.append(t.control);
					addClickHandler(outer);
				} else {
					controls.append(t.control);
				}
			}
		}
	}

	function getPreviewControl(meltdown) {
		var control = '<li class="' + name + '_control ' + name + '_control-hidepreview"><span title="Show preview">Show preview</span></li>'
					  + '<li class="' + name + '_control ' + name + '_control-showpreview"><span title="Hide preview">Hide preview</span></li>';
		control = $(control);
		control.on('click', function () {
			if (!control.hasClass('disabled')) {
				meltdown.togglePreview();
			}
		});
		return control;
	}

	function getExamples() {
		var key, examples, pounds, i;
		examples = {
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
				before: "* ",
				placeholder: "Item\n* Item",
				lineSelect: true,
				isBlock: true
			},
			ol: {
				label: "OL",
				altText: "Ordered List",
				before: "1. ",
				placeholder: "Item 1\n2. Item 2\n3. Item 3",
				lineSelect: true,
				isBlock: true
			},
			table: {
				label: "Table",
				altText: "Table",
				before: "First Header  | Second Header\n------------- | -------------\nContent Cell  | Content Cell\nContent Cell  | Content Cell\n",
				isBlock: true
			}
		};

		pounds = "";
		for (i = 1; i <= 6; i += 1) {
			pounds = pounds + "#";
			examples['h' + i] = {
				group: "h",
				groupLabel: "Headers",
				label: "H" + i,
				altText: "Header " + i,
				before: pounds + " ",
				lineSelect: true
			};
		}

		examples.link = {
			label: "Link",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Link",
			before: "[",
			placeholder: "Example link",
			after: "](http:// \"Link title\")"
		};

		examples.img = {
			label: "Image",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Image",
			before: "![Alt text](",
			placeholder: "http://",
			after: ")"
		};

		examples.blockquote = {
			label: "Blockquote",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Blockquote",
			before: "> ",
			placeholder: "Quoted text",
			lineSelect: true,
			isBlock: true
		};

		examples.codeblock = {
			label: "Code Block",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Code Block",
			before: "~~~\n",
			placeholder: "Code",
			after: "\n~~~",
			lineSelect: true,
			isBlock: true
		};

		examples.code = {
			label: "Code",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Inline Code",
			before: "`",
			placeholder: "code",
			after: "`"
		};

		examples.footnote = {
			label: "Footnote",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Footnote",
			before: "[^1]\n\n[^1]:",
			placeholder: "Example footnote",
			isBlock: true
		};

		examples.hr = {
			label: "HR",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Horizontal Rule",
			before: "----------",
			placeholder: "",
			isBlock: true
		};

		for (key in examples) {
			if (examples.hasOwnProperty(key)) {
				examples[key].styleClass = name + "_control-" + key;
			}
		}

		return examples;
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
				if(meltdown) continue;	// Don't re-init it.
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
	
	// Default meltdown initialization options:
	$.fn.meltdown.defaults = {
		examples: getExamples(),
		autoOpenPreview: true,
		previewInitHeight: "editorHeight", // A CSS height or "editorHeight". "" mean that the height adjusts to the content.
		previewTimeout: 400
	};
	
	// The Meltdown base class:
	var Meltdown = $.fn.meltdown.Meltdown = function(elem) {
			this.element = $(elem);
		};
	
	// The Meltdown methods.
	// Methods are publicly available: elem.meltdown("methodName", args...)
	$.fn.meltdown.methods = $.extend(Meltdown.prototype, {
		init: function(userOptions) {
			var options = this.options = $.extend(true, {}, $.fn.meltdown.defaults, userOptions);
			
			// Setup everything detached from the document:
			this.wrap = $('<div class="' + name + '_wrap ' + name + 'previewvisible" />');
			this.editorWrap =  $('<div class="' + name + '_editor-wrap" />').appendTo(this.wrap);
			this.bar =  $('<div class="meltdown_bar"></div>').appendTo(this.editorWrap);
			this.controls =  $('<ul class="' + name + '_controls"></ul>').appendTo(this.bar);
			this.editor = this.element.addClass("meltdown_editor");
			this.previewWrap =  $('<div class="' + name + '_preview-wrap"></div>').appendTo(this.wrap);
			this.previewHeader =  $('<span class="' + name + '_preview-header">Preview Area (<a class="meltdown_techpreview" href="https://github.com/iphands/Meltdown/issues/1">Tech Preview</a>)</span>').appendTo(this.previewWrap);
			this.preview =  $('<div class="' + name + '_preview"></div>').appendTo(this.previewWrap);
			
			// Setup meltdown sizes:
			this.wrap.width(this.editor.outerWidth());
			var previewHeight = options.previewInitHeight;
			if (previewHeight === "editorHeight") {
				previewHeight = this.editor.outerHeight();
			}
			this.preview.height(previewHeight);
			
			// Build toolbar:
			buildControls(options, this.editor, this.controls);
			this.controls.append(getPreviewControl(this));
			addToolTip(this.wrap);
			
			// Setup update:
			this.debouncedUpdate = debounce(this.update, 350, this);
			this.editor.on('keyup', $.proxy(this.debouncedUpdate, this));
			
			// Setup state:
			if (options.autoOpenPreview) {
				this.update(true);
			}
			else {
				this.togglePreview(false, 0);
			}
			
			// Insert meltdown in the document:
			this.editor.after(this.wrap).insertAfter(this.bar);
			
			return this;	// Chaining
		},
		update: function(force) {
			var src = this.editor.val();
			if (force === true || (this.isPreviewVisible() && src !== this.lastSrc)) {
				this.preview.html(Markdown(src));
				this.lastSrc = src;
			}
			return this;	// Chaining
		},
		isPreviewVisible: function() {
			return this.wrap.hasClass(name + 'previewvisible');
		},
		togglePreview: function(show, duration) {
			var isVisible = this.isPreviewVisible();
			if (show === isVisible) {
				return this;
			}
			if (show === undefined) {
				show = !isVisible;
			}
			if (duration === undefined) {
				duration = this.options.previewTimeout;
			}
			
			if (show) {
				this.wrap.removeClass(name + 'previewinvisible').addClass(name + 'previewvisible');
				this.update();
				this.previewWrap.stop().slideDown(duration);
			} else {
				if (this.previewWrap.is(":visible") && duration > 0) {	// slideUp() doesn't work on hidden elements.
					this.previewWrap.stop().slideUp(duration);
				}
				else {
					this.previewWrap.stop().hide();
				}
				this.wrap.removeClass(name + 'previewvisible').addClass(name + 'previewinvisible');
			}
			
			return this;
		}
	});

}(jQuery, window));