function setGladImage(parent, index, skin, dead){
    fetchSpritesheet(skin).then( function(data){
        var frame = 'walk';
        if (dead)
            frame = 'die';
        parent.find('.glad-preview .image').eq(index).html(getSpriteThumb(data,frame,'down'));
    });
}

function getImage(id){
    for (var i in images){ //images is in assets.js
        if (images[i].id == id)
            return images[i];
    }
    return false;
}

function getSpriteThumb(spritesheet, move, direction){
    var dirEnum = {
        'walk': 8,
        'cast': 0,
        'thrust': 4,
        'slash': 12,
        'shoot': 16,
        'up': 0,
        'left': 1,
        'down': 2,
        'right': 3,
    };
    var line = dirEnum[move] + dirEnum[direction];
    var row = 1;

    if (move == 'die'){
        row = 5;
        line = 20;
    }


    var thumb = document.createElement("canvas");
    thumb.setAttribute("width", 64);
    thumb.setAttribute("height", 64);
    var ctx = thumb.getContext("2d");
    ctx.drawImage(spritesheet, row*192 + 64, line*192 + 64, 64, 64, 0, 0, 64, 64); //10: linha do walk down
    return thumb;
}

function fetchSpritesheet(json) {
    var response = $.Deferred();
    var move = {
        'walk': {'sprites': 9, 'line': 8},
        'cast': {'sprites': 7, 'line': 0},
        'thrust': {'sprites': 8, 'line': 4},
        'slash': {'sprites': 6, 'line': 12},
        'shoot': {'sprites': 13, 'line': 16},
        'die': {'sprites': 6, 'line': 20}
    };

    var errorload = false;
    try{
        json = JSON.parse(json);
    }
    catch(error){
        errorload = true;
        json = {};
    }

    var spritesheet = document.createElement("canvas");
    spritesheet.setAttribute("width", 192 * 13);
    spritesheet.setAttribute("height", 192 * 21);
    var spritectx = spritesheet.getContext("2d");
    
    var imgReady = 0;
    var selectedArray = [];
    for (var i in json){
        if (getImage(json[i]))
            selectedArray.push(getImage(json[i]));
    }
    if (!validate_skin(selectedArray))
        errorload = true;
    
    if (!errorload){
        selectedArray.sort(function(a, b){
            if (a.layer == null)
                return -1;
            else if (b.layer == null)
                return 1;
            else{
                if (typeof a.layer === 'object')
                    a.layer = a.layer.down;
                if (typeof b.layer === 'object')
                    b.layer = b.layer.down;
                return a.layer - b.layer;
            }
        });
        
        spritectx.clearRect(0, 0, spritesheet.width, spritesheet.height);
        var img = new Array();
        for(var i=0 ; i < selectedArray.length ; i++){
            if (selectedArray[i] && selectedArray[i].path != '' && !selectedArray[i].png){
                img[i] = new Image();	
                img[i].src = "sprite/Universal-LPC-spritesheet/" + selectedArray[i].path;
                img[i].onload = function() {
                    imgReady++;
                    if (imgReady == selectedArray.length){
                        drawSprite();
                        return response.resolve(spritesheet);
                    }
                };
            }
            else{
                imgReady++;
                if (imgReady == selectedArray.length){
                    drawSprite();
                    return response.resolve(spritesheet);
                }
            }
        }
            
        function drawSprite() {
            for(var i=0 ; i < selectedArray.length ; i++){
                if (img[i]){
                    if (selectedArray[i].oversize){
                        var line = move[selectedArray[i].move].line;
                        var sprites = move[selectedArray[i].move].sprites;
                        for (var k=0 ; k<4 ; k++){
                            for (var j=0 ; j<sprites ; j++){
                                spritectx.drawImage(img[i], j*192, k*192, 192, 192, j*192, line*192 + k*192, 192, 192);
                            }
                        }
                    }
                    else{
                        for (var k=0 ; k<21 ; k++){
                            for (var j=0 ; j<13 ; j++){
                                spritectx.drawImage(img[i], j*64, k*64, 64, 64, 64 + 3*j*64, 64 + 3*k*64, 64, 64);
                            }
                        }
                    }
                }
            }
        }
    }
    else{
        var img = new Image();	
        img.src = "res/glad.png";
        img.onload = function() {
            for (var k=0 ; k<21 ; k++){
                for (var j=0 ; j<13 ; j++){
                    spritectx.drawImage(img, j*64, k*64, 64, 64, 64 + 3*j*64, 64 + 3*k*64, 64, 64);
                }
            }
            return response.resolve(spritesheet);
        };
    }
    return response.promise();
}

function load_glad_cards(obj,options){
    var response = $.Deferred();

    if (!options.customLoad){
        $.post("back_glad.php",{
            action: "GET",
        }).done( function(data){
            //console.log(JSON.parse(data));
            load_data(JSON.parse(data));
        });
    }
    else{
        load_data(options.customLoad);
    }

    function load_data(data){
        //console.log(data);
        for (let i in data){
            obj.append("<div class='glad-preview'></div>");
        }
        template = $("<div id='template'></div>").load("glad-card-template.html", function(){
            obj.find('.glad-preview').html(template);
            for (let i in data){
                if (options.dead && data[i].dead)
                    setGladImage(obj, i, data[i].skin, true);
                else
                    setGladImage(obj, i, data[i].skin);
                obj.find('.glad-preview .info .glad span').eq(i).html(data[i].name);
                obj.find('.glad-preview .info .attr .str span').eq(i).html(data[i].vstr);
                obj.find('.glad-preview .info .attr .agi span').eq(i).html(data[i].vagi);
                obj.find('.glad-preview .info .attr .int span').eq(i).html(data[i].vint);
                obj.find('.glad-preview').eq(i).data('id',data[i].id);

                if (options.code){
                    let code = data[i].code
                    let blocks = data[i].blocks

                    if (code){
                        obj.find('.glad-preview .code .button').eq(i).removeAttr('disabled')
                        obj.find('.glad-preview .code .button').eq(i).click(function(e){
                            e.stopPropagation();

                            if (blocks && blocks.length){
                                let xml = decodeHTML(blocks)
                                $('body').append(`<div id='fog' class='code'><div class='float-box'><div id='code-ws'></div><div id='button-container'><button class='button'>FECHAR</button></div></div></div>`)
    
                                let ws = Blockly.inject('code-ws', {
                                    scrollbars: true,
                                    readOnly: true
                                });
                        
                                xmlDom = Blockly.Xml.textToDom(xml);
                                Blockly.Xml.domToWorkspace(xmlDom, ws);
                            }
                            else{
                                let language = "c"
                                if (code.indexOf("def loop():") != -1)
                                    language = "python"

                                $('body').append(`<div id='fog' class='code'><div class='float-box'><pre id='code' pre class='line-numbers language-${language}'><code class='language-${language}'>${code}</code></pre><div id='button-container'><button class='button'>FECHAR</button></div></div></div>`);
                                Prism.highlightElement($('code')[0]);
                            }
        
                            $('#fog.code .button').click( function(){
                                $('#fog.code').remove();
                            });
                        });
                    }
                    else
                        obj.find('.glad-preview .code .button').eq(i).prop('disabled', true);
                }

                if (options.master)
                    obj.find('.glad-preview .info .master').eq(i).html(data[i].user);

                if (options.dead && data[i].dead)
                    obj.find('.glad-preview').eq(i).addClass('dead').attr('title', 'Este gladiador está morto');
                    
                if (data[i].oldversion){
                    obj.find('.glad-preview').eq(i).addClass('old').attr('title', 'Este gladiador precisa ser atualizado');
                }
            }
    
            if (!options.code)
                obj.find('.glad-preview .code .button').remove();
            
            if (!options.remove)
                obj.find('.glad-preview .delete-container').remove();
            
            if (options.clickHandler)
                obj.find('.glad-preview').click(options.clickHandler);
            if (options.dblClickHandler)
                obj.find('.glad-preview').dblclick(options.dblClickHandler);

            return response.resolve(true);
        });
    }
    return response.promise();
}