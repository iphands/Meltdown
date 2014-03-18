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

	function update(preview, editor) {
			var mde = Markdown;
			preview.height(input.outerHeight());
			preview.html(mde(input.val()));
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

	function buildControls(opts, editor, controls) {
		var controlList, example, control, tuple, t, groupClass, group, outer;
		controlList = [];

		for (example in opts.examples) {
			if (opts.examples.hasOwnProperty(example)) {
				example = opts.examples[example];

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

	function getPreviewControl(options, editor, previewWrap) {
		var control = $('<li class="' + name + '_control ' + name + '_control-preview"><span title="Toggle preview">Show preview</span></li>');
		control.on('click', function () {
			if (control.hasClass('disabled')) {
				return;
			}

			if (!previewWrap.is(':visible')) {
				previewWrap.find('.meltdown_preview').height(editor.outerHeight());
				update(previewWrap.children(':eq(1)'), editor);
				previewWrap.stop().slideDown(options.previewTimeout);
				previewWrap.addClass(name + 'visible');
				control.children(':eq(0)').text('Hide preview');
				control.addClass(name + '_preview-showing');
			} else {
				previewWrap.stop().slideUp(options.previewTimeout);
				previewWrap.removeClass(name + 'visible');
				control.removeClass(name + '_preview-showing');
				control.children(':eq(0)').text('Show preview');
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

	$.fn.meltdown = function (options) {
		return this.each(function () {
			var opts = $.extend(true, {}, $.fn.meltdown.defaults, options);

			// Prepare everything detached from the DOM:
			var wrap = $('<div class="' + name + '_wrap" />'),
				editorWrap = $('<div class="' + name + '_editor-wrap" />').appendTo(wrap),
				bar = $('<div class="meltdown_bar"></div>').appendTo(editorWrap),
				controls = $('<ul class="' + name + '_controls"></ul>').appendTo(bar),
				editor = $(this).addClass("meltdown_editor"),
				previewWrap = $('<div style="display: none;" class="' + name + '_preview-wrap"></div>').appendTo(wrap),
				_previewHeader = $('<span class="' + name + '_preview-header">Preview Area (<a class="meltdown_techpreview" href="https://github.com/iphands/Meltdown/issues/1">Tech Preview</a>)</span>').appendTo(previewWrap),
				preview = $('<div class="' + name + '_preview"></div>').appendTo(previewWrap);
			
			wrap.width(editor.outerWidth());
			preview.height(editor.outerHeight());

			buildControls(opts, editor, controls);
			controls.append(getPreviewControl(opts, editor, previewWrap));

			addToolTip(wrap);

			editor.on('keyup', function (event) {
				if (previewWrap.is(':visible')) {
					update(preview, editor);
				}
			});

			// Insert meltdown in the DOM:
			editor.after(wrap).insertAfter(bar);
		});
	};

	$.fn.meltdown.defaults = {
		examples: getExamples(),
		previewTimeout: 400
	};

}(jQuery, window));