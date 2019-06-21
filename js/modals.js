//MODAL JS
//6.21.2019
//Daniel King
//
//Custom modal implementation for placeholder website
//OBVIOUSLY REQUIRES JQUERY 

function bg1_hover_in() { 
    var bgpre = document.getElementsByClassName('bg-1-pre');
    $(bgpre).toggleClass("bg-1-transition");
}

function bg1_hover_out() { 
    var bgpre = document.getElementsByClassName('bg-1-pre');
    $(bgpre).toggleClass("bg-1-transition"); 
}

function bg2_hover_in() { 
    var bgpre = document.getElementsByClassName('bg-2-pre');
    $(bgpre).toggleClass("bg-2-transition");
}

function bg2_hover_out() { 
    var bgpre = document.getElementsByClassName('bg-2-pre');
    $(bgpre).toggleClass("bg-2-transition"); 
}

function bg3_hover_in() { 
    var bgpre = document.getElementsByClassName('bg-3-pre');
    $(bgpre).toggleClass("bg-3-transition");
}

function bg3_hover_out() { 
    var bgpre = document.getElementsByClassName('bg-3-pre');
    $(bgpre).toggleClass("bg-3-transition"); 
}


$(document).ready(() => { 

    $(".bg-1 h3").hover(bg1_hover_in, bg1_hover_out);
    $(".bg-2 h3").hover(bg2_hover_in, bg2_hover_out);
    $(".bg-3 h3").hover(bg3_hover_in, bg3_hover_out);

    $(".bg-1 h3").click(function() { 
        console.log('heya');
    });

});
