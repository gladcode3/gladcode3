$(document).ready(async function(){
    // got here from train link
    let hash = $('#hash').html()
    let round = $('#round').html()
    $('#hash, #round').remove()

    if (hash){
        await waitLogged()
        if (user.status == "NOTLOGGED"){
            let data = await showDialog("Você precisa realizar o login para ingressar em um treino", ["Login", "Não"])
            if (data == "Não")
                window.location.href = ''
            else if (data == "Login"){
                await googleLogin()
                window.location.reload()
            }
        }

        let data = await post("back_train.php", {
            action: "JOIN",
            hash: hash
        })
        // console.log(data)
        
        let message
        let redirect = true
        
        if (data.status == "JOINED"){
            window.location.href = 'battle.train'
        }
        else if (data.status == "NOTFOUND"){
            message = "Treino não encontrado"
        }
        else if (data.status == "EXPIRED"){
            message = "O código para ingresso deste treino expirou"
        }
        else if (data.status == "ALLOWED"){
            redirect = false
            selectedGlad.choose(hash)
        }
        else if (data.status == "STARTED"){
            redirect = false

            training.round = round
            training.hash = hash
            await training.show()
        }

        if (redirect){
            let msgbox = showMessage(message)
            $('#fog').addClass('black')
            await msgbox
            window.location.href = "battle.train"
        }
    }
    else
        window.location.href = ''

    socket_ready().then( () => {
        socket.emit('training run join', {
            hash: hash
        });
        socket.on('training refresh', () => {
            if (!training.refreshCalls)
                training.refreshCalls = 0
            
            if (training.refreshCalls == 0){
                setTimeout(() => {
                    training.refreshCalls = 0
                    training.refresh()
                }, 500)
            }
            training.refreshCalls++
        });
        socket.on('training end', () => {
            window.location.href = `train/${training.hash}/0`
        });

        init_chat($('#chat-panel'), {
            full: false,
            defaultOpen: 900
        });
    })

})

var selectedGlad = {
    choose: async function(hash){
        this.hash = hash
        var box = `<div id='fog'>
            <div class='glad-box'>
                <div id='title'>Escolha o gladiador que participará do treino</div>
                <div class='glad-card-container'></div>
                <div id='button-container'>
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
                    $('.glad-box #select').removeAttr('disabled');
                }
            },
            dblClickHandler: function(){
                if ($('#fog .glad-card-container .selected').length)
                    $('#fog .glad-box #select').click();
            }
        })
        $('#fog').addClass('black')

        $('#fog .glad-box #select').click( async function(){
            let glad = $('#fog .glad-preview.selected').data('id')
            let data = JSON.parse(await $.post("back_train.php", {
                action: "JOIN",
                hash: hash,
                glad: glad,
                redirect: true
            }))
            // console.log(data)

            if (data.status == "SUCCESS"){
                $('.glad-box').hide()
                await showMessage("Você ingressou no treino")
                window.location.href = 'battle.train'
                sendChatMessage({text: `/join ${data.name}_${hash}`})
            }
        });
    }
}

var training = {}

training.show = async function(){
    let data = await post("back_training_run.php", {
        action: "GET",
        hash: this.hash,
        round: this.round
    })
    // console.log(data)

    if (data.status == "REDIRECT")
        window.location.href = `train/${this.hash}/${data.round}`

    for (let f in data)
        this[f] = data[f]

    if (data.status == "END"){
        $('#content-box').html("<h1>Classificação final</h1><h3>O treino <span id='tourn-name'>"+ this.name +"</span> chegou ao fim e esta foi a classificação obtida pelos participantes</h3><div id='ranking-container'><div class='head'><div class='score' title='Pontuação obtida no treino'><i class='fas fa-star'></i></div><div class='time' title='Tempo médio sobrevivido'><i class='fas fa-clock'></i></div></div></div><div id='button-container'><button id='back-round' class='button'>RODADA ANTERIOR</button></div>");

        for (let i in data.ranking){
            let c = parseInt(i)+1
            let score = data.ranking[i].score%1 ? parseFloat(data.ranking[i].score).toFixed(1) : parseInt(data.ranking[i].score)
            let time = parseFloat(data.ranking[i].time).toFixed(1)
            $('#content-box #ranking-container').append(`<div class='team'><div class='ordinal'>${c}º</div><div class='name'>${data.ranking[i].apelido} - ${data.ranking[i].name}</div><div class='score'>${score}</div><div class='score'>${time}</div></div>`);

            if (c == 1)
                $('#content-box #ranking-container .team').last().addClass('gold');
            else if (c == 2)
                $('#content-box #ranking-container .team').last().addClass('silver');
            else if (c == 3)
                $('#content-box #ranking-container .team').last().addClass('bronze');
        }
        $('#content-box #ranking-container .team.gold .ordinal').html("<img class='icon' src='icon/gold-medal.png'>");
        $('#content-box #ranking-container .team.silver .ordinal').html("<img class='icon' src='icon/silver-medal.png'>");
        $('#content-box #ranking-container .team.bronze .ordinal').html("<img class='icon' src='icon/bronze-medal.png'>");

        $('#content-box #back-round').click( () => {
            window.location.href = `train/${this.hash}/${parseInt(this.maxround)-1}`
        });
    }
    else{
        $('#content-box').html(`<h1>Treino <span id='tourn-name'>${this.name}</span></h1><h3 id='tourn-desc'>${this.description}</h3><div id='group-container'></div>`)

        // build teams and groups table
        let i = 0
        for (let gid in this.groups){
            $('#content-box #group-container').append(`<div class='group'>
                <div class='head'>
                    <div class='icons'>
                        <div title='Pontuação total até o momento'><i class='fas fa-trophy'></i></div>
                    </div>
                    <div class='title'>Grupo ${i+1} - <span>Rodada ${this.round}</span></div>
                    <div class='icons'>
                        <div class='glad' title='Pontuação da última rodada'><i class='fas fa-star'></i></div>
                        <div class='time' title='Quantos segundos o gladiador sobreviveu'><i class='fas fa-clock'></i></div>
                    </div>
                </div>
                <div class='teams-container'></div>
                <div class='foot'><button class='button' disabled></button><div class='rerun hidden' title='Executar simulação'><i class='fas fa-redo'></i></div></div>
            </div>`);
            $('#content-box #group-container .group').eq(i).data('id', gid);

            for (let tid in this.groups[gid]){
                let team = this.groups[gid][tid]
                let myteamclass = '';
                if (team.myteam == true){
                    myteamclass = 'myteam';
                }

                $('#content-box #group-container .group .teams-container').eq(i).append(`<div class='team ${myteamclass}'>
                    <div class='score'>${parseInt(team.score)}</div>
                    <div class='name'>${team.master} - ${team.gladiator}</div>
                    <div class='info'>
                        <div class='glad'>0</div>
                        <div class='time'>-</div>
                    </div>
                </div>`);
                $('#content-box #group-container .group').eq(i).find('.team').last().data('id', tid);
            }

            i++
        }

        // buld countdown and link to other rounds
        $('#content-box').append(`
            <div id='time-container'>
                <div class='timeleft round' title='Tempo máximo restante até o fim da rodada'>
                    <div class='title'>FIM DA RODADA</div>
                    <div id='time'>
                        <div class='numbers'><span>-</span><span>-</span></div>:
                        <div class='numbers'><span>-</span><span>-</span></div>:
                        <div class='numbers'><span>-</span><span>-</span></div>
                    </div>
                    <div id='text'><span>HRS</span><span>MIN</span><span>SEG</span></div>
                </div>
                <div class='timeleft train' title='Tempo máximo restante até o fim do treino'>
                    <div class='title'>FIM DO TREINO</div>
                    <div id='time'>
                        <div class='numbers'><span>-</span><span>-</span></div>:
                        <div class='numbers'><span>-</span><span>-</span></div>:
                        <div class='numbers'><span>-</span><span>-</span></div>
                    </div>
                    <div id='text'><span>HRS</span><span>MIN</span><span>SEG</span></div>
                </div>
            </div>
            <div id='button-container' class='train'>
                <button class='arrow' id='back-round' title='Rodada anterior' disabled>
                    <i class='fas fa-chevron-left'></i>
                </button>
                <button id='prepare' class='button' disabled>ENCERRAR RODADA</button>
                <button class='arrow' id='next-round' title='Próxima rodada' disabled>
                    <i class='fas fa-chevron-right'></i>
                </button>
            </div>
        `);

        if (this.manager){
            $('#content-box #prepare').removeAttr('disabled');
            $('#content-box #prepare').off().click( () => {
                if (!$('#content-box #prepare').attr('disabled')){
                    $('#content-box #prepare').html("AGUARDE...").attr('disabled', true);

                    post("back_training_run.php", {
                        action: "DEADLINE",
                        hash: this.hash,
                        time: 0,
                        round: this.round
                    }).then( data => {
                        // console.log(data)
                    })
                }
            })

            $('#group-container .foot .rerun').off().click( e => {
                let group = $(e.currentTarget).parents('.group')
                let id = group.data('id')
                post("back_training_run.php", {
                    action: "RERUN",
                    hash: this.hash,
                    group: id
                }).then( data => {
                    // console.log(data)
                    if (data.status == "SUCCESS"){
                        let button = group.find('.foot .button')
                        if (!button.data('try')){
                            button.data('try', '1')
                        }
                        else{
                            let btry = parseInt(button.data('try'))
                            button.data('try', btry + 1)
                        }
                        button.attr('disabled', true).html(`Grupo pronto. Organizando batalha... ${button.data('try')}`);
                        this.groups[id].log = false
                    }
                })
            })

            if (this.deadline === null){
                let click = showDialog(`
                    <span>Quanto tempo até o início das batalhas da rodada ${this.round}?</span>
                    <div id='slider'></div>
                `, ["OK", "Cancelar"])

                var roundTime
                $('#dialog-box #slider').slider({
                    range: "min",
                    min: 0,
                    max: 15,
                    step: 1,
                    value: 5,
                    create: function( event, ui ) {
                        var val = $(this).slider('option','value');
                        $(this).find('.ui-slider-handle').html(val + 'm');
                        roundTime = val
                    },
                    slide: function( event, ui ) {
                        $(this).find('.ui-slider-handle').each( (index, obj) => {
                            $(obj).html(ui.value + 'm');
                            roundTime = ui.value
                        });
                    }
                })

                if (await click == 'OK'){
                    post("back_training_run.php", {
                        action: "DEADLINE",
                        hash: this.hash,
                        time: roundTime,
                        round: this.round
                    }).then( data => {
                        // console.log(data)
                    })
                }
            }
        }
        else if (!this.manager || this.end){
            $('#content-box #prepare').remove();
            $('#button-container .arrow').addClass('nobutton');
            $('#group-container .foot .rerun').remove();
        }

        this.counting = { train: 0, round: 0 }
        if (!this.end)
            this.countDown({mode: 'train'})
        this.refresh({start: true})
    }
}

training.countDown = function({timestart, mode}){
    var startCountTime = new Date()

    if (!mode)
        mode = 'round'

    let timers = {
        train: this.train_deadline,
        round: this.deadline
    }

    var serverleft = new Date(timers[mode]) - new Date(this.now)
    if (!timestart)
        timestart = new Date()

    if (this.counting[mode] <= 1){
        this.counting[mode]++

        let timediff = serverleft - (new Date() - timestart)
        let timeleft = msToTime(timediff)

        $(`.timeleft.${mode} .numbers`).each( function(index, obj){
            if (parseInt(timeleft[index]) != parseInt($(obj).text())){
                $(obj).find('span').eq(0).html(timeleft[index].toString()[0])
                $(obj).find('span').eq(1).html(timeleft[index].toString()[1])
            }
        });

        if (parseInt(timeleft[0]) == 0){
            if (parseInt(timeleft[1]) < 10)
                $(`.timeleft.${mode}`).removeClass('yellow').addClass('red')
            else
                $(`.timeleft.${mode}`).removeClass('green').addClass('yellow')
        }
        else
            $(`.timeleft.${mode}`).addClass('green')
        
        if ($('#group-container .team .icon.green').length == $('#group-container .team').length)
            $(`.timeleft.${mode} .numbers span`).html('0')

        if (timediff > 0){
            let skipTime = 1000 - (new Date() - startCountTime)
            setTimeout( () => {
                this.counting[mode]--
                this.countDown({timestart: timestart, mode: mode})
            }, skipTime)
        }
        else{
            this.refresh()
        }
    }

    function msToTime(ms) {
        var s = Math.floor(ms / 1000);
        var m = Math.floor(s / 60);
        s = s % 60;
        var h = Math.floor(m / 60);
        m = m % 60;
      
        if (h < 0)
            h = '00'
        else if (h < 10)
            h = '0' + h;
        
        if (m < 0)
            m = '00'
        else if (m < 10)
            m = '0' + m;
    
        if (s < 0)
            s = '00'
        else if (s < 10)
            s = '0' + s;
            
        return [h,m,s];
    }
}

training.refresh = async function(args){
    let data = await post("back_training_run.php", {
        action: "REFRESH",
        hash: this.hash,
        round: this.round
    })
    // console.log(data)

    this.now = data.now
    this.deadline = data.deadline

    if (data.end){
        this.end = data.end
        $('#content-box #prepare').html("FIM DO TREINO").off().click( () => {
            window.location.href = `train/${this.hash}/0`
        })

        if (this.round == data.maxround)
            window.location.reload()
    }
    
    for (let gid in this.groups){
        let group = this.groups[gid]
        if (data.groups[gid].locked){
            group.locked = true
            $('.group .rerun').removeClass('hidden')
        }
        if (data.groups[gid].log){
            group.log = data.groups[gid].log
            for (let ti in group){
                group[ti].score = data.groups[gid][ti].score
                group[ti].time = data.groups[gid][ti].time
            }
        }

        if (!$('#content-box #prepare').attr('disabled') && group.locked)
            $('#content-box #prepare').off().html("AGUARDE...").attr('disabled', true)
    }

    this.finished = 0
    $('#content-box #group-container .group').each( async (i, obj) => {
        obj = $(obj)
        const id = obj.data('id')

        if (this.groups[id].log){
            this.finished++
            if (args && args.start)
                revealInfo(obj)

            obj.find('.foot .button').removeAttr('disabled').html("VISUALIZAR BATALHA");
            obj.find('.foot .button').click( () => {
                window.open('play/'+ this.groups[id].log);
                setTimeout(() => {
                    revealInfo(obj)
                }, 1500)
            });
        }
        else if (this.groups[id].locked){
            obj.find('.foot .button').html("Grupo pronto. Organizando batalha...");
        }
    })

    if (data.status == "SUCCESS" && !data.end){
        this.countDown({})
    }
    else{
        if (data.status == "RUN" && !data.end){
            const gid = data.run
            let sim = new Simulation({
                training: gid,
                origin: "train"
            })
            await socket_ready()
            socket.emit('tournament run request', {
                hash: this.hash,
                group: gid
            }, async data => {
                // console.log(data);
                if (data.permission == 'granted'){
                    let d = new Date().getTime()
                    sim.run().then( data => {
                        // console.log(data)
                        $('#content-box #group-container .group').each( (_,obj) => {
                            let id = $(obj).data('id')
                            if (data.error.length && parseInt(id) == parseInt(gid)){
                                // this 5s time is to avoid permission denied from node
                                setTimeout( () => {
                                    $(obj).find('.foot .rerun').click()
                                }, 5000 - (new Date().getTime() - d))
                            }
                        })    
                    })
                }
            })
        }
        else if (data.status == "LOCK"){
            if (this.finished == Object.keys(this.groups).length)
                setTimeout(() => this.refresh(), 2000)
        }
        else if (data.status == "DONE"){
            $('#button-container #next-round').removeAttr('disabled').click( () => {
                window.location.href = `train/${this.hash}/${parseInt(this.round)+1}`
            })
            $('#content-box #prepare').removeAttr('disabled').html("ENCERRAR TREINO").off().click( () => {
                post("back_training_run.php", {
                    action: "DEADLINE",
                    hash: this.hash
                }).then( data => {
                    // console.log(data)
                })
            })

            if (data.newround){
                await socket_ready()
                socket.emit('tournament run request', {
                    hash: this.hash,
                    group: 'newround'
                }, async data => {
                    // console.log(data);
                    if (data.permission == 'granted'){
                        post("back_training_run.php", {
                            action: "NEW ROUND",
                            hash: this.hash,
                            round: this.round
                        }).then( data => {
                            // console.log(data)
                        })
                    }
                })
            }
        }
    }

    if (this.round > 1){
        $('#button-container #back-round').removeAttr('disabled').click( () => {
            window.location.href = `train/${this.hash}/${parseInt(this.round)-1}`
        })
    }
}

function revealInfo(obj){
    const id = obj.data('id')
    obj.find('.team').each( (_,team) => {
        const tid = $(team).data('id')
        const score = parseFloat(training.groups[id][tid].score)
        const time = parseFloat(training.groups[id][tid].time).toFixed(1)

        if (score == 10)
            $(team).find('.glad').html(score)
        else
            $(team).find('.glad').html(score.toFixed(1))

        if (time > 1000)
            $(team).find('.time').html(`<img class='win' src='icon/winner-icon.png'>`)
        else
            $(team).find('.time').html(time +'s')
    })
}