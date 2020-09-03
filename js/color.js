//Toggles between light mode and dark mode 

$(document).ready(() => { 

    var light = true;

    console.log("COLOR JS LOADED");

    $('.lightswitch').click(() => { 
        if(light) { 
            console.log("TURNING LIGHTS OFF, BAKA");
            var t = gsap.timeline();

            // Light switch animation
            t.to(".switch", { duration: .3, x: 85, ease: "inOut" });

            // Background color change first
            t.to(".background-colorbox", { duration: .5, width: "100%", ease: "expo.inOut" });

            // Text box color change next
            t.to(".secondary-bg-box", { duration: .5, height: "67vw", ease: "expo.inOut" });
            
            // Then the text and lightswitch needs to change color
            // Select individually since some need to be staggered and others are different colors
            t.to(".main-dec", { duration: .1, color: "#201F1F", ease: "circ.in"}, .5);
            t.to(".switch", { duration: .3, backgroundColor: "#EEEADD", ease: "circ.in"}, 1.3);
            t.to(".track", { duration: .3, backgroundColor: "#EEEADD", ease: "circ.in"}, 1.3);
            t.to("p", { duration: .3, color: "#EEEADD", ease: "circ.in"}, 1.3);
            t.to("h3", { duration: .3, color: "#EEEADD", ease: "circ.in"}, 1.3);
            t.to(".main-title", { duration: .3, color: "#EEEADD", ease: "circ.in"}, 1.3);
            t.to(".poor-mans-mixed-blend-mode", { duration: .1, color: "#201F1F", ease: "circ.in"}, .5);
            t.to(".select-word", {duration: .1, color: "#201F1F", ease: "circ.in"}, 1.3);
            t.to(".works-word", {duration: .1, color: "#EEEADD", ease: "circ.in"}, 1.3);

            $(".about-title").removeClass("light-bar");
            $(".about-title").addClass("dark-bar");

            $(".tact").removeClass("short-lightbar");
            $(".tact").addClass("short-darkbar");

        } else { 
            console.log("TURNING LIGHTS ON, BAKA");
            var x = gsap.timeline();

            // Light switch animation
            x.to(".switch", { duration: .3, x:0, right: "auto", ease: "inOut" });

            // Background color change first
            x.to(".background-colorbox", { duration: .5, width: "0%", ease: "expo.inOut" });

            // Text box color change next
            x.to(".secondary-bg-box", { duration: .5, height: "0", ease: "expo.inOut" });
            
            // Then the text and lightswitch needs to change color
            x.to(".main-dec", { duration: .1, color: "#EEEADD", ease: "circ.in"}, .5);
            x.to(".switch", { duration: .3, backgroundColor: "#201F1F", ease: "inOut"});
            x.to(".track", { duration: .3, backgroundColor: "#201F1F", ease: "inOut"});
            x.to("p", { duration: .3, color: "#201F1F", ease: "inOut"}, 1.3);
            x.to("h3", { duration: .3, color: "#201F1F", ease: "inOut"}, 1.3);
            x.to(".main-title", { duration: .3, color: "#201F1F", ease: "inOut"}, 1.3);
            x.to(".poor-mans-mixed-blend-mode", { duration: .1, color: "#EEEADD", ease: "inOut"}, .5);
            x.to(".select-word", {duration: .3, color: "#EEEADD", ease: "inOut"}, 1.3);
            x.to(".info-box h3", {duration: .3, color: "#EEEADD", ease: "inOut"}, 1.3);
            x.to(".info-box p", {duration: .3, color: "#EEEADD", ease: "inOut"}, 1.3);

            $(".about-title").removeClass("dark-bar");
            $(".about-title").addClass("light-bar");
            $(".tact").removeClass("short-darkbar");
            $(".tact").addClass("short-lightbar");
        }

        light = !light;
    });

});
