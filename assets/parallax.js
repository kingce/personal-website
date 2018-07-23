$(window).scroll(function() { 
    parallax();
})

function parallax() { 
    var windowScroll = $(window).scrollTop();

    $('.parallax class').css('top', (offset)+(windowScroll*0.005)+ 'em');



}
