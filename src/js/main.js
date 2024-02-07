'use strict';
require.config({
	baseUrl: 'js/',
	paths: {
		jquery: [
			'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min',
			'jsvendor/jquery.min'
		],
		'jquery-mousewheel': 'jsvendor/jquery.mousewheel.min',
		mCustomScrollbar: 'jsvendor/jquery.mCustomScrollbar',
		weather: 'weather'
	},
	shim: {
		mCustomScrollbar: {
			deps: ['jquery', 'jquery-mousewheel'],
			exports: ['mCustomScrollbar']
		},
		'jquery-mousewheel': {
			deps: ['jquery'],
			exports: ['jquery-mousewheel']
		}
	}
});

define(['jquery', 'mCustomScrollbar', 'weather'], function ($) {
	('use strict');

	var $root = $('#root');
	var $scroll = '#scroll';

	function scrollinit(ele) {
		if ($(ele).length > 0 && $(window).width() >= 768) {
			// console.log($(ele).length);
			setTimeout(function () {
				$(ele).mCustomScrollbar({
					axis: 'x',
					scrollButtons: {
						enable: true
					},
					theme: 'light-thick',
					advanced: { autoExpandHorizontalScroll: true }
				});
			}, 800);
		}
	}

	$root.bind('DOMSubtreeModified', function () {
		scrollinit($scroll);
	});

	$(window).resize(function () {
		scrollinit($scroll);
		if ($($scroll).length > 0 && $(window).width() < 768) {
			$($scroll).mCustomScrollbar('destroy');
		}
	});
});
