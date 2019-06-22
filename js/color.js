//Toggles between light mode and dark mode 

$(document).ready(() => { 

    var darkTheme = true;

    console.log("COLOR JS LOADED");

    $('#toggle_colorscheme').click(() => { 
        if(darkTheme) { 
            TweenMax.to(".bg-pre", 1, {width: "100%"});
            TweenMax.to(":root", ".5", {"--main-text-color": "#333", "--about-color": "#81C3D7"});
        } else { 
            TweenMax.to(".bg-pre", 1, {width: "0"});
            TweenMax.to(":root", ".5", {"--main-text-color": "#EFEDED", "--about-color": "#16425B"});
        }
        darkTheme = !darkTheme;
    });

});
