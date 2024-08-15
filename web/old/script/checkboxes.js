$(document).ready( function(){
	$('.checkslider').each( function(){
		create_checkbox($(this));
	});
});

function create_checkbox(checkbox) {
	checkbox.after("<div class='checkslider trail'><div class='checkslider thumb'></div></div>");
	checkbox.hide();
}