var user;
post("back_login.php", {
    action: "GET"
}).then( data => user = data )

$(document).ready( function() {
    $('#menu-button').click( function() {
        $('body').append("<div id='fog'><div id='menu'></div></div>");
        $('#fog #menu').html("<a href='index'><img src='icon/logo.png'></a>"+ $('#h-items').html());
        
        $('#fog').click( function() {
            $('#fog #menu').toggle("slide", 300, function() {
                $('#fog').remove();
            });
        });
        $('#fog #menu').click( function(e) {
            e.stopPropagation();
        });
        $('#fog #login').click( function(){
            googleLogin().then( function(data){
                window.location.href = "news";
            });
        });	
        
        $('#fog #menu').toggle("slide", 300); //precisa jquery ui
    });
    
    $('.drop-menu').hover( function() {
        menu_open($(this));
    });
    $('.drop-menu').mouseleave( function() {
        menu_close();
    });
    $('.drop-menu').click( function() {
        menu_close();
        menu_open($(this));
    });
    function menu_open(element){
        $('.item-container').hide();
        if ($('.item-container.open').length == 0){
            var container = element.find('.item-container');
            container.slideDown().addClass('open');
            
            var left = element.position().left;
            if (element.position().left + container.find('.item').width() > $(window).width())
                left = element.position().left + element.width() - container.width();

            container.css({
                'left': left, 
                'top': element.position().top + element.height()
            });

        }
    }
    function menu_close(){
        $('.item-container').hide();
        $('.item-container').removeClass('open');
    }
    
    initGoogleLogin();

    $('.mobile #login, .desktop #login').click( function(){
        googleLogin().then( function(data){
            window.location.href = "news";
        });
    });	
    
    waitLogged().then( data => {
        if (data.status == "NOTLOGGED")
            $('.mobile #profile, .desktop #login').removeClass('hidden');
        else{
            socket_request('login', {}).then( function(res, err){
                if (err) return console.log(err);
                if (res.session === false){
                    $.post("back_login.php", {
                        action: "UNSET"
                    }).done( function(data){
                        data = JSON.parse(data);
                        if (data.status == "LOGOUT")
                            window.location.reload();
                    });
                }
                else
                    $('.mobile #login, .desktop #profile').removeClass('hidden');
            });
        }
    })

    if ($('#footer').length){
        $('#footer').load("footer.php", async () => {
            await waitLogged()
            translator.translate($('#footer'))
        });
    }

    $('#header .item #english').click( () => {
    })

    waitLogged().then( async () => {
        await translator.init()
        await translator.translate($('body'))
        // translator.googleTranslate($('body'))
    })
});

async function waitLogged(){
    return await new Promise( (resolve, reject) => {
        loginReady();
        function loginReady(){
            setTimeout( function() {
                if (user)
                    resolve(user);
                else
                    loginReady();
            }, 100);
        }
    });
}

async function post(path, args){
    return $.post(path, args).then( data => {
        try{
            data = JSON.parse(data)
        } catch(e) {
            return {error: e, data: data}
        }
        return data
    })
}

function decodeHTML(str) {
    var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;',
        '\'': '&#39;'
    };
    for (var i in escapeMap){
        var regexp = new RegExp(escapeMap[i],"g");
        str = str.replace(regexp, i);
    }
    return str;
}

var translator = {}

translator.init = function(){
    return $.getJSON(`script/translation.json`, data => {
        this.info = data
    })
}

translator.translate = async function(element){
    if (!this.info){
        return false
    }
    else {
        let info = this.info
        let lang = user && user.speak ? user.speak : 'pt'

        var fieldcheck = ['title', 'placeholder']

        // console.log(data)
        element.find(`*`).contents().each(function(){
            // replace contents
            if (this.nodeType == 3){
                let v = this.textContent.replace(/\{\{(\w+)\}\}/, "$1")
                if (v.length && info[v]){
                    this.textContent = this.textContent.replace(this.textContent, info[v][lang])
                }
            }

            let fields = []
            for (let check of fieldcheck){
                if (this[check] && this[check] != ""){
                    fields.push(check)
                }
            }
    
            for (let field of fields){
                let replace = this[field].replace(/\{\{(\w+)\}\}/, "$1")
                if (replace.length && info[replace]){
                    this[field] = this[field].replace(this[field], info[replace][lang])
                }
            }
        })

        return this
    }
}

translator.googleTranslate = async function(elements) {
    let lang = (user && user.speak) ? user.speak : 'pt'
    let contents = this.contents ? this.contents : []
    let translation = this.translation ? this.translation : []

    if (lang != 'pt'){
        elements = Array.isArray(elements) ? elements : [elements]

        for (element of elements){
            element.find(`*`).contents().each(function(){
                // replace contents
                if (this.nodeType == 3 && !this.textContent.includes("\n") && !this.textContent.includes("\t")){
                    let text = this.textContent.replace(/(\w+)/, "$1")
                    if (text.length && !contents[text]){
                        contents.push(text)
                    }
                }
            })
        }

        // get only unique
        for (let i in contents){
            if (contents.indexOf(contents[i]) != i){
                contents.splice(i, 1)
                if (translation[i]){
                    translation.splice(i, 1)
                }
            }
        } 

        const apiKey = "AIzaSyDfENHlgZgw6BDTbevnSJKiZP30BRIJe2g"
        const url = `https://www.googleapis.com/language/translate/v2`

        let calls = []
        for (let i=translation.length ; i<contents.length ; i++){
            calls[i] = $.post(url, {
                q: contents[i],
                source: 'pt',
                target: lang,
                key: apiKey
            }).done( data => {
                // console.log(data)
                translation[i] = decodeHTML(data.data.translations[0].translatedText)
            })
        }

        for (let call of calls){
            await call
        }

        this.contents = contents
        this.translation = translation
        
        for (element of elements){
            element.find(`*`).contents().each(function(){
                // replace contents
                if (this.nodeType == 3){
                    let index = contents.indexOf(this.textContent)
                    if (index != -1){
                        this.textContent = ` ${this.textContent.replace(contents[index], translation[index])} `
                    }
                }
            })
        }
    }

    return this
}