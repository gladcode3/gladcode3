$(document).ready( async function(){
    await menu_loaded()

    var loc = window.location.href.split("/");
    loc = loc[loc.length - 1];
    $('#side-menu #'+loc).addClass('here');
    $('#side-menu #'+loc).click();
    
    $('#learn').addClass('here');

    $.get(`script/functions.json`, async data => {
        
        let page = window.location.href.split("/").splice(-1,1)[0].split("#")[0]
        // console.log(page)
        $('.t-funcs a').map( (i,e) => {
            let match = $(e).attr('href')
            // console.log(match)
            let fakePath = 'function'
            let nameLang = 'default'
            let ext = ''
            if (page == 'docs-blocks'){
                nameLang = 'block'
                ext = '.blk'
            }
            else if (page == 'docs-ptbr'){
                fakePath = 'funcao'
                nameLang = 'pt'
            }

            $(e).attr('href', `${fakePath}/${match}${ext}`).html(data[match].name[nameLang])
            $(e).parent().siblings('td').html(data[match].description.brief)
        })
    })
});