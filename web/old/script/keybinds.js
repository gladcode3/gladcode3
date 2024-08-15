$(document).ready( function() {
	$(window).keydown(function(event) {
		//key Enter
		if(event.keyCode == 13) { 
			if ($('.window .green').length > 0 && $('#term-input').length == 0){
				$('.window .green').click();
				event.preventDefault(); 
			}
		}
		//key ctrl+enter
		if(event.ctrlKey && event.keyCode == 13) {
			if ($('.window .green').length > 0 && $('#term-input').length != 0){
				$('.window .green').click();
				event.preventDefault(); 
			}
		}
		//key ESC
		if(event.keyCode == 27) { 
			$('#fog').click();
			$('#window-wrapper').click();
			if ($('#term-wrapper').height() > 50)
				$('#term-wrapper .red').click();
			event.preventDefault(); 
		}
		//key f8
		if(event.keyCode == 119) {
			event.preventDefault(); 
			if ($('#fog').length == 0){
				$('#button-input').click();
			}
		}
		//key f9
		if(!event.ctrlKey && event.keyCode == 120) { 
			$('#button-run').click();
			event.preventDefault(); 
		}
		//key ctrl+f9
		if(event.ctrlKey && event.keyCode == 120) { 
			$('#term-title').click();
			event.preventDefault(); 
		}
		//key f10
		if(event.keyCode == 121) { 
			$('#button-layout').click();
			event.preventDefault(); 
		}
		//key f12
		if(event.keyCode == 123) { 
			event.preventDefault(); 
			if ($('#fog').length == 0){
				$('#button-help').click();
			}
		}
		//key alt+N
		if(event.altKey && event.keyCode == 78) { 
			event.preventDefault(); 
			if ($('#fog').length == 0){
				$('#button-new').click();
			}
		}
		//key ctrl+S
		if(event.ctrlKey && event.keyCode == 83) { 
			event.preventDefault(); 
			if ($('#fog').length == 0){
				$('#button-save').click();
			}
		}

		//key alt+S
		if(event.altKey && event.keyCode == 83) { 
			event.preventDefault(); 
			if ($('#fog').length == 0 && $('#button-csync').css('display') == "none"){
				$('#button-csave').click();
			}
		}

		//key alt+T
		if(event.altKey && event.keyCode == 84) { 
			event.preventDefault(); 
			if ($('#fog').length == 0){
				var index = $('.tab').index($('.tab.active'));
				if (index == $('.tab').length - 1)
					index = 0;
				else
					index++;
				$('.tab').eq(index).click();
			}
		}

		//key ctrl+O 
		if(event.ctrlKey && event.keyCode == 79) { 
			event.preventDefault(); 
			if ($('#fog').length == 0){
				$('#fileload').click();
			}
		}
		
		//key alt+O
		if(event.altKey && event.keyCode == 79) { 
			event.preventDefault(); 
			if ($('#fog').length == 0){
				$('#button-cload').click();
			}
		}

		//key alt+W
		if(event.altKey && event.keyCode == 87) { 
			event.preventDefault(); 
			if ($('#fog').length == 0){
				$('.tab.active img').click();
			}
		}

		//key ctrl+-
		if(event.ctrlKey && event.keyCode == 189) { 
			$('#button-fontm').click();
			event.preventDefault(); 
		}
		//key ctrl++
		if(event.ctrlKey && event.keyCode == 187) { 
			$('#button-fontp').click();
			event.preventDefault(); 
		}
	});
	
});