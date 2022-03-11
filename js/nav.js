console.log("hehe loaded");
$(window).scroll(function() { 
    console.log("hehe loaded");
    var wintop = $(window).scrollTop();
    var docheight = $(document).height();
    var winheight = $(window).height();
    var scrolled = (wintop/(docheight-winheight));
    console.log(scrolled);

    if($(window).width() > 1300) { 
        $('.line').css("width", "calc((" + scrolled + ")*33em + 7em");
    };
})