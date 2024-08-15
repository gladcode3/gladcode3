$(document).ready( async function(){
    await menu_loaded()

    var loc = window.location.href.split("/");
    loc = loc[loc.length - 1];
    $('#side-menu #'+loc).addClass('here');
    $('#side-menu #'+loc).click();
    
    $('#learn').addClass('here');

    if ($('.block-container').length){
        $('.block-container').each( function(index, obj) {
            let xml = $(obj).html()
            $(obj).html(`<div id='code-ws-${index}' class='block'></div>`)
    
            // console.log(xml)
            let ws = Blockly.inject(`code-ws-${index}`, {
                scrollbars: true,
                readOnly: true
            })
    
            xmlDom = Blockly.Xml.textToDom(xml)
            Blockly.Xml.domToWorkspace(xmlDom, ws)
        })
    }

    post("back_slots.php", {
        action: "UPGRADE",
        command: "COSTS"
    }).then( data => {
        // console.log(data)
        for (let i in data.prices){
            let price = i == 0 ? '-' : `${data.prices[i-1]} <i class='fas fa-coins silver'></i>`
            let time = data.times[i]
            $('#tapot tbody').append(`<tr><td>${parseInt(i)+1}</td><td>${time}h</td><td>${price}</td></tr>`)
        }
    })

    post("back_slots.php", {
        action: "ITEMS"
    }).then( data => {
        // console.log(data.potions)
        for (let i in data.potions){
            let pot = data.potions[i]
            $('#tpotions tbody').append(`<tr><td>${pot.name}</td><td>${pot.lvl}</td><td>${i}</td><td>${pot.description}</td><td>${pot.price} <i class='fas fa-coins silver'></i></td></tr>`)
        }
    })
});