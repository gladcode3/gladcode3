$(document).ready( function(){
	var version = [];
	
	$.post("back_update.php",{
		action: "GET"
	}).done( function(data){
		version = JSON.parse(data);
		$('#version #current').html(version.join('.'));
		if (!version[2])
			version[2] = 0;
		$('#version #new').val([version[0], version[1], parseInt(version[2])+1].join('.'));
	});
	
	$('#version #type select').change( function(){
		var options = $(this).find('option');
		var selected = options.index($(this).find('option:selected'));
		var newversion;
		if (selected == 0)
			newversion = [parseInt(version[0])+1, 0];
		else if (selected == 1)
			newversion = [version[0], parseInt(version[1])+1];
		else if (selected == 2){
			if (!version[2])
				version[2] = 0;
			newversion = [version[0], version[1], parseInt(version[2])+1];
		}
		$('#version #new').val(newversion.join('.'));
	});
	
	$('button').click( function(){
		$.post("back_update.php",{
			action: "SET",
			version: $('#version #new').val(),
			keepup: $('#keep-updated input').prop('checked'),
			pass: $('#pass-div input').val(),
		}).done( function(data){
			//console.log(data);
			if (data != "WRONGPASS"){
				var changes = $('#changes textarea').val();
				changes = changes.replace(/\r?\n/g, '<br/>');
				//console.log(changes);
				showMessage("Mensagem enviada. Aguarde. Não clique mais de uma vez antes de dar status 500 no console.");

				$.post("back_sendmail.php",{
					action: "UPDATE",
					version: $('#version #new').val(),
					summary: changes,
					postlink: $('#postlink input').val()
				}).done( function(data){
					console.log(data);
					try{
						data = JSON.parse(data);
						showMessage("Versão do sistema atualizada");
					}
					catch(e){
						console.log(e);
						showMessage("Erro");
					}
					$('button').removeAttr('disabled');
				});
			}
			else{
				alert("Wrong Password");
			}
		});
	});
});