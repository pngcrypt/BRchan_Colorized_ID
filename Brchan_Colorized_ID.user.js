// ==UserScript==
// @name		BRchan Colorized ID
// @namespace	https://brchan.org/
// @version		1.0.0
// @author		pngcrypt
// @include		http*://www.brchan.org/*
// @include		http*://brchan.org/*
// @grant		none
// @run-at		document-idle
// @nocompat	Chrome
// ==/UserScript==

(function() {
'use strict';
	if(!window.jQuery || !window.$) return;
	var $ = window.$;

	var HLtype = 2, // Type of highlight: 0 - off, 1 - ID to font color; 2 - ID to background color
		lightLimit = 160, // threshold of brightness
		
		// hl-type: 1
		bgDark = "#404040", // color of BG when font color is bright
		bgLight = "#d0d0d0", // color of BG when font color is dark

		// hl-type: 2
		colDark = "#000000", // color of font when BG color is bright
		colLight = "#ffffff", // color of font when BG color is dark

		$thread, selectedID = '', selectedCNT, selectedKey;


    $('head').append('<style>' +
		'span.poster_id {border-radius: 4px; font-size: 0.9em; padding: 2px; font-weight: normal;}' +
		// '.bci_selected {background-blend-mode: hard-light !important; background-color: #ff0000 !important;}' +
		'.bci_selected {background-blend-mode: luminosity !important; background-color: rgba(255, 0, 0, 0.25) !important; border-color: #ff0000 !important;}' +
		'.bci_hidden > div {display:none !important;}' +
		'.bci_hidden .poster_id {opacity: 0.6; !important;}' +
        '</style>');

	var ColorizeID = function($post) {
		var $pid = $post.find('.poster_id'),
			id = $pid.text();
		if(id == selectedID)
			$post.addClass('bci_selected');

		if(HLtype) {
			var rgb = [parseInt(id.substr(0,2), 16), parseInt(id.substr(2,2), 16), parseInt(id.substr(4,2), 16)],
				light = (Math.max.apply(null,rgb) + Math.min.apply(null,rgb)) / 2;
			switch(HLtype) {
				case 1: $pid.css({'color': '#'+id, 'backgroundColor': (light > lightLimit ? bgDark : bgLight)}); break;
				case 2: $pid.css({'backgroundColor': '#'+id, 'color': (light > lightLimit ? colDark : colLight)}); break;
			}
		}
	};

	var updateCounter = function() {
		if(selectedID === '' || !$thread) return;
		var cnt = 1,
			$selected = $thread.find('.bci_selected');
		selectedCNT = $selected.length;
		$selected.find('.poster_id').each(function() {
			$(this).attr('title', cnt + ' (' + selectedCNT + ')');
			cnt++;
		});
	};

	$('div.thread').on('click', 'span.poster_id', function(ev) {
		$thread = $(this).parents('.thread');
		var id = $(this).text();
		var $posts = $thread.find('.post').removeClass('bci_selected bci_hidden').removeAttr('title');

		if(id == selectedID)
			selectedID = '';
		else {
			selectedID = id;
			if(ev.ctrlKey) {
				$posts.find('.poster_id:not(:contains("' + id + '"))')
					.parents('.post')
					.addClass('bci_hidden');
			}
			else {
				$posts.find('.poster_id:contains("' + id + '")')
					.parents('.post')
					.addClass('bci_selected');
			}
		}
		updateCounter();
	});

	$(document).on('new_post', function(ev, el) {
		ColorizeID($(el));
		updateCounter();
	});

	$('div.thread .post').each(function(idx, el) {
		ColorizeID($(el));
	});

	console.log('BRchan ColorizedID started');

})();