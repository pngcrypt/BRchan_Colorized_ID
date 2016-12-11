// ==UserScript==
// @name		BRchan Colorized ID
// @namespace	https://brchan.org/
// @version		1.0.3
// @author		pngcrypt
// @include		http*://www.brchan.org/*
// @include		http*://brchan.org/*
// @grant		none
// @run-at		document-idle
// @nocompat	Chrome
// ==/UserScript==

(function() {
'use strict';
	var $ = window.$;
	if(typeof($) != 'function' || $('head title').text().match('CloudFlare')) 
		return;

	console.log('BRchan ColorizedID started');

	var HLtype = 2, // Type of highlight: 0 - off, 1 - ID to font color; 2 - ID to background color
		lightLimit = 128, // threshold of brightness
		
		// hl-type: 1
		bgDark = "#404040", // color of BG when font color is bright
		bgLight = "#d0d0d0", // color of BG when font color is dark

		// hl-type: 2
		colDark = "#000000", // color of font when BG color is bright
		colLight = "#ffffff", // color of font when BG color is dark

		$thread, selectedID = '', selectedCNT, hideUnselected,
		$navpanel = $('<span class="bci-nav"><div><span class="bci-dn">▼</span><span class="bci-up">▲</span></div></span>').hide();

    $('head').append('<style>' +
		'span.poster_id {border-radius: 4px; font-size: 0.9em; padding: 2px; font-weight: normal;}' +
		'.bci-selected {background-blend-mode: luminosity !important; background-color: rgba(255, 0, 0, 0.25) !important; border-color: #ff0000 !important;}' +
		'.bci-hidden > div {display:none !important;}' +
		'.bci-hidden .poster_id {opacity: 0.6; !important;}' +
		'.bci-nav {position: relative;}' +
		'.bci-nav div {position: absolute; border-radius: 4px 4px 0 0; font-size: 0.8em;height: 14px; top: -16px; right: 0; background: #f0f0ff; border: 1px solid #808080; box-sizing: content-box;}' +
		'.bci-up, .bci-dn {cursor: pointer; color: #000000; padding: 2px;}'+
		'.bci-up:hover, .bci-dn:hover {color: #0000ff}'+
        '</style>');

	var ColorizeID = function($post) {
		var $pid = $post.find('.poster_id'),
			id = $pid.text();
		if(id === '') return;
		if(id === selectedID)
			$post.addClass('bci-selected');
		else if(hideUnselected)
			$post.addClass('bci-hidden');

		if(HLtype) {
			var rgb = [parseInt(id.substr(0,2), 16), parseInt(id.substr(2,2), 16), parseInt(id.substr(4,2), 16)],
				// light = (Math.max.apply(null,rgb) + Math.min.apply(null,rgb)) / 2;
				light = rgb[0]*0.299 + rgb[1]*0.587 + rgb[2]*0.114;
			// console.log('#'+id+':'+light, $pid[0]);
			switch(HLtype) {
				case 1: $pid.css({'color': '#'+id, 'backgroundColor': (light > lightLimit ? bgDark : bgLight)}); break;
				case 2: $pid.css({'backgroundColor': '#'+id, 'color': (light > lightLimit ? colDark : colLight)}); break;
			}
		}
	};

	var updateCounter = function() {
		if(selectedID === '' || !$thread) return;
		var cnt = 1,
			$selected = $thread.find('.bci-selected');
		selectedCNT = $selected.length;
		$selected.find('.poster_id').each(function() {
			$(this).attr('title', cnt + ' (' + selectedCNT + ')');
			cnt++;
		});
	};

	var id_mouseenter = function() {
		$(this).after($navpanel);
		$navpanel.show();
	};

	$('div.thread').on('click', 'span.poster_id', function(ev) {
		$thread = $(this).parents('.thread');
		var id = $(this).text();
		$('div.thread .post').removeClass('bci-selected bci-hidden').removeAttr('title');

		if(id === selectedID) {
			selectedID = '';
			$navpanel.hide();
			$thread.off('mouseenter', '.bci-selected span.poster_id', id_mouseenter);
			if(hideUnselected)
				$('html, body').animate({
					scrollTop: $(this).offset().top - ev.clientY
				}, 10);
			hideUnselected = false;
		}
		else {
			selectedID = id;
			hideUnselected = ev.ctrlKey;
			if(hideUnselected) {
				$thread.find('.poster_id:not(:contains("' + id + '"))')
					.parents('.post')
					.addClass('bci-hidden');
				// todo: need scroll to element
			}
			$thread
				.find('.poster_id:contains("' + id + '")')
				.parents('.post')
				.addClass('bci-selected');
			$thread.on('mouseenter', '.bci-selected span.poster_id', id_mouseenter);
			if(hideUnselected)
				$('html, body').animate({
					scrollTop: $(this).offset().top - ev.clientY
				}, 10, function() {
					$(this).trigger('mouseenter');
				});
			else
				$(this).trigger('mouseenter');
		}
		updateCounter();
	});

	$navpanel.on('click', function(e){
		var $el;
		switch(e.target.className) {
			case 'bci-up':
				$el = $(this).parents('.post').prevUntil('.post:contains("'+selectedID+'")').last().prev();
				break;
			case 'bci-dn':
				$el = $(this).parents('.post').nextUntil('.post:contains("'+selectedID+'")').last().next();
				break;
		}
		if(!$el.length) return;
		$el = $el.find('.poster_id');
		 $('html, body').animate({
		        scrollTop: $el.offset().top - e.clientY - 8
		    }, 250, function() {
				$el.trigger('mouseenter');
		    });		
	});

	$(document).on('new_post', function(ev, el) {
		ColorizeID($(el));
		updateCounter();
	});

	setTimeout(function(){
		$('div.thread .post').each(function(idx, el) {
			ColorizeID($(el));
		});
	}, 0);

})();
