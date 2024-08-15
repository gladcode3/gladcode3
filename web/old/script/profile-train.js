$(document).ready( function(){
    socket_ready().then( () => {
        socket.on('training list', data =>{
            trainList.refresh()
        })
        socket.on('training room', data =>{
            roomList[data.id].refresh()
        });
    });

    waitLogged().then( () => {
        if (!user.premium){
            $('#panel #train.wrapper #create').hide()        
        }
    })
    
    $('#panel #train.wrapper #create').click( function() {
        if (!user.premium){
            new Message({
                message: `
                    <h3>Transforme seu perfil em uma conta de tutor.</h3>
                    <img id='school' src='image/training.png'>
                    <p>Crie treinos onde você decide o tempo de duração e a quantidade de alunos por batalha.</p>
                    <p>Gere rankings personalizados e aumente o engajamento.</p>
                    `,
                buttons: { no: "NÃO", yes: "SABER MAIS" }
            }).show().click('yes', () => {
                window.open('about#plans')
            })
            $('#dialog-box').addClass('school large')
        }
        else if (parseFloat(user.credits) <= 0){
            noCredit()
        }
        else{
            let box = `<div id='fog'>
                <div class='train window'>
                    <div id='title'>
                        <h2>Criar treino</h2>
                    </div>
                    <input id='name' class='input' placeholder='Identificador do treino (nome)' maxlength='50'>
                    <textarea id='desc' class='input' placeholder='Breve descrição...' maxlength='512'></textarea>
                    <div id='options'>
                        <div id='maxtime' class='col'>
                            <span>Tempo máximo do treino</span>
                            <div id='slider'></div>
                        </div>
                        <div id='players' class='col'>
                            <span>Gladiadores por batalha</span>
                            <div id='slider'></div>
                        </div>
                        <div id='weight' class='col'>
                            <span>Peso do treino</span>
                            <div id='slider'></div>
                        </div>
                    </div>
                    <div id='button-container'>
                        <button id='cancel' class='button'>Cancelar</button>
                        <button id='create' class='button'>CRIAR</button>
                    </div>
                </div>
            </div>`
            $('body').append(box);
            
            $( ".train.window #players #slider" ).slider({
                range: "min",
                min: 2,
                max: 5,
                step: 1,
                value: 3,
                create: function( event, ui ) {
                    var val = $(this).slider('option','value');
                    $(this).find('.ui-slider-handle').html(val);
                },
                slide: function( event, ui ) {
                    $(this).find('.ui-slider-handle').each( (index, obj) => {
                        $(obj).html(ui.value);
                    });
                }
            })

            $( ".train.window #maxtime #slider" ).slider({
                range: "min",
                min: 5,
                max: 120,
                step: 5,
                value: 45,
                create: function( event, ui ) {
                    var val = $(this).slider('option','value');
                    $(this).find('.ui-slider-handle').html(val + 'm');
                },
                slide: function( event, ui ) {
                    $(this).find('.ui-slider-handle').each( (index, obj) => {
                        $(obj).html(ui.value + 'm');
                    });
                }
            });

            $( ".train.window #weight #slider" ).slider({
                range: "min",
                min: 0,
                max: 8,
                step: 1,
                value: 1,
                eqValue: [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 10],
                create: function( event, ui ) {
                    let eqValue = $(this).slider('option','eqValue')
                    let value = $(this).slider('option','value')
                    let text = eqValue[value]
                    text = text == 10 ? text : text.toFixed(1)
                    $(this).find('.ui-slider-handle').html(text + 'x')
                },
                slide: function( event, ui ) {
                    $(this).find('.ui-slider-handle').each( (index, obj) => {
                        let eqValue = $(this).slider('option','eqValue')
                        let text = eqValue[ui.value]
                        text = text == 10 ? text : text.toFixed(1)
                        $(obj).html(text + 'x')
                    });
                },
                getWeight: function(){
                    let eqValue = $( ".train.window #weight #slider" ).slider('option','eqValue')
                    let value = $( ".train.window #weight #slider" ).slider('option','value')
                    return eqValue[value]
                }
            });

            $('#fog .train.window').hide().fadeIn();
            $('#fog .train.window #name').focus();

            $('.train.window #cancel').click( function(){
                $('#fog').remove();
            });

            $('.train.window #create').click( async function(){
                var name = $('.train.window #name').val()
                var desc = $('.train.window #desc').val()
                var maxtime = $('.train.window #maxtime #slider').slider('option','value')
                var players = $('.train.window #players #slider').slider('option','value')
                var weight = $('.train.window #weight #slider').slider('option','getWeight')()

                if (name.length < 6){
                    $('.train.window #name').focus();
                    $('.train.window #name').addClass('error');
                    $('.train.window #name').before("<span class='tip'>O identificador precisa ter tamanho 6 ou mais</span>");
                }
                else{
                    let data = JSON.parse(await $.post("back_train.php",{
                        action: "CREATE",
                        name: name,
                        desc: desc,
                        maxtime: maxtime,
                        players: players,
                        weight: weight
                    }))
                    // console.log(data)

                    if (data.status == "NOPREMIUM"){
                        create_toast(`Esta função só pode ser usada por contas verificadas de instituições de ensino`, "error")
                        user.premium = false            
                    }
                    else if (data.status == "NOCREDITS"){
                        create_toast("Você não possui créditos para utilizar essa função", "error")
                        user.credits = 0
                    }
                    else if (data.status == "SUCCESS"){
                        sendChatMessage({text: `/create ${name}_${data.hash} -pvt -d Sala de discussão do treino ${name}`})

                        $('#fog').remove()
                        let box = `
                            <h2>Treino criado</h2>
                            <p>Os mestres de gladiadores podem ingressar no treino</p>
                            <div class='column-list'>
                                <div class='item' id='qrcode'>
                                    <span>Escaneando o QR code em seus celulares</span>
                                    <i class='fas fa-qrcode'></i>
                                </div>
                                <div class='item' id='link'>
                                    <span>Usando o link do treino</span>
                                    <i class='fas fa-link'></i>
                                </div>
                                <div class='item' id='manual'>
                                    <span>Digitando o código do treino</span>
                                    <i class='fas fa-font'></i>
                                </div>
                            </div>
                            <div id='button-container'>
                                <button class='button'>FECHAR</button>
                            </div>
                        `
                        $('body').append(`<div id='fog'><div id='train-message'>${box}</div><div id='big-info'></div></div>`)

                        $('#train-message .button').click( function(){
                            $('#fog').remove()
                        })

                        $('#train-message #qrcode').click(async function(){
                            $('#train-message').hide()

                            var qrcode = new Image()
                            $('#fog').addClass('black')
                            $('#big-info').html("<div id='close'><i class='icon fas fa-times'></i></div><i class='fas fa-spinner fa-pulse'></i>").fadeIn()

                            qrcode.onload = () => {
                                $('#big-info .fa-spinner').remove()
                                $('#big-info').hide().append(qrcode).fadeIn()
                            }
                            qrcode.src = `https://api.qrserver.com/v1/create-qr-code/?data=https://gladcode.dev/train/${data.hash}&size=500x500`

                            $('#fog #close').click( function(){
                                $('#fog').removeClass('black')
                                $('#big-info').hide().html("")
                                $('#train-message').fadeIn()
                            })
                        })

                        $('#train-message #link, #train-message #manual').click(async function(){
                            let prelink = 'https://gladcode.dev/train/'
                            let manualclass = ''
                            let manualtext = ''
                            if ($(this).attr('id') == 'manual'){
                                prelink = ''
                                manualclass = 'manual'
                                manualtext = `<p>Para ingressar no treino acesse no menu BATALHA > Treino de equipes > PARTICIPAR DE TREINO, e informe o código abaixo</p>`
                            }

                            $('#fog').addClass('white')
                            $('#big-info').html(`<i id='close' class='icon fas fa-times'></i>
                                ${manualtext}
                                <div class='row'>
                                    <span class='link ${manualclass}'>${prelink}<b>${data.hash}</b></span>
                                </div>
                                <div id='buttons' class='row'>
                                    <i id='reduce' class='icon fas fa-minus' title='Reduzir fonte'></i>
                                    <i id='copy' class='icon fas fa-copy' title='Copiar link'></i>
                                    <i id='increase' class='icon fas fa-plus' title='Aumentar fonte'></i>
                                </div>
                            `).fadeIn()
                            $('#train-message').hide()

                            $('#fog #close').click( function(){
                                $('#fog').removeClass('white')
                                $('#big-info').hide().html("")
                                $('#train-message').fadeIn()
                            })

                            $('#big-info span, #big-info #copy').click( function(){
                                $('body').append(`<input type='text' id='dummy' readonly value='${$('#big-info .link.manual').text()}'>`)
                                $('#dummy').select();
                                document.execCommand("copy");
                                create_toast("Link do treino copiado para área de transferência", "success");
                                $('#dummy').remove()
                            })

                            $('#big-info #increase').click( function(){
                                let size = parseInt($('#big-info .link').css('font-size').split('px')[0])
                                $('#big-info .link').css({'font-size': parseInt(size * 1.1) + 'px'})
                                
                            })

                            $('#big-info #reduce').click( function(){
                                let size = parseInt($('#big-info .link').css('font-size').split('px')[0])
                                $('#big-info .link').css({'font-size': parseInt(size * 0.9) + 'px'})
                                
                            })
                        })
                    }
                }

            })
        }
    })

    $('#panel #train.wrapper #join').click( async function(){
        var hash = await showInput("Informe o código fornecido para participar do treino", '')
        if (hash === false)
            return

        let data = await $.post("back_train.php", {
            action: "JOIN",
            hash: hash
        })
        // console.log(data)

        data = JSON.parse(data)

        if (data.status == "NOTFOUND")
            showMessage("Treino não encontrado")
        else if (data.status == "STARTED")
            showMessage("Este treino já iniciou");
        else if (data.status == "EXPIRED")
            showMessage("O código para ingresso deste treino expirou")
        else if (data.status == "COLLISION"){
            if (await showDialog(`Colisão de hash. Informar o administrador?`, ["OK", "Cancelar"]) == "OK"){
                $.post("back_message.php", {
                    action: "SEND",
                    id: 277,
                    message: `Sistema - Colisão de hash: training#${hash}`
                })
            }
        }
        else if (data.status == "JOINED"){
            create_toast("Você já está participando deste treino", "info")
            roomList[data.id].show()
        }
        else if (data.status == "ALLOWED"){
            var box = `<div id='fog'>
                <div id='duel-box'>
                    <div id='title'>Escolha o gladiador que participará do treino</div>
                    <div class='glad-card-container'></div>
                    <div id='button-container'>
                        <button id='cancel' class='button'>Cancelar</button>
                        <button id='select' class='button' disabled>SELECIONAR</button>
                    </div>
                </div>
            </div>`;
            $('body').append(box);

            load_glad_cards($('#fog .glad-card-container'), {
                clickHandler: function(){
                    if (!$(this).hasClass('old')){
                        $('#fog #btn-glad-open').removeAttr('disabled');
                        $('#fog .glad-preview').removeClass('selected');
                        $(this).addClass('selected');
                        $('#duel-box #select').removeAttr('disabled');
                    }
                },
                dblClickHandler: function(){
                    if ($('#fog .glad-card-container .selected').length)
                        $('#fog #duel-box #select').click();
                }
            })

            $('#fog #duel-box #cancel').click( function(){
                $('#fog').remove();
            })

            // after selecting glad, finally join
            $('#fog #duel-box #select').click( async function(){
                var myglad = $('#fog .glad-preview.selected').data('id');
                let data = await $.post("back_train.php", {
                    action: "JOIN",
                    hash: hash,
                    glad: myglad
                })
                // console.log(data)
                data = JSON.parse(data)
                if (data.status == "SUCCESS"){
                    create_toast("Você ingressou no treino", "success")
                    $('#fog').remove()
                    if (!roomList[data.id])
                        roomList.create({id: data.id})
                    await roomList[data.id].show()
                    sendChatMessage({text: `/join ${roomList[data.id].name}_${hash}`})
                }
                else
                    create_toast("Erro ao ingressar, tente novamente", "error")
                
            });
        }
    })

    $('#train.wrapper .title #offset button').click( function(){
        let value
        if ($(this).parent().hasClass('part'))
            value = 'part'
        if ($(this).parent().hasClass('manage'))
            value = 'manage'

        if ($(this).attr('id') == 'prev')
            trainList.page[value].offset -= trainList.page.step
        if ($(this).attr('id') == 'next')
            trainList.page[value].offset += trainList.page.step

        trainList.refresh();
    })
})

var trainList = {
    page: {
        manage: {offset: 0},
        part: {offset: 0},
        step: 10
    },
    listening: false,

    refresh: async function(){
        if (!this.listening){
            socket_ready().then( () => {
                socket.emit('training list join', {})
            })
            this.listening = true
        }

        if ($('#panel #battle-mode #train.button').hasClass('selected')){
            let data = await $.post("back_train.php", {
                action: "LIST",
                moffset: this.page.manage.offset,
                poffset: this.page.part.offset
            })
            // console.log(data);

            if ($('#panel #battle-mode #train.button').hasClass('selected')){
                data = JSON.parse(data)

                for (let set of ['manage', 'part']){
                    if (!data[set]){
                        $(`#train.wrapper #table-${set}`).html("").hide()
                        $(`#train.wrapper .title.${set}`).hide()
                    }
                    else if (data[set].length){
                        $(`#train.wrapper #table-${set}`).show()
                        $(`#train.wrapper .title.${set}`).show()

                        this.page[set].offset = parseInt(data.pages[set].offset)
                        this.page[set].total = parseInt(data.pages[set].total)
                        this.page[set].end = Math.min(this.page[set].total, this.page[set].offset + this.page.step)
    
                        $(`#train.wrapper #offset.${set} .start`).html(this.page[set].offset + 1)
                        $(`#train.wrapper #offset.${set} .end`).html(this.page[set].end)
                        $(`#train.wrapper #offset.${set} .total`).html(this.page[set].total)
    
                        $(`#train.wrapper #offset.${set} button`).removeAttr('disabled');
                        if (this.page[set].offset == 0)
                            $(`#train.wrapper #offset.${set} #prev`).prop('disabled', true);
                        if (this.page[set].end == this.page[set].total)
                            $(`#train.wrapper #offset.${set} #next`).prop('disabled', true);
    
                        $(`#train.wrapper #table-${set}`).html(`<div class='row head'><div class='cell'>Identificador</div><div class='cell'>Descrição</div><div class='cell'>Mestres</div>${set == 'manage' ? `<div class='cell'></div>` : ''}</div>`);
                        for (let row of data[set]){
                            $(`#train.wrapper #table-${set}`).append(`<div class='row'>
                                <div class='cell' id='name'>${row.name}</div>
                                <div class='cell'>${row.description}</div>
                                <div class='cell'>${row.masters}</div>
                                ${set == 'manage' ? `<div class='cell actions'><i title='Remover treino' class='remove fas fa-times'></i></div>` : ''}
                            </div>`)
                            $(`#train.wrapper #table-${set} .row`).last().data('id', row.id)
                            if (!roomList[row.id])
                                roomList.create(row)
                        }
        
                    }
                }
            
                $('#train.wrapper .table .row').not('.head').click( function(){
                    let id = $(this).data('id')
                    roomList[id].show()
                })

                $('#train.wrapper .table .row .actions .remove').click( async function(e){
                    e.stopPropagation()
                    let id = $(this).parents('.row').data('id')
                    let name = $(this).parents('.row').find('#name').text()
                    new Message({
                        message: `Deseja realmente excluir o treino <b>${name}</b>? Esta operação é irreversível`,
                        buttons: {yes: "SIM", no: "NÃO"}
                    }).show().click('yes', async () => {
                        input.show().click('ok', async data => {
                            if (data.input == name){
                                data = await post("back_train.php", {
                                    action: "REMOVE",
                                    id: id
                                })
                                // console.log(data)
                                if (data.status == "SUCCESS"){
                                    new Message({message: `O treino foi removido com sucesso`}).show()
                                }
                            }
                            else{
                                new Message({message: `O nome informado não confere`}).show()
                            }
                        })
                    })

                    let input = new Message({
                        message: `Para confirmar a remoção, informe o nome do treino`,
                        buttons: {ok: "OK", cancel: "CANCELAR"},
                        input: true
                    })
                })  
            }
    
            if (data.redirect){
                roomList[data.redirect].show()
            }

        }
    }
}

var roomList = {
    create: function(info){
        this[info.id] = {
            id: info.id,
            show: async function(){
                var id = this.id
                let data = JSON.parse(await $.post("back_train.php", {
                    action: "ROOM",
                    id: id
                }))
                // console.log(data)
                this.name = data.name
                this.hash = data.hash
                this.description = data.description
                this.players = data.players

                if (data.status == "STARTED"){
                    window.open(`train/${data.hash}`)
                }
                else if (data.status == "MANAGE" || data.status == "PARTICIPATE"){
                    var manager = false
                    if(data.status == "MANAGE")
                        manager = true
            
                    this.manager = manager
                    $('body').append(`<div id='fog'>
                        <div class='train window'>
                            <div id='title'><h2>Treino<span id='train-name' class='edit' data-field='name'>${data.name}</span></h2></div>
                            <div id='train-desc' class='edit' data-field='description'>${data.description}</div>
                            <h3>Participantes: <span id='count'></span></h3>
                            <div class='table'></div>
                            <div id='options-container'>
                                <div>
                                    <div id='qr' class='blur'></div>
                                    <div id='link'>https://gladcode.dev/train/</div>
                                </div>
                                <div id='time-container'>
                                    <span>Tempo máximo do treino</span>
                                    <span id='maxtime'>${data.maxtime}m</span>
                                </div>
                                <div id='player-container'>
                                    <span>Batalhas compostas por <span id='players'>${data.players}</span><span id='pl-second'></span> mestres</span>
                                </div>
                            </div>
                            <div id='button-container'>
                                <button id='delete' class='button' hidden>REMOVER</button>
                                <button id='start' class='button' disabled>INICIAR TREINO</button>
                                <button id='close' class='button'>FECHAR</button>
                            </div>
                        </div>
                    </div>`);
            
                    if (manager){
                        if ($('.train.window #train-desc').text().length == 0){
                            $('.train.window #train-desc').html("Adicione uma descrição")
                        }
                    }
                    else{
                        $('.train.window .edit').removeClass('edit')
                        $('.train.window #qr').parent().remove()
                        $('.train.window #start').hide()
                        $('.train.window #delete').html("ABANDONAR TREINO").show()

                        $('.train.window #delete').click( async () => {
                            if (await showDialog(`Abandonar o treino <b>${data.name}</b>?`, ["Sim", "Não"]) == "Sim"){
                                this.left = true

                                $.post("back_train.php", {
                                    action: "KICK",
                                    id: id,
                                    myself: true
                                })

                                sendChatMessage({text: `/leave ${this.name}_${this.hash}`})
                            }

                        })
                    }
            
                    $('.train.window .edit').attr('title', "Clique para alterar")
            
                    let qrcode = new Image()
                    if (!data.expired){
                        qrcode.src = `https://api.qrserver.com/v1/create-qr-code/?data=https://gladcode.dev/train/${data.hash}&size=500x500`
                        
                        $('.train.window #link').before(`<button id='renew'><i class='fas fa-spinner fa-pulse'></i></button>`)
            
                        qrcode.onload = function(){
                            $('.train.window #qr').html(qrcode).attr('title', "Apliar QR code").removeClass('blur')
                            $('.train.window #link').append(`<span>${data.hash}</span>`)
                            $('.train.window #renew').remove()
                            showQR($('.train.window #qr img').clone())
                        }
                    }
                    else{
                        $('.train.window #qr').html(`<i id='fake-qr' class='fas fa-qrcode'></i>`)
                        $('.train.window #link').append(`<span class='blur'>XXXX</span>`).before(`<button id='renew' title='Renovar link'><i class='fas fa-redo'></i></button>`)
                    }
            
                    $('.train.window #close').click( function(){
                        $('#fog').remove()

                        if (socket)
                            socket.emit('training room leave', {id: id})
                    })
            
                    $('.train.window .edit').click( function(){
                        var textEdit = {
                            object: $(this),
                            text: $(this).html(),
                            fontSize: $(this).css('font-size'),
                            field: $(this).data('field'),
                            width: $(this).outerWidth(),
                            height: $(this).outerHeight(),
            
                            create: function(){
                                this.object.after(`<textarea id='input-edit'>${this.text}</textarea>`).addClass('hidden')
                                this.input = $('.train.window #input-edit')
                                this.input.css({
                                    'font-size': this.fontSize,
                                    'width': this.width + 70,
                                    'height': this.height
                                }).focus().select()
            
                                this.input.focusout( () => {
                                    let newtext = this.input.val()
                                    if (newtext != this.text)
                                        this.post()
                                    else
                                        this.cancel()
                                })
                    
                                this.input.keyup( e => {
                                    if (e.keyCode == 27 || (e.keyCode == 13 && this.input.val().trim() == this.text))
                                        this.cancel()
                                    else if (e.keyCode == 13)
                                        this.post()
                                    
                                })
                            },
            
                            post: async function(){
                                let oldtext = this.text
                                this.text = this.input.val().trim()
                                this.input.remove()
                                this.object.html(this.text).removeClass('hidden')
                                let oldname = roomList[id].name
            
                                let data = JSON.parse(await $.post("back_train.php", {
                                    action: "EDIT",
                                    id: id,
                                    field: this.field,
                                    value: this.text
                                }))
                                // console.log(data)
                                if (data.status == "ERROR"){
                                    create_toast(data.message, "error")
                                    this.object.html(oldtext)
                                }
                                else if (data.status == "SUCCESS"){
                                    create_toast(`Campo alterado com sucesso`, "success")
                                    roomList[id][this.field] = this.text
                                    if (this.field == 'name'){
                                        sendChatMessage({text: `/edit -r ${oldname}_${roomList[id].hash} -n ${this.text}_${roomList[id].hash} -d Sala de discussão do treino ${this.text}`})
                                    }
                                }
                            },
            
                            cancel: function(){
                                this.input.remove()
                                this.object.html(this.text).removeClass('hidden')
                            }
                        }
            
                        textEdit.create()
                    })
            
                    $('.train.window #renew').click( async e => {
                        let renew = $(e.currentTarget)
                        renew.find('i').remove()
                        renew.append(`<i class='fas fa-spinner fa-pulse'></i>`)
                        let data = JSON.parse(await $.post("back_train.php", {
                            action: "RENEW",
                            id: id
                        }))
                        // console.log(data)
                        if (data.status == "SUCCESS"){
                            let qrcode = new Image()
                            qrcode.src = `https://api.qrserver.com/v1/create-qr-code/?data=https://gladcode.dev/train/${data.hash}&size=500x500`
                            qrcode.onload = () => {
                                $('.train.window #qr').html(qrcode).removeClass('blur')
                                $('.train.window #qr').attr('title', 'Ampliar QR code')
                                $('.train.window #link span').html(data.hash).removeClass('blur')
                                $('.train.window #renew').remove()
                                showQR($('.train.window #qr img').clone())
                                sendChatMessage({text: `/edit -r ${this.name}_${this.hash} -n ${this.name}_${data.hash}`})
                                this.hash = data.hash
                            }
                        }
                    })

                    if (socket)
                        socket.emit('training room join', {id: id})

                    this.refresh()
                }
            },

            refresh: async function(){
                var id = this.id

                let data = JSON.parse(await $.post("back_train.php", {
                    action: "ROOM",
                    id: id
                }))
                // console.log(data)

                if (data.status == "NOTFOUND"){
                    $('#fog').remove()
                    showMessage("O treino foi removido pelo gerenciador")
                }
                if (data.status == "STARTED"){
                    $('#fog').remove()
                    await showMessage("O treino foi iniciado. Clique para ir até ele")
                    window.open(`train/${data.hash}`)
                }
                else if (data.status == "NOTALLOWED"){
                    $('#fog').remove()
                    if (this.left){
                        create_toast("Você saiu do treino", "success")
                        this.left = false
                    }
                    else{
                        showMessage("Você foi removido do treino")
                    }
                    if (socket)
                        socket.emit('training room leave', {id: id})
                }
                else if (data.status == "MANAGE" || data.status == "PARTICIPATE"){
                    let manager = false
                    if (data.status == "MANAGE")
                        manager = true

                    this.manager = manager
                    $('.train.window #train-name').html(data.name)
                    if (data.description.length > 0)
                        $('.train.window #train-desc').html(data.description)

                    if (!data.expired && $('.train.window #link span').html() != data.hash){
                        let qrcode = new Image()
                        qrcode.src = `https://api.qrserver.com/v1/create-qr-code/?data=https://gladcode.dev/train/${data.hash}&size=500x500`
                        qrcode.onload = function(){
                            $('.train.window #qr').html(qrcode).attr('title', "Apliar QR code").removeClass('blur')
                            $('.train.window #link span').html(data.hash).removeClass('blur')
                            $('.train.window #renew').remove()
                            showQR($('.train.window #qr img').clone())
                        }
                    }
            
                    let nglads = data.glads.length
                    if (nglads == 0){
                        $('.train.window .table').html("<div class='row'>Nenhum participante</div>");
                        $('.train.window h3 #count').html("");
            
                        if (manager){
                            $('.train.window #start').hide()
                            $('.train.window #delete').show().off().click( async () => {
                                if (await showDialog(`Deseja excluir o treino ${data.name}?`, ["Sim", "Não"]) == "Sim"){
                                    let data = JSON.parse(await $.post("back_train.php", {
                                        action: "DELETE",
                                        id: id
                                    }))
                                    // console.log(data)
            
                                    if (data.status == "SUCCESS"){
                                        $('#fog').remove()
                                        create_toast("Treino removido", "success")

                                        sendChatMessage({text: `/leave ${this.name}_${this.hash}`})
                                    }
                                }
                            })
                        }
                    }
                    else {
                        let players = parseInt(this.players)
                        let ngroups = Math.ceil(nglads / players)
                        let lower = Math.floor(nglads / ngroups)
                        let higher = Math.ceil(nglads / ngroups)

                        if (lower == higher && lower == players){
                            $('.train.window #player-container #players').html(lower)
                            $('.train.window #player-container #pl-second').html("")
                        }
                        else if (lower == players){
                            $('.train.window #player-container #players').html(lower)
                            $('.train.window #player-container #pl-second').html(`e ${higher}`)
                        }
                        else if (higher == players){
                            $('.train.window #player-container #players').html(higher)
                            $('.train.window #player-container #pl-second').html(`e ${lower}`)
                        }
                        else{
                            $('.train.window #player-container #players').html("")
                            if (lower == higher){
                                $('.train.window #player-container #pl-second').html(lower)
                            }
                            else{
                                $('.train.window #player-container #pl-second').html(`${lower} e ${higher}`)
                            }
                        }

                        $('.train.window .table').html("<div class='row head'><div class='cell'>Mestre</div><div class='cell'>Gladiador</div></div>");
                        for (let glad of data.glads){
                            $('.train.window .table').append(`<div class='row'><div class='cell'>${glad.master}</div><div class='cell'>${glad.gladiator}</div><div class='kick' title='Expulsar participante'><i class='fas fa-times-circle'></i></div></div>`);
                            $('.train.window .table .row').last().data('id', glad.id)
            
                            if (glad.mine)
                                $('.train.window .table .row').last().addClass('signed')
                        }
            
                        $('.train.window h3 #count').html(data.glads.length);
            
                        if (manager){
                            $('.train.window #start').show()
                            $('.train.window #delete').hide()

                            if (data.glads.length >= this.players){
                                $('.train.window #start').removeAttr('disabled').off().click( async function(){
                                    if (await showDialog("Deseja iniciar o treino? Após o início, os participantes não poderão ser alterados",["Sim","Não"]) == "Sim"){
                                        $('.train.window #close').click();

                                        let data = JSON.parse(await $.post("back_train.php",{
                                            action: "START",
                                            id: id
                                        }))
                                        //console.log(data);

                                        if (data.status == "SUCCESS"){
                                            create_toast("Treino iniciado", "success")
                                            window.open(`train/${data.hash}`);
                                        }
                                    }
                                });
                            }
                            else
                                $('.train.window #start').attr('disabled', true).off()
                        }
                        
                        if (manager){
                            $('.train.window .table .kick').click(async e => {
                                let kick = $(e.currentTarget)
                                let gladid = kick.parents('.row').data('id')
                                
                                let data = JSON.parse(await $.post("back_train.php", {
                                    action: "KICK",
                                    glad: gladid,
                                    id: id
                                }))
                                // console.log(data)
                                if (data.status == "SUCCESS"){
                                    create_toast("Participante removido", "success")
                                    let name = kick.parent().find('.cell').eq(0).html()
                                    sendChatMessage({text: `/kick ${name} -r ${this.name}_${this.hash}`})
                                }
                            })
                        }
                        else{
                            $('.train.window .table .kick').remove()
        
                            $('.train.window .table .row.signed').click( function(){
                                var box = `<div id='fog'>
                                    <div id='duel-box'>
                                        <div id='title'>Escolha o gladiador que participará do treino</div>
                                        <div class='glad-card-container'></div>
                                        <div id='button-container'>
                                            <button id='cancel' class='button'>Cancelar</button>
                                            <button id='select' class='button' disabled>SELECIONAR</button>
                                        </div>
                                    </div>
                                </div>`;
                                $('body').append(box);
                    
                                load_glad_cards($('#fog .glad-card-container'), {
                                    clickHandler: function(){
                                        if (!$(this).hasClass('old')){
                                            $('#fog #btn-glad-open').removeAttr('disabled');
                                            $('#fog .glad-preview').removeClass('selected');
                                            $(this).addClass('selected');
                                            $('#duel-box #select').removeAttr('disabled');
                                        }
                                    },
                                    dblClickHandler: function(){
                                        if ($('#fog .glad-card-container .selected').length)
                                            $('#fog #duel-box #select').click();
                                    }
                                })
                    
                                $('#fog #duel-box #cancel').click( function(){
                                    $(this).parents('#fog').remove();
                                })
                    
                                $('#fog #duel-box #select').click( async function(){
        
                                    var myglad = $('#fog .glad-preview.selected').data('id');
                                    let data = await $.post("back_train.php", {
                                        action: "CHANGE",
                                        glad: myglad,
                                        id: id
                                    })
                                    // console.log(data)
                                    data = JSON.parse(data)
                                    if (data.status == "SUCCESS"){
                                        $(this).parents('#fog').remove()
                                        create_toast("Gladiador alterado", "success")
                                        roomList[id].refresh()
                                    }
                                    else
                                        create_toast("ERRO", "error")
                                    
                                });
                            })
                        }
                    }
                }
            }

        },

        showQR = function(qrcode){
            $('.train.window #qr').click( function(){
                $('#fog .window').hide()
                if ($('#fog #big-info').length == 0){
                    $('#fog').append("<div id='big-info'><div id='close'><i class='icon fas fa-times'></i></div></div>").addClass('black')
                    $('#fog #big-info').append(qrcode).hide().fadeIn()
        
                    $('#fog #big-info #close').click( function(){
                        $('#fog #big-info').hide()
                        $('#fog').removeClass('black')
                        $('#fog .window').fadeIn()
                    })
                }
                else{
                    $('#fog').addClass('black')
                    $('#fog #big-info').fadeIn()
                }
                
            })
        
        }
    }
}