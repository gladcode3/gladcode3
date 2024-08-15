$(document).ready( () => {
    var slotlvl
    var potions
    post("back_slots.php", {
        action: "ITEMS"
    }).then (data => {
        // console.log(data)
        potions = data.potions
        
        $('#apot-container #browse').click( function(){
            if (!$(this).attr('disabled')){
                let slotsDOM = ""
                for (let i in potions){
                    let item = potions[i]
                    slotsDOM += `<div class='slot' data-id='${i}'>
                        <div class='top'><img src='${item.icon}'></div>
                        <div class='mid'>
                            <div><i class='fas fa-arrow-alt-circle-up'></i><span class='lvl'>${item.lvl}</span></div>
                            <div><i class='fas fa-coins silver'></i><span class='price'>${item.price}</span></div>
                        </div>
                        <div class='bot'>
                            <span class='name'>${item.name}</span>
                            <div class='button-container'>
                                <span class='info' title='Informações'><i class='fas fa-question-circle'></i></span>
                                <span class='buy' title='Encomendar produto'><i class='fas fa-thumbs-up'></i></span>
                            </div>
                        </div>
                    </div>`
                }

                $('body').append(`<div id='fog'>
                    <div id='browse-potions'>
                        <h2>Estes são os produtos que você pode encomendar:</h2>
                        <div id='shop-container'>
                            ${slotsDOM}
                        </div>
                        <button id='close'>CANCELAR</button>
                    </div>
                </div>`)
                $('#fog').hide().fadeIn()
                slots.refresh()

                $('#browse-potions #close').click( function() {
                    $('#fog').remove()
                })

                $('#browse-potions .info').click( function() {
                    let id = $(this).parents('.slot').data('id')
                    new Message({ message:
                        `<h3><b>${potions[id].name}</b></h3>
                        <div>${potions[id].description}</div>
                        <div id='description-info'>
                            <div class='col'>
                                <span class='small'>Nível necessário:</span>
                                <span><i class='fas fa-arrow-alt-circle-up'></i><b>${potions[id].lvl}</b></span>
                            </div>
                            <div class='col'>
                                <span>Custo:</span>
                                <span><b>${potions[id].price}</b><i class='fas fa-coins silver'></i></span>
                            </div>
                        </div>`,
                        class: "description"
                    }).show()
                })
        
                $('#browse-potions .buy').click( function() {
                    let firstslot = $('#apot-container #my-pots .slot.empty').first()
    
                    if (firstslot.length){
                        let id = $(this).parents('.slot').data('id')
                        
                        if (apothecary.lvl < potions[id].lvl){
                            new Message({ message: `Aprimore o apotecário para o nível <b>${potions[id].lvl}</b> para poder encomendar este item` }).show()
                        }
                        else if (parseInt(user.silver) < potions[id].price){
                            new Message({ message: `Você não possui prata <i class='fas fa-coins silver'></i> suficiente para adquirir este item` }).show()
                        }
                        else{
                            new Message({
                                message: `Emcomendar <b>${potions[id].name}</b>?`,
                                buttons: {yes: "Sim", no: "Não"}
                            }).show().click('yes', () => {                
                                if (firstslot.length){
                                    $('#fog').remove()
                                    if (slots.fill(id)){
                                        create_toast(`Item ${potions[id].name} encomandado`, "success")
                                    }
                                    else{
                                        create_toast(`O item não pôde ser adquirido`, "error")
                                    }
                                }
                            })
                        }
                    }
                    else {
                        $('#apot-container #browse').attr('disabled', true)
                        $('#fog').remove()
                        new Message({ message: `Você não possui espaços disponíveis para adquirir este item` }).show()
                    }
                })
            }
        })

        $('#apot-container #upgrade').click( function(){
            let msg = new Message({
                message: `
                    <h2>Melhorar o apotecário?</h2>
                    <div id='up-table'>
                        <div class='row'>
                            <div>Nível</div>
                            <div>${apothecary.lvl}</div>
                            <div class='icon'><i class='fas fa-angle-double-right'></i></div>
                            <div class='new'>${apothecary.lvl + 1}</div>
                        </div>
                        <div class='row'>
                            <div>Duração</div>
                            <div>${apothecary.time()} horas</div>
                            <div class='icon'><i class='fas fa-angle-double-right'></i></div>
                            <div class='new'>${apothecary.time(apothecary.lvl + 1)} horas</div>
                        </div>
                        <div class='row cost'>
                            <div><b>Custo</b></div>
                            <div><b><span>${apothecary.price()}</span></b><i class='fas fa-coins silver'></i></div>
                        </div>
                    </div>`,
                buttons: {yes: "Aprimorar", no: "Cancelar"},
                class: 'upgrade'
            }).show().click('yes', () => {
                post("back_slots.php", {
                    action: "UPGRADE",
                    command: "APOT"
                }).then( data => {
                    console.log(data)

                    if (data.status == "NO MONEY"){
                        new Message({message: "Você não possui prata suficiente"}).show()
                    }
                    else if (data.status == "MAX LVL"){
                        new Message({message: "O apotecário já está no nível máximo"}).show()
                    }
                    else{
                        user.silver = data.silver
                        $('#menu #silver span').text(user.silver)
                        user.apothecary = data.apot
                        apothecary.lvl = parseInt(user.apothecary)
                        $('#apot-panel .lvl').text(apothecary.lvl)
                        $('#apot-panel .cost').text(apothecary.price())
                        $('#apot-panel .duration').text(apothecary.time())

                        if (apothecary.lvl == 5){
                            $('#apot-panel #apot-info .cost').parents('.row').remove()
                            $('#apot-panel #apot-info #upgrade').remove()
                        }
                    }
                })
            })

            if (apothecary.price() > user.silver){
                $('#up-table .cost').addClass('nomoney')
                msg.getButton('yes').remove()
            }
        })

        waitLogged().then( () => {
            slots.refresh()
        })
    })

    waitLogged().then( () => {
        let mypots = ""
        for (let i=0 ; i<4 ; i++){
            mypots += `<div class='slot empty'>
                <div class='top'><div class='empty'></div></div>
                <div class='mid'><span class='name'>Nenhum item neste espaço</span></div>
                <div class='bot' title='Tempo restante'><i class='fas fa-clock'></i><span class='time'></span></div>
            </div>`
            if (!slots.items[i].empty){
                slots.items[i].empty = true
            }
        }
        $('#apot-container #my-pots').html(mypots)

        apothecary.init().then( () => {
            apothecary.lvl = parseInt(user.apothecary)
            $('#apot-panel .lvl').text(apothecary.lvl)
            $('#apot-panel .cost').text(apothecary.price())
            $('#apot-panel .duration').text(apothecary.time())

            if (apothecary.lvl == 5){
                $('#apot-panel #apot-info .cost').parents('.row').remove()
                $('#apot-panel #apot-info #upgrade').remove()
            }
        })
    })

    $('#menu #potions').click( () => {
        slots.refresh()
    })

    var slots = {
        items: [{},{},{},{}]
    }

    slots.fill = function(id){
        for (let i in this.items){
            if (this.items[i].empty && parseInt(user.silver) >= parseInt(potions[id].price)){
                this.items[i].id = id
                this.items[i].empty = false
                this.items[i].counting = false
                user.silver -= potions[id].price

                post("back_slots.php", {
                    action: "BUY",
                    id: id
                }).then( data => {
                    // console.log(data)
                    this.refresh()
                })

                return true
            }
        }
        return false
    }

    slots.refresh = async function() {
        let data = await post("back_slots.php", {
            action: "SLOTS"
        })
        // console.log(data)

        slotlvl = data.slotlvl
        for (let i=0 ; i<4 ; i++){
            // enable new slot
            if (data.lvl >= slotlvl[i] && this.items[i].disabled){
                $('#apot-container #my-pots .slot').eq(i).removeClass('disabled').addClass('empty').html(`
                    <div class='top'><div class='empty'></div></div>
                    <div class='mid'><span class='name'>Nenhum item neste espaço</span></div>
                    <div class='bot' title='Tempo restante'><i class='fas fa-clock'></i><span class='time'></span></div>
                `)
                delete this.items[i].disabled
                this.items[i].empty = true
            }
            // disable slot
            else if (data.lvl < slotlvl[i] && !this.items[i].disabled){
                $('#apot-container #my-pots .slot').eq(i).removeClass('empty').addClass('disabled').html(`
                    <div class='top'><div class='empty'></div></div>
                    <div class='mid'><span>Atinja o nível ${slotlvl[i]} para desbloquear este item</span></div>
                `)
                this.items[i].disabled = true
                delete this.items[i].empty
            }
        }

        this.time = new Date().getTime() / 1000

        for (let i=0 ; i<4 ; i++){
            if (!this.items[i].disabled){
                this.items[i].empty = true
            }
        }
        for (let i in data.slots){
            this.items[i].id = data.slots[i].id
            this.items[i].sid = data.slots[i].sid
            this.items[i].name = data.slots[i].name
            this.items[i].icon = data.slots[i].icon
            this.items[i].description = data.slots[i].description
            this.items[i].time = data.slots[i].time
            this.items[i].empty = false
        }


        for (let i in this.items){
            let item = this.items[i]
            if (!item.disabled && !item.empty && !item.counting){
                $('#apot-container #my-pots .slot').eq(i).removeClass('empty').addClass('filled').html(`
                    <div class='top'><img src='${item.icon}'><div class='remove'><i class='fas fa-trash-alt'></i></div></div>
                    <div class='mid'><span class='name'>${item.name}</span></div>
                    <div class='bot'><span class='time'></span><i class='fas fa-clock'></i></div>
                `)

                item.counting = true
                this.countTime(i)

                $('#apot-container #my-pots .slot').eq(i).click( () => {
                    new Message({
                        message: `Para usar este item nas batalhas, use no seu código: <code><b>useItem("${item.id}")</b></code>`,
                        buttons: {yes: "Ajuda", no: "OK"}
                    }).show().click('yes', function(){
                        window.open(`manual#nav-item`)
                    })
                })

                $('#apot-container #my-pots .slot .remove').eq(i).click( e => {
                    e.stopPropagation()

                    new Message({
                        message: `Deseja cancelar esta encomenda?`,
                        buttons: {yes: "SIM", no: "NÃO"}
                    }).show().click('yes', async () => {
                        let data = await post("back_slots.php", {
                            action: "EXPIRE",
                            id: item.sid
                        })
                        // console.log(data)
                        if (data.status == "SUCCESS"){
                            this.refresh()
                        }
                    })
                })
            }
            else if (item.empty){
                $('#apot-container #my-pots .slot').eq(i).addClass('empty').html(`
                    <div class='top'><div class='empty'></div></div>
                    <div class='mid'><span class='name'>Nenhum item neste espaço</span></div>
                    <div class='bot' title='Tempo restante'><i class='fas fa-clock'></i><span class='time'></span></div>
                `)
            }
        }

        $('#apot-container #browse').removeAttr('disabled')
        if (!this.items.filter(e => e.empty).length){
            $('#apot-container #browse').attr('disabled', true)
        }

        $('#currencies #silver span').text(user.silver)

        $('#browse-potions .slot').each( (_,obj) => {
            let id = $(obj).data('id')
            if (parseInt(user.silver) < parseInt(potions[id].price)){
                $(obj).addClass('dis-price disabled')
            }
            if (apothecary.lvl < parseInt(potions[id].lvl)){
                $(obj).addClass('dis-lvl disabled')
            }
        })
    }

    slots.countTime = function(i){
        let item = this.items[i]
        setTimeout( () => {
            let elapsed = new Date().getTime() / 1000 - this.time
            let time = {s: parseInt(item.time) - elapsed}

            if (time.s < 0){
                item.counting = false
                slots.refresh()
            }
            else {
                time.m = Math.floor(time.s / 60)
                time.s = Math.floor(time.s % 60)
                time.h = Math.floor(time.m / 60)
                time.m = Math.floor(time.m % 60)

                time.s = `${time.s}s`
                time.m = time.m == 0 && time.h == 0 ? '' : `${time.m}m`
                time.h = time.h == 0 ? '' : `${time.h}h`

                time.str = `${time.h} ${time.m} ${time.s}`

                $('#apot-container #my-pots .slot').eq(i).find('.time').html(time.str)
                this.countTime(i)
            }
        }, 1000)
    }

    var apothecary = {
        init: async function() {
            let data = await post("back_slots.php", {
                action: "UPGRADE",
                command: "COSTS"
            })
            this.prices = data.prices
            this.times = data.times
        },
        price: function(lvl) {
            if (!lvl){
                lvl = this.lvl
            }
            return this.prices[lvl-1]
        },
        time: function(lvl) {
            if (!lvl){
                lvl = this.lvl
            }
            return this.times[lvl-1]
        }
    }

})