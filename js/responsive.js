//Responsive about slider cos i'm too lazy to write actual content LOL 

function toggleMenu() { 
    if( $(window).width() <= 400) { 
        var expanded = false;

        var x = document.getElementById('mobile-menu');
        x.style.display = 'block';
        console.log(x);

        $(x).on('click', () => { 
            if(expanded) { 
                console.log("FUCK");
                TweenMax.to("#about", 1, { "top": "200%", "display": "none"});
            } else { 
                console.log("BYE");
                TweenMax.to("#about", 1, { "top" : "0%", "display": "block"});
            }

            expanded = !expanded;

        });
    } else { 
        //for some reason the stupid mobile menu wont go away lmao
        document.getElementById('mobile-menu').style.display = "none";
    }
}

$(document).ready(() => { 
    toggleMenu();
    if($(window).resize(() => { 
        if($(window).width() >= 400) { 
            console.log('yeet this outta here');
            document.getElementById('mobile-menu').style.display = 'none';
        } else { 
            toggleMenu();
        }
    }));
});
