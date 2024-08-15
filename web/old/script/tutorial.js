var tutorial = {
    enabled: false,
    state: 0,
    lesson: {},
    order: [
        'start',
        'skin',
        'firstStep',
        'checkStep',
        'oponent',
        'watchCodeMove',
        'moveBackForth',
        'askMoveNext',
        'showBackForth',
        'detectEnemy',
        'learnAttack',
        'checkAttack',
        'getHit',
        'checkGetHit',
        'reactHit',
        'checkReact',
        'safe',
        'checkSafe',
        'fireball',
        'checkFireball',
        'teleport',
        'checkTeleport',
        'upgrade',
        'checkUpgrade',
        'breakpoint',
        'checkBreakpoint',
        'end'
    ]
}

tutorial.next = function(show){
    if (this.state == this.order.length || !this.enabled)
        return false
    this.state++

    if (show === true)
        return this.show()
    
    return true
}

tutorial.previous = function(show){
    if (this.state == 0 || !this.enabled)
        return false
    this.state--

    if (show === true)
        return this.show()

    return true
}

tutorial.show = function(trigger){
    if (!this.enabled || this.order.length == this.state)
        return false

    let f = this.order[this.state]

    if (trigger){
        for (let step of trigger){
            if (f === step)
                return this.lesson[f]()
        }
    }
    else
        return this.lesson[f]()

    return false
}

tutorial.getState = function(){
    return this.state
}

tutorial.getLesson = function(){
    if (this.state == this.order.length)
        return false	

    return this.order[this.state]
}

tutorial.jumpTo = function(lesson){
    if (!this.enabled)
        return false

    for (let l in this.order){
        if (this.order[l] === lesson){
            this.state = parseInt(l)+1
            return this.lesson[lesson]()
        }
    }
    return false
}

// -----------------------------
//   start of tutorial lessons
// -----------------------------

tutorial.lesson.start = async function(){
    let data = await showDialog("Olá. Como você é novo aqui, eu gostaria de lhe ensinar alguns conceitos básicos sobre programação de gladiadores. Você aceita?",["Nunca","Agora não","SIM"])

    if (data == "Nunca"){
        $.post("back_login.php", {
            action: "TUTORIAL_END",
        })
        // .done( data => console.log(data))
    }
    else if (data == "SIM"){
        let data = await showDialog("Certo. Você já conhece um pouco de alguma linguagem de programação?",["Não","Sim"])
        
        if (data == "Não"){
            await showMessage("Então vamos começar usando a programação em blocos.")

            setLang('blocks')
            toggleBlocks({ask: false, active: true})

            let data = await showDialog("Gostaria de assistir um vídeo ensinando lógica de programação básica usando blocos na gladCode?", ["SIM", "NÃO"])
            if (data == "SIM"){
                window.open("https://www.youtube.com/embed/hzxe5rmyODI")
                await showMessage("Agora que você sabe um pouco de lógica de programação, vamos prosseguir com o tutorial!")

                tutorial.next(true)
            }
            else{
                await showMessage("OK. Se mudar de ideia pode procurar nosso canal do Youtube. Vamos prosseguir com o tutorial!")

                tutorial.next(true)
            }
        }
        if (data == "Sim"){
            let lang = await showDialog("Qual destas linguagens você prefere utilizar?", ["C", "Python", "Blocos"])

            if (lang == 'Blocos'){
                toggleBlocks({ask: false, active: true})
                lang = 'blocks'
            }
            else{
                toggleBlocks({active: false})
                lang = lang.toLowerCase()
            }

            setLang(lang)

            tutorial.next(true)
        }
    }

    function setLang(lang){
        user.language = lang
        $.post("back_login.php", {
            action: "TUTORIAL_LANGUAGE",
            language: lang
        })
        // .done( data => console.log(data))
    }
}

tutorial.lesson.skin = async function(){
    await showMessage("Configure a aparência do seu gladiador")
    editor.setValue("");
    $('#skin').click();
}

tutorial.lesson.firstStep = async function(){
    await showMessage("Cada gladiador pode executar uma ação a cada 0.1s, que é o intervalo da simulação. Na <b>função loop</b> é onde você diz o que seu gladiador deve fazer em cada intervalo de tempo da simulação")

    let text = {
        c: `Experimente colocar a função <b>stepForward()</b> dentro das chaves da função loop. Quando terminar, clique no botão para testar seu gladiador. É o sexto botão no menu à esquerda, com o ícone de um controle de videogame`,
        python: `Experimente colocar a função <b>stepForward()</b> logo abaixo função loop. Quando terminar, clique no botão para testar seu gladiador. É o sexto botão no menu à esquerda, com o ícone de um controle de videogame`,
        blocks: `Experimente colocar um bloco <b>Passo para [frente]</b> dentro do bloco <b>loop</b>. Ele fica no menu de blocos gladCode > Movimentação.`
    }

    let buttons = ["Onde?","OK"]
    if (user.language == 'blocks')
        buttons = ["OK"]

    let data = await showDialog(text[user.language], buttons)

    if (data == "Onde?"){
        $('#test i').css({
            'color': 'red',
            'transition': '1s all',
            'font-size': '40px'
        });
        setTimeout(function(){
            $('#test i').css({
                'color': 'white',
                'transition': '0.5s all',
                'font-size': '30px'
            });
        },1500);
        setTimeout(function(){
            $('#test i').removeAttr('style');
        },2500);
    }

    tutorial.next()
}

tutorial.lesson.checkStep = async function(){
    var text = editor.getValue();

    if (user.language == 'blocks'){
        let search = text.search(/def loop\(\):\n[\w\W]*?\n{0,1}  stepForward\(\)/g)
        if (search != -1){
            $('#fog').remove()
            let data = await showDialog("Perfeito! Agora clique no botão para testar seu gladiador. É o sexto botão no menu à esquerda, com o ícone de um controle de videogame.", ["Onde?","OK"])

            if (data == "Onde?"){
                $('#test i').css({
                    'color': 'red',
                    'transition': '1s all',
                    'font-size': '40px'
                });
                setTimeout(function(){
                    $('#test i').css({
                        'color': 'white',
                        'transition': '0.5s all',
                        'font-size': '30px'
                    });
                },1500);
                setTimeout(function(){
                    $('#test i').removeAttr('style');
                },2500);
            }

            tutorial.next()
        }
    }
    else {
        let search
        if (user.language == 'c')
            search = text.search(/[\s(=]stepForward[\s]{0,1}\(\)[);\s]/g)
        else if (user.language == 'python')
            search = text.search(/[\s(=]stepForward[\s]{0,1}\(\)[)\s]/g)

        if (search == -1){
            let data = await showDialog('Você ainda não inseriu <b>stepForward()</b> dentro da função loop. Experimente digitar na primeira linha dentro da função',["Como?","OK"])
            if (data == "Como?"){
                let info = {
                    message: {
                        c: "Vou lhe mostrar. Observe o editor de texto. Cada comando fica em uma linha, e no fim da linha precisa conter o <b>;</b>. Agora clique no botão para testar o gladiador.",
                        python: "Vou lhe mostrar. Observe o editor de texto. Cada comando fica em uma linha, respeitando a indentação (espaços) dentro da função. Agora clique no botão para testar o gladiador."
                    },
                    code: {
                        c: 'loop(){\n    stepForward();\n}',
                        python: 'def loop():\n    stepForward()\n'
                    }
                }
    
                editor.setValue(info.code[user.language]);
                showDialog(info.message[user.language],["Ok. Entendi"]);
            }

        }
        else{
            await showMessage("Agora escolha um oponente para seu gladiador, e clique no botão para começar a batalha")
            tutorial.next()
            $('#test').click();
        }
    }
}

tutorial.lesson.oponent = async function(){
    if (user.language == 'blocks')
        await showMessage("Perfeito. Escolha um oponente para seu gladiador, e clique no botão para começar a batalha")

    tutorial.next()
    $('#test').click();
}

tutorial.lesson.watchCodeMove = async function(){
    if (user.language == 'blocks'){
        await showDialog("Maravilha! Você viu como seu gladiador ficou andando sem parar? O bloco <b>Passo para [Frente]</b> faz ele dar somente um passo para frente, mas como <b>loop</b> estava sendo executado a todo momento, ele ficou andando.",["Sim"])

        var code = '<xml xmlns="https://developers.google.com/blockly/xml"><variables><variable id="h;%$!XueSmZdU7Zb].,}">start</variable></variables><block type="variables_set" id="/M)73/RW@k|gPO#q,Kg2" x="60" y="50"><field name="VAR" id="h;%$!XueSmZdU7Zb].,}">start</field><value name="VALUE"><block type="logic_boolean" id="{*$5I^4Q/UbB9YeKp*s)"><field name="BOOL">TRUE</field></block></value></block><block type="loop" id="}Gy*!?M3#94S#-Vn~7PM" deletable="false" x="60" y="90"><statement name="CONTENT"><block type="controls_if" id="Do]s:hh,2JEvn;zXYB!$"><mutation else="1"/><value name="IF0"><block type="variables_get" id="OQFLKw%U9PBsspSe9O`+"><field name="VAR" id="h;%$!XueSmZdU7Zb].,}">start</field></block></value><statement name="DO0"><block type="move" id="k.y)_GDvLlH5s[LP^{+?"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id="P(VIu%)G(?(R_dEon~r@"><field name="NUM">12</field></shadow></value><value name="Y"><shadow type="math_number" id="##Dd6S^nlM`VO]a]HI,2"><field name="NUM">12</field></shadow></value><next><block type="controls_if" id="~.+BH8:[Ml?}t?s3LIf9"><value name="IF0"><block type="logic_operation" id="!bO/`p+J}8kG/xO!`5!M" inline="false"><field name="OP">AND</field><value name="A"><block type="logic_compare" id="V/*h:|jZqTq[,ZYyU4E("><field name="OP">EQ</field><value name="A"><block type="get_info" id="]/1I;cnTv~v|3H0dJ8~R"><field name="COMPLEMENT">X</field></block></value><value name="B"><block type="math_number" id="~?z$p)GvC$hL.XU4]PlU"><field name="NUM">12</field></block></value></block></value><value name="B"><block type="logic_compare" id="S}/[0Xs*#!I+bYe0#5GZ"><field name="OP">EQ</field><value name="A"><block type="get_info" id="$=w%7AWm,|HRi8k[onRs"><field name="COMPLEMENT">Y</field></block></value><value name="B"><block type="math_number" id="v~-kCoB:+i=gXy{RdB@P"><field name="NUM">12</field></block></value></block></value></block></value><statement name="DO0"><block type="variables_set" id="qa7;b6_nk8.~VQ]UW@4;"><field name="VAR" id="h;%$!XueSmZdU7Zb].,}">start</field><value name="VALUE"><block type="logic_boolean" id="7LudFatMQFmd%zbyLoqL"><field name="BOOL">FALSE</field></block></value></block></statement></block></next></block></statement><statement name="ELSE"><block type="turnangle" id="pK?(6aZh`/k7vWHNU^Iu"><mutation xmlns="http://www.w3.org/1999/xhtml" operation="TURN"></mutation><field name="COMPLEMENT">TURN</field><value name="ANGLE"><shadow type="math_number" id="]qCH`X#2A=OkR*uV9yGo"><field name="NUM">60</field></shadow></value></block></statement></block></statement></block></xml>'
        xmlDom = Blockly.Xml.textToDom(code);
        Blockly.mainWorkspace.clear()
        Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace);
    }
    else{
        await showDialog("Maravilha! Você viu como seu gladiador ficou andando sem parar? A função <b>stepForward()</b> faz ele dar somente um passo para frente, mas como <b>loop</b> estava sendo executado a todo momento, ele ficou andando.",["Sim"])

        if (user.language == 'c')
            editor.setValue("// controla quando o gladiador chegou no meio da arena \nint start = 1;\n\nloop(){\n    if (start){ // se ele ainda não chegou no meio\n        moveTo(12, 12); // move em direção à posição 12,12\n        // getX e getY capturam o X e Y do gladiador\n        if (getX() == 12 && getY() == 12) // se X e Y é 12, chegou no destino\n            start = 0; // coloca 0 em start para dizer que não quer mais caminhar\n    }\n    else // caso start já esteja em 0\n        turn(60); // fica rotacionando 60 graus\n}")
        else if (user.language == 'python')
            editor.setValue("# controla quando o gladiador chegou no meio da arena \nstart = True\n\ndef loop():\n    global start\n    if start: # se ele ainda não chegou no meio\n        moveTo(12, 12) # move em direção à posição 12,12\n        # getX e getY capturam o X e Y do gladiador\n        if getX() == 12 and getY() == 12: # se X e Y é 12, chegou no destino\n            start = False # coloca 0 em start para dizer que não quer mais caminhar\n    else: # caso start já esteja em 0\n        turn(60) # fica rotacionando 60 graus")
        
    }

    await showMessage("Agora analise esse código, tente entendê-lo e quando quiser teste o gladiador")

    tutorial.next()
}

tutorial.lesson.moveBackForth = async function(){
    if (user.language == 'blocks'){
        await showDialog(`Como você pôde ver, o gladiador se deslocou até o centro da arena e ficou girando.O bloco <b>Mover para [Posição]</b> especifica para onde ele quer ir e da um passo em direção ao destino. O gladiador sabe quando chegou por causa do bloco <b>Pegar Informação</b> com as opções <b>[Coordenada X/Y]</b>. O bloco <b>Virar Graus 
        relativo [ao gladiador]</b> faz ele girar`, ["Entendi"])

        await showDialog(`Como a variável <b>start começa em Verdadeiro</b>, o <b>senão</b> será ignorado nos primeiros momentos. Em todas etapas da simulação que start for Verdadeiro, o gladiador irá se mover em direção ao centro. Quando ele chegar, <b>start fica Falso</b>, garantindo que nas próximas execuções do bloco <b>loop</b>, o código entre no <b>senão</b> e o gladiador fique girando`, ["Acho que saquei"])
    }
    else{
        await showDialog(`Como você pôde ver, o gladiador se deslocou até o centro da arena e ficou girando. A função <b>moveTo</b> especifica para onde ele quer ir e da um passo em direção ao destino. O gladiador sabe quando chegou por causa das funções <b>getX</b> e <b>getY</b>. E a função <b>turn</b> faz ele girar`, ["Entendi"])

        let info = {
            c: ['1', '0'],
            python: ['True', 'False'],
        }

        await showDialog(`Como a variável <b>start começa em ${info[user.language][0]}</b>, o <b>else</b> da <b>linha 11</b> será ignorado nos primeiros momentos. Em todas etapas da simulação que start for ${info[user.language][0]}, o gladiador irá se mover em direção ao centro. Quando ele chegar, <b>start fica ${info[user.language][1]}</b>, garantindo que nas próximas execuções da função <b>loop</b>, o código entre no <b>else</b> e o gladiador fique girando`, ["Acho que saquei"])
    }

    let data = await showDialog("Vamos fazer uma pequena modificação neste código. Você seria capaz de fazer com que o gladiador após chegar ao centro, fique indo e voltando do ponto (5, 15) para o ponto (20, 10)?", ["Não quero","Vou tentar"])

    tutorial.next()

    if (data == "Não quero")
        tutorial.next(true)
}

tutorial.lesson.askMoveNext = async function(){
    let data = await showDialog("Interessante! Gostaria de ir para a próxima lição?",["Ainda não","Vamos lá"])

    if (data == "Vamos lá")
        tutorial.next(true)
}

tutorial.lesson.showBackForth = async function(){
    if (user.language == 'blocks'){
        let code = '<xml xmlns="https://developers.google.com/blockly/xml"><variables><variable id="U=tSZ+ekH3hJ,haIaWqR">start</variable><variable id="hx+ws)=n`Fu#%8|Y{B/G">vai</variable></variables><block type="variables_set" id="Y?PsUyJarv*xRk=b42Vl" x="60" y="50"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="sZQEw0Ni[={EdJ4Nm4{)"><field name="BOOL">TRUE</field></block></value><next><block type="variables_set" id="M,Wz3~5K`^2Dwf;}tU7`"><field name="VAR" id="hx+ws)=n`Fu#%8|Y{B/G">vai</field><value name="VALUE"><block type="logic_boolean" id="Boj*0LwqpnBHm4d.fy1["><field name="BOOL">FALSE</field></block></value></block></next></block><block type="loop" id="}N8OK1Qr^B.hPY!rF#NW" deletable="false" x="60" y="110"><statement name="CONTENT"><block type="controls_if" id="}{rSgs!hHjd-7+y1A6xA"><mutation else="1"/><value name="IF0"><block type="variables_get" id="S*C7wUaq?lqyj,$wljdn"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field></block></value><statement name="DO0"><block type="move" id="6D*FQ.M92nACF@+o[3OW"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id="{m-rfV|02dxcApmeeFLT"><field name="NUM">12</field></shadow></value><value name="Y"><shadow type="math_number" id="ADNV{zHWjK2mH)~Hpd]J"><field name="NUM">12</field></shadow></value><next><block type="controls_if" id="CAYdNskAgv0M80[o]J}g"><value name="IF0"><block type="logic_operation" id="uR9:!F}(w[j)Cb#HwVjW" inline="false"><field name="OP">AND</field><value name="A"><block type="logic_compare" id="#rDBbsK_]5l#p60/Pp|u"><field name="OP">EQ</field><value name="A"><block type="get_info" id="O7P+X)EUx$Tkdfzs2p}!"><field name="COMPLEMENT">X</field></block></value><value name="B"><block type="math_number" id="upFi.JRrRv@S#MzPRTPZ"><field name="NUM">12</field></block></value></block></value><value name="B"><block type="logic_compare" id="F22OyBP]^g|rs.sE8y*c"><field name="OP">EQ</field><value name="A"><block type="get_info" id="c%j#dC^XI|Y+9*kvO+^n"><field name="COMPLEMENT">Y</field></block></value><value name="B"><block type="math_number" id="IbS`JYOSuii$8X(dIKld"><field name="NUM">12</field></block></value></block></value></block></value><statement name="DO0"><block type="variables_set" id="H^QP_}9s2G6Y+U|c[[J/"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="5S5)Ke~B!k=l2Y.#Bavn"><field name="BOOL">FALSE</field></block></value></block></statement></block></next></block></statement><statement name="ELSE"><block type="controls_if" id="S3i11q:ne,u=*,k`RIL0"><mutation else="1"/><value name="IF0"><block type="variables_get" id="j#yV/3_Q;PslIKSGthZ@"><field name="VAR" id="hx+ws)=n`Fu#%8|Y{B/G">vai</field></block></value><statement name="DO0"><block type="controls_if" id="jsdvO)~G,E~P*w~(F+5G"><value name="IF0"><block type="move" id="{R|}XvOVWMI_ZW,Il`f^"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="true"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id="Z=!ZG=|-oL:t#2Gsa/`j"><field name="NUM">5</field></shadow></value><value name="Y"><shadow type="math_number" id="^wqc|*`GQ;R-bq?~-N[+"><field name="NUM">15</field></shadow></value></block></value><statement name="DO0"><block type="variables_set" id="@x)E6pu8ztQ}r81]$~73"><field name="VAR" id="hx+ws)=n`Fu#%8|Y{B/G">vai</field><value name="VALUE"><block type="logic_boolean" id="4s+cJp+/)Q)pQ^/:;3hg"><field name="BOOL">FALSE</field></block></value></block></statement></block></statement><statement name="ELSE"><block type="controls_if" id="u=f~ZW[!LfElNoAXbV?K"><value name="IF0"><block type="move" id="*ePMurB4v9$ryzgW]u1="><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="true"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id="]A(69o(V+/ZO^)=%[SY`"><field name="NUM">20</field></shadow></value><value name="Y"><shadow type="math_number" id="HF3;*HU)SUobIRIfLYPZ"><field name="NUM">10</field></shadow></value></block></value><statement name="DO0"><block type="variables_set" id="GnFSHMUUp/zA~2{Do~?2"><field name="VAR" id="hx+ws)=n`Fu#%8|Y{B/G">vai</field><value name="VALUE"><block type="logic_boolean" id="=T3oSVw^*^_m(w%-2P#F"><field name="BOOL">TRUE</field></block></value></block></statement></block></statement></block></statement></block></statement></block></xml>'
        xmlDom = Blockly.Xml.textToDom(code);
        Blockly.mainWorkspace.clear()
        Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace);
    }
    else if (user.language == 'c'){
        editor.setValue("//controla quando o gladiador chegou no meio da arena \nint start=1, vai=0;\n\nloop(){\n    if (start){ //se ele ainda não chegou no meio\n        moveTo(12,12); //se move em direção à posição 12,12\n        //getX e getY server para capturar o X e Y do gladiador\n        if (getX() == 12 && getY() == 12) //se X e Y é 12, chegou no destino\n            start = 0; //coloca 0 em start para dizer que não quer mais caminhar\n    }\n    else{ //caso start já esteja em 0\n        if (vai){ //verifica se vai ou vem\n            if(moveTo(5,15)) //move e testa se chegou no ponto\n                vai = 0; //diz que é hora do vem\n        }\n        else{ //se está na etapa do vem\n            if(moveTo(20,10)) \n                vai = 1; //diz que é hora do vai\n        }\n    }\n}");
    }
    else if (user.language == 'python'){
        editor.setValue("# controla quando o gladiador chegou no meio da arena \nstart = True\nvai = False\n\ndef loop():\n    global start, vai\n    if start: # se ele ainda não chegou no meio\n        moveTo(12,12) # se move em direção à posição 12,12\n        # getX e getY server para capturar o X e Y do gladiador\n        if getX() == 12 and getY() == 12: # se X e Y é 12, chegou no destino\n            start = False # coloca 0 em start para dizer que não quer mais caminhar\n    else: # caso start já esteja em 0\n        if vai: # verifica se vai ou vem\n            if moveTo(5, 15): # move e testa se chegou no ponto\n                vai = False # diz que é hora do vem\n        else: # se está na etapa do vem\n            if moveTo(20, 10): \n                vai = True # diz que é hora do vai");
    }

    await showMessage("Ok. Modifiquei seu código. Pode conferir se sua solução era mais ou menos assim. Teste o gladiador para prosseguir")
        
    tutorial.next()
}

tutorial.lesson.detectEnemy = async function(){
    let data
    if (user.language == 'blocks'){
        data = await showDialog("Agora vamos detectar seus oponentes. Todo gladiador consegue enxergar 60 graus ao seu redor e à uma distância de 9 passos. O bloco <b>Selecionar alvo</b>, que serve para este propósito está localizado no submenu <b>Percepção</b> no menu de blocos da gladCode. Além de detectar inimigos no campo de visão do gladiador, o bloco ainda fixa a atenção do gladiador no oponente detectado, permitindo o uso de outros blocos que requerem um alvo", ["Conhecer funções","Certo"])
    }
    else{
        data = await showDialog("Agora vamos detectar seus oponentes. Todo gladiador consegue enxergar 60 graus ao seu redor e à uma distância de 9 passos. As funções <b>getLowHp</b>, <b>getHighHp</b>, <b>getCloseEnemy</b> e <b>getFarEnemy</b> além de detectarem inimigos no campo de visão do gladiador, ainda fixam a atenção do gladiador no oponente detectado, permitindo o uso de outras funções que requerem um alvo",["Conhecer funções","Certo"])
    }
    
    if (data == "Conhecer funções")
        window.open("docs#nav-sense");
    
    if (user.language == 'blocks'){
        data = await showDialog("Gostaria que você usasse este bloco para detectar um oponente. Com ele você pode escolher selecionar um inimigo mais próximo/distante ou com mais/menos pontos de vida. Que tal colocá-lo dentro de uma condição (bloco Se-faça)? Assim você pode controlar o que fazer caso o gladiador encontre um oponente. Quando tiver concluido clique no botão para testar o gladiador",["Mostrar como","Vou tentar"])
    }
    else{
        data = await showDialog("Gostaria que você usasse uma destas funções para detectar um oponente. Que tal colocar uma delas dentro de uma condição (if)? Assim você pode controlar o que fazer caso o gladiador encontre um oponente. Quando tiver concluido clique no botão para testar o gladiador",["Mostrar como","Vou tentar"])
    }

    if (data == "Mostrar como"){
        if (user.language == 'blocks'){
            let code = '<xml xmlns="https://developers.google.com/blockly/xml"><variables><variable id="U=tSZ+ekH3hJ,haIaWqR">start</variable></variables><block type="variables_set" id="Y?PsUyJarv*xRk=b42Vl" x="60" y="50"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="sZQEw0Ni[={EdJ4Nm4{)"><field name="BOOL">TRUE</field></block></value></block><block type="loop" id="}N8OK1Qr^B.hPY!rF#NW" deletable="false" x="60" y="90"><statement name="CONTENT"><block type="controls_if" id="}{rSgs!hHjd-7+y1A6xA"><value name="IF0"><block type="variables_get" id="S*C7wUaq?lqyj,$wljdn"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field></block></value><statement name="DO0"><block type="move" id="6D*FQ.M92nACF@+o[3OW"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id="{m-rfV|02dxcApmeeFLT"><field name="NUM">12</field></shadow></value><value name="Y"><shadow type="math_number" id="ADNV{zHWjK2mH)~Hpd]J"><field name="NUM">12</field></shadow></value><next><block type="controls_if" id="CAYdNskAgv0M80[o]J}g"><value name="IF0"><block type="logic_operation" id="uR9:!F}(w[j)Cb#HwVjW" inline="false"><field name="OP">AND</field><value name="A"><block type="logic_compare" id="#rDBbsK_]5l#p60/Pp|u"><field name="OP">EQ</field><value name="A"><block type="get_info" id="O7P+X)EUx$Tkdfzs2p}!"><field name="COMPLEMENT">X</field></block></value><value name="B"><block type="math_number" id="upFi.JRrRv@S#MzPRTPZ"><field name="NUM">12</field></block></value></block></value><value name="B"><block type="logic_compare" id="F22OyBP]^g|rs.sE8y*c"><field name="OP">EQ</field><value name="A"><block type="get_info" id="c%j#dC^XI|Y+9*kvO+^n"><field name="COMPLEMENT">Y</field></block></value><value name="B"><block type="math_number" id="IbS`JYOSuii$8X(dIKld"><field name="NUM">12</field></block></value></block></value></block></value><statement name="DO0"><block type="variables_set" id="H^QP_}9s2G6Y+U|c[[J/"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="5S5)Ke~B!k=l2Y.#Bavn"><field name="BOOL">FALSE</field></block></value></block></statement></block></next></block></statement><next><block type="controls_if" id="3%8by*to|-Roz-.}OzLc"><comment pinned="false" h="80" w="160">aqui vamos colocar o que fazer quando detectar inimigo</comment><value name="IF0"><block type="get_enemy" id="Rd*7*Ac!*QozhA%w1_d^"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="true"></mutation><field name="COMPLEMENT">CloseEnemy</field></block></value></block></next></block></statement></block></xml>'
            xmlDom = Blockly.Xml.textToDom(code);
            Blockly.mainWorkspace.clear()
            Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace);
        }
        else if (user.language == 'c'){
            editor.setValue("int start=1;\n\nloop(){\n    if (start){\n        moveTo(12,12);\n        if (getX() == 12 && getY() == 12)\n            start = 0;\n    }\n    // detecta se tem inimigo próximo, e fixa a atenção nele\n    if (getCloseEnemy()){\n        // aqui vamos colocar o que fazer quando detectar inimigo\n    }\n}");
        }
        else if (user.language == 'python'){
            editor.setValue('start = True\n\ndef loop():\n    global start\n    if start:\n        moveTo(12, 12)\n        if getX() == 12 and getY() == 12:\n            start = False\n    # detecta se tem inimigo próximo, e fixa a atenção nele\n    if getCloseEnemy():\n        # aqui vamos colocar o que fazer quando detectar inimigo')
        }
    }

    tutorial.next()
}

tutorial.lesson.learnAttack = async function(){
    var text = editor.getValue();
    let search

    if (user.language == 'blocks' || user.language == 'python')
        search = text.search(/[(\s=](getCloseEnemy|getFarEnemy|getLowHp|getHighHp)[\s]{0,1}\(\)[:=!<>)\s]{0,1}/g)
    else if (user.language == 'c')
        search = text.search(/[(\s=](getCloseEnemy|getFarEnemy|getLowHp|getHighHp)[\s]{0,1}\(\)[=!<>;)\s]/g)

    if (search == -1){
        let data
        if (user.language == 'blocks')
            data = await showDialog("Você ainda não inseriu o bloco <b>Selecionar alvo</b>. Quer uma ajuda?",["Esqueci", "Sim, ajuda","Deixa comigo"])
        else
            data = await showDialog("Você ainda não inseriu nenhuma das funções apresentadas. Quer uma ajuda?",["Esqueci", "Sim, ajuda","Deixa comigo"])
        
        if (data == "Sim, ajuda")
            window.open("docs#nav-sense");
        else if (data == "Esqueci")
            tutorial.previous(true)
    }
    else{
        let data
        if (user.language == 'blocks'){
            data = await showDialog("Agora vamos aprender a atacar. Com um alvo fixado, seu gladiador pode usar o bloco <b>Pegar [Coordenada X/Y] do alvo</b> para saber a posição do alvo. Este bloco é muito versátil e lhe possibilita saber várias coisas sobre seu alvo fixado com <b>Selecionar alvo</b>",["Como assim?","Fácil"])
        }
        else{
            data = await showDialog("Agora vamos aprender a atacar. Com um alvo fixado, seu gladiador pode usar <b>getTargetX</b> e <b>getTargetY</b> para saber a posição do alvo",["Como assim?","Fácil"])
        }

        if (data == "Como assim?")
            window.open("docs#nav-sense");

        if (user.language == 'blocks'){
            data = await showDialog("Sabendo a posição, usamos o bloco <b>Ataque à distância</b> para atirar com o arco. Ele se encontra no submenu <b>Ataque</b> dos blocos da gladCode. Neste bloco você precisa informar as coordenadas X e Y de onde você quer atirar. Tente atirar na posição do alvo e teste seu gladiador",["Me mostre como","OK"])
        }
        else{
            data = await showDialog("Sabendo a posição, usamos <b>attackRanged</b> para atirar com o arco. Dentro dos parênteses da função precisa colocar as coordenadas X e Y de onde você quer atirar. Tente atirar na posição do alvo e teste seu gladiador",["Me mostre como","OK"])
        }

        if (data == "Me mostre como"){
            if (user.language == 'blocks'){
                let code = '<xml xmlns="https://developers.google.com/blockly/xml"><variables><variable id="U=tSZ+ekH3hJ,haIaWqR">start</variable></variables><block type="variables_set" id="Y?PsUyJarv*xRk=b42Vl" x="60" y="50"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="sZQEw0Ni[={EdJ4Nm4{)"><field name="BOOL">TRUE</field></block></value></block><block type="loop" id="}N8OK1Qr^B.hPY!rF#NW" deletable="false" x="60" y="90"><statement name="CONTENT"><block type="controls_if" id="}{rSgs!hHjd-7+y1A6xA"><value name="IF0"><block type="variables_get" id="S*C7wUaq?lqyj,$wljdn"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field></block></value><statement name="DO0"><block type="move" id="6D*FQ.M92nACF@+o[3OW"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id="{m-rfV|02dxcApmeeFLT"><field name="NUM">12</field></shadow></value><value name="Y"><shadow type="math_number" id="ADNV{zHWjK2mH)~Hpd]J"><field name="NUM">12</field></shadow></value><next><block type="controls_if" id="CAYdNskAgv0M80[o]J}g"><value name="IF0"><block type="logic_operation" id="uR9:!F}(w[j)Cb#HwVjW" inline="false"><field name="OP">AND</field><value name="A"><block type="logic_compare" id="#rDBbsK_]5l#p60/Pp|u"><field name="OP">EQ</field><value name="A"><block type="get_info" id="O7P+X)EUx$Tkdfzs2p}!"><field name="COMPLEMENT">X</field></block></value><value name="B"><block type="math_number" id="upFi.JRrRv@S#MzPRTPZ"><field name="NUM">12</field></block></value></block></value><value name="B"><block type="logic_compare" id="F22OyBP]^g|rs.sE8y*c"><field name="OP">EQ</field><value name="A"><block type="get_info" id="c%j#dC^XI|Y+9*kvO+^n"><field name="COMPLEMENT">Y</field></block></value><value name="B"><block type="math_number" id="IbS`JYOSuii$8X(dIKld"><field name="NUM">12</field></block></value></block></value></block></value><statement name="DO0"><block type="variables_set" id="H^QP_}9s2G6Y+U|c[[J/"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="5S5)Ke~B!k=l2Y.#Bavn"><field name="BOOL">FALSE</field></block></value></block></statement></block></next></block></statement><next><block type="controls_if" id="3%8by*to|-Roz-.}OzLc"><comment pinned="false" h="80" w="160">detecta se tem inimigo próximo, e fixa a atenção nele</comment><value name="IF0"><block type="get_enemy" id="Rd*7*Ac!*QozhA%w1_d^"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="true"></mutation><field name="COMPLEMENT">CloseEnemy</field></block></value><statement name="DO0"><block type="ranged" id="4EIcJ[I[UGH2U]0C}n=(" inline="false"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="false"></mutation><value name="X"><shadow type="math_number" id="}vF+j}:O8+N].M`UTyN3"><field name="NUM">0</field></shadow><block type="get_target" id="_k+JH[2qQp$!0p.]$i*%"><field name="COMPLEMENT">X</field></block></value><value name="Y"><shadow type="math_number" id="j#Vn-{6r^FB=lXhZnI6n"><field name="NUM">0</field></shadow><block type="get_target" id="/]BGx,5X1V8@(::MpW,?"><field name="COMPLEMENT">Y</field></block></value></block></statement></block></next></block></statement></block></xml>'
                xmlDom = Blockly.Xml.textToDom(code)
                Blockly.mainWorkspace.clear()
                Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace)
            }
            else if (user.language == 'python'){
                editor.setValue("start = True\n\ndef loop():\n    global start\n    if start:\n        moveTo(12, 12)\n        if getX() == 12 and getY() == 12:\n            start = False\n    # detecta se tem inimigo próximo, e fixa a atenção nele\n    if getCloseEnemy():\n        attackRanged(getTargetX(), getTargetY())");
            }
            else if (user.language == 'c'){
                editor.setValue("int start=1;\n\nloop(){\n    if (start){\n        moveTo(12,12);\n        if (getX() == 12 && getY() == 12)\n            start = 0;\n    }\n    // detecta se tem inimigo próximo, e fixa a atenção nele\n    if (getCloseEnemy()){\n        attackRanged(getTargetX(), getTargetY());\n    }\n}");
            }
        }

        tutorial.next()
    }
}

tutorial.lesson.checkAttack = async function(){
    var text = editor.getValue();

    let search
    if (user.language == 'blocks' || user.language == 'python'){
        search = text.search(/[\s]attackRanged[\s]{0,1}\(+[\s]*getTargetX[\s]{0,1}\(\)[\s]*\)*,[\s]*\(*[\s]*getTargetY[\s]{0,1}\(\)[\s]*\)*[:\s]/g) == -1 && text.search(/([\w]+)[\s]{0,1}=[\s]{0,1}getTarget[XY][\s]{0,1}\(\)[\w\W]*([\w]+)[\s]{0,1}=[\s]{0,1}getTarget[XY][\s]{0,1}\(\)[\w\W]*\n[\s(]*attackRanged[\s]{0,1}\([\s]*\1[\s]*,[\s]*\2[\s]*\)/g) == -1
    }
    else if (user.language == 'c'){
        search = text.search(/[(=<>!\s]attackRanged[\s]{0,1}\([\s]*getTargetX[\s]{0,1}\(\)[\s]*,[\s]*getTargetY[\s]{0,1}\(\)[\s]*\)[)!=<>;\s]*/g) == -1 && text.search(/([\w]+)[\s]{0,1}=[\s]{0,1}getTarget[XY][\s]{0,1}\(\);[\w\W]*([\w]+)[\s]{0,1}=[\s]{0,1}getTarget[XY][\s]{0,1}\(\);[\w\W]*\n[\s]*attackRanged[\s]{0,1}\([\s]*\1[\s]*,[\s]*\2[\s]*\);/g) == -1
    }

    if (search){
        let data
        if (user.language == 'blocks'){
            data = await showDialog("Antes de testar você deve adicionar o bloco que permite que o gladiador ataque. É só inserir o bloco <b>Ataque à distância</b> dentro do da condição que detectou o alvo, e nas coordenadas X e Y usar o bloco <b>Pegar [Coordenada X/Y] do alvo</b>",["Me mostre","Vou tentar"])
        }
        else{
            data = await showDialog("Antes de testar você deve adicionar o código que permite que o gladiador ataque. É só colocar a função <b>attackRanged</b> dentro do da condição que detectou o alvo, e como parâmetro do attackRanged colocar as funções <b>getTargetX</b> e <b>getTargetY</b>",["Me mostre","Vou tentar"])
        }
    
        if (data == "Me mostre"){
            if (user.language == 'blocks'){
                let code = '<xml xmlns="https://developers.google.com/blockly/xml"><variables><variable id="U=tSZ+ekH3hJ,haIaWqR">start</variable></variables><block type="variables_set" id="Y?PsUyJarv*xRk=b42Vl" x="60" y="50"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="sZQEw0Ni[={EdJ4Nm4{)"><field name="BOOL">TRUE</field></block></value></block><block type="loop" id="}N8OK1Qr^B.hPY!rF#NW" deletable="false" x="60" y="90"><statement name="CONTENT"><block type="controls_if" id="}{rSgs!hHjd-7+y1A6xA"><value name="IF0"><block type="variables_get" id="S*C7wUaq?lqyj,$wljdn"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field></block></value><statement name="DO0"><block type="move" id="6D*FQ.M92nACF@+o[3OW"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id="{m-rfV|02dxcApmeeFLT"><field name="NUM">12</field></shadow></value><value name="Y"><shadow type="math_number" id="ADNV{zHWjK2mH)~Hpd]J"><field name="NUM">12</field></shadow></value><next><block type="controls_if" id="CAYdNskAgv0M80[o]J}g"><value name="IF0"><block type="logic_operation" id="uR9:!F}(w[j)Cb#HwVjW" inline="false"><field name="OP">AND</field><value name="A"><block type="logic_compare" id="#rDBbsK_]5l#p60/Pp|u"><field name="OP">EQ</field><value name="A"><block type="get_info" id="O7P+X)EUx$Tkdfzs2p}!"><field name="COMPLEMENT">X</field></block></value><value name="B"><block type="math_number" id="upFi.JRrRv@S#MzPRTPZ"><field name="NUM">12</field></block></value></block></value><value name="B"><block type="logic_compare" id="F22OyBP]^g|rs.sE8y*c"><field name="OP">EQ</field><value name="A"><block type="get_info" id="c%j#dC^XI|Y+9*kvO+^n"><field name="COMPLEMENT">Y</field></block></value><value name="B"><block type="math_number" id="IbS`JYOSuii$8X(dIKld"><field name="NUM">12</field></block></value></block></value></block></value><statement name="DO0"><block type="variables_set" id="H^QP_}9s2G6Y+U|c[[J/"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="5S5)Ke~B!k=l2Y.#Bavn"><field name="BOOL">FALSE</field></block></value></block></statement></block></next></block></statement><next><block type="controls_if" id="3%8by*to|-Roz-.}OzLc"><comment pinned="false" h="80" w="160">detecta se tem inimigo próximo, e fixa a atenção nele</comment><value name="IF0"><block type="get_enemy" id="Rd*7*Ac!*QozhA%w1_d^"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="true"></mutation><field name="COMPLEMENT">CloseEnemy</field></block></value><statement name="DO0"><block type="ranged" id="4EIcJ[I[UGH2U]0C}n=(" inline="false"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="false"></mutation><value name="X"><shadow type="math_number" id="}vF+j}:O8+N].M`UTyN3"><field name="NUM">0</field></shadow><block type="get_target" id="_k+JH[2qQp$!0p.]$i*%"><field name="COMPLEMENT">X</field></block></value><value name="Y"><shadow type="math_number" id="j#Vn-{6r^FB=lXhZnI6n"><field name="NUM">0</field></shadow><block type="get_target" id="/]BGx,5X1V8@(::MpW,?"><field name="COMPLEMENT">Y</field></block></value></block></statement></block></next></block></statement></block></xml>'
                xmlDom = Blockly.Xml.textToDom(code)
                Blockly.mainWorkspace.clear()
                Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace)
            }
            else if (user.language == 'python'){
                editor.setValue("start = True\n\ndef loop():\n    global start\n    if start:\n        moveTo(12, 12)\n        if getX() == 12 and getY() == 12:\n            start = False\n    # detecta se tem inimigo próximo, e fixa a atenção nele\n    if getCloseEnemy():\n        attackRanged(getTargetX(), getTargetY()) # Ataca o alvo no ponto informado");
            }
            else if (user.language == 'c'){
                editor.setValue("int start=1;\n\nloop(){\n    if (start){\n        moveTo(12,12);\n        if (getX() == 12 && getY() == 12)\n            start = 0;\n    }\n    // detecta se tem inimigo próximo, e fixa a atenção nele\n    if (getCloseEnemy()){\n        attackRanged(getTargetX(), getTargetY()); // Ataca o alvo no ponto informado\n    }\n}");
            }
        }
    }
    else{
        tutorial.next()
        $('#test').click()
    }
}

tutorial.lesson.getHit = async function(){
    let data
    if (user.language == 'blocks')
        data = await showDialog("Perfeito. Agora você tem um gladiador que sabe se defender. Caso queira atacar corpo-a-corpo, pode usar o bloco <b>Ataque Corpo-a-corpo</b>",["Referência","Certo"])
    else
        data = await showDialog("Perfeito. Agora você tem um gladiador que sabe se defender. Caso queira atacar corpo-a-corpo, pode usar <b>attackMelee</b>",["Referência","Certo"])

    if (data == "Referência")
        window.open("function/attackmelee");
    
    if (user.language == 'blocks')
        data = await showDialog("Seu gladiador precisa também dar valor à vida dele. Vamos aprender alguns blocos para esse fim. O primeiro é <b>Fui acertado?</b>, que detecta se o gladiador foi ferido. Ele fica no submenu <b>Informações</b> dos blocos da gladCode. Atualize seu código de maneira que o gladiador tome uma atitude quando for ferido. Após, teste o gladiador",["Fui acertado?","Vou tentar"])
    else
        data = await showDialog("Seu gladiador precisa também dar valor à vida dele. Vamos aprender algumas funções para esse fim. A primeira é <b>getHit</b>, que detecta se o gladiador foi ferido. Atualize seu código de maneira que o gladiador tome uma atitude quando for ferido. Após, teste o gladiador",["getHit","Vou tentar"])

    if (data == "getHit" || data == 'Fui acertado?')
        window.open("function/gethit");
    
    tutorial.next()
}

tutorial.lesson.checkGetHit = async function(){
    var text = editor.getValue();

    if (text.search(/[(=]*[\s]*getHit[\s]{0,1}\(\)[\s]*[><!=;:)]*/g) == -1){
        let data
        if (user.language == 'blocks')
            data = await showDialog("Antes de testar você deve adicionar uma condição que permita que o gladiador verifique se foi ferido. Você deve usar o bloco <b>Fui acertado?</b> para este fim. Coloque-o dentro de uma condição (bloco Se) para fazer o teste. Se ele for ferido, faça algo, por exemplo, <b>virar 180 graus</b>",["Fui acertado?","Me ajuda","Beleza!"])
        else
            data = await showDialog("Antes de testar você deve adicionar uma condição que permita que o gladiador verifique se foi ferido. Você deve usar <b>getHit</b> para este fim. Coloque-o dentro de uma condição (if) para fazer o teste. Se ele for ferido, faça algo, por exemplo, <b>virar 180 graus</b>",["getHit","Me ajuda","Beleza!"])

        if (data == "getHit" || data == 'Fui acertado?')
            window.open("function/gethit");
        if (data == "Me ajuda"){
            await showDialog("Ok. Vou te ajudar nessa. Dê uma olhada no código e tente entender o que ele faz",["OK. Valeu!"])
        
            if (user.language == 'blocks'){
                let code = '<xml xmlns="https://developers.google.com/blockly/xml"><variables><variable id="U=tSZ+ekH3hJ,haIaWqR">start</variable></variables><block type="variables_set" id="Y?PsUyJarv*xRk=b42Vl" x="60" y="50"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="sZQEw0Ni[={EdJ4Nm4{)"><field name="BOOL">TRUE</field></block></value></block><block type="loop" id="}N8OK1Qr^B.hPY!rF#NW" deletable="false" x="60" y="90"><statement name="CONTENT"><block type="controls_if" id="}{rSgs!hHjd-7+y1A6xA"><mutation elseif="2" else="1"/><value name="IF0"><block type="gethit" id="XKN_@6azN_a7Mvj-F2L8"><comment pinned="false" h="80" w="160">Verifica se o gladiador foi ferido</comment></block></value><statement name="DO0"><block type="turnangle" id="%#vY3Fbmo/dw.qm8O9|b"><mutation xmlns="http://www.w3.org/1999/xhtml" operation="TURN"></mutation><field name="COMPLEMENT">TURN</field><comment pinned="false" h="80" w="160">Vira 180g caso tenha sido ferido</comment><value name="ANGLE"><shadow type="math_number" id="for:,~MQ)4eR1`f%#,x4"><field name="NUM">180</field></shadow></value></block></statement><value name="IF1"><block type="get_enemy" id="Rd*7*Ac!*QozhA%w1_d^"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="true"></mutation><field name="COMPLEMENT">CloseEnemy</field><comment pinned="false" h="80" w="160">Se não foi ferido, verifica se tem inimigo próximo</comment></block></value><statement name="DO1"><block type="ranged" id="4EIcJ[I[UGH2U]0C}n=(" inline="false"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="false"></mutation><comment pinned="false" h="80" w="160">Ataca alvo se encontrou inimigo</comment><value name="X"><shadow type="math_number" id="}vF+j}:O8+N].M`UTyN3"><field name="NUM">0</field></shadow><block type="get_target" id="_k+JH[2qQp$!0p.]$i*%"><field name="COMPLEMENT">X</field></block></value><value name="Y"><shadow type="math_number" id="j#Vn-{6r^FB=lXhZnI6n"><field name="NUM">0</field></shadow><block type="get_target" id="/]BGx,5X1V8@(::MpW,?"><field name="COMPLEMENT">Y</field></block></value></block></statement><value name="IF2"><block type="variables_get" id="S*C7wUaq?lqyj,$wljdn"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field></block></value><statement name="DO2"><block type="move" id="6D*FQ.M92nACF@+o[3OW"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id="{m-rfV|02dxcApmeeFLT"><field name="NUM">12</field></shadow></value><value name="Y"><shadow type="math_number" id="ADNV{zHWjK2mH)~Hpd]J"><field name="NUM">12</field></shadow></value><next><block type="controls_if" id="CAYdNskAgv0M80[o]J}g"><value name="IF0"><block type="logic_operation" id="uR9:!F}(w[j)Cb#HwVjW" inline="false"><field name="OP">AND</field><value name="A"><block type="logic_compare" id="#rDBbsK_]5l#p60/Pp|u"><field name="OP">EQ</field><value name="A"><block type="get_info" id="O7P+X)EUx$Tkdfzs2p}!"><field name="COMPLEMENT">X</field></block></value><value name="B"><block type="math_number" id="upFi.JRrRv@S#MzPRTPZ"><field name="NUM">12</field></block></value></block></value><value name="B"><block type="logic_compare" id="F22OyBP]^g|rs.sE8y*c"><field name="OP">EQ</field><value name="A"><block type="get_info" id="c%j#dC^XI|Y+9*kvO+^n"><field name="COMPLEMENT">Y</field></block></value><value name="B"><block type="math_number" id="IbS`JYOSuii$8X(dIKld"><field name="NUM">12</field></block></value></block></value></block></value><statement name="DO0"><block type="variables_set" id="H^QP_}9s2G6Y+U|c[[J/"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="5S5)Ke~B!k=l2Y.#Bavn"><field name="BOOL">FALSE</field></block></value></block></statement></block></next></block></statement><statement name="ELSE"><block type="turnangle" id="{29j!^-s1vFHL.in;E]s"><mutation xmlns="http://www.w3.org/1999/xhtml" operation="TURN"></mutation><field name="COMPLEMENT">TURN</field><value name="ANGLE"><shadow type="math_number" id="bP(RPy`NX.J*FqOt!T;B"><field name="NUM">60</field></shadow></value></block></statement></block></statement></block></xml>'
                xmlDom = Blockly.Xml.textToDom(code)
                Blockly.mainWorkspace.clear()
                Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace)
            }
            else if (user.language == 'python'){
                editor.setValue("start = True\ndef loop():\n    global start\n    if getHit(): # Verifica se o gladiador foi ferido\n        turn(180) # vira 180g caso tenha sido ferido\n    elif getCloseEnemy(): # se nao foi ferido, verifica se tem inimigo próximo\n        attackRanged(getTargetX(), getTargetY()) # ataca alvo se encontrou inimigo\n    elif start:\n        moveTo(12,12)\n        if getX() == 12 and getY() == 12:\n            start = False\n    else:\n        turn(60)")
            }
            else if (user.language == 'c'){
                editor.setValue("int start=1;\nloop(){\n    if (getHit()) //Verifica se o gladiador foi ferido\n        turn(180); //vira 180g caso tenha sido ferido\n    else if (getCloseEnemy()) //se nao foi ferido, verifica se tem inimigo próximo\n        attackRanged(getTargetX(), getTargetY()); //ataca alvo se encontrou inimigo\n    else if (start){\n        moveTo(12,12);\n        if (getX() == 12 && getY() == 12)\n            start = 0;\n    }\n    else\n        turn(60);\n}")
            }
        }
    }
    else{
        tutorial.next()
        $('#test').click();
    }
}

tutorial.lesson.reactHit = async function(){
    let data
    if (user.language == 'blocks'){
        data = await showDialog("Ok, agora o gladiador sabe quando foi ferido. Vamos fazer ele reagir a isso. Quando ele se ferir, você pode fazer com que ele se vire na direção de onde veio a agressão, dessa maneira fica mais fácil revidar. O bloco <b>Virar para [Ataque recebido]</b> serve para fazer o gladiador se virar para onde recebeu o ataque. Este é o mesmo bloco <b>Virar para [Posição]</b>, basta alterar a opção. Modifique esse trecho e teste o gladiador",["Referência","OK"])
    }
    else{
        data = await showDialog("Ok, agora o gladiador sabe quando foi ferido. Vamos fazer ele reagir a isso. Quando ele se ferir, você pode fazer com que ele se vire na direção de onde veio a agressão, dessa maneira fica mais fácil revidar. A função <b>turnToLastHit</b> serve para fazer o gladiador se virar para onde recebeu o ataque. Modifique esse trecho do código e teste o gladiador",["Referência","OK"])
    }

    if (data == "Referência")
        window.open("function/turntolasthit")

    tutorial.next()
}

tutorial.lesson.checkReact = async function(){
    var text = editor.getValue();

    let search
    if (user.language == 'blocks' || user.language == 'python')
        search = text.search(/[(=]*[\s]*getHit[\s]{0,1}\(\)[\s]*[><!=;:)][\w\W]*turnToLastHit[\s]{0,1}\(\)/g) == -1
    else if (user.language == 'c')
        search = text.search(/[(=][\s]*getHit[\s]{0,1}\(\)[\s]*[><!=;)][\w\W]*turnToLastHit[\s]{0,1}\(\)/g) == -1

    if (search){
        let data
        if (user.language == 'blocks'){
            data = await showDialog("Para avançar você precisa alterar seu programa para usar o bloco <b>Virar para [Ataque recebido]</b> dentro de uma condição que testa o resultado do bloco <b>Fui acertado?</b>. Desta maneira, o gladiador verifica se foi ferido, e em caso afirmativo, se vira para o agressor",["Han??","Não sei como","Entendi"])
        }
        else{
            data = await showDialog("Para avançar você precisa alterar seu código para usar a função <b>turnToLastHit</b> dentro de uma condição que testa o resultado da função <b>getHit</b>. Desta maneira, o gladiador verifica se foi ferido, e em caso afirmativo, se vira para o agressor",["Han??","Não sei como","Entendi"])
        }

        if (data == "Han??")
            window.open("function/turntolasthit");
        if (data == "Não sei como"){
            await showDialog("Tudo bem. Estamos aqui para aprender. Analise bem o código e tente entender o que ele faz",["Obrigado"])
        
            if (user.language == 'blocks'){
                let code = '<xml xmlns="https://developers.google.com/blockly/xml"><variables><variable id="U=tSZ+ekH3hJ,haIaWqR">start</variable></variables><block type="variables_set" id="Y?PsUyJarv*xRk=b42Vl" x="60" y="50"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="sZQEw0Ni[={EdJ4Nm4{)"><field name="BOOL">TRUE</field></block></value></block><block type="loop" id="}N8OK1Qr^B.hPY!rF#NW" deletable="false" x="60" y="90"><statement name="CONTENT"><block type="controls_if" id="}{rSgs!hHjd-7+y1A6xA"><mutation elseif="2" else="1"/><value name="IF0"><block type="gethit" id="XKN_@6azN_a7Mvj-F2L8"><comment pinned="false" h="80" w="160">Verifica se o gladiador foi ferido</comment></block></value><statement name="DO0"><block type="turn" id="be.xgflxz$DDthMmn?sq"><mutation xmlns="http://www.w3.org/1999/xhtml" where="HIT" use-return="false"></mutation><field name="COMPLEMENT">HIT</field><comment pinned="false" h="80" w="160">Vira em direção ao agressor</comment></block></statement><value name="IF1"><block type="get_enemy" id="Rd*7*Ac!*QozhA%w1_d^"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="true"></mutation><field name="COMPLEMENT">CloseEnemy</field><comment pinned="false" h="80" w="160">Se não foi ferido, verifica se tem inimigo próximo</comment></block></value><statement name="DO1"><block type="ranged" id="4EIcJ[I[UGH2U]0C}n=(" inline="false"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="false"></mutation><comment pinned="false" h="80" w="160">Ataca alvo se encontrou inimigo</comment><value name="X"><shadow type="math_number" id="}vF+j}:O8+N].M`UTyN3"><field name="NUM">0</field></shadow><block type="get_target" id="_k+JH[2qQp$!0p.]$i*%"><field name="COMPLEMENT">X</field></block></value><value name="Y"><shadow type="math_number" id="j#Vn-{6r^FB=lXhZnI6n"><field name="NUM">0</field></shadow><block type="get_target" id="/]BGx,5X1V8@(::MpW,?"><field name="COMPLEMENT">Y</field></block></value></block></statement><value name="IF2"><block type="variables_get" id="S*C7wUaq?lqyj,$wljdn"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field></block></value><statement name="DO2"><block type="move" id="6D*FQ.M92nACF@+o[3OW"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id="{m-rfV|02dxcApmeeFLT"><field name="NUM">12</field></shadow></value><value name="Y"><shadow type="math_number" id="ADNV{zHWjK2mH)~Hpd]J"><field name="NUM">12</field></shadow></value><next><block type="controls_if" id="CAYdNskAgv0M80[o]J}g"><value name="IF0"><block type="logic_operation" id="uR9:!F}(w[j)Cb#HwVjW" inline="false"><field name="OP">AND</field><value name="A"><block type="logic_compare" id="#rDBbsK_]5l#p60/Pp|u"><field name="OP">EQ</field><value name="A"><block type="get_info" id="O7P+X)EUx$Tkdfzs2p}!"><field name="COMPLEMENT">X</field></block></value><value name="B"><block type="math_number" id="upFi.JRrRv@S#MzPRTPZ"><field name="NUM">12</field></block></value></block></value><value name="B"><block type="logic_compare" id="F22OyBP]^g|rs.sE8y*c"><field name="OP">EQ</field><value name="A"><block type="get_info" id="c%j#dC^XI|Y+9*kvO+^n"><field name="COMPLEMENT">Y</field></block></value><value name="B"><block type="math_number" id="IbS`JYOSuii$8X(dIKld"><field name="NUM">12</field></block></value></block></value></block></value><statement name="DO0"><block type="variables_set" id="H^QP_}9s2G6Y+U|c[[J/"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="5S5)Ke~B!k=l2Y.#Bavn"><field name="BOOL">FALSE</field></block></value></block></statement></block></next></block></statement><statement name="ELSE"><block type="turnangle" id="{29j!^-s1vFHL.in;E]s"><mutation xmlns="http://www.w3.org/1999/xhtml" operation="TURN"></mutation><field name="COMPLEMENT">TURN</field><value name="ANGLE"><shadow type="math_number" id="bP(RPy`NX.J*FqOt!T;B"><field name="NUM">60</field></shadow></value></block></statement></block></statement></block></xml>'
                xmlDom = Blockly.Xml.textToDom(code)
                Blockly.mainWorkspace.clear()
                Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace)
            }
            else if (user.language == 'python'){
                editor.setValue("start = True\ndef loop():\n    global start\n    if getHit(): # Verifica se o gladiador foi ferido\n        turnToLastHit() # vira em direção ao agressor\n    elif getCloseEnemy(): # se nao foi ferido, verifica se tem inimigo próximo\n        attackRanged(getTargetX(), getTargetY()) # ataca alvo se encontrou inimigo\n    elif start:\n        moveTo(12, 12)\n        if getX() == 12 and getY() == 12:\n            start = False\n    else:\n        turn(60)")
            }
            else if (user.language == 'c'){
                editor.setValue("int start=1;\nloop(){\n    if (getHit()) //Verifica se o gladiador foi ferido\n        turnToLastHit(); //vira em direção ao agressor\n    else if (getCloseEnemy()) //se nao foi ferido, verifica se tem inimigo próximo\n        attackRanged(getTargetX(), getTargetY()); //ataca alvo se encontrou inimigo\n    else if (start){\n        moveTo(12,12);\n        if (getX() == 12 && getY() == 12)\n            start = 0;\n    }\n    else\n        turn(60);\n}");
            }
        }
    }
    else{
        tutorial.next()
        $('#test').click();
    }
}

tutorial.lesson.safe = async function(){
    await showDialog("Ótimo. Seu gladiador está ficando cada vez mais inteligente. Para concluir o assunto sobrevivência é importante falar sobre o <b>gás tóxico</b>. Após certo tempo, começa a emanar das bordas da arena uma nuvem mortal que causa dano em todos que estiverem em contato. O único refúgio é se dirigir para o centro na medida que a nuvem toma conta da periferia da arena.",["Hmm, perigoso"])

    let data
    if (user.language == 'blocks'){
        data = await showDialog("Um gladiador consegue saber se sua vida está ameaçada pela nuvem utilizando o bloco <b>É seguro [Aqui]?</b>. Ele fica no submenu <b>Percepção</b> de blocos da gladCode. Gostaria que você adicionasse mais uma condição no código para fazer o gladiador evitar estas zonas perigosas. Após adicionar, teste o gladiador para prosseguir",["Referência","Vou tentar"])
    }
    else{
        data = await showDialog("Um gladiador consegue saber se sua vida está ameaçada pela nuvem utilizando a função <b>isSafeHere</b>. Gostaria que você adicionasse mais uma condição no código para fazer o gladiador evitar estas zonas perigosas. Após adicionar, teste o gladiador para prosseguir",["Referência","Vou tentar"])
    }

    if (data == "Referência")
        window.open("function/issafehere");
    
    tutorial.next()
}

tutorial.lesson.checkSafe = async function(){
    var text = editor.getValue();

    let search
    if (user.language == 'blocks' || user.language == 'python')
        search = text.search(/[!(\s=<>]isSafeHere[\s]{0,1}\(\)[\s)=<>:]/g) == -1
    else
        search = text.search(/[!(\s=<>]isSafeHere[\s]{0,1}\(\)[\s)=<>]/g) == -1

    if (search){
        let data
        if (user.language == 'blocks'){
            data = await showDialog("Ei! Voçê está esquecendo de colocar o bloco <b>É seguro [Aqui]?</b>. Sem ele seu gladiador poderá morrer envenenado.",["Estou perdido","Verdade"])
        }
        else{
            data = await showDialog("Ei! Voçê está esquecendo de colocar a função <b>isSafeHere</b>. Sem ela seu gladiador poderá morrer envenenado.",["Estou perdido","Verdade"])
        }

        if (data == "Estou perdido"){
            data = await showDialog("Está certo. Vou lhe mostrar o código. Mas talvez você queira dar uma estudada no que já foi visto.",["É melhor","Estou bem"])

            if (data == "É melhor")
                window.open("function/issafehere");
            
            if (user.language == 'blocks'){
                let code = '<xml xmlns="https://developers.google.com/blockly/xml"><variables><variable id="U=tSZ+ekH3hJ,haIaWqR">start</variable></variables><block type="variables_set" id="Y?PsUyJarv*xRk=b42Vl" x="60" y="50"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="sZQEw0Ni[={EdJ4Nm4{)"><field name="BOOL">TRUE</field></block></value></block><block type="loop" id="}N8OK1Qr^B.hPY!rF#NW" deletable="false" x="60" y="90"><statement name="CONTENT"><block type="controls_if" id="}{rSgs!hHjd-7+y1A6xA"><mutation elseif="3" else="1"/><value name="IF0"><block type="logic_negate" id="*vHSVNu?Eg`2(fVFV3Mb"><value name="BOOL"><block type="issafe" id="=Tn`9uV+A=k|m{d?M8)p"><mutation xmlns="http://www.w3.org/1999/xhtml" position="false"></mutation><field name="COMPLEMENT">Here</field><comment pinned="false" h="80" w="160">Testa se o gladiador está em cima da nuvem</comment></block></value></block></value><statement name="DO0"><block type="move" id="5z9]#C8|W!^I`M8PN#Vy"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><comment pinned="false" h="80" w="160">Foge da nuvem, em direção ao centro</comment><value name="X"><shadow type="math_number" id=".zr3fXOH[oqd60y3ShsW"><field name="NUM">12.5</field></shadow></value><value name="Y"><shadow type="math_number" id="8:o!D]!GC;oPw=OtB)7X"><field name="NUM">12.5</field></shadow></value></block></statement><value name="IF1"><block type="gethit" id="XKN_@6azN_a7Mvj-F2L8"/></value><statement name="DO1"><block type="turn" id="be.xgflxz$DDthMmn?sq"><mutation xmlns="http://www.w3.org/1999/xhtml" where="HIT" use-return="false"></mutation><field name="COMPLEMENT">HIT</field></block></statement><value name="IF2"><block type="get_enemy" id="Rd*7*Ac!*QozhA%w1_d^"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="true"></mutation><field name="COMPLEMENT">CloseEnemy</field></block></value><statement name="DO2"><block type="ranged" id="4EIcJ[I[UGH2U]0C}n=(" inline="false"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="false"></mutation><value name="X"><shadow type="math_number" id="}vF+j}:O8+N].M`UTyN3"><field name="NUM">0</field></shadow><block type="get_target" id="_k+JH[2qQp$!0p.]$i*%"><field name="COMPLEMENT">X</field></block></value><value name="Y"><shadow type="math_number" id="j#Vn-{6r^FB=lXhZnI6n"><field name="NUM">0</field></shadow><block type="get_target" id="/]BGx,5X1V8@(::MpW,?"><field name="COMPLEMENT">Y</field></block></value></block></statement><value name="IF3"><block type="variables_get" id="S*C7wUaq?lqyj,$wljdn"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field></block></value><statement name="DO3"><block type="move" id="6D*FQ.M92nACF@+o[3OW"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id="{m-rfV|02dxcApmeeFLT"><field name="NUM">12</field></shadow></value><value name="Y"><shadow type="math_number" id="ADNV{zHWjK2mH)~Hpd]J"><field name="NUM">12</field></shadow></value><next><block type="controls_if" id="CAYdNskAgv0M80[o]J}g"><value name="IF0"><block type="logic_operation" id="uR9:!F}(w[j)Cb#HwVjW" inline="false"><field name="OP">AND</field><value name="A"><block type="logic_compare" id="#rDBbsK_]5l#p60/Pp|u"><field name="OP">EQ</field><value name="A"><block type="get_info" id="O7P+X)EUx$Tkdfzs2p}!"><field name="COMPLEMENT">X</field></block></value><value name="B"><block type="math_number" id="upFi.JRrRv@S#MzPRTPZ"><field name="NUM">12</field></block></value></block></value><value name="B"><block type="logic_compare" id="F22OyBP]^g|rs.sE8y*c"><field name="OP">EQ</field><value name="A"><block type="get_info" id="c%j#dC^XI|Y+9*kvO+^n"><field name="COMPLEMENT">Y</field></block></value><value name="B"><block type="math_number" id="IbS`JYOSuii$8X(dIKld"><field name="NUM">12</field></block></value></block></value></block></value><statement name="DO0"><block type="variables_set" id="H^QP_}9s2G6Y+U|c[[J/"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="5S5)Ke~B!k=l2Y.#Bavn"><field name="BOOL">FALSE</field></block></value></block></statement></block></next></block></statement><statement name="ELSE"><block type="turnangle" id="{29j!^-s1vFHL.in;E]s"><mutation xmlns="http://www.w3.org/1999/xhtml" operation="TURN"></mutation><field name="COMPLEMENT">TURN</field><value name="ANGLE"><shadow type="math_number" id="bP(RPy`NX.J*FqOt!T;B"><field name="NUM">60</field></shadow></value></block></statement></block></statement></block></xml>'
                xmlDom = Blockly.Xml.textToDom(code)
                Blockly.mainWorkspace.clear()
                Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace)
            }
            else if (user.language == 'python'){
                editor.setValue("start = True\ndef loop():\n    global start\n    if not isSafeHere(): # testa se o gladiador está em cima da nuvem\n        moveTo(12.5, 12.5) # foge da nuvem, em direção ao centro\n    if getHit():\n        turnToLastHit()\n    elif getCloseEnemy():\n        attackRanged(getTargetX(), getTargetY())\n    elif start:\n        moveTo(12, 12)\n        if getX() == 12 and getY() == 12:\n            start = False\n    else:\n        turn(60)");
            }
            else if (user.language == 'c'){
                editor.setValue("int start=1;\nloop(){\n    if (!isSafeHere()) //testa se o gladiador está em cima da nuvem\n        moveTo(12.5,12.5); //foge da nuvem, em direção ao centro\n    else if (getHit())\n        turnToLastHit();\n    else if (getCloseEnemy())\n        attackRanged(getTargetX(), getTargetY());\n    else if (start){\n        moveTo(12,12);\n        if (getX() == 12 && getY() == 12)\n            start = 0;\n    }\n    else\n        turn(60);\n}");
            }
        }
    }
    else{
        tutorial.next()
        $('#test').click();
    }
}

tutorial.lesson.fireball = async function(){
    let data
    let addinfo = ''
    if (user.language == 'blocks')
        addinfo = '. Você pode encontrá-las no submenu <b>Habilidades</b> dos blocos da gladCode'

    data = await showDialog(`Agora por fim iremos aprender sobre as habilidades dos gladiadores. As habilidades são ações especiais que gastam o recurso <b>pontos de habilidade</b> (ap) para serem usados. As habilidades possibilitam efeitos incríveis e poderosos aos gladiadores${addinfo}`,["Quero aprender mais","Entendi"])

    if (data == "Quero aprender mais")
        window.open("manual#nav-hab");
    
    if (user.language == 'blocks'){
        data = await showDialog("Vamos usar o bloco <b>Bola de fogo</b> para fazer com que o gladiador lance uma bola de fogo no inimigo. O bloco funciona parecido com <b>Ataque à distância</b>. Você precisa somente fornecer as coordenadas <b>X</b> e <b>Y</b> do ponto onde deseja lançar a habilidade. Modifique seu programa trocando Ataque à distância por Bola de fogo, e teste o gladiador",["Referência","OK"])
    }
    else{
        data = await showDialog("Vamos usar a função <b>fireball</b> para fazer com que o gladiador lance uma bola de fogo no inimigo. A função funciona parecido com <b>attackRanged</b>. Você precisa somente fornecer as coordenadas <b>X</b> e <b>Y</b> do ponto onde deseja lançar a habilidade. Modifique seu código trocando attackRanged por fireball, e teste o gladiador",["Referência","OK"])
    }

    if (data == "Referência")
        window.open("function/fireball");
    
    tutorial.next()
}

tutorial.lesson.checkFireball = async function(){
    var text = editor.getValue();

    let search
    if (user.language == 'blocks' || user.language == 'python')
        search = text.search(/[\s]fireball[\s]{0,1}\([\s\(]*getTargetX[\s]{0,1}\(\)[\s\)]*,[\s\(]*getTargetY[\s]{0,1}\(\)[\s\)]*\)[\s]/g) == -1 && text.search(/([\w]+)[\s]{0,1}=[\s]{0,1}getTarget[XY][\s]{0,1}\(\)[\w\W]*([\w]+)[\s]{0,1}=[\s]{0,1}getTarget[XY][\s]{0,1}\(\)[\w\W]*\n[\s]*fireball[\s]{0,1}\([\s]*\1[\s]*,[\s]*\2[\s]*\)/g) == -1
    else
        search = text.search(/[\s]fireball[\s]{0,1}\([\s]*getTargetX[\s]{0,1}\(\)[\s]*,[\s]*getTargetY[\s]{0,1}\(\)[\s]*\)[;\s]/g) == -1 && text.search(/([\w]+)[\s]{0,1}=[\s]{0,1}getTarget[XY][\s]{0,1}\(\);[\w\W]*([\w]+)[\s]{0,1}=[\s]{0,1}getTarget[XY][\s]{0,1}\(\);[\w\W]*\n[\s]*fireball[\s]{0,1}\([\s]*\1[\s]*,[\s]*\2[\s]*\);/g) == -1

    if (search){
        let data
        if (user.language == 'blocks'){
            data = await showDialog("Você deveria inserir o block <b>Bola de fogo</b> em seu programa. Ela fará seu gladiador obliterar os oponentes. Precisa de ajuda?",["Bola de fogo?","Sim, preciso","Não, valeu"])
            if (data == "Bola de fogo?")
                window.open("function/fireball");
        }
        else{
            data = await showDialog("Você deveria inserir a função <b>fireball</b> em seu código. Ela fará seu gladiador obliterar os oponentes. Precisa de ajuda?",["fireball?","Sim, preciso","Não, valeu"])
            if (data == "fireball?")
                window.open("function/fireball");
        }

        if (data == "Sim, preciso"){
            if (user.language == 'blocks'){
                let code = '<xml xmlns="https://developers.google.com/blockly/xml"><variables><variable id="U=tSZ+ekH3hJ,haIaWqR">start</variable></variables><block type="variables_set" id="Y?PsUyJarv*xRk=b42Vl" x="60" y="50"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="sZQEw0Ni[={EdJ4Nm4{)"><field name="BOOL">TRUE</field></block></value></block><block type="loop" id="}N8OK1Qr^B.hPY!rF#NW" deletable="false" x="60" y="90"><statement name="CONTENT"><block type="controls_if" id="}{rSgs!hHjd-7+y1A6xA"><mutation elseif="3" else="1"/><value name="IF0"><block type="logic_negate" id="*vHSVNu?Eg`2(fVFV3Mb"><value name="BOOL"><block type="issafe" id="=Tn`9uV+A=k|m{d?M8)p"><mutation xmlns="http://www.w3.org/1999/xhtml" position="false"></mutation><field name="COMPLEMENT">Here</field></block></value></block></value><statement name="DO0"><block type="move" id="5z9]#C8|W!^I`M8PN#Vy"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id=".zr3fXOH[oqd60y3ShsW"><field name="NUM">12.5</field></shadow></value><value name="Y"><shadow type="math_number" id="8:o!D]!GC;oPw=OtB)7X"><field name="NUM">12.5</field></shadow></value></block></statement><value name="IF1"><block type="gethit" id="XKN_@6azN_a7Mvj-F2L8"/></value><statement name="DO1"><block type="turn" id="be.xgflxz$DDthMmn?sq"><mutation xmlns="http://www.w3.org/1999/xhtml" where="HIT" use-return="false"></mutation><field name="COMPLEMENT">HIT</field></block></statement><value name="IF2"><block type="get_enemy" id="Rd*7*Ac!*QozhA%w1_d^"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="true"></mutation><field name="COMPLEMENT">CloseEnemy</field></block></value><statement name="DO2"><block type="fireball" id=",bB7_EiZs(VXSV5i.n}~" inline="false"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="false"></mutation><comment pinned="false" h="80" w="160">Arremessa bola de fogo</comment><value name="X"><shadow type="math_number" id="N:;]`eiZ.S/+K1O`,ygr"><field name="NUM">0</field></shadow><block type="get_target" id="_k+JH[2qQp$!0p.]$i*%"><field name="COMPLEMENT">X</field></block></value><value name="Y"><shadow type="math_number" id="XO~!LJoc_/`RA/].3G|~"><field name="NUM">0</field></shadow><block type="get_target" id="/]BGx,5X1V8@(::MpW,?"><field name="COMPLEMENT">Y</field></block></value></block></statement><value name="IF3"><block type="variables_get" id="S*C7wUaq?lqyj,$wljdn"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field></block></value><statement name="DO3"><block type="move" id="6D*FQ.M92nACF@+o[3OW"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id="{m-rfV|02dxcApmeeFLT"><field name="NUM">12</field></shadow></value><value name="Y"><shadow type="math_number" id="ADNV{zHWjK2mH)~Hpd]J"><field name="NUM">12</field></shadow></value><next><block type="controls_if" id="CAYdNskAgv0M80[o]J}g"><value name="IF0"><block type="logic_operation" id="uR9:!F}(w[j)Cb#HwVjW" inline="false"><field name="OP">AND</field><value name="A"><block type="logic_compare" id="#rDBbsK_]5l#p60/Pp|u"><field name="OP">EQ</field><value name="A"><block type="get_info" id="O7P+X)EUx$Tkdfzs2p}!"><field name="COMPLEMENT">X</field></block></value><value name="B"><block type="math_number" id="upFi.JRrRv@S#MzPRTPZ"><field name="NUM">12</field></block></value></block></value><value name="B"><block type="logic_compare" id="F22OyBP]^g|rs.sE8y*c"><field name="OP">EQ</field><value name="A"><block type="get_info" id="c%j#dC^XI|Y+9*kvO+^n"><field name="COMPLEMENT">Y</field></block></value><value name="B"><block type="math_number" id="IbS`JYOSuii$8X(dIKld"><field name="NUM">12</field></block></value></block></value></block></value><statement name="DO0"><block type="variables_set" id="H^QP_}9s2G6Y+U|c[[J/"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="5S5)Ke~B!k=l2Y.#Bavn"><field name="BOOL">FALSE</field></block></value></block></statement></block></next></block></statement><statement name="ELSE"><block type="turnangle" id="{29j!^-s1vFHL.in;E]s"><mutation xmlns="http://www.w3.org/1999/xhtml" operation="TURN"></mutation><field name="COMPLEMENT">TURN</field><value name="ANGLE"><shadow type="math_number" id="bP(RPy`NX.J*FqOt!T;B"><field name="NUM">60</field></shadow></value></block></statement></block></statement></block></xml>'
                xmlDom = Blockly.Xml.textToDom(code)
                Blockly.mainWorkspace.clear()
                Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace)
            }
            else if (user.language == 'python'){
                editor.setValue("start = True\ndef loop():\n    global start\n    if not isSafeHere():\n        moveTo(12.5, 12.5)\n    elif getHit():\n        turnToLastHit()\n    elif getCloseEnemy():\n        fireball(getTargetX(), getTargetY()) # arremessa bola de fogo\n    elif start:\n        moveTo(12, 12)\n        if getX() == 12 and getY() == 12:\n            start = False\n    else:\n        turn(60)")
            }
            else if (user.language == 'c'){
                editor.setValue("int start=1;\nloop(){\n    if (!isSafeHere())\n        moveTo(12.5,12.5);\n    else if (getHit())\n        turnToLastHit();\n    else if (getCloseEnemy())\n        fireball(getTargetX(), getTargetY()); //arremessa bola de fogo\n    else if (start){\n        moveTo(12,12);\n        if (getX() == 12 && getY() == 12)\n            start = 0;\n    }\n    else\n        turn(60);\n}");
            }
        }
    }
    else{
        tutorial.next()
        $('#test').click();
    }
}

tutorial.lesson.teleport = async function(){
    let data = await showDialog("Muito bem! O uso das habilidades é essencial para o sucesso do gladiador. Aprenda sobre todas elas para descobrir suas forças e fraquezas.",["Quero aprender","Pensarei a respeito"])

    if (data == "Quero aprender")
        window.open("manual#nav-hab");

    if (user.language == 'blocks'){
        await showDialog("Agora vamos aprender sobre a habilidade <b>Teletransporte</b>. Ela é muito útil quando seu gladiador se vê em uma posição indesejada. Usando o Teletransporte seu gladiador instantaneamente se transporta para um ponto qualquer. Vamos mudar o código para que o gladiador se transporte para a posição (5,5) quando for ferido (dentro da condição do <b>Fui acertado?</b>). Teste o gladiador após a mudança",["Referência","OK"])
    }
    else{
        data = await showDialog("Agora vamos aprender sobre a habilidade <b>teleport</b>. Ela é muito útil quando seu gladiador se vê em uma posição indesejada. Usando o teleport seu gladiador instantaneamente se transporta para um ponto qualquer. Vamos mudar o código para que o gladiador se transporte para a posição (5,5) quando for ferido (dentro da condição do <b>getHit</b>). Teste o gladiador após a mudança",["Referência","OK"])
    }

    if (data == "Referência")
        window.open("function/teleport");
    
    tutorial.next()
}

tutorial.lesson.checkTeleport = async function(){
    var text = editor.getValue();

    let search
    if (user.language == 'blocks')
        search = text.search(/[\s]teleport[\s]{0,1}\([\w\d\s]+,[\w\d\s]+\)[\s]/g) == -1
    else
        search = text.search(/[\s]teleport[\s]{0,1}\([\w\d\s]+,[\w\d\s]+\)[;\s]/g) == -1

    if (search){
        let data
        if (user.language == 'blocks'){
            data = await showDialog("Você deveria inserir o bloco <b>Teletransporte</b> em seu programa. Ela faz com que seu gladiador instantaneamente fuja quando for ferido. Precisa de ajuda?",["Tele o q?","Sim, preciso","Não, valeu"])
            if (data == "Tele o q?")
                window.open("function/teleport");
        }
        else{
            data = await showDialog("Você deveria inserir a função <b>teleport</b> em seu código. Ela faz com que seu gladiador instantaneamente fuja quando for ferido. Precisa de ajuda?",["teleport?","Sim, preciso","Não, valeu"])
            if (data == "teleport?")
                window.open("function/teleport");
        }

        if (data == "Sim, preciso"){
            if (user.language == 'blocks'){
                let code = '<xml xmlns="https://developers.google.com/blockly/xml"><variables><variable id="U=tSZ+ekH3hJ,haIaWqR">start</variable></variables><block type="variables_set" id="Y?PsUyJarv*xRk=b42Vl" x="60" y="50"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="sZQEw0Ni[={EdJ4Nm4{)"><field name="BOOL">TRUE</field></block></value></block><block type="loop" id="}N8OK1Qr^B.hPY!rF#NW" deletable="false" x="60" y="90"><statement name="CONTENT"><block type="controls_if" id="}{rSgs!hHjd-7+y1A6xA"><mutation elseif="3" else="1"/><value name="IF0"><block type="logic_negate" id="*vHSVNu?Eg`2(fVFV3Mb"><value name="BOOL"><block type="issafe" id="=Tn`9uV+A=k|m{d?M8)p"><mutation xmlns="http://www.w3.org/1999/xhtml" position="false"></mutation><field name="COMPLEMENT">Here</field></block></value></block></value><statement name="DO0"><block type="move" id="5z9]#C8|W!^I`M8PN#Vy"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id=".zr3fXOH[oqd60y3ShsW"><field name="NUM">12.5</field></shadow></value><value name="Y"><shadow type="math_number" id="8:o!D]!GC;oPw=OtB)7X"><field name="NUM">12.5</field></shadow></value></block></statement><value name="IF1"><block type="gethit" id="XKN_@6azN_a7Mvj-F2L8"/></value><statement name="DO1"><block type="teleport" id="G(HNk==N`x=rhg.sH$8."><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="false"></mutation><comment pinned="false" h="80" w="160">Foge para posição 5,5 quando for ferido</comment><value name="X"><shadow type="math_number" id="K_+iqSfUHkD,l`_`:YSJ"><field name="NUM">5</field></shadow></value><value name="Y"><shadow type="math_number" id="24{2)/QLEE|1{RryuBQx"><field name="NUM">5</field></shadow></value></block></statement><value name="IF2"><block type="get_enemy" id="Rd*7*Ac!*QozhA%w1_d^"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="true"></mutation><field name="COMPLEMENT">CloseEnemy</field></block></value><statement name="DO2"><block type="fireball" id=",bB7_EiZs(VXSV5i.n}~" inline="false"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="false"></mutation><value name="X"><shadow type="math_number" id="N:;]`eiZ.S/+K1O`,ygr"><field name="NUM">0</field></shadow><block type="get_target" id="_k+JH[2qQp$!0p.]$i*%"><field name="COMPLEMENT">X</field></block></value><value name="Y"><shadow type="math_number" id="XO~!LJoc_/`RA/].3G|~"><field name="NUM">0</field></shadow><block type="get_target" id="/]BGx,5X1V8@(::MpW,?"><field name="COMPLEMENT">Y</field></block></value></block></statement><value name="IF3"><block type="variables_get" id="S*C7wUaq?lqyj,$wljdn"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field></block></value><statement name="DO3"><block type="move" id="6D*FQ.M92nACF@+o[3OW"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id="{m-rfV|02dxcApmeeFLT"><field name="NUM">12</field></shadow></value><value name="Y"><shadow type="math_number" id="ADNV{zHWjK2mH)~Hpd]J"><field name="NUM">12</field></shadow></value><next><block type="controls_if" id="CAYdNskAgv0M80[o]J}g"><value name="IF0"><block type="logic_operation" id="uR9:!F}(w[j)Cb#HwVjW" inline="false"><field name="OP">AND</field><value name="A"><block type="logic_compare" id="#rDBbsK_]5l#p60/Pp|u"><field name="OP">EQ</field><value name="A"><block type="get_info" id="O7P+X)EUx$Tkdfzs2p}!"><field name="COMPLEMENT">X</field></block></value><value name="B"><block type="math_number" id="upFi.JRrRv@S#MzPRTPZ"><field name="NUM">12</field></block></value></block></value><value name="B"><block type="logic_compare" id="F22OyBP]^g|rs.sE8y*c"><field name="OP">EQ</field><value name="A"><block type="get_info" id="c%j#dC^XI|Y+9*kvO+^n"><field name="COMPLEMENT">Y</field></block></value><value name="B"><block type="math_number" id="IbS`JYOSuii$8X(dIKld"><field name="NUM">12</field></block></value></block></value></block></value><statement name="DO0"><block type="variables_set" id="H^QP_}9s2G6Y+U|c[[J/"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="5S5)Ke~B!k=l2Y.#Bavn"><field name="BOOL">FALSE</field></block></value></block></statement></block></next></block></statement><statement name="ELSE"><block type="turnangle" id="{29j!^-s1vFHL.in;E]s"><mutation xmlns="http://www.w3.org/1999/xhtml" operation="TURN"></mutation><field name="COMPLEMENT">TURN</field><value name="ANGLE"><shadow type="math_number" id="bP(RPy`NX.J*FqOt!T;B"><field name="NUM">60</field></shadow></value></block></statement></block></statement></block></xml>'
                xmlDom = Blockly.Xml.textToDom(code)
                Blockly.mainWorkspace.clear()
                Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace)
            }
            else if (user.language == 'python'){
                editor.setValue("start = True\ndef loop():\n    global start\n    if not isSafeHere():\n        moveTo(12.5, 12.5)\n    elif getHit():\n        teleport(5, 5) # foge para posição 5,5 quando for ferido\n    elif getCloseEnemy():\n        fireball(getTargetX(), getTargetY())\n    elif start:\n        moveTo(12, 12)\n        if getX() == 12 and getY() == 12:\n            start = False\n    else:\n        turn(60)")
            }
            else if (user.language == 'c'){
                editor.setValue("int start=1;\nloop(){\n    if (!isSafeHere())\n        moveTo(12.5,12.5);\n    else if (getHit())\n        teleport(5,5); //foge para posição 5,5 quando for ferido\n    else if (getCloseEnemy())\n        fireball(getTargetX(), getTargetY());\n    else if (start){\n        moveTo(12,12);\n        if (getX() == 12 && getY() == 12)\n            start = 0;\n    }\n    else\n        turn(60);\n}")
            }
        }
    }
    else{
        tutorial.next()
        $('#test').click();
    }
}

tutorial.lesson.upgrade = async function(){

    let name = 'teleport'
    if (user.language == 'blocks')
        name = "teletransporte"

    let data = await showDialog(`Ótimo! Você aprendeu como se usa o ${name}, mas se você quer ser um proficiente mestre de gladiadores precisa aprender sobre todas habilidades.`,["Me mostre","Talvez mais tarde"])

    if (data == "Me mostre")
        window.open("manual#nav-hab")

    data = await showDialog("Na medida que os gladiadores participam das batalhas eles ganham <b>experiência</b> e eventualmente aumentam de <b>nível</b>. Subir de nível faz com que o gladiador ganhe <b>cinco pontos</b> para distribuir em quaisquer de seus atributos: Força, Agilidade ou Inteligência",["Onde diz isso?","Entendi"])

    if (data == "Onde diz isso?")
        window.open("manual#nav-sim")

    if (user.language == 'blocks'){
        data = await showDialog("Através do bloco <b>Melhorar [Força/Agilidade/Inteligência]</b> o gladiador pode decidir qual de seus atributos deseja melhorar ao subir de nível. O bloco pode ser usado em qualquer parte do bloco loop. Experimente usa-lo e teste o gladiador",["Referência","Deixa comigo"])
    }
    else{
        data = await showDialog("Através das funções <b>upgradeSTR</b>, <b>upgradeAGI</b> e <b>upgradeINT</b> o gladiador pode decidir qual de seus atributos deseja melhorar ao subir de nível. A função pode ser chamada em qualquer trecho da função loop. Experimente uma das três e teste o gladiador",["Referência","Deixa comigo"])
    }

    if (data == "Referência")
        window.open("docs#nav-up")
    
    tutorial.next()
}

tutorial.lesson.checkUpgrade = async function(){
    var text = editor.getValue();

    let search
    if (user.language == 'blocks' || user.language == 'python')
        search = text.search(/[\s\()]*upgrade(INT|STR|AGI)[\s]{0,1}\([\d]{1,3}\)[\)\s]*/g) == -1
    else
        search = text.search(/[\s]upgrade(INT|STR|AGI)[\s]{0,1}\([\d]{1,3}\)[;\s]/g) == -1

    if (search){
        let data
        if (user.language == 'blocks'){
            data = await showDialog("Você deve inserir o bloco <b>Melhorar [Força/Agilidade/Inteligência]</b> no comportamento do gladiador. Só assim ele poderá melhorar um de seus atributos quando subir de nível",["Melhorar?","Não sei como","OK"])
            if (data == "Melhorar?")
                window.open("docs#nav-up")
        }
        else{
            data = await showDialog("Você deve inserir <b>upgradeSTR</b>, <b>upgradeAGI</b> ou <b>upgradeINT</b> no comportamento do gladiador. Só assim ele poderá melhorar um de seus atributos quando subir de nível",["upgrade?","Não sei como","OK"])
            if (data == "upgrade?")
                window.open("docs#nav-up")
        }

        if (data == "Não sei como"){
            if (user.language == 'blocks'){
                let code = '<xml xmlns="https://developers.google.com/blockly/xml"><variables><variable id="U=tSZ+ekH3hJ,haIaWqR">start</variable></variables><block type="variables_set" id="Y?PsUyJarv*xRk=b42Vl" x="60" y="50"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="sZQEw0Ni[={EdJ4Nm4{)"><field name="BOOL">TRUE</field></block></value></block><block type="loop" id="}N8OK1Qr^B.hPY!rF#NW" deletable="false" x="60" y="90"><statement name="CONTENT"><block type="upgrade" id="#Xz5$iF61`E;?ox7y(gW"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="false"></mutation><field name="COMPLEMENT">INT</field><comment pinned="false" h="80" w="160">Melhora inteligência quando subir de nível</comment><value name="VALUE"><shadow type="math_number" id="HN_tMV.N9wt*7c;(i-Eb"><field name="NUM">5</field></shadow></value><next><block type="controls_if" id="}{rSgs!hHjd-7+y1A6xA"><mutation elseif="3" else="1"/><value name="IF0"><block type="logic_negate" id="*vHSVNu?Eg`2(fVFV3Mb"><value name="BOOL"><block type="issafe" id="=Tn`9uV+A=k|m{d?M8)p"><mutation xmlns="http://www.w3.org/1999/xhtml" position="false"></mutation><field name="COMPLEMENT">Here</field></block></value></block></value><statement name="DO0"><block type="move" id="5z9]#C8|W!^I`M8PN#Vy"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id=".zr3fXOH[oqd60y3ShsW"><field name="NUM">12.5</field></shadow></value><value name="Y"><shadow type="math_number" id="8:o!D]!GC;oPw=OtB)7X"><field name="NUM">12.5</field></shadow></value></block></statement><value name="IF1"><block type="gethit" id="XKN_@6azN_a7Mvj-F2L8"/></value><statement name="DO1"><block type="teleport" id="G(HNk==N`x=rhg.sH$8."><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="false"></mutation><value name="X"><shadow type="math_number" id="K_+iqSfUHkD,l`_`:YSJ"><field name="NUM">5</field></shadow></value><value name="Y"><shadow type="math_number" id="24{2)/QLEE|1{RryuBQx"><field name="NUM">5</field></shadow></value></block></statement><value name="IF2"><block type="get_enemy" id="Rd*7*Ac!*QozhA%w1_d^"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="true"></mutation><field name="COMPLEMENT">CloseEnemy</field></block></value><statement name="DO2"><block type="fireball" id=",bB7_EiZs(VXSV5i.n}~" inline="false"><mutation xmlns="http://www.w3.org/1999/xhtml" use-return="false"></mutation><value name="X"><shadow type="math_number" id="N:;]`eiZ.S/+K1O`,ygr"><field name="NUM">0</field></shadow><block type="get_target" id="_k+JH[2qQp$!0p.]$i*%"><field name="COMPLEMENT">X</field></block></value><value name="Y"><shadow type="math_number" id="XO~!LJoc_/`RA/].3G|~"><field name="NUM">0</field></shadow><block type="get_target" id="/]BGx,5X1V8@(::MpW,?"><field name="COMPLEMENT">Y</field></block></value></block></statement><value name="IF3"><block type="variables_get" id="S*C7wUaq?lqyj,$wljdn"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field></block></value><statement name="DO3"><block type="move" id="6D*FQ.M92nACF@+o[3OW"><mutation xmlns="http://www.w3.org/1999/xhtml" position="true" use-return="false"></mutation><field name="COMPLEMENT">TO</field><value name="X"><shadow type="math_number" id="{m-rfV|02dxcApmeeFLT"><field name="NUM">12</field></shadow></value><value name="Y"><shadow type="math_number" id="ADNV{zHWjK2mH)~Hpd]J"><field name="NUM">12</field></shadow></value><next><block type="controls_if" id="CAYdNskAgv0M80[o]J}g"><value name="IF0"><block type="logic_operation" id="uR9:!F}(w[j)Cb#HwVjW" inline="false"><field name="OP">AND</field><value name="A"><block type="logic_compare" id="#rDBbsK_]5l#p60/Pp|u"><field name="OP">EQ</field><value name="A"><block type="get_info" id="O7P+X)EUx$Tkdfzs2p}!"><field name="COMPLEMENT">X</field></block></value><value name="B"><block type="math_number" id="upFi.JRrRv@S#MzPRTPZ"><field name="NUM">12</field></block></value></block></value><value name="B"><block type="logic_compare" id="F22OyBP]^g|rs.sE8y*c"><field name="OP">EQ</field><value name="A"><block type="get_info" id="c%j#dC^XI|Y+9*kvO+^n"><field name="COMPLEMENT">Y</field></block></value><value name="B"><block type="math_number" id="IbS`JYOSuii$8X(dIKld"><field name="NUM">12</field></block></value></block></value></block></value><statement name="DO0"><block type="variables_set" id="H^QP_}9s2G6Y+U|c[[J/"><field name="VAR" id="U=tSZ+ekH3hJ,haIaWqR">start</field><value name="VALUE"><block type="logic_boolean" id="5S5)Ke~B!k=l2Y.#Bavn"><field name="BOOL">FALSE</field></block></value></block></statement></block></next></block></statement><statement name="ELSE"><block type="turnangle" id="{29j!^-s1vFHL.in;E]s"><mutation xmlns="http://www.w3.org/1999/xhtml" operation="TURN"></mutation><field name="COMPLEMENT">TURN</field><value name="ANGLE"><shadow type="math_number" id="bP(RPy`NX.J*FqOt!T;B"><field name="NUM">60</field></shadow></value></block></statement></block></next></block></statement></block></xml>'
                xmlDom = Blockly.Xml.textToDom(code)
                Blockly.mainWorkspace.clear()
                Blockly.Xml.domToWorkspace(xmlDom, Blockly.mainWorkspace)
            }
            else if (user.language == 'python'){
                editor.setValue("start = True\ndef loop():\n    global start\n    upgradeINT(5) # melhora inteligência quando subir de nível\n    if not isSafeHere():\n        moveTo(12.5, 12.5)\n    elif getHit():\n        teleport(5, 5)\n    elif getCloseEnemy():\n        fireball(getTargetX(), getTargetY())\n    elif start:\n        moveTo(12, 12)\n        if getX() == 12 and getY() == 12:\n            start = False\n    else:\n        turn(60)")
            }
            else if (user.language == 'c'){
                editor.setValue("int start=1;\nloop(){\n    upgradeINT(5); //melhora inteligência quando subir de nível\n    if (!isSafeHere())\n        moveTo(12.5,12.5);\n    else if (getHit())\n        teleport(5,5);\n    else if (getCloseEnemy())\n        fireball(getTargetX(), getTargetY());\n    else if (start){\n        moveTo(12,12);\n        if (getX() == 12 && getY() == 12)\n            start = 0;\n    }\n    else\n        turn(60);\n}")
            }
        }
    }
    else{
        tutorial.next()
        $('#test').click();
    }
}

tutorial.lesson.breakpoint = async function(){
    if (user.language != 'blocks'){
        let data = await showDialog("Uma última coisa. Vou te ensinar uma poderosa ferramenta para testar seu código: os <b>breakpoints</b>. Com eles você pode pausar a simulação quando seu gladiador estiver prestes a executar uma linha de comando específica.", ["Interessante"])

        data = showDialog("Para adicionar um breakpoint, basta clicar lá no lado esquerdo, no número da linha desejada do seu código. Experimente!",["Onde?", "Certo"])

        if (data == "Onde?"){
            $('.ace_gutter-cell').addClass('red transition');
            setTimeout( function(){
                $('.ace_gutter-cell').removeClass('red');
                setTimeout( function(){
                    $('.ace_gutter-cell').removeClass('transiton');
                }, 500);
            }, 1500);
        }

        editor.focus();

        $('.ace_gutter-cell').click( function(){
            tutorial.next()
            setTimeout( function() {
                if ($('.ace_gutter-cell.ace_breakpoint').length){
                    showMessage("Muito bem. Agora teste seu gladiador.");
                    $('.ace_gutter-cell').off();
                }
            }, 500);
            
        });
    }
    else
        tutorial.jumpTo('end')
}

tutorial.lesson.checkBreakpoint = async function(){
    if ($('.ace_gutter-cell.ace_breakpoint').length)
        tutorial.next(true)
    else{
        let data = await showDialog("Experimente testar seu gladiador com pelo menos um <b>breakpoint</b>.", ["Como?", "OK"])
        if (data == "Como?")
            tutorial.jumpTo('breakpoint')
    }
}

tutorial.lesson.end = async function(){
    let data = await showDialog("Muito bem. Creio que você já tenha aprendido o básico sobre a programação dos gladiadores. Existem muitas outras funções disponíveis para você aprender. Sempre que quiser a página de referências da gladCode estará disponível. Obrigado por chegar até aqui e espero ter sido útil",["Outras funções","Obrigado"])

    if (data == "Outras funções")
        window.open("docs");

    $.post("back_login.php", {
        action: "TUTORIAL_END",
    })
    // .done( data => console.log(data));

    tutorial.enabled = false
}