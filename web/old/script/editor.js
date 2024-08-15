var editor;
var saved = true;
var tested = true;
var gladid;
var user;
var nick;
var hash;
var pieces;
var loadGlad = false;
var wannaSave = false;
var blocksEditor = false;
var sim

$(document).ready( function() {
    $('#header-editor').addClass('here');
    
    waitLogged().then(user => {
        //console.log(user);
        if (user.status == "SUCCESS"){
            $('#login').html(user.nome);
            
            if (user.tutor == "1"){
                tutorial.enabled = true
                tutorial.show()
            }
            
            var pic = new Image();
            pic.src = user.foto;
            $('#profile-icon img').attr('src', pic.src);

            pic.onerror = function(){
                $('#profile-icon img').attr('src', "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=");
            }

            if (user.language == 'blocks')
                toggleBlocks({ask: false, active: true})

            editor.setTheme("ace/theme/"+ user.theme);
            editor.setFontSize(user.font +"px");

            if ($('#newglad').length){
                $('#newglad').remove();
                $('#fog-skin').fadeIn();
            }
            else if (!loadGlad)
                $('#open').click();
        }
        else{
            $('#fog-skin').fadeIn();
        }

    });
    
    $('.fog').hide();

    if ($('#glad-code').length){
        loadGlad = {
            id: $('#glad-code #idglad').html(),
            name: $('#glad-code #name').html(),
            user: $('#glad-code #user').html(),
            code: $('#glad-code #code').html(),
            blocks: $('#glad-code #blocks').html(),
            vstr: $('#glad-code #vstr').html(),
            vagi: $('#glad-code #vagi').html(),
            vint: $('#glad-code #vint').html(),
            skin: $('#glad-code #skin').html()
        };
        nick = $('#glad-code #user').html();
        $('#glad-code').remove();

        if (loadGlad.blocks){
            toggleBlocks({ask: false, active: true, load: true})
        }
    }

    load_glad_generator($('#fog-skin'));

    $('#header-container').addClass('small');
    
    load_editor();
    editor.focus();

    $('#float-card .glad-preview').click( function(){
        $('#skin').click();
    });
    
    $('#panel-left-opener').click( function(){
        if ($(this).hasClass('open')){
            $('#panel-left').width(0).addClass('hidden');
            $(this).removeClass('open');
        }
        else{
            $('#panel-left').width(65).removeClass('hidden');
            $(this).addClass('open');
        }
    });
    
    $('#profile-icon').click( function(){
        if (user){
            window.location.href = "news";
        }
        else{
            googleLogin().then(function(data) {
                window.location.href = "news";
            });
        }
    });

    $('#new').click( function(){
        if (saved)
            window.location.href = "newglad";
        else{
            showDialog(
                "Deseja criar um novo gladiador e perder as alterações feitas no gladiador atual?",
                ["Sim","Não"])
            .then( function(data){
                if (data == "Sim"){
                    saved = true;
                    window.location.href = "newglad";
                }
            });
        }
    });
    
    $('#open').click( function(){
        if (!$(this).hasClass('disabled')){
            if (!user){
                showDialog("Você precisa fazer LOGIN no sistema para visualizar seus gladiadores",["Cancelar","LOGIN"]).then( function(data){
                    if (data == "LOGIN"){
                        googleLogin().then(function(data) {
                            //console.log(data);
                            user = data.email;
                            setLoadGlad();
                            $('#login').html(data.nome).off().click( function(){
                                window.location.href = "news";
                            });
                        });
                    }
                });
            }
            else{
                $('#fog-glads').fadeIn();
                $('#fog-glads .glad-preview').remove();
                $('#fog-glads #btn-glad-open').prop('disabled',true);
                var template = $("<div id='template'></div>").load("glad-card-template.html", function(){});
                $.post("back_glad.php",{
                    action: "GET",
                }).done( function(data){
                    data = JSON.parse(data);
                    // console.log(data);
                    if (data.length == 0){
                        window.location.href = "newglad";
                    }
                    for (var i in data){
                        $('#fog-glads .glad-card-container').append("<div class='glad-preview'></div>");
                    }
                    $('#fog-glads .glad-card-container .glad-preview').html(template);

                    for (var i in data){
                        setGladImage(i, data[i].skin);
                        $('#fog-glads .glad-preview .info .glad span').eq(i).html(data[i].name);
                        $('#fog-glads .glad-preview .info .attr .str span').eq(i).html(data[i].vstr);
                        $('#fog-glads .glad-preview .info .attr .agi span').eq(i).html(data[i].vagi);
                        $('#fog-glads .glad-preview .info .attr .int span').eq(i).html(data[i].vint);
                        $('#fog-glads .glad-preview').eq(i).data('id',data[i].id);
                        //$('#fog-glads .glad-preview').eq(i).data('code',data[i].code);
                        $('#fog-glads .glad-preview .delete').eq(i).click( function(){
                            var card = $(this).parents('.glad-preview');
                            showDialog(
                                "Deseja excluir o gladiador <span class='highlight'>"+ card.find('.glad span').html() +"</span>?",
                                ["Sim","Não"])
                            .then( function(data){
                                if (data == "Sim"){
                                    card.fadeOut(function(){
                                        card.remove();
                                    });
                                    $.post("back_glad.php",{
                                        action: "DELETE",
                                        id: card.data('id')
                                    }).done( function(data){
                                    });
                                }
                            });
                            //console.log(card.data('id'));
                        });
                    }
                    $('#fog-glads .glad-preview .code .button').remove();
                    
                    $('#fog-glads .glad-preview').click( function(){
                        $('#fog-glads #btn-glad-open').removeAttr('disabled');
                        $('#fog-glads .glad-preview').removeClass('selected');
                        $(this).addClass('selected');
                    });
                    
                    $('#fog-glads .glad-preview').dblclick( function(){
                        $('#fog-glads #btn-glad-open').click();
                    });
                    //console.log(user.lvl);
                });
            }
        }
    });
    $('#fog-glads #btn-glad-cancel').click( function(){
        $('#fog-glads').hide();
    });
    $('#fog-glads #btn-glad-open').click( function(){
        if (saved){
            var id = $('#fog-glads .glad-preview.selected').data('id');
            window.location.href = "glad-"+id;
        }
        else{
            var name = $('#fog-glads .glad-preview.selected .glad span').html();
            showDialog(
                "Deseja abrir o gladiador <span class='highlight'>"+ name +"</span> para edição? Todas alterações no gladiador atual serão perdidas",
                ["Sim","Não"])
            .then( function(data){
                if (data == "Sim"){
                    saved = true;
                    var id = $('#fog-glads .glad-preview.selected').data('id');
                    window.location.href = "glad-"+id;
                }
            });
        }
    });

    var sampleGlads = {
        'Wanderer': {'difficulty': 1, 'filename': 'Wanderer'},
        'Runner': {'difficulty': 1, 'filename': 'Runner'},
        'Blinker': {'difficulty': 1, 'filename': 'Blinker'},
        'Arch': {'difficulty': 2, 'filename': 'Arch'},
        'Patient': {'difficulty': 2, 'filename': 'Patient'},
        'Warrior': {'difficulty': 2, 'filename': 'Warrior'},
        'Mage': {'difficulty': 2, 'filename': 'Mage'},
        'Rogue': {'difficulty': 2, 'filename': 'Rogue'},
        'Archie': {'difficulty': 3, 'filename': 'Archie'},
        'War Maker': {'difficulty': 3, 'filename': 'WarMaker'},
        'Magnus': {'difficulty': 3, 'filename': 'Magnus'},
        'Rouge': {'difficulty': 3, 'filename': 'Rouge'},
    };

    $('#save').click( function(){
        if (!$(this).hasClass('disabled')){
            if (user){
                setLoadGlad();
                //console.log(loadGlad);

                getBannedFunctions(editor.getValue()).then( function(banned){
                    if (banned.length){
                        var msg = "Você possui funções em seu código que são permitidas somente para teste. Remova-as e tente salvar novamente.<ul>Funções:";
                        for (let i in banned){
                            msg += `<li><b>${banned[i]}</b></li>`;
                        }
                        msg += "</ul>"
                        showMessage(msg);
                    }
                    else if (tested){
                        var action = "INSERT";
                        if (gladid)
                            action = "UPDATE";
                        var nome = $('#distribuicao #nome').val();

                        let args = {
                            action: action,
                            id: gladid,
                            nome: nome,
                            vstr: $('#float-card .glad-preview .info .attr .str span').html(),
                            vagi: $('#float-card .glad-preview .info .attr .agi span').html(),
                            vint: $('#float-card .glad-preview .info .attr .int span').html(),
                            skin: JSON.stringify(pieces),
                        }

                        if (loadGlad.blocks)
                            args.blocks = loadGlad.blocks

                        // console.log(args)
                        $.post( "back_glad.php", args).done( function(data){
                            //console.log(data);
                            $('#fog').remove();
                            if (data.search("LIMIT") != -1)
                                showMessage("Você não pode possuir mais de <span class='highlight'>"+ JSON.parse(data).LIMIT +"</span> gladiadores simultaneamente. Aumente seu nível de mestre para desbloquear mais gladiadores.");
                            else if (data == "EXISTS")
                                showMessage("O nome <span class='highlight'>"+ nome +"</span> já está sendo usado por outro gladiador");
                            else if (data == "INVALID")
                                showMessage("CHEATER");
                            else if (data.search("ID") != -1){
                                gladid = JSON.parse(data).ID;
                                if (action == "INSERT"){
                                    showDialog("O gladiador <span class='highlight'>"+ nome +"</span> foi criado e gravado em seu perfil. Deseja inscrevê-lo para competir contra outros gladiadores?",["Sim","Agora não"]).then( function(data){
                                        if (data == "Sim")
                                            window.open('battle.ranked')
                                    });
                                }
                                else{
                                    showMessage("Gladiador <span class='highlight'>"+ nome +"</span> gravado");
                                }
                                saved = true;
                            }
                        });
                    }
                    else{
                        $('body').append(`<div id='fog'>
                            <div id='save-box'>
                                <div id='message'>Gravando alterações no gladiador <span class='highlight'>${loadGlad.name}</span>. Aguarde...</div>
                                <div id='button-container'><button class='button'>OK</button></div>
                            </div>
                        </div>`);
    
                        var sample = {
                            "Archie": sampleGlads['Archie'],
                            "War Maker": sampleGlads['War Maker'],
                            "Magnus": sampleGlads['Magnus'],
                            "Rouge": sampleGlads['Rouge']
                        };
    
                        var glads = [];
                        for (let i in sample){
                            var filename = `samples/gladbots/${sample[i].filename}.c`;
                            getGladFromFile(filename).then( function(data){
                                glads.push(data.code);
                                if (glads.length == 4)
                                    loadReady(glads);
                            });
                        }
                
                        function loadReady(glads){
                            btnbattle_click($('#save-box button'), glads).then( hash => {
                                // console.log(hash);
                                if (hash !== false){
                                    $.post("back_log.php", {
                                        action: "DELETE",
                                        hash: hash
                                    });
    
                                    tested = true;
                                    $('#save').click();
                                }
                                else{
                                    $('#fog').remove();
                                }
                            });
                        }
                    }
                });
            }
            else{
                showDialog("Você precisa fazer LOGIN no sistema para salvar seu gladiador",["Cancelar","LOGIN"]).then( function(data){
                    if (data == "LOGIN"){
                        googleLogin().then(function(data) {
                            //console.log(data);
                            user = data.email;
                            setLoadGlad();
                            $('#login').html(data.nome).off().click( function(){
                                window.location.href = "news";
                            });
                        });
                    }
                });
            }
        }
    });
    
    $('#skin').click( function(){
        $('#fog-skin').fadeIn();
    });

    $('#test').click( function(){
        if (!$(this).hasClass('disabled')){
            showTestWindow()
            
            function showTestWindow(){
                let t = tutorial.show([
                    'checkStep',
                    'oponent',
                    'learnAttack',
                    'checkAttack',
                    'checkGetHit',
                    'checkReact',
                    'checkSafe',
                    'checkFireball',
                    'checkTeleport',
                    'checkUpgrade',
                    'checkBreakpoint'
                ])

                if (t === false){
                    setLoadGlad();
                    if (!$(this).hasClass('disabled')){
                        $('#fog-battle').fadeIn();
                        var name = $('#float-card .glad-preview .glad span').html();
                        $('#fog-battle h3 span').html(name);
                    }
                }
            }
        }
    });

    var num = ["","one","two","three"];
    var template = "<div class='glad'><div class='name'></div><div class='diff'><div class='bar'></div><div class='bar'></div><div class='bar'></div></div></div>";
    for (var i in sampleGlads){
        $('#fog-battle #list').append(template);
        $('#fog-battle #list .glad').last().data('filename',sampleGlads[i].filename);
        $('#fog-battle #list .glad .name').last().html(i);
        $('#fog-battle #list .glad .diff').last().addClass(num[sampleGlads[i].difficulty]);

        bindGladList($('#fog-battle #list .glad').last());
    }

    waitLogged().then( () => {
        if (user.status == "SUCCESS" ){
            $.post("back_glad.php",{
                action: "GET",
            }).done( function(data){
                data = JSON.parse(data);
                // console.log(data);
                for (let i in data){
                    $('#fog-battle #list').append(template);
                    $('#fog-battle #list .glad .name').last().html(data[i].name);
                    $('#fog-battle #list .glad .diff').last().addClass('none');
                    $('#fog-battle #list .glad').last().data('info',data[i]);
    
                    bindGladList($('#fog-battle #list .glad').last());
                }
            });
        }
    })
    
    function bindGladList(obj){
        obj.click( function(){
            var filename = null;
            if ($(this).data('filename'))
                filename = "samples/gladbots/"+ $(this).data('filename') +".c";

            var code, blocks;
            if ($(this).hasClass('selected')){
                $(this).removeClass('selected');
                $('#fog-battle .glad-card-container').html("");
            }
            else if ($('#fog-battle #list .glad.selected').length < 4){
                $(this).addClass('selected');
                var template = $("<div id='template'></div>").load("glad-card-template.html", function(){
                    $('#fog-battle .glad-card-container').html("<div class='glad-preview'></div>");
                    $('#fog-battle .glad-card-container .glad-preview').html(template);
                    
                    if (filename){
                        getGladFromFile(filename).then( function(data){
                            loadCard(data);
                        });
                    }
                    else{
                        loadCard(obj.data('info'));
                    }

                    function loadCard(data){
                        //console.log(data);
                        fetchSpritesheet(data.skin).then( function(data){
                            $('#fog-battle .glad-preview .image').html(getSpriteThumb(data,'walk','down'));
                        });
                        $('#fog-battle .glad-preview .info .glad span').html(data.name);
                        $('#fog-battle .glad-preview .info .attr .str span').html(data.vstr);
                        $('#fog-battle .glad-preview .info .attr .agi span').html(data.vagi);
                        $('#fog-battle .glad-preview .info .attr .int span').html(data.vint);
                        code = data.code
                        blocks = data.blocks
                    }

                    $('#fog-battle .glad-preview .delete').remove();

                    $('#fog-battle .glad-preview .code .button').click( function(){
                        let language = "c";
                        if (code.indexOf("def loop():") != -1)
                            language = "python";

                        if (blocks && blocks.length){
                            $('body').append(`<div id='fog'><div id='code-box'><div id='code-ws'></div><div id='button-container'><button id='close' class='button'>Fechar</button></div></div></div>`);

                            let ws = Blockly.inject('code-ws', {
                                scrollbars: true,
                                readOnly: true
                            });
                    
                            xmlDom = Blockly.Xml.textToDom(decodeHTML(blocks));
                            Blockly.Xml.domToWorkspace(xmlDom, ws);
                        }
                        else{
                            $('body').append(`<div id='fog'><div id='code-box'><pre class='line-numbers language-${language}'><code class='language-${language}'>${code}</code></pre><div id='button-container'><button id='close' class='button'>Fechar</button></div></div></div>`);
                            Prism.highlightElement($('code')[0]);
                        }
            
                        $('#code-box #close').click( function(e){
                            $('#fog').remove();
                        });
            
                    });
            
                });
            }

            
            if ($('#fog-battle #list .glad.selected').length > 0){
                var length = $('#fog-battle #list .glad.selected').length;
                $('#fog-battle #btn-battle').removeAttr('disabled');
                $('#fog-battle #list-title span').html(length +" selecionados");
            }
            else{
                $('#fog-battle #btn-battle').prop('disabled',true);
                $('#fog-battle #list-title span').html("");
            }
        });
    }

    var progbtn;
    $('#fog-battle #btn-cancel').click( function(){
        if (progbtn && progbtn.isActive()){
            progbtn.kill();
            if (sim && sim.running)
                sim.abort();
        }
        else
            $('#fog-battle').hide();
    });

    $('#fog-battle #btn-battle').click( function(){
        var glads = [];
        var totalGlads = $('#fog-battle #list .glad.selected').length;
        $('#fog-battle #list .glad.selected').each( function(){
            var selected = $(this)
            var name = $(this).find('.name').html();
            if (!selected.data('info')){
                var filename = `samples/gladbots/${sampleGlads[ name ].filename}.c`;
                getGladFromFile(filename).then( function(data){
                    glads.push(data.code);
                    if (glads.length == totalGlads)
                        loadReady(glads);
                });
            }
            //my own glads
            else{
                glads.push(selected.data('info').id);
                if (glads.length == totalGlads)
                    loadReady(glads);
            }
        });

        function loadReady(glads){
            btnbattle_click($('#fog-battle #btn-battle'), glads).then( hash => {
                if (hash !== false){
                    showDialog("Deseja visualizar a batalha?",["Sim","Não"]).then( function(data){
                        if (data == "Sim")
                            window.open("play/"+ hash);
                        else{
                            $.post("back_log.php", {
                                action: "DELETE",
                                hash: hash
                            });
                        }
                        if (wannaSave){
                            showDialog("Gladiador testado com sucesso. Deseja gravá-lo?",["Sim","Não"]).then( function(data){
                                if (data == "Sim")
                                    $('#save').click();
                            });
                            wannaSave = false;
                        }
                        
                        tutorial.show([
                            'watchCodeMove',
                            'moveBackForth',
                            'askMoveNext',
                            'detectEnemy',
                            'getHit',
                            'reactHit',
                            'safe',
                            'fireball',
                            'teleport',
                            'upgrade',
                            'breakpoint'
                        ])
                    });
                    progbtn.kill();
                    //$('#fog-battle #btn-cancel').removeAttr('disabled');
                    $('#fog-battle').hide();
                }
            });
        }
    });

    async function btnbattle_click(btn, glads){
        progbtn = new progressButton(btn, ["Executando batalha...","Aguardando resposta do servidor"]);

        var breakpoints = [];
        $('.ace_breakpoint').each( function() {
            breakpoints.push($(this).text());
        });
        if (!breakpoints.length)
            breakpoints = false;

        glads.push(loadGlad.code);

        return new Promise( (resolve, reject) => {
            // console.log(glads)
            sim = new Simulation({
                glads: glads,
                savecode: true,
                origin: "editor",
                single: true,
                breakpoints: breakpoints,
                terminal: true,
            })
            sim.run().then( data => {
                // console.log(data);
                if (data.error){
                    //$('#fog-battle #btn-cancel').removeAttr('disabled');
                    $('#fog-battle').hide();
                    resolve(false);
                }
                else{
                    resolve(data.simulation);
                }
                progbtn.kill();
            })
        });
    }

    $('#switch').click( function(){
        toggleBlocks();
    });

    $('#settings').click( function(){
        var themes = ["ambiance", "chaos", "chrome", "clouds", "clouds_midnight", "cobalt", "crimson_editor", "dawn", "dracula", "dreamweaver", "eclipse", "github", "gob", "gruvbox", "idle_fingers", "iplastic", "katzenmilch", "kr_theme", "kuroir", "merbivore", "merbivore_soft", "mono_industrial", "monokai", "pastel_on_dark", "solarized_dark", "solarized_light", "sqlserver", "terminal", "textmate", "tomorrow", "tomorrow_night_blue", "tomorrow_night_bright", "tomorrow_night_eighties", "tomorrow_night", "twilight", "vibrant_ink", "xcode"];

        $('body').append("<div id='fog'><div id='settings-window'><div id='title'><h2>Preferências do editor</h2></div><div id='settings-content'><div id='options'><h3>Temas</h3><div id='list'></div><h3>Tamanho da fonte</h3><div id='font-size'><button class='button font-small'><img src='icon/font_minus.png'></button><button class='button font-big'><img src='icon/font_plus.png'></button></div></div><div id='sample'><h3>Visualização</h3><pre id='code-sample'></pre></div></div><div id='button-container'><button class='button' id='cancel'>Cancelar</button><button class='button' id='change'>ALTERAR</button></div></div></div>");

        for (var i in themes){
            $('#settings-window #list').append("<div class='theme'>"+ themes[i] +"</div>");
            if (user && user.theme == themes[i] || !user && themes[i] == "dreamweaver")
                $('#settings-window #list .theme').last().addClass('selected');
        }

        var sample = ace.edit("code-sample");
        if (user){
            sample.setTheme("ace/theme/"+ user.theme);
            sample.setFontSize(user.font +"px");
        }
        sample.getSession().setMode("ace/mode/c_cpp");
        sample.setReadOnly(true);

        sample.setValue("int start = 1;\n\nloop(){\n    upgradeSTR(5);\n    if (getCloseEnemy()){\n        float dist = getDist(getTargetX(), getTargetY());\n        if (dist < 0.8 && isTargetVisible()){\n            attackMelee();\n        }\n        else\n            moveToTarget();\n    }\n    else{\n        if (start){\n            if(moveTo(12.5,12.5))\n                start = 0;\n        }\n        else\n            turnLeft(50);\n    }\n}", -1);

        $('#settings-window #list .theme').click( function(){
            $('#settings-window #list .theme').removeClass('selected');
            $(this).addClass('selected');

            var theme = $(this).html();
            sample.setTheme("ace/theme/"+theme);
        });

        $('#settings-window #font-size .button').click( function(){
            var font = parseInt(sample.getFontSize());
            if ($(this).hasClass('font-small')){
                sample.setFontSize(font-2);
            }
            else if ($(this).hasClass('font-big')){
                sample.setFontSize(font+2);
            }
            sample.resize();
        });

        $('#settings-window #cancel').click( function(){
            $('#fog').remove();
        });
        $('#settings-window #change').click( function(){
            var theme = sample.getTheme().split("/")[2];
            var font = parseInt(sample.getFontSize());

            editor.setTheme(sample.getTheme());
            editor.setFontSize(sample.getFontSize());
            $('#fog').remove();

            if (user){
                $.post("back_login.php",{
                    action: "EDITOR",
                    theme: theme,
                    font: font
                }).done( function(){
                    user.theme = theme;
                    user.font = font;
                });
            }
        });
    });

    $('#help').click( function(){
        $('body').append("<div id='fog'><div id='help-window'><div id='title'>Que tipo de ajuda você gostaria?</div><div id='cat-container'><div id='docs' class='categories'><img src='icon/document.png'><span>Leitura</span></div><div id='video' class='categories'><img src='icon/video.png'><span>Vídeo</span></div><div id='tutorial' class='categories'><img src='icon/tutor.png'><span>Tutorial</span></div></div>");
        
        $('#fog').hide().fadeIn();
        $('#fog').click( function(){
            $(this).remove();
        });
        
        $('#help-window #tutorial').click( function(){
            tutorial.enabled = true
            tutorial.show();
        });
        $('#help-window #docs').click( function(e){
            e.stopPropagation();
            if (!$(this).hasClass('selected')){
                $('#help-window .categories').removeClass('selected');
                $(this).addClass('selected');
                $('#help-window #subcat').remove();
                $('#help-window').append("<div id='subcat'><a href='manual' class='button' target='_blank'>Manual da gladCode</a><a href='docs' class='button' target='_blank'>Referência das funções</a></div>");
                $('#help-window #subcat').hide().slideDown();
            }
        });
        $('#help-window #video').click( function(e){
            e.stopPropagation();
            if (!$(this).hasClass('selected')){
                $('#help-window .categories').removeClass('selected');
                $(this).addClass('selected');
                $('#help-window #subcat').remove();
                $('#help-window').append("<div id='subcat'><button class='video button' data-video='te1M98UDKiM'>Introdução e conceitos</button><button class='video button' data-video='tjMjqQ14AS8'>Editor de gladiadores</button><button class='video button' data-video='Wrc-0_Kq-_4'>Programando gladiadores</button><button class='video button' data-video='5QQtfruq8_8'>Habilidades e efeitos</button><button class='video button' data-video='hzxe5rmyODI'>Programação com blocos</button></div>");
                $('#help-window #subcat').hide().slideDown();
                
                $('#help-window .video.button').click( function(){
                    $('#fog').remove();
                    var vid = $(this).data('video');
                    $('body').append("<div id='fog' class='dark'><div id='video-container'><iframe width='100%' height='100%' src='https://www.youtube.com/embed/"+ vid +"' frameborder='0' allowfullscreen></iframe><div id='remove'></div></div></div>");
                    $('#fog').hide().fadeIn();
                    
                    $('#fog #remove').click( function(){
                        $('#fog').remove();
                    });
                });
            }
        });
    });
    
    editor.on("change", function() {
        saved = false;
        tested = false;

        var text = editor.getValue();

        if ($('#float-card .glad-preview').html() != "" && text != ""){
            $('#download').removeClass('disabled');
        }
        else{
            $('#download').addClass('disabled');
        }
        
        var lang = getLanguage(text);
        if (lang == "c" && editor.language != 'c'){
            editor.session.setMode("ace/mode/c_cpp");
            editor.language = 'c';
        }
        else if (lang == "python" && editor.language != 'python'){
            editor.session.setMode("ace/mode/python");
            editor.language = 'python';
        }

        if (tutorial.enabled && user.language == 'blocks'){
            tutorial.show([
                'checkStep'
            ])
        }

    });

    init_chat($('#chat-panel'), {
        full: false,
        expandWidth: "-65px"
    });
    chat_started().then( () => {
        $('#chat-panel #show-hide').click( () => {
            resizeInt = setInterval( () => {
                change_size();
            },10);
            setTimeout( () => {
                clearInterval(resizeInt);
            },1000);
        });

        $(window).resize( () => {
            setTimeout( () => {
                change_size();
            },1000);
        });

        change_size();
        function change_size(){
            var w = $('#chat-panel').width();
            $('#panel-right').width(w);
            editor.resize();
            $('#float-card').css({'margin-right': w});
        }
        
    });
    
    editor.on("guttermousedown", function(e) {
        var target = e.domEvent.target;

        if (e.domEvent.button != 0) //left mouse button
            return;
        
        if (target.className.indexOf("ace_gutter-cell") == -1){
            return;
        }
    
        if (!editor.isFocused()){
            return; 
        }
    
        var breakpoints = e.editor.session.getBreakpoints(row, 0);
        var row = e.getDocumentPosition().row;
    
        var Range = require('ace/range').Range;

        // If there's a breakpoint already defined, it should be removed, offering the toggle feature
        if(typeof breakpoints[row] === typeof undefined){
            let lang = getLanguage(editor.getValue())
            var brackets = 0;
            for (let i=0 ; i < editor.session.getLength() ; i++){				
                var line = editor.session.getLine(i);
                var ln = parseInt($(target).text()) - 1;

                if (i == ln){
                    var rowdif = row;
                    if (editor.session.getLine(ln).indexOf("else") != -1){
                        rowdif = row + 1;
                    }

                    if ((lang == 'c' && brackets == 0) || (lang == 'python' && line.indexOf('  ') == -1)){
                        showMessage("Breakpoints só podem ser inseridos dentro de funções");
                    }
                    else{
                        e.editor.session.setBreakpoint(rowdif);

                        var marker = editor.session.getMarkers();
                        var marked = false;
                        for (let i in marker){
                            if (marker[i].clazz == 'line-breakpoint' && marker[i].range.start.row == rowdif){
                                marked = true;
                            }
                        }
                        if (!marked)
                            editor.session.addMarker(new Range(rowdif,0,rowdif,1),'line-breakpoint','fullLine');
                    }
    
                }

                if (lang == 'c'){
                    if (line.indexOf("{") != -1)
                        brackets++;
                    if (line.indexOf("}") != -1)
                        brackets--;
                }
            }

        }else{
            e.editor.session.clearBreakpoint(row);

            var marker = editor.session.getMarkers();
            for (let i in marker){
                if (marker[i].clazz == 'line-breakpoint' && marker[i].range.start.row == row){
                    editor.session.removeMarker(marker[i].id);
                }
            }
        }

        e.stop();
    });

    editor.on("guttermouseup", function(e) {
    });
});

function setLoadGlad(){
    loadGlad = {};
    var skin = [];
    for (var i in selected)
        skin.push(i);
    loadGlad.skin = JSON.stringify(skin);
    loadGlad.id = gladid;
    loadGlad.user = nick;
    loadGlad.name = $('#distribuicao #nome').val();
    loadGlad.vstr = $('#distribuicao .slider').eq(0).val();
    loadGlad.vagi = $('#distribuicao .slider').eq(1).val();
    loadGlad.vint = $('#distribuicao .slider').eq(2).val();
    delete loadGlad.blocks

    var language = getLanguage(editor.getValue());
    if (language == "c"){
        var setup = `setup(){\n    setName(\"${loadGlad.name}\");\n    setSTR(${loadGlad.vstr});\n    setAGI(${loadGlad.vagi});\n    setINT(${loadGlad.vint});\n    setSkin(\"${loadGlad.skin}\");\n    setUser(\"${loadGlad.user}\");\n    setSlots(\"-1,-1,-1,-1\");\n}\n\n`;
        loadGlad.code = setup + editor.getValue();
    }
    else if (language == "python" || language == 'blocks'){
        var setup = `def setup():\n    setName(\"${loadGlad.name}\")\n    setSTR(${loadGlad.vstr})\n    setAGI(${loadGlad.vagi})\n    setINT(${loadGlad.vint})\n    setSkin(\"${loadGlad.skin}\")\n    setUser(\"${loadGlad.user}\")\n    setSlots(\"-1,-1,-1,-1\")\n# start of user code\n`;
        loadGlad.code = setup + editor.getValue();

        if (language == 'blocks')
            loadGlad.blocks = saveBlocks()
    }
}

function getGladFromFile(filename){
    var response = $.Deferred();
    $.post('back_glad.php', {
        action: "FILE",
        filename: filename
    })
    .done(function(data){
        //console.log(data);
        data = JSON.parse(data);
        if (data.skin)
            data.skin = JSON.stringify(data.skin);
        return response.resolve(data);
    });
    return response.promise();
}

function load_editor(){
    var langTools = ace.require("ace/ext/language_tools");
    editor = ace.edit("code");
    editor.session.setUseSoftTabs(true);
    editor.session.setOption("tabSize", 4)
    editor.setTheme("ace/theme/dreamweaver");
    editor.setFontSize(18);
    editor.getSession().setUseWrapMode(true);
    editor.$blockScrolling = Infinity;
    
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
    });
    

    buildDataTable().then( function(dataTable){
        var customCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                if (prefix.length === 0) { callback(null, []); return }

                callback(null, dataTable.map(function(table) {
                    var syntax = table.syntax[editor.language];
                    var snippet = table.snippet[editor.language];

                    return {
                        value: syntax,
                        caption: table.name,
                        snippet: snippet,
                        description: table.description,
                        syntax: syntax,
                        score: 1000,
                        meta: `gladCode-${editor.language}`
                    };
                }));	
            },
            getDocTooltip: function(item) {
                if (item.meta == 'gladCode'){
                    if (editor.language == 'c')
                        var func = `<b>${item.syntax.replace(/(int[ \*]{0,1} |float[ \*]{0,1} |double[ \*]{0,1} |char[ \*]{0,1} |void[ \*]{0,1})/g, "</b>$1<b>")}</b>`;
                    else if (editor.language == 'python')
                        var func = `<b>${item.syntax}</b>`;

                    item.docHTML = `${func}<hr></hr>${item.description}`;
                }
                else if (item.snippet) {
                    item.docHTML = `<b>${item.caption}</b><hr></hr>${item.snippet}`;
                }
            }
        }
        langTools.addCompleter(customCompleter);

    });
}

async function buildDataTable(){
    var table = [];
    return await new Promise( (resolve, reject) => {
        $.get("docs.php", function(content) {
            var docs = content.matchAll(/<td><a href=['"]([\w]+?)['"]><\/a><\/td>/g);
            var length = 0;
            for (let m of docs){
                $.getJSON(`script/functions/${m[1]}.json`, function(data){
                    // console.log(m[1]);
                    table.push({
                        name: data.name.default,
                        syntax: data.syntax,
                        description: data.description.brief,
                        snippet: data.snippet
                    });
                    if (table.length == length){
                        resolve(table);
                    }
                }).fail( function(e){
                    console.log(e);
                    length--;
                });
                length++;
            }
        });
    });
}

var menus = {
    'body': ['gender', 'shape', 'ears', 'eyes'],
    'hair': ['style', 'color', 'facial', 'bcolor'],
    'cloth': ['shirt', 'armor', 'legs', 'feet'],
    'misc': ['head', 'shoulder', 'hands', 'cape', 'belt'],
    'equip': ['melee', 'ranged', 'shield'],
};

var canvas = document.createElement("canvas");
canvas.setAttribute("width", 192);
canvas.setAttribute("height", 192);
var ctx = canvas.getContext("2d");
var spritesheet = document.createElement("canvas");
spritesheet.setAttribute("width", 192 * 13);
spritesheet.setAttribute("height", 192 * 21);
var spritectx = spritesheet.getContext("2d");

var lastcolor = 'black';
var direction = 2;
var scale = 1;
var animationOn = false;
var selected = {};
var imageIndex = new Array();
var parentTree = new Array();

var anim_num = 0;
var move = [
    {'name': 'walk', 'sprites': 9, 'line': 8, 'image': 'walk'},
    {'name': 'cast', 'sprites': 7, 'line': 0, 'image': 'magic'},
    {'name': 'thrust', 'sprites': 8, 'line': 4, 'image': 'thrust'},
    {'name': 'slash', 'sprites': 6, 'line': 12, 'image': 'slash'},
    {'name': 'shoot', 'sprites': 13, 'line': 16, 'image': 'arrows'},
];
var moveEnum = {'walk': 0, 'cast': 1, 'thrust': 2, 'slash': 3, 'shoot': 4};

function load_glad_generator(element){
    
    element.load('glad-create.html', function(){
        buildIndex();
        
        $('.img-button.sub').addClass('hidden');		
        $('#middle-container').append(canvas);
        reload_reqs();
        
        $('.slider-container').on('touchstart mouseenter', function() {
            text = [
                {
                    'path': 'sprite/images/strength.png',
                    'title': 'Força - STR', 
                    'description': 'Força física e resistência do gladiador.', 
                    'list': [
                        {'path': 'sprite/images/decapitation.png',	'description': 'Dano físico, o dano causado com armas corpo-a-corpo'},
                        {'path': 'sprite/images/healing.png',	'description': 'Pontos de vida, responsáveis por manter o gladiador vivo'}
                    ]
                },
                {
                    'path': 'sprite/images/agility.png',
                    'title': 'Agilidade - AGI', 
                    'description': 'Agilidade, rapidez e destreza do gladiador.', 
                    'list': [
                        {'path': 'sprite/images/bullseye.png',	'description': 'Precisão, o dano causado com armas à distância'},
                        {'path': 'sprite/images/sprint.png',	'description': 'Velocidade de movimento dentro da arena'},
                        {'path': 'sprite/images/blades.png',	'description': 'Velocidade de execução de ataques'}
                    ]
                },
                {
                    'path': 'sprite/images/smart.png',
                    'title': 'Inteligência - INT', 
                    'description': 'Rapidez de raciocínio e Capacidade intelectual do gladiador.', 
                    'list': [
                        {'path': 'sprite/images/energy.png',	'description': 'Poder mágico, o dano causado com habilidades mágicas'},
                        {'path': 'sprite/images/3balls.png',	'description': 'Velocidade de execução de uma habilidade'},
                        {'path': 'sprite/images/energise.png',	'description': 'Pontos de habilidade, usados para lançar habilidades'}
                    ]
                },
            ];
            
            index = $('.slider-container').index($(this));
            $('#info #title img').attr('src', text[index].path);
            $('#info #title span').html(text[index].title);
            $('#info #body .fill').html(text[index].description);
            $('#info ul').html("");
            $.each( text[index].list , function(i, item) {
                $('#info ul').append("<li><img src='"+ item.path +"'><span>"+ item.description +"</span></li>");
            });

        });
        
        $('#save-glad').click( function() {
            $('#distribuicao-container').css({'display':'flex', 'height':$('#skin-container').outerHeight()});
            $('#skin-container').hide();
            
            var cvpoint = document.createElement('canvas');
            cvpoint.setAttribute("width", 64);
            cvpoint.setAttribute("height", 64);
            var pct = cvpoint.getContext("2d");
            pct.drawImage(canvas, 64, 64, 64, 64, 0, 0, 64, 64);
            $('#cv').html(cvpoint);
            
            saved = false;
            tested = false;
        });	
        
        $('#get-code').click( function() {
            createFloatCard();
        });

        function createFloatCard(arg){
            var nome = $('#distribuicao #nome').val();
            if (nome.length <= 2 || !nome.match(/^[\w À-ú]+?$/g) ){
                $('#distribuicao #nome').addClass('error');
                $('#distribuicao #nome').focus();
            }
            else{
                $('#distribuicao #nome').removeClass('error');

                pieces = new Array();
                $.each( selected, function(index, image) {
                    pieces.push(image.id);
                });

                var vstr = $('#distribuicao .slider-input').eq(0).val();
                var vagi = $('#distribuicao .slider-input').eq(1).val();
                var vint = $('#distribuicao .slider-input').eq(2).val();
                var codigo = "loop(){\n    //comportamento do gladiador\n}";
                if (user.language == 'python')
                    codigo = "def loop():\n    #comportamento do gladiador\n";
                
                if (tutorial.getLesson() == 'skin')
                    tutorial.next(true)

                if (editor){
                    if (editor.getValue() == ""){
                        editor.setValue(codigo);
                        editor.gotoLine(1,0,true);
                    }
                    editor.focus();
                    $('#save, #test').removeClass('disabled');
                    $('#fog-skin').hide();
                    $('#back').click();
                    $('#float-card .glad-preview').load("glad-card-template.html", function(){
                        $('#float-card .glad-preview .info .glad span').html(nome);
                        $('#float-card .glad-preview .info .attr .str span').html(vstr);
                        $('#float-card .glad-preview .info .attr .agi span').html(vagi);
                        $('#float-card .glad-preview .info .attr .int span').html(vint);
            
                        $('.delete-container, .code').remove();
                        
                        if (arg && arg.image){
                            $('#float-card .glad-preview .image').html(arg.image);
                        }
                        else{
                            var canvascard = document.createElement('canvas');
                            canvascard.setAttribute("width", 64);
                            canvascard.setAttribute("height", 64);
                            var ctx = canvascard.getContext("2d");
                            ctx.drawImage(canvas, 64, 64, 64, 64, 0, 0, 64, 64);
                            $('#float-card .glad-preview .image').html(canvascard);
                        }

                        if ($('#float-card .glad-preview').html() != "" && editor.getValue() != "")
                            $('#download').removeClass('disabled');
                        else
                            $('#download').addClass('disabled');
                    });
                }
            }
            saved = false;
            tested = false;
        }

        $('#back').click( function() {
            $('#distribuicao-container').hide();
            $('#skin-container').show();
        });
        $('#reset').click( function() {
            $('.img-button').removeClass('selected');
            $('.img-button .sub').addClass('hidden');
            $('#distribuicao #nome').val("");
            $('#distribuicao .slider').val(0).change();
            selected = {};
            for (var i in images){
                if (images[i].default)
                    selected[images[i].id] = images[i];
            }
            reload_reqs();
            $('#distribuicao-container').hide();
            $('#skin-container').show();
        });
        $('.img-button.cat').click( function() {
            if (!$(this).hasClass('n-av')){
                $('.img-button.cat').removeClass('selected');
                $('.img-button.sub').removeClass('selected');
                
                $('.img-button.sub').addClass('hidden');
                $.each( menus[$(this).attr('id')], function(index, name) {
                    $('#'+ name).removeClass('hidden');
                });
                
                $(this).addClass('selected');
                
                reload_reqs();
            }
        });

        $('.img-button.sub').click( function() {
            if (!$(this).hasClass('n-av')){
                $('.img-button.sub').removeClass('selected');
                $(this).addClass('selected');
                reload_reqs();
            }
        });
            
        $('#turn').click( function() {
            direction = (direction + 1)%4;
            draw();
        });
        
        $('#down-scale').click( function() {
            if (scale > 1)
                scale -= 0.5;
            draw();
        });
        $('#up-scale').click( function() {
            if (scale < 3.5)
                scale += 0.5;
            draw();
        });
        var j=0;
        $('#play-pause').click( function(){
            if (animationOn){
                animationOn = false;
                j = 0;
                $(this).find('img').attr('src','sprite/images/play.png');
            }
            else{
                animationOn = true;
                $(this).find('img').attr('src','sprite/images/pause.png');
            }
            draw();
        });
        
        $('#animation').click( function(){
            var attacks = {'walk': true, 'cast': true, 'thrust': false, 'slash': false, 'shoot': false};
            $.each( selected, function(index,image) {
                if (image.move)
                    attacks[image.move] = true;
            });

            do{
                anim_num = (anim_num + 1) % move.length;
            }while(!attacks[ move[anim_num].name ]);
            
            j = 0;
            
            $(this).find('img').attr('src', 'sprite/images/'+ move[anim_num].image +'.png' );
        });
        
        setInterval( function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (animationOn)
                j++;
            if ( j >= move[anim_num].sprites )
                j = 0;
            i = (direction + move[anim_num].line);
            //ctx.drawImage(spritesheet, j*64, i*64, 64, 64, 0, -5, 64, 64);
            ctx.drawImage(spritesheet, 192*j, 192*i, 192, 192, 192/2 - 192*scale/2, 192/2 - 192*scale/2 - 5, 192*scale, 192*scale);
        }, 1000/10);
        
        function calcAttrValue(slider) {
            if (slider == 0)
                return 0;
            return calcAttrValue(slider - 1) + Math.ceil(slider/6);
        }
        
        $(document).on('input change', '#distribuicao .slider', function() {
            $(this).parents('.slider-container').find('.slider-value').html(calcAttrValue($(this).val()));
            $(this).parents('.slider-container').find('.slider-input').val($(this).val());
            $('#get-code').prop('disabled','true');
            
            var soma = 0;
            $('#distribuicao .slider-value').each( function() {
                soma += parseInt($(this).html());
            });
            
            var numobj = $('#distribuicao #remaining span');
            numobj.html(50 - soma);

            if (soma == 50){
                $('#get-code').html("GERAR CÓDIGO");
                $('#get-code').removeAttr('disabled');
                numobj.css('color','#4caf50');
            }
            else if (soma > 50)
                numobj.css('color','#f44336');
            else
                numobj.css('color','black');
        });

        $('.close').click( function(){
            $('#fog-skin').hide();
        });
        
        waitLogged().then( () => {
            if (loadGlad){
                selected = {};
                var skin;
                var errorSkin = false;
                try{
                    skin = JSON.parse(loadGlad.skin);
                }
                catch(error){
                    errorSkin = true;
                    skin = [];
                }
                for (var i in skin){
                    if (getImage(skin[i]))
                        selected[skin[i]] = getImage(skin[i]);
                }

                //console.log(selected);
                gladid = loadGlad.id;
                $('#distribuicao #nome').val(loadGlad.name);
                $('#distribuicao .slider').eq(0).val(loadGlad.vstr);
                $('#distribuicao .slider').eq(1).val(loadGlad.vagi);
                $('#distribuicao .slider').eq(2).val(loadGlad.vint);
                $('#distribuicao .slider').change();
                editor.setValue(decodeHTML(loadGlad.code));
                editor.gotoLine(1,0,true);
                
                if (!errorSkin){
                    fetchSpritesheet(JSON.stringify(skin)).then( function(data){
                        createFloatCard({image: getSpriteThumb(data,'walk','down')});
                    });
                }

                saved = true;
            }
        });
    });
}

function draw() {
    var imgReady = 0;
    var selectedArray = [];
    for (var i in selected)
        selectedArray.push(selected[i]);
    
    selectedArray.sort(function(a, b){
        return getLayer(a) - getLayer(b);
    });
    
    function getLayer(a){
        var directionEnum = ['up', 'left', 'down', 'right'];
        if (a.layer && a.layer.default){
            if (a.layer[ directionEnum[direction] ])
                return a.layer[ directionEnum[direction] ];
            else
                return a.layer.default;
        }
        return a.layer;
        
    }
    
    var img = new Array();
    for(i=0 ; i < selectedArray.length ; i++){
        if (selectedArray[i].path != '' && !selectedArray[i].png){
            img[i] = new Image();	
            img[i].src = "sprite/Universal-LPC-spritesheet/" + selectedArray[i].path;
            img[i].onload = function() {
                imgReady++;
            };
        }
        else
            imgReady++;
    }
    
    var tempss = document.createElement("canvas");
    tempss.width = spritesheet.width;
    tempss.height = spritesheet.height;
    var tempctx = tempss.getContext("2d");
    
    interval = setInterval( function() {
        if (imgReady == selectedArray.length){
            clearInterval(interval);
            for(i=0 ; i < selectedArray.length ; i++){
                if (img[i]){
                    if (selectedArray[i].oversize){
                        var line = move[moveEnum[selectedArray[i].move]].line;
                        var sprites = move[moveEnum[selectedArray[i].move]].sprites;
                        for (k=0 ; k<4 ; k++){
                            for (j=0 ; j<sprites ; j++){
                                tempctx.drawImage(img[i], j*192, k*192, 192, 192, j*192, line*192 + k*192, 192, 192);
                            }
                        }
                    }
                    else{
                        for (k=0 ; k<21 ; k++){
                            for (j=0 ; j<13 ; j++){
                                tempctx.drawImage(img[i], j*64, k*64, 64, 64, 64 + 3*j*64, 64 + 3*k*64, 64, 64);
                            }
                        }
                    }
                }
            }
            spritectx.clearRect(0, 0, spritesheet.width, spritesheet.height);
            spritectx.drawImage(tempss, 0, 0);
        }
    }, 10);
}

function reload_reqs(keepItems){
    if (!keepItems)
        $('#right-container').html("");
    var visible = {};
    setTimeout( function(){
        var parentList = parentTree[$('.img-button.sub.selected').attr('id')];
        //verifique quem é visivel pelo parent
        $.each( parentList , function(index, image) {
            image = getImage(image);
            var visibleFlag = true;

            //define quais vao ser visiveis baseado no parent 
            if (Array.isArray(image.parent)){
                for (i=0 ; i < image.parent.length ; i++){
                    if ( $('.img-button#'+image.parent[i]).hasClass('selected') )
                        break;
                }
                if (i == image.parent.length)
                    visibleFlag = false;
            }
            else{
                if ( !$('.img-button#'+image.parent).hasClass('selected') )
                    visibleFlag = false;
            }

            if (visibleFlag)
                visible[image.id] = image;
            
        });

        //torna invivel pelo requerimento
        $.each(images, function(index,image) {
            if (image.req){
                if (image.req.or){
                    for (i=0 ; i<image.req.or.length ; i++){
                        if( selected[image.req.or[i]] )
                            break;
                    }
                    if (i == image.req.or.length){
                        delete visible[image.id];
                        delete selected[image.id];
                    }
                }
                else if (image.req.and){
                    for (i=0 ; i<image.req.and.length ; i++){
                        if( !selected[image.req.and[i]] ){
                            delete visible[image.id];
                            delete selected[image.id];
                            break;
                        }
                    }
                }
                else if (image.req.not){ 
                    for (i=0 ; i<image.req.not.length ; i++){
                        if( selected[image.req.not[i]] ){
                            delete visible[image.id];
                            delete selected[image.id];
                            break;
                        }
                    }
                }
                else{
                    if( !selected[image.req] ){
                        delete visible[image.id];
                        delete selected[image.id];
                    }
                }
            }
        });
        
        //reseta o shape se troca de sexo
        var shapeOK = false;
        $.each(selected, function(index,image) {
            if (image.parent == 'shape')
                shapeOK = true;
        });
        if (!shapeOK){
            if (selected['male'])
                selected['male-light'] = getImage('male-light');
            else
                selected['female-light'] = getImage('female-light');
        }
        
        //torna visivel cores do cabelo
        if ($('#style').hasClass('selected')){
            var color = lastcolor;
            $.each(selected, function(index,image) {
                if (image.parent[1] == 'color'){
                    color = image.id.split("_")[1];
                    lastcolor = color;
                }
            });
            $.each(images, function(index,image) {
                if (image.parent[1] == 'color'){
                    if ($(this).attr('id').split("_")[1] == color)
                        visible[image.id] = image;
                    else
                        delete visible[image.id];
                }
                
            });		
        }
        //torna visivel cores da barba
        if ($('#facial').hasClass('selected')){
            var color = lastcolor;
            $.each(selected, function(index,image) {
                if (image.parent[1] == 'bcolor'){
                    color = image.id.split("_")[1];
                    lastcolor = color;
                }
            });
            $.each(images, function(index,image) {
                if (image.parent[1] == 'bcolor'){
                    if (image.id.split("_")[1] == color)
                        visible[image.id] = image;
                    else
                        delete visible[image.id];
                }
                
            });		
        }
        //torna visivel estilos de cabelo
        if ($('#color').hasClass('selected')){
            var style;
            $.each(selected, function(index,image) {
                if (image.parent[0] == 'style')
                    style = image.id.split("_")[0];
            });
            $.each(images, function(index,image) {
                if (image.parent[0] == 'style'){
                    if (image.id.split("_")[0] == style)
                        visible[image.id] = image;
                    else
                        delete visible[image.id];
                }
            });		
        }
        //torna visivel cores de barba
        if ($('#bcolor').hasClass('selected')){
            var facial;
            $.each(selected, function(index,image) {
                if (image.parent[0] == 'facial'){
                    facial = image.id.split("_")[0];
                }
            });
            $.each(images, function(index,image) {
                if (image.parent[0] == 'facial'){
                    if (image.id.split("_")[0] == facial)
                        visible[image.id] = image;
                    else
                        delete visible[image.id];
                }
            });		
        }
        //coloca not available
        $('.img-button.sub.n-av').removeClass('n-av');
        
        if ( selected['male-orc'] || selected['male-red_orc'] || selected['skeleton'] || selected['female-orc'] || selected['female-red_orc'] )
            $('#eyes, #ears').addClass('n-av');
        
        if ( selected['hair_none'] )
            $('#color').addClass('n-av');

        if ( selected['facial_none'] )
            $('#bcolor').addClass('n-av');
        
        if ( selected['male_chain'] || selected['female_chain'] )
            $('#shirt, #legs').addClass('n-av');
        
        $.each( selected , function(index,image) {
            //torna invisivel pelo block
            if (Array.isArray(image.block)){
                for (i=0 ; i<image.block.length ; i++)
                    $('#'+ image.block[i]).addClass('n-av');
            }
            else
                $('#'+ image.block).addClass('n-av');
            
            //selectiona a move no botao la em cima
            if (image.move && $('.img-button#'+image.parent).hasClass('selected')){
                anim_num = moveEnum[image.move];
                $('#animation').find('img').attr('src', 'sprite/images/'+ move[anim_num].image +'.png' );
            }
            
            //seleciona os itens agregados (arrows)
            if (image.parent == 'none' && selected[image.id])
                delete selected[image.id]
            
            if (image.select){
                selected[image.select] = getImage(image.select);
            }
            
            
        });
        //remove os items not avaliable
        $.each( $('.img-button.sub.n-av') , function() {
            var list = parentTree[$(this).attr('id')];
            for (var i in list){
                if (selected[list[i]])
                    delete selected[list[i]];
            }
        });
        
        if (!keepItems){
            for (var i in visible){
                load_assets(visible[i]);
            }
        }
        draw();
    },1);
}

function load_assets(image) {
    var prev = document.createElement("canvas");
    prev.setAttribute("width", 64);
    prev.setAttribute("height", 64);
    var prevctx = prev.getContext("2d");
    var imgRef = image.path;

    var img = new Image();
    
    if (image.png)
        img.src = "sprite/images/" + imgRef;
    else
        img.src = "sprite/Universal-LPC-spritesheet/" + imgRef;
    
    img.onload = function() { callback(img) };

    if ( $('.img-button.item#'+ image.id).length == 0)
        $('#right-container').append("<div class='img-button item' id='"+ image.id +"'></div>");
    $('.img-button.item#'+ image.id).append(prev);
    
    if (image.default)
        $('.img-button.item#'+ image.id).addClass('selected');
    for (var i in selected){
        if (selected[i].id == image.id){
            $('.img-button.item').removeClass('selected');
            $('.img-button.item#'+ image.id).addClass('selected');
        }
    }

    var callback = function(img) {
        try {
            var line = 10, col = 0;
            var s = 64;
            if (image.line)
                line = image.line;
            if (image.col)
                col = image.col;
            
            if (image.oversize)
                s = 192;

            if (image.png)
                prevctx.drawImage(img, 0, 0, image.width, image.height, 0, 0, 64, 64);
            else if (image.scale){
                var dx = 0, dy = 0;
                if (image.posx)
                    dx = image.posx;
                if (image.posy)
                    dy = image.posy;
                prevctx.drawImage(img, col * s, line * s, s, s, s/2 - image.scale*s/2 + dx, s/2 - image.scale*s/2 + dy, 64*image.scale, 64*image.scale);
            }
            else
                prevctx.drawImage(img, col * s, line * s, s, s, 0, -5, 64, 64);
        } catch (err) {
            console.log(err);
        }
    };
    $('.img-button.item#'+ image.id).click( function() {
        var imageParent = [];
        if (Array.isArray(image.parent))
            imageParent = image.parent;
        else
            imageParent.push(image.parent);
        
        for (var i in selected){
            var selectedParent = [];
            if (Array.isArray(selected[i].parent))
                selectedParent = selected[i].parent;
            else
                selectedParent.push(selected[i].parent);
            
            for (var j in selectedParent){
                for (var k in imageParent){
                    if (selectedParent[j] == imageParent[k])
                        delete selected[i];
                }
            }
        }
        selected[image.id] = image;
        $('.img-button.item').removeClass('selected');
        $(this).addClass('selected');
        //console.log(selected);
        reload_reqs(true);
    });
}


function getImage(id) {
    /*
    var image = $.grep(images, function(item){
        return item.id == id;
    });
    return image[0];
    */
    return images[imageIndex[id]];
}

function buildIndex(){
    for (i=0 ; i<images.length ; i++) {
        imageIndex[ images[i].id ] = i;
        
        if (images[i].parent){
            if (Array.isArray(images[i].parent)){
                for (j in images[i].parent){
                    if (!parentTree[images[i].parent[j]]){
                        parentTree.push(images[i].parent[j]);
                        parentTree[images[i].parent[j]] = new Array();
                    }
                    parentTree[images[i].parent[j]].push(images[i].id);
                }
            }
            else{
                if (!parentTree[images[i].parent]){
                    parentTree.push(images[i].parent);
                    parentTree[images[i].parent] = new Array();
                }
                parentTree[images[i].parent].push(images[i].id);
            }
        }		
        if (images[i].default)
            selected[images[i].id] = images[i];
    }
}

function setGladImage(index, skin){
    fetchSpritesheet(skin).then( function(data){
        $('#fog-glads .glad-preview .image').eq(index).html(getSpriteThumb(data,'walk','down'));
    });
}

window.onbeforeunload = function() {
    if (saved)
        return null;
    else
        return true;
};

async function getBannedFunctions(code){
    return new Promise( (resolve, reject) => {
        $.getJSON("banned_functions.json", function(banned){
            banned = banned.functions;
            var found = [];
            for (let i in banned){
                if (code.indexOf(banned[i]) != -1)
                    found.push(banned[i]);
            }
            resolve(found);
        });
    });
}

function getLanguage(code){
    var language = "c";
    if (blocksEditor.active)
        language = 'blocks'
    else if (code.indexOf("def loop():") != -1)
        language = "python";

    return language;
}

async function toggleBlocks(args){
    if (args){
        var active = args.active
        var ask = args.ask
        var load = args.load
    }

    if (!blocksEditor){
        blocksEditor = {};

        $('#blocks').load("blockly_toolbox.xml", function(){
            blocksEditor.workspace = Blockly.inject('blocks', {
                toolbox: $('#blocks #toolbox')[0],	
                zoom: { controls: true },
                grid: { spacing: 20, length: 0, snap: true },
                scrollbars: true,
                trashcan: true
            });

            blocksEditor.workspace.addChangeListener( function(){
                var code = Blockly.Python.workspaceToCode(blocksEditor.workspace)

                if (code != "def loop():\n  pass\n")
                    editor.setValue(code);
                // console.log(code);
            });

            if (!load){
                var loop = `<xml><block type="loop" x="60" y="50"></block></xml>`;
                xmlDom = Blockly.Xml.textToDom(loop);
                Blockly.Xml.domToWorkspace(xmlDom, blocksEditor.workspace);
            }
            else
                loadBlocks({xml: decodeHTML(loadGlad.blocks)})

            new ResizeObserver(() => {
                Blockly.svgResize(blocksEditor.workspace);
            }).observe($('#blocks')[0])    
        });
    }
    
    if (active === true)
        blocksEditor.active = false
    if (active === false)
        blocksEditor.active = true

    if (blocksEditor.active){
        $('#blocks').hide();
        $('#code').show();
        
        blocksEditor.active = false;

        $('#switch i').removeClass('fa-code').addClass('fa-puzzle-piece');
        $('#switch').tooltip({content: 'Alternar para editor de blocos'});
    }
    else{
        if (ask === false)
            change()
        else{
            showDialog("Se você alternar para o editor de blocos perderá seu código. Deseja continuar?", ["SIM", "NÃO"]).then( data => {
                if (data == "SIM")
                    change()
            });
        }

        function change(){
            $('#code').hide();
            $('#blocks').show();
    
            blocksEditor.active = true;
    
            $('#switch i').removeClass('fa-puzzle-piece').addClass('fa-code');
            $('#switch').tooltip({content: 'Alternar para editor de código'});
        }
    }
}

function saveBlocks(){
    var xmlDom = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    var xmlText = Blockly.Xml.domToText(xmlDom);
    return xmlText
}

function loadBlocks({path, xml}){
    if (path){
        $.get(path, xml => {
            Blockly.mainWorkspace.clear();
            let dom = Blockly.Xml.textToDom(xml)
            Blockly.Xml.domToWorkspace(dom, Blockly.mainWorkspace);
        }, 'text')
    }
    else if (xml){
        Blockly.mainWorkspace.clear();
        let dom = Blockly.Xml.textToDom(xml)
        Blockly.Xml.domToWorkspace(dom, Blockly.mainWorkspace);
    }
}