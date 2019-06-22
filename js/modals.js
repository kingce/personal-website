//MODAL JS
//6.21.2019
//Daniel King
//
//Code for the modal-ish thing that happens and a bunch of other random fuckery
//OBVIOUSLY REQUIRES JQUERY 

function aboutClick() { 
    document.getElementById('about-button').innerHTML = '+ HOME';
    var x = document.getElementById('about');
    var y = document.getElementById('transition_about');


    //This is probably the world's most ghetto animation setup
    //Pls make not bad 
    $(document.getElementById('about-button')).css("pointer-events", "none");
    $(y).addClass("transition_about_swipe"); 
    setTimeout(function(){
        x.style.display = "grid";
        setTimeout(function() { 
            $(y).removeClass("transition_about_swipe");
            $(document.getElementById('about-button')).css("pointer-events", "auto");
        },1000);
    },500);
}

function backClick() { 
    document.getElementById('about-button').innerHTML = '+ ABOUT';
    var x = document.getElementById('about');
    var y = document.getElementById('transition_about');
    $(document.getElementById('about-button')).css("pointer-events", "none");
    $(y).addClass("transition_about_swipe"); 
    setTimeout(function(){
        x.style.display = "none";
        setTimeout(function() { 
            $(y).removeClass("transition_about_swipe");
            $(document.getElementById('about-button')).css("pointer-events", "auto");
        },1000);
    },500);
}

$(document).ready(() => { 
    var aboutActive = false;

    $("#about-button").click(function() { 

        if(aboutActive) { 
            backClick();
        } else { 
            aboutClick();
        }
        aboutActive = !aboutActive;
    });

    

});

