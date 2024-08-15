var input = "";
var editor;
var editor2;
var user = new profile();
var sync_time;
var window_size_threshold = 600;
var gladcodeFlag = false;

var posting = $.post( "back_login.php", {
	action: "GET",
} );
posting.done(function( data ) {
	//console.log(data);
	data = JSON.parse(data);
	if (data.status == "SUCCESS"){
		data = JSON.parse(data);
		user.email = data.email;
		user.nome = data.nome;
		user.sobrenome = data.sobrenome;
		user.foto = data.foto;
		user.pasta = data.pasta;
	}
});


$(document).ready( function() {
	load_editor();

	initGoogleLogin();
	
	if ($(window).width() > window_size_threshold){
		editor.focus();
	}
	
	var resizing = false;
	var layout = 1;
	var fontsize = 18;
	$('#term').css('font-size', fontsize + 'px');
	$('#code').css('font-size', fontsize + 'px');

	$('#panel').click( function() {
		if ($(window).width() <= window_size_threshold){
			$(this).hide();
		}
	});

	$('#button-menu').click( function() {
		$('#panel').slideDown('slow');
		if ($('#button-csync').css('display') != "none"){
			get_last_sync_time();
		}
	});	
	
	
	new_tab("");
	$('#button-new').click( function() {
		new_tab("");
	});	

	$('#gladcode').click( function() {
		window.location.href = "index";
	});	

	$('#button-cload').click( function() {
		if (user.email != ""){
			show_file_manager("load");
		}
		else{
			pre_google_login("load");		
		}
	});
	
	$('#button-csave').click( function() {
		if (user.email != ""){
			show_file_manager("save");
		}
		else{
			pre_google_login("save");		
		}
	});

	$('#button-csync').hover( function() {
		if ($(window).width() > window_size_threshold){
			get_last_sync_time();
		}
	});
	
	
	$('#button-load').click( function() {
		$('#fileload').click();
	});
	
	$('#button-save').click( function() {
		var filename = $('.tab.active .name').html();
		if (filename == "sem nome"){
			var popup_window = "<div id='fog'><div class='window message' id='save'><div class='row title'>Informe o nome do arquivo</div><div class='row'><input type-text></div><div class='row buttons'><img class='green' src='icon/check.png'><img class='red' src='icon/close_x.png'></div></div></div>";
			$('body').append(popup_window);
			
			$('.window input').focus();

			$('#fog').click( function() {
				$(this).remove();
				if ($(window).width() > window_size_threshold)
					editor.focus();
			});
			$('.window').click( function(e) {
				e.stopPropagation();
			});
			$('.window img.red').click( function() {
				$('#fog').click();
			});
			$('.window img.green').click( function() {
				if ($('.window input').val() != ""){
					filename = $('.window input').val();
					$('#fog').click();
					$('.tab.active .name').html(filename);
					$('.tab.active .changed').remove();
					download(filename, editor.getValue());
				}
			});
		}
		else{
			$('.tab.active .changed').remove();
			download(filename, editor.getValue());
		}
	});	
	
	$('#button-fontp').click( function() {
		fontsize += 2;
		$('#term').css('font-size', fontsize + 'px');
		$('#code').css('font-size', fontsize + 'px');
	});
	
	$('#button-fontm').click( function() {
		fontsize -= 2;
		$('#term').css('font-size', fontsize + 'px');
		$('#code').css('font-size', fontsize + 'px');
	});

	$('#button-input').click( function() {
		var popup_window = "<div id='fog'><div class='window message'><div class='row title'>Informe a entrada que será usada no programa</div><div class='row'><pre id='term-input'></pre></div><div class='row buttons'><img class='green' src='icon/check.png'><img class='red' src='icon/close_x.png'></div></div></div>";
		$('body').append(popup_window);

		var input_term = ace.edit("term-input");
		input_term.setTheme("ace/theme/terminal");
		input_term.session.setMode("ace/mode/text");
		input_term.$blockScrolling = Infinity;
		input_term.setAutoScrollEditorIntoView(true);	
		input_term.renderer.setShowGutter(false); 
		input_term.setShowPrintMargin(false);
		input_term.setHighlightActiveLine(false);
		input_term.getSession().setUseWrapMode(true);
		
		$('#term-input').css('font-size', fontsize + 'px');
		input_term.setValue(input);
		input_term.focus();

		$('#fog').click( function() {
			$(this).remove();
			if ($(window).width() > window_size_threshold)
				editor.focus();
		});
		$('.window').click( function(e) {
			e.stopPropagation();
		});
		$('.window img.red').click( function() {
			$('#fog').click();
		});
		$('.window img.green').click( function() {
			$('#fog').click();
			input = input_term.getValue();
		});
		
	});
	
	$('#button-run').click( function() {
		if (!$(this).hasClass('disabled')){
			var code = editor.getValue();
			var compile_message = "";
			editor2.setValue(compile_message);
			editor2.renderer.$cursorLayer.element.style.display = "none";
			editor2.clearSelection();
			var interval = setInterval(function(){
				compile_message += ".";
				if (compile_message == "....")
					compile_message = "";
				editor2.setValue(compile_message);
				editor2.renderer.$cursorLayer.element.style.display = "none";
				editor2.clearSelection();
			}, 500);
			$(this).addClass('disabled');

			if (layout == 1){
				$("#code-wrapper").animate({height:   ($(window).height() - 55) * 0.4  }, function(){
					editor.resize();
				});
				$("#term-wrapper").animate({height:   ($(window).height() - 55) * 0.6  }, function(){
					editor2.resize();
				});		
			}

			var posting = $.post( "back_compile.php", {
				code: code,
				input: input
			} );
			var timeout = setTimeout(function(){ 
				posting.abort();
				clearInterval(interval);
				$('#button-run').removeClass('disabled');
				editor2.setValue("Não obteve resposta do servidor. Verifique conexão com a internet e tente novamente");
				editor2.renderer.$cursorLayer.element.style.display = "none";
				editor2.clearSelection();
			}, 15000);
			posting.done(function( data ) {
				data = data.replace("|","");
				editor2.setValue(data);
				$('#button-run').removeClass('disabled');
				clearTimeout(timeout);
				clearInterval(interval);
				
				//esconde cursor
				editor2.renderer.$cursorLayer.element.style.display = "none";
				editor2.clearSelection();
			});
		}
	});

	$('#button-layout').click( function() {
		if (layout == 1){
			layout = 2;
			$('#editor').css('display','flex');
			$("#term-title").hide();
			$("#code-wrapper").css({
				height: ($(window).height() - 55),
				width: ($(window).width() * 0.6)
			}, function(){
				editor.resize();
			});
			$("#term-wrapper").css({
				height: ($(window).height() - 55),
				width: ($(window).width() * 0.4)
			}, function(){
				editor2.resize();
			});		
			editor.resize();
			editor2.resize();
		}
		else{
			layout = 1;
			$('#editor').removeAttr('style');
			$("#term-title").show();
			$("#code-wrapper").css({
				height:  ($(window).height() - 55 - 20),
				width: ($(window).width())
			}, function(){
				editor.resize();
			});
			$("#term-wrapper").css({
				height: 20,
				width: ($(window).width())
			}, function(){
				editor2.resize();
			});		
			editor.resize();
			editor2.resize();
		}
	});
	$('#button-layout').click();

	$('#button-fullscreen').click( function() {
		toggleFullScreen();
	});
	
	$('#button-help').click( function() {
		var popup_window = "<div id='fog'><div class='window' id='help'><div class='row title'>Escolha um tópico:</div><div class='wrap'><div class='row title'>Teclas de atalho</div><div class='row line'>Alt+N  <span class='dots'>........</span>  Abrir nova aba</div><div class='row line'>Alt+W  <span class='dots'>........</span>  Fechar aba atual</div><div class='row line'>Alt+O  <span class='dots'>........</span>  Abrir arquivo da nuvem</div><div class='row line'>Alt+S  <span class='dots'>........</span>  Sincronizar com a nuvem (caso ainda não esteja)</div><div class='row line'>Alt+T  <span class='dots'>........</span>  Alternar entre abas abertas</div><div class='row line'>Ctrl+O  <span class='dots'>.......</span>  Abrir arquivo local</div><div class='row line'>Ctrl+S  <span class='dots'>.......</span>  Baixar arquivo</div><div class='row line'>Ctrl+A  <span class='dots'>.......</span>  Selecionar tudo</div><div class='row line'>Ctrl+F  <span class='dots'>.......</span>  Procurar texto no arquivo</div><div class='row line'>Ctrl+H  <span class='dots'>.......</span>  Substituir texto no arquivo</div><div class='row line'>Tab  <span class='dots'>..........</span>  Avançar indentação</div><div class='row line'>Shift+Tab  <span class='dots'>....</span>  Recuar indentação</div><div class='row line'>Ctrl+-  <span class='dots'>.......</span>  Reduzir tamanho da fonte</div><div class='row line'>Ctrl++  <span class='dots'>.......</span>  Aumentar tamanho da fonte</div><div class='row line'>F8  <span class='dots'>...........</span>  Inserir entrada de dados</div><div class='row line'>F9  <span class='dots'>...........</span>  Compilar e executar programa</div><div class='row line'>Ctrl+F9  <span class='dots'>......</span>  Mostrar terminal (layout 1)</div><div class='row line'>F10  <span class='dots'>..........</span>  Alternar Layout</div><div class='row line'>F11  <span class='dots'>..........</span>  Modo tela cheia</div><div class='row line'>F12  <span class='dots'>..........</span>  Exibir ajuda</div><div class='row line'>Enter  <span class='dots'>........</span>  Botão de confirmação em janelas de mensagem</div><div class='row line'>Ctrl+Enter  <span class='dots'>...</span>  Botão de confirmação na janela de entrada de dados</div><div class='row line'>Esc  <span class='dots'>..........</span>  Ocultar terminal (layout 1), botão de cancelar em janelas de mensagem</div></div><div class='wrap'><div class='row title'>Entrada de dados</div><div class='row line'>Ao informar a entrada de dados do programa, você deverá fornecer todos os valores previamente. Cada valor de entrada deverá estar separado por um espaço ou enter.</div></div><div class='wrap'><div class='row title'>Sincronização com a nuvem</div><div class='row line'>Ao abrir um arquivo que está gravado na nuvem, ou guardar na nuvem pela primeira vez um arquivo local, o sistema irá detectar  mudanças no arquivo e gravá-lo automaticamente, sem necessidade de intervenção. Você pode verificar se o arquivo possui modificações ainda não guardadas através de um * na aba do arquivo.</div></div><div class='wrap'><div class='row title'>Exemplos de código</div><div class='row line'><a class='code' href='samples/hello.c'>hello.c</a>  <span class='dots'>......</span>  Clássico Olá mundo</div><div class='row line'><a class='code' href='samples/input.c'>input.c</a>  <span class='dots'>......</span>  Exemplo que lê e mostra valores de entrada</div><div class='row line'><a class='code' href='samples/math.c'>math.c</a>  <span class='dots'>.......</span>  Funções da biblioteca math.h</div><div class='row line'><a class='code' href='samples/string.c'>string.c</a>  <span class='dots'>.....</span>  Verifica strings e conta ocorrências</div><div class='row line'><a class='code' href='samples/random.c'>random.c</a>  <span class='dots'>.....</span>  Sorteia e mostra números aleatórios</div><div class='row line'><a class='code' href='samples/fibonacci.c'>fibonacci.c</a>  <span class='dots'>..</span>  Função que calcula o enésimo termo da sequência de Fibonacci</div><div class='row line'><a class='code' href='samples/sort.c'>sort.c</a>  <span class='dots'>.......</span>  Ordena um vetor em ordem crescente</div></div><div class='wrap'><div class='row title'>Tutorial Linguagem C</div><div class='row line'><a target='_blank' href='https://www.youtube.com/playlist?list=PLa75BYTPDNKaW9KYaTh5hE6O5OnMdBB51'>Série de vídeo aulas de linguagem C</a></div><div class='row line'><a target='_blank' href='http://linguagemc.com.br/primeiro-programa-em-linguagem-c/'>Introdução à linguagem de programação C</a></div><div class='row line'><a target='_blank' href='http://linguagemc.com.br/variaveis-em-linguagem-c/'>Variáveis na linguagem de programação C</a></div><div class='row line'><a target='_blank' href='http://linguagemc.com.br/operacoes-de-entrada-e-saida-de-dados-em-linguagem-c/'>Comandos de entrada e saída de dados</a></div><div class='row line'><a target='_blank' href='http://linguagemc.com.br/operadores-aritmeticos-em-linguagem-c/'>Operadores aritméticos</a></div><div class='row line'><a target='_blank' href='http://linguagemc.com.br/a-biblioteca-math-h/'>A biblioteca math.h</a></div><div class='row line'><a target='_blank' href='http://linguagemc.com.br/estrutura-de-decisao-if-em-linguagem-c/'>Estrutura de seleção IF</a></div><div class='row line'><a target='_blank' href='http://linguagemc.com.br/operadores-relacionais/'>Operadores relacionais</a></div><div class='row line'><a target='_blank' href='http://linguagemc.com.br/estruturas-de-decisao-encadeadas-if-else-if-else/'>Estruturas IF encadeadas</a></div><div class='row line'><a target='_blank' href='http://linguagemc.com.br/a-estrutura-de-repeticao-for-em-c/'>Estrutura de repetição FOR</a></div><div class='row line'><a target='_blank' href='http://linguagemc.com.br/o-comando-while-em-c/'>Estrutura de repetição WHILE</a></div><div class='row line'><a target='_blank' href='http://linguagemc.com.br/vetores-ou-arrays-em-linguagem-c/'>Vetores (arrays) na linguagem C</a></div></div><div class='row credit'>Pablo Werlang (<a href='mailto:pswerlang@gmail.com'>pswerlang@gmail.com</a>)</div></div></div>";
		$('body').append(popup_window);
		$('#fog').click( function() {
			$(this).remove();
			if ($(window).width() > window_size_threshold)
				editor.focus();
		});
		
		$('.wrap .row.title').click( function(e) {
			e.stopPropagation();
		});

		$('.row.line').hide();
		
		$('.wrap .row.title').click( function() {
			$(this).parent().find('.line').slideToggle('slow');
		});
		
		$('a.code').click( function(e) {
			e.preventDefault();
			
			var href = $(this).attr('href');

			var posting = $.post( "back_getfile.php", {
				action: "FILE",
				href: href
			} );
			posting.done(function( data ) {
				if (data != "NULL"){
					var name = href.split("/")[href.split("/").length - 1];
					new_tab(name, data);
				}
				$('#fog').click();
			});
		});
	});
	

	
	
	$('#button-fontm, #button-fontp, #button-run, #button-layout, #button-fullscreen').click( function() {
		if ($(window).width() > window_size_threshold)
			editor.focus();
	});
	
	
	$('#term-title').click( function(e) {
		$("#code-wrapper").animate({height:   ($(window).height() - 55) * 0.4  }, function(){
			editor.resize();
		});
		$("#term-wrapper").animate({height:   ($(window).height() - 55) * 0.6  }, function(){
			editor2.resize();
		});		
	});		
	
	$('#button-close-term').click( function(e) {
		if (layout == 1){
			$("#code-wrapper").animate({height:  ($(window).height() - 55 - 20) }, function(){
				editor.resize();
			});
			$("#term-wrapper").animate({height: 20 }, function(){
				editor2.resize();
			});		
		}
		e.stopPropagation();
	});

	$("#code-wrapper").resizable({
		handles: "s, e"
	});
	$("#code-wrapper").on("resize", function() {
		editor.resize();
		if (layout == 1){
			$("#term-wrapper").height($(window).height() - 55 - $("#code-wrapper").height());
		}
		else{
			$("#term-wrapper").width($(window).width() - $("#code-wrapper").width());
		}
		editor2.resize();
		resizing = true;
	});
	
	$("#code-wrapper").mouseup( function() {
		resizing = false;
	});
	
	$(window).resize( function() {
		if (!resizing){
			if (layout == 1){
				$("#code-wrapper").animate({
					height:  ($(window).height() - 55 - 20),
					width: ($(window).width()) 
				}, function(){
					editor.resize();
				});
				$("#term-wrapper").animate({
					height: 20,
					width: ($(window).width()) 
				}, function(){
					editor2.resize();
				});	
			}
			else{
				$("#code-wrapper").animate({
					height: ($(window).height() - 55),
					width:  ($(window).width() * 0.6) 
				}, function(){
					editor.resize();
				});
				$("#term-wrapper").animate({
					height: ($(window).height() - 55),
					width: ($(window).width() * 0.4)
				}, function(){
					editor2.resize();
				});	
			}
		}
	});
	
	var reader = new FileReader();
	reader.onload = function(e) {
		var text = reader.result;
		var name = $('#fileload').val().split("\\")[$('#fileload').val().split("\\").length - 1];
		new_tab(name, text);
	}

	$('#fileload').change( function() {
		reader.readAsText(document.getElementById('fileload').files[0]);
	});
});

function profile(){
	this.email = "";
	this.foto = "";
	this.nome = "";
	this.sobrenome = "";
	this.pasta = "";
}

function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {  
      document.documentElement.requestFullScreen();  
    } else if (document.documentElement.mozRequestFullScreen) {  
      document.documentElement.mozRequestFullScreen();  
    } else if (document.documentElement.webkitRequestFullScreen) {  
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
    }  
  } else {  
    if (document.cancelFullScreen) {  
      document.cancelFullScreen();  
    } else if (document.mozCancelFullScreen) {  
      document.mozCancelFullScreen();  
    } else if (document.webkitCancelFullScreen) {  
      document.webkitCancelFullScreen();  
    }  
  }  
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

function load_editor(){
	ace.require("ace/ext/language_tools");
    editor = ace.edit("code");
    editor.setTheme("ace/theme/dreamweaver");
    editor.session.setMode("ace/mode/c_cpp");
	editor.getSession().setUseWrapMode(true);
	editor.$blockScrolling = Infinity;
	editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
    });
	var timeout;
	var trigger_file;
	editor.on("change", function() {
		if ($('.tab.active .changed').length == 0 && !block_change){
			$('.tab.active .name').before("<span class='changed'>*</span>");
		}
		
		if ($('.tab.active .changed').length != 0 && $('#button-csync').css('display') != "none"){
			trigger_file = meta_files[$('.tab').index($('.tab.active'))];
			
			clearTimeout(timeout);
			timeout = setTimeout(function(){
				var this_file = meta_files[$('.tab').index($('.tab.active'))];
				//alert(trigger_file.path +"|||"+ this_file.path);
				if (trigger_file.path == this_file.path && this_file.path != ""){
					sync_file(editor.getValue(), trigger_file.path);
					$('.tab.active .changed').remove();
					sync_time = Date.now();				
				}
			}, 5000);
		}
	});	
	
    editor2 = ace.edit("term");
    editor2.setTheme("ace/theme/terminal");
    editor2.session.setMode("ace/mode/text");
	editor2.$blockScrolling = Infinity;
	editor2.setAutoScrollEditorIntoView(true);	
	editor2.renderer.setShowGutter(false); 
	editor2.setShowPrintMargin(false);
	editor2.setHighlightActiveLine(false);
	editor2.getSession().setUseWrapMode(true);
	editor2.setReadOnly(true);
}

function pre_google_login(action){
	var popup_window = "<div id='fog'><div class='window message'><div class='row title'>Para usar a nuvem, faça login com sua conta do Google</div><div class='row buttons'><div id='google-login'><div class='icon'><img src='icon/google-icon.png'></div><div class='text'>Login com Google</div></div></div></div></div>";
	$('body').append(popup_window);
	$('#fog').click( function() {
		$(this).remove();
		if ($(window).width() > window_size_threshold)
			editor.focus();
	});
	$('.window.message').click( function(e) {
		e.stopPropagation();
	});		

	$('#google-login').click( function(){
		googleLogin().then( function(data){
			$('#fog').click();
			//console.log(data);
			user.email = data.email;
			user.nome = data.nome;
			user.sobrenome = data.sobrenome;
			user.foto = data.foto;
			user.pasta = data.pasta;
			if (action == "save")
				$('#button-csave').click();
			else
				$('#button-cload').click();
		});
	})
}

function get_last_sync_time(){
	var time_now = Date.now();
	var diff = time_now - sync_time;
	if (isNaN(diff)){
		$('#button-csync').attr('title','Sincronizando com a nuvem');
		$('#button-csync').find('.name').html('Sincronizando com a nuvem');
	}
	else{
		var h,m,s,msg;
		s = parseInt(diff/1000);
		m = parseInt(s/60);
		s = s%60;
		h = parseInt(m/60);
		m = m%60;
		if (h != 0){
			if (h == 1)
				msg = h +" hora";
			else
				msg = h +" horas";
		}
		else if (m != 0){
			if (m == 1)
				msg = m +" minutos";
			else
				msg = m +" minutos";
		}
		else{
			if (s == 1)
				msg = s +" segundo";
			else
				msg = s +" segundos";
		}
		$('#button-csync').attr('title','Sincronizado pela última vez há '+ msg);
		$('#button-csync').find('.name').html('Sincronizado pela última vez há '+ msg);
	}
}
