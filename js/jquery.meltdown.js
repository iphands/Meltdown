/*global jQuery, console, Markdown*/

/*
 * Meltdown (Markup Extra Live Toolbox)
 * Version: 0.1 (13-FEB-2013)
 * Requires: jQuery v1.7.2 or later
 */

(function (jQuery) {
	'use strict';

	var ver, name, dbg;
	ver = '0.1';
	name = 'meltdown';
	dbg = true;

	function debug(msg) {
		if ((typeof console !== 'undefined') && (dbg === true)) {
			console.log(msg);
		}
	}

	function update(previewArea, input) {
		var mde = Markdown;
		previewArea.height(input.outerHeight());
		previewArea.html(mde(input.val()));
	}

	function addEventHandler(thees, example, control) {
		var selection;
		control.click(function (e) {
			if (typeof thees.surroundSelectedText !== 'undefined') {
				if (example.type === "wrap") {
					thees.surroundSelectedText(example.before, example.after, true);
				} else {
					selection = thees.getSelection();
					if (selection.length  === 0) {
						thees.replaceSelectedText(example.markdown + "\n\n\n");
					} else {
						thees.insertText(example.markdown + "\n\n\n", selection.start);
					}
				}
			} else {
				debug('Failed to load surroundSelectedText');
				thees.val(example.markdown + "\n\n\n" + thees.val());
			}
			thees.keyup();
		});
	}

	function buildControls(opts, thees, controls) {
		var controlList, example, control, tuple, t, groupClass, group, outer, tmpThis;
		controlList = [];

		for (example in opts.examples) {
			if (opts.examples.hasOwnProperty(example)) {
				example = opts.examples[example];

				control = jQuery('<li><span>' + example.label + '</span></li>');
				control.addClass(name + '_control');
				if (typeof example.styleClass !== 'undefined') {
					control.addClass(example.styleClass);
				}

				control.children(":first").attr('title', example.altText);
				addEventHandler(thees, example, control);

				tuple = {};
				tuple.example = example;
				tuple.control = control;
				controlList.push(tuple);
			}
		}

		function addClickHandler(outer) {
			outer.on('click', function () {
                var element = jQuery(this);
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
					outer = jQuery('<li />');
					if (group.length === 0) {
						group = jQuery('<ul style="display: none;" />');
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

	function getAddExampleControl(options, thees, previewArea, example) {
		var control = jQuery('<li><span>' + example.label + '</span></li>');
		control.addClass(name + '_control');
		if (typeof example.styleClass !== 'undefined') {
			control.addClass(example.styleClass);
		}
		control.children(":first").attr('title', example.altText);
		control.on('click', function () {
			thees.val(example.markdown + "\n\n\n" + thees.val());
			thees.keyup();
		});
		return control;
	}

	function getPreivewControl(options, thees, previewArea) {
		var control = jQuery('<li class="' + name + '_control ' + name + '_control-preview"><span title="Show preview">Show preview</span></li>');
		control.on('click', function () {

			if (control.hasClass('disabled')) {
				return;
			}

			if (!previewArea.is(':visible')) {
				previewArea.find('.meltdown_preview').height(thees.outerHeight());
				if (options.hasEffects) {
					previewArea.slideToggle(options.previewTimeout);
				} else {
					previewArea.fadeIn();
				}
				previewArea.addClass(name + 'visible');
				control.children(':eq(0)').text('Hide preview');
				control.addClass(name + '_preview-showing');
				update(previewArea.children(':eq(1)'), thees);
			} else {
				if (options.hasEffects) {
					previewArea.slideToggle(options.previewTimeout);
				} else {
					previewArea.fadeOut();
				}
				previewArea.removeClass(name + 'visible');
				control.removeClass(name + '_preview-showing');
				control.children(':eq(0)').text('Show preview');
			}
		});
		return control;
	}

	function getExamples() {
		var key, examples, pounds, i, j;
		examples = {
			bold: {
				label: "B",
				altText: "Bold",
				before: "**",
				after: "**",
				type: "wrap"
			},
			italics: {
				label: "I",
				altText: "Italics",
				before: "*",
				after: "*",
				type: "wrap"
			},
			ul: {
				label: "UL",
				altText: "Unordered List",
				markdown: "* Item\n* Item\n"
			},
			ol: {
				label: "OL",
				altText: "Ordered List",
				markdown: "1. Item 1\n2. Item 2\n3. Item 3\n\n"
			},
			table: {
				label: "Table",
				altText: "Table",
				markdown: "First Header  | Second Header\n------------- | -------------\nContent Cell  | Content Cell\nContent Cell  | Content Cell\n\n"
			}
		};

		for (i = 1; i <= 6; i += 1) {
			pounds = "";
			for (j = 1; j <= i; j += 1) {
				pounds = pounds + "#";
			}
			examples['h' + i] = {
				group: "h",
				groupLabel: "Headers",
				label: "H" + i,
				altText: "Header " + i,
				before: pounds,
				after: "",
				type: "wrap"
			};
		}

		examples.link = {
			label: "Link",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Link",
			markdown: "[Example link](http://example.com/ \"Link title\")"
		};

		examples.img = {
			label: "Image",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Image",
			markdown: "![Alt text](http://image_url)"
		};

		examples.blockquote = {
			label: "Blockquote",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Blockquote",
			markdown: "> Example text"
		};

		examples.codeblock = {
			label: "Code Block",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Code Block",
			before: "\n~~~\n",
			after: "\n~~~\n",
			type: "wrap"
		};

		examples.code = {
			label: "Code",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Inline Code",
			before: "`",
			after: "`",
			type: "wrap"
		};

		examples.footnote = {
			label: "Footnote",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Footnote",
			markdown: "[^1]\n\n[^1]:Example footnote"
		};

		examples.hr = {
			label: "HR",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Horizontal Rule",
			markdown: "----------"
		};

		for (key in examples) {
			if (examples.hasOwnProperty(key)) {
				examples[key].styleClass = name + "_control-" + key;
			}
		}

		return examples;
	}

	function addToolTip(wrap) {
		var tip, preview;

		preview = wrap.find('.meltdown_control-preview');
		if (typeof jQuery.qtip !== 'undefined') {
			// Disable the preview
			preview.addClass('disabled');
			tip = preview.qtip({
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
						jQuery('.meltdown_control-preview-enabler').click(function () {
							tip.qtip('destroy');
							jQuery('.meltdown_control-preview').removeClass('disabled');
							preview.click();
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

	jQuery.fn.meltdown = function (userOptions) {
		return this.each(function () {
			var defaults, opts, thees, wrap, previewWrap, preview, bar, controls;
			defaults = jQuery.fn.meltdown.defaults;
			opts = jQuery.extend(true, {}, defaults, userOptions);
			opts.hasEffects = typeof jQuery.ui !== 'undefined';

			thees = jQuery(this);
			thees.wrap('<div class="' + name + '_wrap" />');
			thees.before('<div><div style="display: none;" class="' + name + '_preview-wrap"><span class="' + name + '_preview-header">Preview Area (<a class="meltdown_techpreview" href="https://github.com/iphands/Meltdown/issues/1">Tech Preview</a>)</span><div class="' + name + '_preview"></div></div></div><div class="meltdown_bar"><ul class="' + name + '_controls"></ul></div>');
			wrap = thees.parent();
			previewWrap = wrap.children(':eq(0)').children(':eq(0)'); /* wrapper for the preview area, but not where the updated content goes */
			preview = previewWrap.children(':eq(1)'); /* preview area where updates happen */
			bar = wrap.children(':eq(1)');
			controls = bar.children().first();

			buildControls(opts, thees, controls);
			controls.append(getPreivewControl(opts, thees, previewWrap));

			wrap.width(thees.outerWidth());
			preview.height(thees.outerHeight());

			thees.on('keyup', function (event) {
				if (previewWrap.is(':visible')) {
					update(preview, thees);
				}
			});

			addToolTip(wrap);
		});
	};

	jQuery.fn.meltdown.defaults = {
		examples: getExamples(),
		previewTimeout: 400
	};

}(jQuery));
