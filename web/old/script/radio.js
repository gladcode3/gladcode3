$(document).ready( function(){
    $('.radio').parents('label').wrap("<div class='radio'></div>");
    $('.radio label').addClass('option').append("<div class='border'><div class='inner'></div></div>");
});