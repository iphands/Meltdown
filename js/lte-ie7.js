/* Use this script if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'meltdown\'">' + entity + '</span>' + html;
	}
	var icons = {
			'meltdown-icon-eye-open' : '&#x73;',
			'meltdown-icon-eye-close' : '&#x68;',
			'meltdown-icon-table' : '&#x74;',
			'meltdown-icon-bold' : '&#x62;',
			'meltdown-icon-italic' : '&#x69;',
			'meltdown-icon-list-ol' : '&#x31;',
			'meltdown-icon-list-ul' : '&#x2a;',
			'meltdown-icon-link' : '&#x6c;',
			'meltdown-icon-code' : '&#x3c;',
			'meltdown-icon-picture' : '&#x70;',
			'meltdown-icon-quote' : '&#x22;',
			'meltdown-icon-help' : '&#x3f;',
			'meltdown-icon-code-block' : '&#x5b;',
			'meltdown-icon-return' : '&#x72;',
			'meltdown-icon-footnote' : '&#x66;',
			'meltdown-icon-hr' : '&#x5f;',
			'meltdown-icon-caret-down' : '&#x76;',
			'meltdown-icon-add-to-list' : '&#x2b;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; i < els.length; i += 1) {
		el = els[i];
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/meltdown-icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};