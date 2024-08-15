$(document).ready( function() {
    $('#header').addClass('big');
    $('#header-container').addClass('small');
    
    $('#section-2 .card').mouseenter( function() {
        var name = $(this).find('.title img').attr('src').split('/')[1].split('.')[0];
        $(this).find('.title img').attr('src','image/'+ name +'.gif');
    }).mouseleave( function() {
        var name = $(this).find('.title img').attr('src').split('/')[1].split('.')[0];
        $(this).find('.title img').attr('src','image/'+ name +'.png');
    });	
    
    $('#account').click( function(){
        googleLogin().then(function(data) {
            window.location.href = "news";
        });
    });
    
    $('#section-2 .card .video').click( function() {
        var hash = $(this).find('.thumb').attr('src').split('/')[4];
        
        $('body').append("<div id='fog'><div id='video-container'><iframe width='100%' height='100%' src='https://www.youtube.com/embed/"+ hash +"' frameborder='0' allowfullscreen></iframe><div id='remove'></div></div></div>");
        $('#fog').hide().fadeIn(1000);
        $('#fog').click( function(){
            $('#fog').remove();
        });
    });
    
    if ($('#loginhash').length){
        var tab = $('#loginhash').html();
        $('#loginhash').remove();
        
        var loginMessage = {
            'messages': "Faça login para visualizar sua mensagem",
            'friends': "Faça login para ver seus pedidos de amizade",
            'battle': "Faça login para visualizar suas batalhas e desafios"
        };

        let msg = loginMessage[tab]
        if (!loginMessage[tab])
            msg = "Faça login para ir para o seu perfil"

        showDialog(msg, ["Cancelar","LOGIN"]).then( function(data){
            if (data == "LOGIN"){
                googleLogin().then(function(data) {
                    window.location.href = tab;
                });
            }
        });
    }
});