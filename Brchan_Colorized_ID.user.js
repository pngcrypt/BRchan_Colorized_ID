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

	var ids = [],
		stylesheet,
		HLtype = 2, // Type of highlight: 0 - off, 1 - ID to font color; 2 - ID to background color
		lightLimit = 160, // threshold of brightness
		selectedID = '',
		selectedCNT = 0,
		
		// hl-type: 1
		bgDark = "#404040", // color of BG when font color is bright
		bgLight = "#d0d0d0", // color of BG when font color is dark

		// hl-type: 2
		colDark = "#000000", // color of font when BG color is bright
		colLight = "#ffffff"; // color of font when BG color is dark

	function addStyle(selector, rules) {
		if(!stylesheet) {
			stylesheet = document.styleSheets[0];
			if(!stylesheet) return;
		}
		if("insertRule" in stylesheet)
			stylesheet.insertRule(selector + "{" + rules + "}", 0);
		else
			stylesheet.addRule(selector, rules, 0);
	}

	function ColorizeID(parent) {
		var id, rgb=[], light;
		$(parent).find('span.poster_id').each(function(){
			id = this.textContent;
			if(HLtype && (rgb = id.match(/(..)(..)(..)/))) {
				rgb[0] = parseInt(rgb[1], 16);
				rgb[1] = parseInt(rgb[2], 16);
				rgb[2] = parseInt(rgb[3], 16);
				light = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2]; // color brightness

				switch(HLtype) {
					case 1:
						this.style.color = "#"+id;
						this.style.backgroundColor = light > lightLimit ? bgDark : bgLight;
						break;

					case 2:
						this.style.backgroundColor = "#"+id;
						this.style.color = light > lightLimit ? colDark : colLight;
						break;
				}
			}
			if(selectedID == id && this.parentElement && this.parentElement.parentElement) {
				$(this.parentElement.parentElement).addClass('bci_selected');
			}
		});
	}

	function updateCounter() {
		if(selectedID === '') return;
		var cnt = 1;
		selectedCNT = $('div.thread .bci_selected').length;
		$('div.thread').find('.bci_selected').each(function(){
			$('span.poster_id', this).attr('title', cnt + ' ('+selectedCNT+')');
			cnt++;
		});
	}

	function onIDclick() {
		var parent,
			self = this,
			id = self.textContent;

		if(!(parent = self.parentElement)) return; 
		if(!(parent = parent.parentElement)) return; // post
		if(!(parent = parent.parentElement)) return; // thread
		$(parent).find('div.post').each(function(){
			$(this).removeClass('bci_selected');
			$('span.poster_id', this).attr('title', '');
		});
		if(id == selectedID) {
			selectedID = '';
			selectedCNT = 0;
		}
		else {
			selectedID = id;
			$(parent).find('span.poster_id').each(function(){
				if(this.textContent !== id) return;
				$(this.parentElement.parentElement).addClass('bci_selected');
			});
			updateCounter();
		}
	}

	function onNewPost(e, el) {
		ColorizeID(el);
		updateCounter();
	};

	console.log('ColorizeID started');

	// style of id
	addStyle('span.poster_id', 'border-radius: 4px; font-size: 0.9em; padding: 2px; font-weight: bold; ');
	addStyle('div.bci_selected', 'background-blend-mode: hard-light !important; background-color: #ff0000 !important;');
	//background-blend-mode: hard-light; background-color: #b3569c;

	ColorizeID(document);
	$(document).on('new_post', onNewPost);
	$('div.thread').on('click', 'span.poster_id', onIDclick);

})();