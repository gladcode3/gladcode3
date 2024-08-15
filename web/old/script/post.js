$(document).ready( function() {
    $.post("back_news.php",{
        action: "POST",
        hash: $('#hash').html()
    }).done( function(data){
        // console.log(data);
        data = JSON.parse(data);

        if (data.status == "EMPTY"){
            window.location.href = "index";
        }
        else if (data.status == "SUCCESS"){
            $('#post').html(`<div class='post'>
                <div class='title'>${data.post.title}</div>
                <div class='time'>Publicado em ${getMessageTime(data.post.time, { month_full: true })}</div>
                <div class='body'>${data.post.body}</div>
            </div>`);

            if (data.prev){
                $('#prev').removeClass('disabled').attr('href', `post/${data.prev}`);
            }
            if (data.next){
                $('#next').removeClass('disabled').attr('href', `post/${data.next}`);
            }
        }
    });

    $('#hash').remove();
});

function getMessageTime(msgTime, args){
	var short = false;
	var month_full = false;
	if (args){
		if (args.short)
			short = true;
		if (args.month_full)
			month_full = true;
	} 

	if (short){
		var now = new Date();
		msgTime = new Date(msgTime);
		
		var secNow = Math.round(now.getTime() / 1000);
		var secMsg = Math.round(msgTime.getTime() / 1000);
		
		var diff = (secNow - secMsg) / 60;
		return last_active_string(diff);
	}
	else{
		var months = [
			"Janeiro",
			"Fevereiro",
			"Março",
			"Abril",
			"Maio",
			"Junho",
			"Julho",
			"Agosto",
			"Setembro",
			"Outubro",
			"Novembro",
			"Dezembro"
		];
		if (!month_full){
			for (let i in months)
				months[i] = months[i].toLowerCase().slice(0,3);
		}

		t = new Date(msgTime);
		var string = t.getDate() +' de '+ months[t.getMonth()] +' de '+ t.getFullYear() +' às '+ ('0'+t.getHours()).slice(-2) +':'+ ('0'+t.getMinutes()).slice(-2);
		return string;
	}
}