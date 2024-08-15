var file_manager_action;

function get_dir(){
	var dir = $('.window #dir-path').text().split(" > ");
	dir.splice(0, 1);
	dir = user.pasta +"/"+ dir.join("/");
	return dir;
}

function create_dir(name, dir){		
	var posting = $.post( "back_getfile.php", {
		action: "NEWDIR",
		dir: dir,
		name: name
	} );
	posting.done(function( data ) {
		var reload = reload_canvas(dir);
		$.when(reload).then(function() {
			$('.window .folder .name').filter(function() {
				return $(this).html() === name;
			}).parent().addClass('selected');			
		});		
		$('.window .folder.selected').dblclick( function() {
			var dirname = $('.window .folder.selected .name').html();
			dir += "/"+ dirname;
			reload_canvas(dir);
			$('.window #dir-path').append(" > <a class='dir'>"+ dirname +"</a>");
			$('.window #filename').val("");
		});
	});
}

function reload_canvas(dir){
	var filetag = "";
	var foldertag = "";
	var posting = $.post( "back_getfile.php", {
		action: "DIR",
		dir: dir
	} );
	posting.done(function( data ) {
		var folders = data.split("||")[0].split("|");
		var files = data.split("||")[1].split("|");
		if (files[0] != ""){
			for (var i=0 ; i<files.length ; i++){
				var ext = files[i].split(".")[1];
				if (ext == "c" || ext == "cpp")
					filetag += "<div class='file'><img src='icon/file_c.png'><div class='name'>"+ files[i] +"</div></div>";
				else
					filetag += "<div class='file'><img src='icon/file_generic.png'><div class='name'>"+ files[i] +"</div></div>";
			}
		}
		if (folders[0] != ""){
			for (var i=0 ; i<folders.length ; i++){
				foldertag += "<div class='folder'><img src='icon/folder.png'><span class='name'>"+ folders[i] +"</span></div>";
			}
		}
		
		var canvas = foldertag + filetag;
		$('.window #blank').html(canvas);
		
		$('.window .file, .window .folder').click( function(e) {
			e.stopPropagation()
			$('.window .file, .window .folder').removeClass('selected');
			$(this).addClass('selected');
			$('.window #filename').val( $('.window #blank .selected .name').html() );
		});		
		$('.window .folder').dblclick( function() {
			var dirname = $('.window .folder.selected .name').html();
			reload_canvas(dir +"/"+ dirname);
			$('.window #dir-path').append("<span class='arrow'> > </span><a class='dir'>"+ dirname +"</a>");
			$('.window #filename').val("");
			$('.window #dir-path .dir').last().click( function() {
				var index = $('.window #dir-path .dir').index($(this));
				$('.window #dir-path .dir').eq(index).nextAll().remove();
				$('.window #dir-path .arrow').eq(index).nextAll().remove();
				reload_canvas(get_dir());
			});
			
		});
		$('.window .file').dblclick( function() {
			if (file_manager_action == "load"){
				var filename = $('.window .file.selected .name').html();
				var href = "/home/gladcode/user/"+ dir +"/"+ filename;

				var skip_open = false;
				$('.tab').each( function() {
					var this_file = meta_files[$('.tab').index($(this))];
					if (this_file.path == href){
						switch_tab($(this));
						skip_open = true;
						$('#fog').click();
					}
				});
				if (!skip_open){
					var posting = $.post( "back_getfile.php", {
						action: "FILE",
						href: href
					} );
					posting.done(function( data ) {
						if (data != "NULL"){
							var name = href.split("/")[href.split("/").length - 1];
							new_tab(name, data);
							meta_files[meta_files.length-1].path = href;
							meta_files[meta_files.length-1].local = false;
							$('#button-csave').hide();
							$('#button-csync').show();
						}
						$('#fog').click();
					});
				}
			}
			else if (file_manager_action == "save"){
				var name = $('.window #blank .selected .name').html();
				var popup_window = "<div id='window-wrapper'><div class='window message' id='overwrite'><div class='row title'>Deseja sobrescrever o arquivo \""+ name +"\"?</div><div class='row buttons'><img class='green' src='icon/check.png'><img class='red' src='icon/close_x.png'></div></div></div>";
				$('body').append(popup_window);
				$('#window-wrapper').click( function() {
					$(this).remove();
				});
				$('.window.message').click( function(e) {
					e.stopPropagation();
				});
				
				$('.window.message img.red').click( function() {
					$('#window-wrapper').click();
				});
				$('.window.message img.green').click( function() {
					$('#window-wrapper').click();

					var name = $('.window #filename').val();
					var dir = get_dir();
					var text = editor.getValue();
					var posting = $.post( "back_getfile.php", {
						action: "SAVE",
						name: name,
						dir: dir,
						text: text
					} );
					posting.done(function( data ) {
						$('#fog').click();
						$('.tab.active .name').html(name);
						$('.tab.active .changed').remove();

						var href = "/home/gladcode/user/"+ dir +"/"+ name;
						meta_files[$('.tab').index($('.tab.active'))].path = href;
						meta_files[$('.tab').index($('.tab.active'))].local = false;
						$('#button-csave').hide();
						$('#button-csync').show();
					});
				});
			}
			
		});
	});
	return posting;
}

function show_file_manager(action){
	file_manager_action = action;
	var title;
	if (action == "load")
		title = "Abrir arquivo";
	else if (action == "save")
		title = "Guardar arquivo";
	
	var popup_window = "<div id='fog'><div class='window' id='folder-canvas'><div id='title'><div>"+ title +"</div><img id='button-close-window' class='red' src='icon/close_x.png'></div><div id='dir-path'><a class='dir'>Minha Pasta</a></div><div id='blank'></div><div class='row'><input id='filename' type='text'></div><div class='row buttons'><div class='column'><img class='grey' id='button-newdir' src='icon/folder_add.png' title='Nova pasta'><img class='grey' id='button-remove' src='icon/delete.png' title='Excluir'></div><div class='column'><img class='green' id='button-ok' src='icon/check.png'></div></div></div></div>";
	$('body').append(popup_window);
	
	$('#fog').click( function() {
		$(this).remove();
		if ($(window).width() > window_size_threshold)
			editor.focus();
	});
	$('.window').click( function(e) {
		e.stopPropagation();
	});
	
	reload_canvas(user.pasta);
	
	if ($(window).width() > window_size_threshold)
		$('.window #filename').focus();

	$('.window #blank').click( function() {
		$('.window .file, .window .folder').removeClass('selected');
	});
	
	$('.window #dir-path .dir').click( function() {
		$.when(reload_canvas(user.pasta)).then(function() {
			$('.window #dir-path .dir').eq(0).nextAll().remove();
			$('.window #dir-path .arrow').remove();
		});				
	});
			
	$('.window #button-newdir').click( function(e) {
		$('.window .file, .window .folder').removeClass('selected');
		$('.window #blank').append("<div class='folder selected'><img src='icon/folder.png'><span class='name'><input type='text' value='Nova pasta'></span></div>");
		var input = $('.window .folder.selected input');
		$('.window #blank').scrollTop(input.position().top + input.height());
		var dir = get_dir();
		input.select();
		input.keydown(function(event) {
			if(event.keyCode == 13) {
				create_dir(input.val(), dir);
			}
		});
		input.focusout( function (){
			create_dir(input.val(), dir);
		});
	});
				
	$('.window #button-remove').click( function(e) {
		if ($('.window #blank .selected').length == 1){
			var type;
			var name = $('.window #blank .selected .name').html();
			
			if ($('.window #blank .selected').hasClass('folder'))
				type = "a pasta";
			else
				type = "o arquivo";
							
			var popup_window = "<div id='window-wrapper'><div class='window message'><div class='row title'>Tem certeza que deseja excluir "+ type +" \""+ name +"\"?</div><div class='row buttons'><img class='green' src='icon/check.png'><img class='red' src='icon/close_x.png'></div></div></div>";
			$('body').append(popup_window);
			$('#window-wrapper').click( function() {
				$(this).remove();
				if ($(window).width() > window_size_threshold)
					editor.focus();
			});
			$('.window.message').click( function(e) {
				e.stopPropagation();
			});
			
			$('.window.message img.red').click( function() {
				$('#window-wrapper').click();
			});
			$('.window.message img.green').click( function() {
				$('#window-wrapper').click();

				var dir = get_dir();
				var posting = $.post( "back_getfile.php", {
					action: "REMOVE",
					name: name,
					dir: dir
				} );
				posting.done(function( data ) {
					reload_canvas(dir);
				});
				
			});
		}
	
	});

	$('.window #button-close-window').click( function(e) {
		$('#fog').click();
	});

	$('.window #button-ok').click( function(e) {
		if ($('.folder.selected input').length == 0){
			var obj;
			var name = $('.window #filename').val();
			$('.window .folder, .window .file').each( function(){
				if (name == $(this).find('.name').html())
					obj = $(this);
			});
			if (obj){
				obj.click();
				obj.dblclick();
			}
			else if (file_manager_action == "save" && $('.window #filename').val() != ""){
				var dir = get_dir();
				var text = editor.getValue();
				var posting = $.post( "back_getfile.php", {
					action: "SAVE",
					name: name,
					dir: dir,
					text: text
				} );
				posting.done(function( data ) {
					$('#fog').click();
					$('.tab.active .name').html(name);
					$('.tab.active .changed').remove();
					var href = "/home/gladcode/user/"+ dir +"/"+ name;
					meta_files[$('.tab').index($('.tab.active'))].path = href;
					meta_files[$('.tab').index($('.tab.active'))].local = false;
					$('#button-csave').hide();
					$('#button-csync').show();
				});
			}
		}
	});
}

function sync_file(text, path){
	var posting = $.post( "back_getfile.php", {
		action: "SYNC",
		path: path,
		text: text
	} );
	posting.done(function( data ) {
	});
}
