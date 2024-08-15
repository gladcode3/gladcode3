$(document).ready( function() {
    menu_loaded().then( function(data){
        var loc = window.location.href.split("/");
        loc = loc[loc.length - 1];
        $('#side-menu #'+loc).addClass('here');
    });    
    $('#about').addClass('here');

    $( "#mmr-slider" ).slider({
        range: true,
        min: 0,
        max: 4000,
        step: 100,
        values: [500, 3500],
        create: function( event, ui ) {
            var val = $(this).slider('option','values');
            $(this).find('.ui-slider-handle').eq(0).html(val[0]);
            $(this).find('.ui-slider-handle').eq(1).append(val[1]);
        },
        slide: function( event, ui ) {
            $(this).find('.ui-slider-handle').each( (index, obj) => {
                $(obj).html(ui.values[index]);
            });
        },
        stop: function( event, ui ) {
            search();
        }
    });
    
    $( "#date-str, #date-end" ).datepicker({
        showAnim: "slideDown",
        dateFormat: "dd/mm/yy",
        dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
        dayNamesMin: ['D','S','T','Q','Q','S','S','D'],
        dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
        monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
        nextText: 'Próximo',
        prevText: 'Anterior'
    });
    
    $( "#date-str, #date-end" ).change( function() {
        search();
    });
    
    search();

    $('.table .info').click( function() {
        //create_tooltip($(this).attr('title'), $(this));
    });
});

async function search(){
    var mmr = $( "#mmr-slider" ).slider('option','values');
    
    let stats = load_stats({
        date: {
            start: $("#date-str").val(),
            end: $("#date-end").val()
        },
        mmr: {
            start: mmr[0],
            end: mmr[1]
        }
    })
    
    let potions = post("back_slots.php", { action: "ITEMS" })

    load_table(await stats, (await potions).potions)

}

function load_table(data, potions){
    data = JSON.parse(data);
    // console.log(data);
    
    $('#t-hab tbody').html("");
    $('#t-glad tbody td').not('.fixed').remove();
    if (data.average.length != 0){
        for (let i in data.average){
            $('#t-hab tbody').append(`<tr>
                <td>${i}</td>
                <td>${(data.percuse[i]).toFixed(1)}%</td>
                <td>${(data.average[i]).toFixed(1)}</td>
                <td>${(data.percwin[i]).toFixed(1)}%</td>
            </tr>`);
        }

        for (let i=0 ; i < $('#t-glad tbody tr').length ; i++){
            var a = $('#t-glad tbody tr').eq(i).data('info');

            var avg = data.highattr.avg[a];
            if (avg)
                avg = avg.toFixed(1);
            else
                avg = '-';

            var winner = data.highattr.winner[a];
            if (winner)
                winner = winner.toFixed(1);
            else
                winner = '-';
    
            if (a != 'lvl' && avg != '-')
                avg += '%';
            if (a != 'lvl' && winner != '-')
                winner += '%';

            $('#t-glad tbody tr').eq(i).append(`
                <td>${avg}</td>
                <td>${winner}</td>`);
        }

        $('#nbattles').html(data.nbattles.total);

        if (data.duration)
            $('#avg-time').html(data.duration.toFixed(1) +"s");
        else
            $('#avg-time').html('-');

        if (data.potions.battles < data.nbattles.total){
            $('#single-stats #low-battles').removeClass('hidden').attr('title', `Somente ${data.potions.battles} batalhas foram encontradas neste intervalo contendo as estatísticas recentemente adicionadas.`).tooltip();
        }
        else if (!$('#single-stats #low-battles').hasClass('hidden'))
            $('#single-stats #low-battles').addClass('hidden');
    }
    else{
        $('#t-hab tbody').html("<tr><td colspan=4>Nenhuma batalha encontrada</td></tr>");
        $('#t-glad tbody tr').each( function(){
            $(this).append(`<td colspan=2></td>`)
        })
        $('#avg-time').html("-");
        $('#nbattles').html("0");
        $('#single-stats #low-battles').addClass('hidden')
    }
    
    let table = {}
    for (let p in potions){
        let potkind = p.split("-").splice(0,2).join("-")
        if (!table[potkind]){
            let name = potions[p].name.split(" ")
            name = name.splice(0, name.length-1).join(" ") 
            table[potkind] = {name: name, lvl: []}
        }

        let uses = data.potions.use[p]
        let wins = data.potions.win[p]
        let lvl = parseInt(p.split("-")[2])
        if (!uses){
            uses = 0
        }
        if (!wins){
            wins = 0
        }
        table[potkind].lvl[lvl-1] = {use: uses, win: wins}
    }

    let str = []
    for (let p in table){
        row = []
        for (let i=0 ; i<5 ; i++){
            if (!table[p].lvl[i] || table[p].lvl[i].use == 0){
                row.push(`<td>-</td>`)    
            }
            else{
                let uses = table[p].lvl[i].use / data.potions.battles * 100
                let wins = table[p].lvl[i].win / table[p].lvl[i].use * 100
                row.push(`<td><div>
                    <span class='up' title='Percentual de batalhas que a poção foi utilizada'>${uses == 100 ? uses.toFixed(0) : uses.toFixed(1)}%</span>/
                    <span class='down' title='Percentual de batalhas que o gladiador que usou a poção venceu'>${wins == 100 ? wins.toFixed(0) : wins.toFixed(1)}%</span>
                </div></td>`)
            }
        }
        str.push(`<tr><td>${table[p].name}</td>${row.join("")}</tr>`)
    }

    $('#t-pot tbody').html(str.join(""))
}
