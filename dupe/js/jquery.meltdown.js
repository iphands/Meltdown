/*
 * Meltdown (Markup Extra Live Toolbox)
 * Version: 0.1 (13-FEB-2013)
 * Requires: jQuery v1.7.2 or later
 */
;(function($) {

var ver = '0.1';
var name = 'meltdown';

$.fn.meltdown = function(userOptions) {
    return this.each(function() {
		var defaults = $.fn.meltdown.defaults;
        var opts = jQuery.extend(true, {}, defaults, userOptions);
		opts.hasEffects = typeof jQuery.ui != 'undefined';

		var thees = jQuery(this);
		thees.wrap('<div class="' + name + '_wrap" />');
		thees.before('<div><div style="display: none;" class="' + name + '_preview-wrap"><span class="' + name + '_preview-header">Preview Area</span><div class="' + name + '_preview"></div></div></div><div class="meltdown_bar"><ul class="' + name + '_controls"></ul></div>');

		var wrap = thees.parent();
		var previewWrap = wrap.children(':eq(0)').children(':eq(0)'); /* wrapper for the preview area, but not where the updated content goes */
		var preview = previewWrap.children(':eq(1)'); /* preview area where updates happen */
		var bar = wrap.children(':eq(1)');
		var controls = bar.children().first();

		buildControls(opts, thees, controls);
		controls.append(getPreivewControl(opts, thees, previewWrap));

		wrap.width(thees.outerWidth());
		preview.height(thees.outerHeight());

		thees.on('keyup', function(event) {
			if (previewWrap.is(':visible')) {
				update(preview, thees);
			}
		});

    });
};

function addEventHandler(thees, example, control) {
	control.click(function(e) {

		if (typeof jQuery.surroundSelectedText !== undefined) {
			if (example.type == "wrap") {
				thees.surroundSelectedText(example.before, example.after, true);
			} else {
				selection = thees.getSelection();
				if (selection.length  === 0) {
					thees.replaceSelectedText(example.markdown);
				}
			}
		} else {
			console.log('Failed to load surroundSelectedText');
			thees.val(example.markdown + "\n\n\n" + thees.val());
		}


		thees.keyup();
	});
}

function buildControls(opts, thees, controls) {
	var controlList = [];

	for (var example in opts.examples) {
		example = opts.examples[example];

		var control = jQuery('<li><span>' + example.label + '</span></li>');
		control.addClass(name + '_control');
		if (typeof example.styleClass !== undefined) {
			control.addClass(example.styleClass);
		}

		control.children(":first").attr('title', example.altText);
		addEventHandler(thees, example, control);

		var tuple = {};
		tuple.example = example;
		tuple.control = control;
		controlList.push(tuple);
	}

	for (var t in controlList ) {
		t = controlList[t];
		if (t.example.group && t.example.groupLabel) {
			var groupClass = name + "_controlgroup-" + t.example.group;
			var group = controls.find("ul." + groupClass);
			var outer = jQuery('<li />');
			
			if (group.length === 0) {
				group = jQuery('<ul style="display: none;" />');
				group.addClass(name + '_controlgroup-dropdown ' + groupClass);
				outer.addClass(name + '_controlgroup ' + groupClass);
				outer.append('<span>'+t.example.groupLabel+' <i class="meltdown-icon-caret-down"></i></span><b></b>');
				outer.append(group);
				controls.append(outer);
			}
			group.append(t.control);
			
			outer.on('click', function() {
				$(this).siblings('li').removeClass(name + '_controlgroup-open').children('ul').hide();
				$(this).toggleClass(name + '_controlgroup-open').children('ul').toggle();
			});
			
		} else {
			controls.append(t.control);
		}
	}
}

function getAddExampleControl(options, thees, previewArea, example) {
	var control = jQuery('<li><span>' + example.label + '</span></li>');
	control.addClass(name + '_control');
	if (typeof example.styleClass !== undefined) {
		control.addClass(example.styleClass);
	}
	control.children(":first").attr('title', example.altText);
	control.on('click', function() {
		thees.val(example.markdown + "\n\n\n" + thees.val());
		thees.keyup();
	});
	return control;
}

function getPreivewControl(options, thees, previewArea) {
	var control = jQuery('<li class="' + name + '_control ' + name + '_control-preview"><span title="Show preview">Show preview</span></li>');
	control.on('click', function() {
		if (! previewArea.is(':visible')) {
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
	var examples = {
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

	for (var i = 1; i <= 6; i += 1) {
		var pounds = "";
		for (var j = 1; j <= i; j += 1) {
			pounds = pounds + "#";
		}
		examples['h'+i] = {
			group: "h",
			groupLabel: "Headers",
			label: "H"+i,
			altText: "Header "+i,
			before: pounds,
			after: "",
			type: "wrap"
		};
	}

	examples['link'] = {
			label: "Link",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Link",
			markdown: "[Example link](http://example.com/ \"Link title\")"
	};
	
	examples['img'] = {
			label: "Image",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Image",
			markdown: "![Alt text](http://image_url)"
	};
	
	examples['blockquote'] = {
		label: "Blockquote",
		group: "kitchenSink",
		groupLabel: "Kitchen Sink",
		altText: "Blockquote",
		markdown: "> Example text"
	};
	
	examples['codeblock'] = {
			label: "Code Block",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Code Block",
			markdown: "~~~\nExample code\n~~~"
	};
	
	examples['code'] = {
			label: "Code",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Inline Code",
			markdown: "`Example code`"
	};
	
	examples['footnote'] = {
			label: "Footnote",
			group: "kitchenSink",
			groupLabel: "Kitchen Sink",
			altText: "Footnote",
			markdown: "[^1]\n\n[^1]:Example footnote"
	};
	
	examples['hr'] = {
		label: "HR",
		group: "kitchenSink",
		groupLabel: "Kitchen Sink",
		altText: "Horizontal Rule",
		markdown: "----------"
	};

	for (key in examples) {
		examples[key].styleClass = name + "_control-" + key;
	}

	return examples;
}

function update(previewArea, input) {
	previewArea.html(Markdown(input.val()));
}

$.fn.meltdown.defaults = {
	examples: getExamples(),
	previewTimeout: 400
};

})(jQuery);
