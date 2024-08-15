// ------------------------------------------------------------------------
// WHEN MESSING WITH FUNCS, DONT FORGET TO RUN compress_functions.php AFTER
// ------------------------------------------------------------------------

var langDict = false

$(document).ready( function() {
    $('#learn').addClass('here');
    
    var func = "";
    if ($('#vget').length)
        func = $('#vget').val();

    var lang_word = 'function';
    if ($('#dict').length){
        langDict = $('#dict').html()
        if (langDict == 'pt')
            lang_word = 'funcao';
    }

    if (func == "")
        load_content("");
    else{
        $('#language select').selectmenu({
            change: function( event, ui ) {
                let ext = {
                    c: "c",
                    python: "py",
                    blocks: "blk"
                };

                window.location.href = `${lang_word}/${func}.${ext[ui.item.value]}`;
            }
        });
            
        $.getJSON(`script/functions.json`, async data => {
            await load_content(func, data);        
            await menu_loaded();
            
            let loc = window.location.href.split("/")
            let place = loc[loc.length - 2]
            let funcName = loc[loc.length - 1].split(".")
            let ext = ''

            let submenu

            if (funcName[1] == 'blk'){
                ext = '.'+ funcName[1]
                submenu = $(`#docs-blocks`).next('ul')
            }
            else if (place == 'funcao'){
                submenu = $(`#docs-ptbr`).next('ul')
            }
            else{
                submenu = $(`#docs`).next('ul')
            }

            funcName = funcName[0]

            submenu.find(`li a`).each( function(){
                if ($(this).attr('href') == `${place}/${funcName}${ext}`){
                    $(this).parent().addClass('here visible').siblings('li').addClass('visible');
                    $(this).parents('ul').prev('li').addClass('here visible');
                    $('li.here i').addClass('open');
                }
            });
        }).fail( function(){
            load_content("");
        });
    }

});

async function load_content(item, fileData){
    if (!item || item == ""){
        var func = $('#vget').val();
        $('#content').html("<h1>Função <i>"+ func +"</i> não encontrada.</h1><p><a href='docs'>Voltar para documentação</a></p>")
        return false;
    }

    item = fileData[item]

    var user = await waitLogged();

    var language;

    // set language to c or python only, and only if set in GET
    if ($('#get-lang').length){
        var ext = $('#get-lang').html();

        if (ext == 'c')
            language = "c";
        else if (ext == 'py')
            language = "python";
        else if (ext == 'blk')
            language = 'blocks'

        $('#get-lang').remove();
    }
    
    // if language is not set in GET, or set wrong, set user language, else set c
    if (!language){
        if (user)
            language = user.language
        else
            language = 'c';
    }

    // check if there is no version for this funcion, then remove the select option
    if (item.noversion){
        for (let l of item.noversion){
            if (l == language){
                let func = $('#vget').val();
                $('#content').html(`<h1>A função <i>${func}</i> não existe para esta linguagem.</h1><p><a href='docs'>Voltar para documentação</a></p>`)
                return false;
            }
            $('#language select option').each( function() {
                if ($(this).val() == l){
                    $(this).remove()
                }
            })
        }
    }

    $('#language select').val(language).selectmenu('refresh');

    if (!item.syntax[language])
        window.location.href = `function/${item.name.default.toLowerCase()}.c`

    if (language == 'blocks'){
        $('title').html("gladCode - "+ item.name.block)
        $('#temp-name').html(item.name.block)
        $('#temp-syntax').parent().after(`<div id='syntax-ws'></div>`).remove()

        let xml = `<xml>${item.syntax.blocks}</xml>`
        let ws = Blockly.inject('syntax-ws', { readOnly: true });
        xmlDom = Blockly.Xml.textToDom(xml);
        Blockly.Xml.domToWorkspace(xmlDom, ws);

        new ResizeObserver(() => {
            Blockly.svgResize(ws);
        }).observe($('#syntax-ws')[0])
    }
    else{
        $('title').html("gladCode - "+ item.name.default)
        $('#temp-name').html(item.name.default)

        $('#temp-syntax').html(item.syntax[language])

        $('#temp-syntax').attr('class', `language-${language}`)
        Prism.highlightElement($('#temp-syntax')[0])
    }

    $('#temp-description').html(item.description.long)

    var param = item.param.default;
    if (user && item.param[language])
        param = item.param[language];

    for (let i in param){
        if (param[i].name == "void")
            $('#temp-param').append("<p>"+ param[i].description +"</p>");
        else
            $('#temp-param').append("<p class='syntax'>"+ param[i].name +"</p><p>"+ param[i].description +"</p>");
    }
    
    var treturn = item.treturn.default;
    if (user && item.treturn[language])
        treturn = item.treturn[language];

    $('#temp-return').html(treturn);

    let filename = item.sample.explain.split(".")[0] + '.json'
    var loadSample = $.get(`script/functions/samples/${filename}`, async code => {
        if (language == 'blocks'){
            // load blocks into div, create workspace and observe resize
            $('#temp-sample').parent().after(`<div id='sample-ws'></div>`).remove()

            let ws = Blockly.inject('sample-ws', {
                scrollbars: true,
                readOnly: true
            });
    
            xmlDom = Blockly.Xml.textToDom(code.blocks);
            Blockly.Xml.domToWorkspace(xmlDom, ws);

            new ResizeObserver(() => {
                Blockly.svgResize(ws);
            }).observe($('#sample-ws')[0])  
        }
        else{
            // load code into div and use prism to highlight code
            $('#temp-sample').html(code[language]).attr('class', `language-${language}`)
            Prism.highlightElement($('#temp-sample')[0])
        }

        // put functions into seealso
        let codesearch = code.python
        if (!codesearch)
            codesearch = code.c

        let funcs = codesearch.match(/\w+\(/g)
        funcs = funcs.map(e => { return e.split("(")[0]})

        let reserved = ['loops', 'if', 'elif', 'while', 'for']
        for (let e of funcs){
            if (e != item.name.default && item.seealso.indexOf(e) == -1 && reserved.indexOf(e) == -1)
                item.seealso.push(e)
        }   

        // translate functions in brackets {} in explian text
        let matches = code.explain.match(/\{[\w\W]+?\}/g)
        funcs = []
        if (matches){
            for (let match of matches){
                let word = match.match(/\w+/)[0]
                if (funcs.indexOf(word) == -1)
                    funcs.push(word)
            }
            for (let func of funcs){
                // translate explain text to reflect blocks names
                if (language == 'blocks'){
                    let data = fileData[func.toLowerCase()]
                    code.explain = code.explain.replace(new RegExp(`\\{${func}\\}`, 'g'), data.name.block)
                }
                else
                    code.explain = code.explain.replace(new RegExp(`\\{${func}\\}`, 'g'), func)
            }
        }
        $('#temp-explain').html(code.explain);
    
        return code
    })

    if (langDict){
        var funcsDict = {};
        funcsDict[item.name.default] = item.name[langDict];
    }

    await loadSample

    for (let i in item.seealso){
        let data = fileData[item.seealso[i].toLowerCase()]
        if (data){
            let link = data.name.default.toLowerCase()
            let name = data.name.default

            if (language == 'blocks')
                name = data.name.block

            if (name)
                $('#temp-seealso').append(`<tr>
                    <td><a href='function/${link}'>${name}</a></td>
                    <td>${data.description.brief}</td></tr>`)

            if (langDict)
                funcsDict[data.name.default] = data.name[langDict]
        }
    }

    if (langDict){
        // await loadExplain
        loadDict(funcsDict)
    }

    return true;
}

function loadDict(func){
    if (langDict == 'pt'){
        for (let name in func){
            var pattern = new RegExp("([^f=\\w])"+ name +"([\\W])", 'g');
            var replace = '$1'+ func[name] +'$2';
            $('#content #template').html($('#content #template').html().replace(pattern, replace));
        }
        var pattern = new RegExp("href=\"function/([\\w]*?)\"", 'g');
        var replace = "href='funcao/$1'";
        $('#content #template').html($('#content #template').html().replace(pattern, replace));
    }
}