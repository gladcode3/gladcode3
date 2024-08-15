var block_change = false;
var meta_files = new Array();

function switch_tab(obj){
	block_change = true;
	
	var old = $('.tab').index($('.tab.active').eq(0));
	meta_files[old].code = editor.getValue();
	meta_files[old].input = input;
	$('.tab.active').removeClass('active');

	obj.addClass('active');
	var index = $('.tab').index($('.tab.active').eq(0));
	editor.setValue(meta_files[index].code);
	input = meta_files[index].input;
	editor.clearSelection();
	editor.focus();
	
	if (meta_files[index].path == ""){
		$('#button-csync').hide();
		$('#button-csave').show();
	}
	else{
		$('#button-csync').show();
		$('#button-csave').hide();
	}
	resize_tabs();
	
	block_change = false;
}

function close_tab(obj){
	block_change = true;
	
	var index = $('.tab').index(obj);
	meta_files.splice(index,1);
	$('.tab').eq(index).remove();
	if (index > 0)
		index--;
	if ($('.tab.active').length == 0){
		$('.tab').eq(index).addClass('active');
		editor.setValue(meta_files[index].code);
		input = meta_files[index].input;
		
		if (meta_files[index].path == ""){
			$('#button-csync').hide();
			$('#button-csave').show();
		}
		else{
			$('#button-csync').show();
			$('#button-csave').hide();
		}
		
	}
	resize_tabs();
	editor.clearSelection();
	editor.focus();
	
	block_change = false;
}

function new_tab() {
	var name;
	var text;
	if (arguments.length == 1){
		name = "sem nome";
		text = arguments[0];
	}
	else if (arguments.length == 2){
		name = arguments[0];
		text = arguments[1];
	}
	
	block_change = true;
	
	meta_files.push(new file());
	if ($('.tab').length == 0)
		var index = 0;
	else
		var index = $('.tab').index($('.tab.active').eq(0));
	meta_files[index].code = editor.getValue();
	meta_files[index].input = input;
	
	$('.tab.active').removeClass('active');
	$('#tab-bar').append("<div class='tab active'><span class='name'>"+ name +"</span><img src='icon/close_x.png'></div>");
	editor.setValue(text);
	input = "";
	editor.clearSelection();
	editor.focus();
	editor.gotoLine(1,0,true);
	
	$('#button-csync').hide();
	$('#button-csave').show();
	
	block_change = false;

	$('.tab').off();
	$('.tab').click( function() {
		switch_tab($(this));
	});
	
	resize_tabs();
	
	$('.tab img').off();
	$('.tab img').click( function(e) {
		var name_close = $(this).parent().find('.name').html();
		e.stopPropagation();
		var clicked = $(this).parent();
		
		if (clicked.find('.changed').length != 0){
			var popup_window = "<div id='fog'><div class='window message'><div class='row title'>Deseja fechar o arquivo \""+ name_close +"\"? Você irá perder todas alterações realizadas</div><div class='row buttons'><img class='green' src='icon/check.png'><img class='red' src='icon/close_x.png'></div></div></div>";
			
			$('body').append(popup_window);
			$('#fog').click( function() {
				$(this).remove();
				if ($(window).width() > window_size_threshold)
					editor.focus();
			});
			$('.window.message').click( function(e) {
				e.stopPropagation();
			});
			
			$('.window.message img.red').click( function() {
				$('#fog').click();
			});
			$('.window.message img.green').click( function() {
				$('#fog').click();
				if ($('.tab').length == 1)
					new_tab("");
				close_tab(clicked);
			});
		}
		else{
			if ($('.tab').length == 1)
				new_tab("");
			close_tab(clicked);
		}
	});
	
}

function file(){
	this.code = "";
	this.path = "";
	this.input = "";
	this.changed = false;
	this.local = true;
}

function resize_tabs(){
	$('.tab').removeAttr('style');
	if ($('.tab').last().position().left + $('.tab').last().width() > $('#tab-bar').width()){
		var maxw = $('#tab-bar').width();
		var ntabs = $('.tab').length;
		var menuw = 0;
		if ($(window).width() < window_size_threshold)
			menuw = 25;
		$('.tab').css('max-width',(maxw-menuw)/ntabs);
	}
}