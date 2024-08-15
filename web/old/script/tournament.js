var hash, round, isManager;

$(document).ready( function() {
    hash = $('#hash').html();
    round = $('#round').html();
    $('#hash, #round').remove();

    socket_ready().then( () => {
        socket.emit('tournament run join', {
            hash: hash
        });
        socket.on('tournament refresh', data =>{
            refresh_round();
        });
    });

    $.post("back_tournament_run.php", {
        action: "GET",
        hash: hash,
        round: round
    }).done( function(data){
        // console.log(data);
        data = JSON.parse(data);

        if (data.status == "REDIRECT"){
            window.location.href = 'tourn/'+ hash +'/'+ data.round;
        }
        else if (data.status == "NOTFOUND"){
            window.location.href = 'index';
        }
        else if (data.status == "END"){
            $('#content-box').html("<h1>Classificação final</h1><h3>O torneio <span id='tourn-name'>"+ data.tournament +"</span> chegou ao fim e esta foi a classificação obtida pelas equipes</h3><div id='ranking-container'></div><div id='button-container'><button id='back-round' class='button'>RODADA ANTERIOR</button></div>");

            for (let i in data.ranking){
                var c = parseInt(i)+1;
                $('#content-box #ranking-container').append("<div class='team'><div class='ordinal'>"+ c +"º</div><div class='name'>"+ data.ranking[i] +"</div></div>");

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

            $('#content-box #back-round').click( function(){
                window.location.href = 'tourn/'+ hash +'/'+ data.maxround;
            });
        }
        else{
            $('#content-box').html("<h1>Torneio <span id='tourn-name'>"+ data.tournament.name +"</span></h1><h3 id='tourn-desc'>"+ data.tournament.description +"</h3><div id='group-container'></div>");

            var hasteam = false;
            var groupindex = 0;
            var groups = {};
            for (let i in data.teams){
                var groupid = data.teams[i].group;

                if (!(data.teams[i].group in groups)){
                    groups[groupid] = groupindex;
                    $('#content-box #group-container').append("<div class='group'><div class='head'><div class='title'>Grupo "+ parseInt(groupindex+1) +" - <span>Rodada "+ data.tournament.round +"</span></div><div class='icons'><div class='glad' title='Quantos gladiadores da equipe ainda restam'><img src='icon/gladcode_icon.png'></div><div class='time' title='Quantos segundos o gladiador da equipe sobreviveu'><img src='icon/clock-icon.png'></div></div></div><div class='teams-container'></div><div class='foot'><button class='button' disabled>Aguardando <span class='number'></span> mestre<span class='plural'>s</span></button></div></div>");
                    $('#content-box #group-container .group').eq(groupindex).data('id', groupid);
                    groupindex++;
                }

                var myteamclass = '';
                var myteam;
                if (data.teams[i].myteam == true){
                    myteamclass = 'myteam';
                    hasteam = true;
                    myteam = data.teams[i].name;
                }

                $('#content-box #group-container .group .teams-container').eq(groups[groupid]).append(`<div class='team ${myteamclass}'>
                    <div class='icon'><i class='far fa-hourglass'></i></div>
                    <div class='name'>${data.teams[i].name}</div>
                    <div class='info'>
                        <div class='glad'>
                            <div class='g-bar'></div>
                            <div class='g-bar'></div>
                            <div class='g-bar'></div>
                        </div>
                        <div class='time'>-</div>
                    </div>
                </div>`);
                $('#content-box #group-container .group').eq(groups[groupid]).find('.team').last().data('id', data.teams[i].id);

            }

            $('#content-box').append(`<div class='timeleft' title='Tempo máximo restante até o fim da rodada'>
                <div id='time'>
                    <div class='numbers'><span>0</span><span>0</span></div>:
                    <div class='numbers'><span>0</span><span>0</span></div>:
                    <div class='numbers'><span>0</span><span>0</span></div>
                </div>
                <div id='text'><span>HRS</span><span>MIN</span><span>SEG</span></div>
            </div>
            <div id='button-container'>
                <button class='arrow' id='back-round' title='Rodada anterior' disabled>
                    <i class='fas fa-chevron-left'></i>
                </button>
                <button id='prepare' class='button' disabled>PREPARAR-SE</button>
                <button class='arrow' id='next-round' title='Próxima rodada' disabled>
                    <i class='fas fa-chevron-right'></i>
                </button>
            </div>`);

            refresh_round();

            var round = data.tournament.round;
            if (round > 1){
                $('#content-box #back-round').removeAttr('disabled');
                $('#content-box #back-round').click( function(){
                    window.location.href = 'tourn/'+ hash +'/'+ parseInt(round - 1);
                });
            }

            isManager = data.tournament.manager;
            if (hasteam){
                $('#content-box #prepare').html("PREPARAR-SE").removeAttr('disabled');

                if (data.locked)
                    $('#content-box #prepare').attr('disabled', true).html("Aguarde a nova rodada");

                var round = data.tournament.round;
                var nick = data.nick;

                $('#content-box #prepare').off().click( function(){
                    $.post("back_tournament_run.php", {
                        action: "GLADS",
                        hash: hash,
                        round: round
                    }).done( function(data){
                        //console.log(data);
                        data = JSON.parse(data);
                       
                        if (data.status == "LOCK"){
                            showMessage("Tarde demais. Seu grupo já encerrou as inscrições");
                            $('#content-box #prepare').attr('disabled', true).html("Aguarde a nova rodada");
                        }
                        else if (data.status == "NOTFOUND"){
                            showMessage("Lista de gladiadores não encontrada");
                        }
                        else{
                            $('body').append("<div id='fog'><div class='float-box'><div id='text'>Olá <span class='highlight'>"+ nick +"</span>, você precisa escolher um gladiador para representar a equipe <span class='highlight'>"+ myteam +"</span> na rodada <span class='highlight'>"+ round +"</span> do torneio</div><div class='glad-card-container'></div><div id='button-container'><button id='cancel' class='button'>AINDA NÃO</button><button id='choose' class='button' disabled>ESCOLHER</button></div></div></div>");

                            $('.float-box #cancel').click( function(){
                                $('#fog').remove();
                            });
            
                            $('.float-box #choose').click( function(){
                                var gladid = $('.float-box .glad-preview.selected').data('id');
                                var gladname = $('.float-box .glad-preview.selected .info .glad span').html();
                                $.post("back_tournament_run.php", {
                                    action: "CHOOSE",
                                    id: gladid,
                                    hash: hash
                                }).done( function(data){
                                    //console.log(data);
                                    data = JSON.parse(data);
            
                                    if (data.status == "DEAD")
                                        showMessage("Este gladiador está gravemente ferido e não poderá mais participar deste torneio");
                                    else if (data.status == "OLD")
                                        showMessage("Este gladiador está desatualizado e não pode ser escolhido. Para atualizá-lo, altere ele no editor e salve-o");
                                    else if (data.status == "SUCCESS"){
                                        $('#fog').remove();
                                        showMessage("Sua equipe escolheu o gladiador <span class='highlight'>"+ gladname +"</span> para participar desta rodada. Assim que todas equipes escolherem seus representantes a batalha iniciará.");
                                    }
                                });
            
                            });

                            load_glad_cards($('.float-box .glad-card-container'), {
                                customLoad: data.glads,
                                code: true,
                                master: true,
                                dead: true,
                                clickHandler: function(){
                                    if (!$(this).hasClass('dead') && !$(this).hasClass('old')){
                                        $('.float-box #choose').removeAttr('disabled');
                                        $('.float-box .glad-preview').removeClass('selected');
                                        $(this).addClass('selected');
                                    }
                                }, 
                                dblClickHandler: function(){
                                    if (!$(this).hasClass('dead') && !$(this).hasClass('old'))
                                        $('.float-box #choose').click();
                                }
                            }).then( function(){
                            });
                        }
                        
                    });

                });

            }
            else if (isManager){
                $('#content-box #prepare').html("ENCERRAR RODADA").removeAttr('disabled');
                $('#content-box #prepare').off().click( function(){
                    $('#content-box #prepare').html("AGUARDE...").attr('disabled', true);
                    $.post("back_tournament_run.php", {
                        action: "END TURN",
                        hash: hash
                    }).done( function(data){
                        data = JSON.parse(data);
                        //console.log(data);
                    });
                });
            }
            else{
                $('#content-box #prepare').remove();
                $('#button-container .arrow').addClass('nobutton');
            }

            var deadline = new Date(data.tournament.deadline);
            var timenow = new Date(data.tournament.timenow);
            var serverleft = deadline - timenow;
            var timestart = new Date();
            countDown();
            function countDown() {
                setTimeout( function(){
                    var timediff = serverleft - (new Date() - timestart);
                    var timeleft = msToTime(timediff);
                    
                    $('.timeleft .numbers').each( function(index, obj){
                        if (parseInt(timeleft[index]) != parseInt($(obj).text())){
                            $(obj).find('span').eq(0).html(timeleft[index].toString()[0]);
                            $(obj).find('span').eq(1).html(timeleft[index].toString()[1]);
                        }
                    });

                    if ($('#group-container .team.myteam .icon.green').length == 1)
                        $('.timeleft').addClass('green');
                    else if (parseInt(timeleft[0]) == 0){
                        if (parseInt(timeleft[1]) < 10)
                            $('.timeleft').addClass('red');
                        else
                            $('.timeleft').addClass('yellow');
                    }
                    
                    if ($('#group-container .team .icon.green').length == $('#group-container .team').length)
                        $('.timeleft .numbers span').html('0');
                    if ($('.timeleft #time').text() != '00:00:00')
                        countDown();
                }, 1000);
            }

        }
        
    });

    init_chat($('#chat-panel'), {
        full: false,
        defaultOpen: 900
    });
});

function refresh_round(){
    $.post("back_tournament_run.php", {
        action: "REFRESH",
        hash: hash,
        round: round,
    }).done( async function(data){
        data = JSON.parse(data);
        console.log(data);
        
        $('#content-box #group-container .team').each( function(){
            if (!$(this).parents('.group').hasClass('hide-info')){
                var i = $(this).data('id');
                // var lasttime = '-';
                var lasttime = data.teams[i].lasttime;
                if (lasttime == null)
                    lasttime = '-';
                else if (parseFloat(lasttime) >= 1000){
                    lasttime = "<img class='win' src='icon/winner-icon.png'>";
                }
                else
                    lasttime = parseFloat(lasttime).toFixed(1);
        
                var alive = ['', 'one', 'two', 'three'];
                alive = alive[data.teams[i].alive];
        
                var iconready = {class: 'far fa-hourglass', title: 'A equipe ainda não escolheu seu gladiador'};
                if (data.teams[i].ready)
                    iconready = {class: "fas fa-check green", title: 'A equipe está pronta para a batalha'};

                $(this).find('.icon i').attr('class', iconready.class);
                $(this).find('.icon i').attr('title', iconready.title);

                $(this).find('.info .glad').attr('class', 'glad '+ alive);
                $(this).find('.info .time').html(lasttime);
            }
        });

        $('#content-box #group-container .group').each( function(){
            var groupobj = $(this);
            var i = $(this).data('id');

            if (data.groups[i].status == "DONE"){
                $(this).find('.foot .button').removeAttr('disabled').html("VISUALIZAR BATALHA");
                $(this).find('.foot .button').click( function(){
                    window.open('play/'+ data.groups[i].hash);
                    $(this).parents('.group').removeClass('hide-info');
                });

                if (isManager) {
                    $(this).find('.foot .button').html("<span>VISUALIZAR BATALHA</span><span class='reload' title='Executar batalha novamente'>🔄️</span>");
                    $(this).find('.foot .button .reload').click( function(e){
                        e.stopPropagation();
                        groupobj.find('.foot .button').attr('disabled', true).html("Aguardando batalha...");
                        runSimulation({
                            tournament: i,
                            origin: "tourn"
                        }).then( function(data){
                            // console.log(data);
                            refresh_round();
                        });
                    });
                }
            }
            else if (data.groups[i].status == "RUN"){
                groupobj.addClass('hide-info');
                groupobj.find('.foot .button').html("Grupo pronto. Aguardando batalha...");

                if ((groupobj).find('.team.myteam').length > 0) {
                    $('#content-box #prepare').attr('disabled', true).html("Aguarde a nova rodada");
                }

                if (isManager){
                    groupobj.find('.foot .button').html("Executar Batalha").removeAttr('disabled').click( function(){
                        groupobj.find('.foot .button').attr('disabled', true).html("Aguardando batalha...");
                        runSimulation({
                            tournament: i,
                            origin: "tourn"
                        }).then( function(data){
                            console.log(data);
                            refresh_round();
                        });
                    });


                }
            }
            else if (data.groups[i].status == "WAIT"){
                $(this).find('.foot .button .number').html(data.groups[i].value);
                if (data.groups[i].value == 1)
                    $(this).find('.foot .button').addClass('one');
            }
        });

        // all groups done and I'm the manager and there is no next round yet
        if (Object.values(data.groups).filter(group => group.status == "DONE").length == data.groups.length && isManager && data.status == "SUCCESS"){
            $('#content-box #prepare').removeAttr('disabled').html("Preparar próxima rodada").click(function () {
                $.post("back_tournament_run.php", {
                    action: "UPDATE",
                    hash: hash
                }).done(function (data) {
                    // console.log(data);
                    data = JSON.parse(data);
                    refresh_round();
                });
            });;
        }

        if (data.status == "NEXT" || data.status == "END"){
            $('#content-box #next-round').removeAttr('disabled');
            $('#content-box #prepare').remove();
            $('#button-container .arrow').addClass('nobutton');

            $('#content-box #next-round').off().click( function(){
                if (data.status == "END"){
                    window.location.href = 'tourn/'+ hash +'/0';
                }
                else{
                    var newround = parseInt(round) + 1;
                    window.location.href = 'tourn/'+ hash +'/'+ newround;
                }
            });
        }

    });

}

function msToTime(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    var h = Math.floor(m / 60);
    m = m % 60;

    if (h < 10)
        h = '0' + h;
    if (m < 10)
        m = '0' + m;
    if (s < 10)
        s = '0' + s;

    return [h, m, s];
}