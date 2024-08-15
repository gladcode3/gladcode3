$(document).ready( function(){
    $('#header #search').addClass('visible');
    $('#header #search').click( function(){
        if ($(this).hasClass('visible')){
            $('#side-menu').addClass('mobile');
            $('#side-menu').hide().show("slide", { direction: "right" }, 300);
            $('#side-menu input').focus();
            $('#side-menu a').click(function(){
                $('#side-menu').fadeOut( function(){
                    $('#side-menu').removeClass('mobile');
                });
            })
        }
    });

    $('#side-menu').load("side-menu.html", function(){
		var icon = "<i class='fas fa-chevron-right'></i>";
		$('#side-menu li').each( function(){
			if ($(this).next('ul').length != 0)
				$(this).prepend(icon);
		});
		
        $('#side-menu li').removeClass('visible');
        $('#side-menu li i').removeClass('open');
        $('#side-menu > ul > li').addClass('visible');
        
        $('#side-menu #search input').on('input', function(){
            $('#side-menu li').removeClass('visible');
            $('#side-menu li i').removeClass('open');
            var text = $(this).val();
            if (text.length <= 1){
                $('#side-menu > ul > li').addClass('visible');
            }
            else{
                var pattern = new RegExp("[\\w]*"+ text +"[\\w]*","ig");
                $('#side-menu li').each(function(){
                    if ($(this).text().match(pattern)){
                        $(this).addClass('visible');
                        $(this).parent().prev('li').addClass('visible').parent().prev('li').addClass('visible');
                    }
                });
                $('#side-menu li').each(function(){
					if ($(this).css('display') != 'none')
						$(this).children('i').addClass('open');
				});
            }
        });

        $('#side-menu li').click( function(e){
            //console.log($(this));
            //e.preventDefault();
            var list = $(this).next('ul');
            if (list.children().css('display') != 'none'){
                list.find('li').removeClass('visible');
                list.find('li i').removeClass('open');
                $(this).children('i').removeClass('open');
			}
            else{
                list.children('li').addClass('visible');
				$(this).children('i').addClass('open');
            }
        });
        menuLoadFlag = true;
    });
});

function scrollTo(elem, offset){
    if (elem){
        if (!offset)
            offset = 0;
        $([document.documentElement, document.body]).animate({
            scrollTop: elem.offset().top + offset
        }, 1000);
    }
}

var menuLoadFlag = false;
function menu_loaded(){
    var resp = $.Deferred();
    var intLoad = setInterval( function(){
        if (menuLoadFlag){
            clearInterval(intLoad);
            return resp.resolve(true);
        }
    }, 10);
    return resp.promise();
}

$(document).scroll( function(){
    var mindist, winner;
    $('#side-menu li a').each( function(){
        var loc = window.location.href.split("/");
        loc = loc[loc.length - 1].split("#")[0];
        var href = $(this).attr('href').split("#");
        var hash = href[1];
        href = href[0];
        if (href == loc && hash && $('#'+ hash).length){
            var dist = Math.abs($(document).scrollTop() - $('#'+ hash).offset().top);
            if (!mindist || dist < mindist){
                mindist = dist;
                winner = $(this).parent();
            }
        }
    });
    if (winner){
        winner.siblings('li.here').removeClass('here');
        winner.addClass('here');

        if (!winner.children('i').hasClass('open'))
            winner.click();
        $(winner.siblings('li').find('i.open').click());
    }
});

