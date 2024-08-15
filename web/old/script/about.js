$(document).ready( function(){
    $('#support input').click( function(){
        if ($('#support #one-time:checked').length)
            $('#support #method').slideDown();
        else{
            $('#support #method').fadeOut();
            $('#support #method input').prop('checked', false);
        }

        $('#support .donate').addClass('hidden');
        $('#support #buttons').hide();

        if ($('#support #crypto:checked').length)
            $('#support #bitcoin, #support #ethereum').removeClass('hidden');
        if ($('#support #boleto:checked').length + $('#support #card:checked').length)
            $('#support #pagseguro').removeClass('hidden');
        if ($('#support #monthly:checked').length + $('#support #card:checked').length)
            $('#support #paypal').removeClass('hidden');

        $('#support #buttons').slideDown('fast');
    });

    $('#support .donate.small').click( function(){
        var id = $(this).attr('id');

        if (id == 'ethereum')
            showWallet("eth");
        else if (id == 'bitcoin')
            showWallet("btc");
    });

    $('.discontinued').click( () => {
        create_tooltip("Este modo não existe mais na gladCode. Os torneio agora podem ser criados a partir do peril do usuário.", $('.discontinued'));
    });

    $('#paypal, #pagseguro').click( function(){
        $.post("back_thanks.php",{
            action: "SET",
            url: window.location.pathname
        }).done( function(data){
            //console.log(data);
        });
    });
    
    $('#plans #premium').click( () => {
        // new Message({
        //     message: `
        //         <h2 id='title'>Tornar-se tutor?</h2>
        //         <p>Ao tornar-se tutor, sua conta receberá <b>R$ 30,00 de crédito</b> para usar nos treinos de equipes.</p>
        //         <p>A partir do momento da adesão, a cada mês será descontado <b>R$ 0,99</b> de seus créditos por cada aluno que participou de algum de seus treinos do mês vigente.</p>
        //         <p>Ao fim de seus créditos, você poderá recarregá-los através de pagamento com cartão de crédito, boleto ou criptomoedas.</p>`,
        //     buttons: {no: 'Não, obrigado', yes: "SIM, EU QUERO"}
        // }).show().click('yes', async () => {
        //     let data = await post("back_login.php", { action: "PREMIUM" })
        //     console.log(data)
        //     if (data.status == "PREMIUM"){
        //         new Message({ message: "Seu perfil já possui o status de tutor" }).show()
        //     }
        //     else if (data.status == "SUCCESS"){
        //         new Message({ message: "Pronto! Seu perfil agora possui o status de tutor, e foram depositados <b>R$ 30,00</b> de créditos em sua conta" }).show()
        //     }
        // })
        // $('#dialog-box').addClass('large')
    })
});

function showWallet(curr){
    var data = {
        btc: {
            name: "Bitcoin",
            wallet: "351JhGwhqGckt6P4F8cSsFCgsHKHCU8tjD",
            icon: "icon/bitcoin.png",
            qrcode: "image/qr_btc.png"
        },
        eth: {
            name: "Ethereum",
            wallet: "0x50E9BBf49C6329FC97493d012fEBB4D04d5de37e",
            icon: "icon/ethereum.png",
            qrcode: "image/qr_eth.png"
        }
    };

    if ($('#crypto-box').length == 0){
        var wallet = data[curr].wallet;
        var prettyArray = {
            btc: [4,4,4,5,4,4,4,5],
            eth: [4,4,4,4,5,4,4,4,4,5]
        };
        var walletpretty = "";
        var start = 0;
        for (var i in prettyArray[curr]){
            walletpretty += wallet.substring(start, start + prettyArray[curr][i]);
            start += prettyArray[curr][i];
            if (i < prettyArray[curr].length-1)
                walletpretty += " ";
        }

        //var wallet = walletpretty.split(" ").join("");
        var qrcode = "<img src='"+ data[curr].qrcode +"'>";
        var box = "<div id='fog'><div id='crypto-box' class='size-"+ prettyArray[curr].length +"'><div id='close'>X</div><div id='title'>Carteira "+ data[curr].name +":</div><div id='qrcode'>"+ qrcode +"</div><div id='wallet' title='Copiar para área de transferência'><img src='"+ data[curr].icon +"'><span>"+ walletpretty +"</span></div></div></div>";

        $('body').append(box);
        $('#crypto-box').hide().fadeIn();
        $('#crypto-box #close').click(function(){
            $('#fog').remove();
        });

        $('#crypto-box #wallet').click(function(){
            var textObj = $('#crypto-box #wallet span');
            copyToClipboard(wallet);
            textObj.parent().addClass('copied');
            textObj.html("Copiado").fadeOut(1200, function(){
                textObj.parent().removeClass('copied');
                textObj.html(walletpretty).show();
            });
        });

    }
}

function copyToClipboard(text) {
    $('body').append("<input type='text' id='icopy' value='"+ text +"'>");
    $('#icopy').select();
    document.execCommand("copy");
    $('#icopy').remove();
}	