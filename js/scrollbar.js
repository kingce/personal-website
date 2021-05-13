// Javascript to show scroll progress from the top
// Ripped this from my old portfolio haha
$(window).scroll(function() { 
    var wintop = $(window).scrollTop();
    var docheight = $(document).height();
    var winheight = $(window).height();
    var scrolled = (wintop/(docheight-winheight));
    console.log(wintop);

    $('.progress-bar .line').css("width", "calc((" + scrolled + ")*70vw + 8rem");
})