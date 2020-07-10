//Toggles between light mode and dark mode 

$(document).ready(() => { 

    var light = true;

    console.log("COLOR JS LOADED");

    $('.lightswitch').click(() => { 
        if(light) { 
            console.log("TURNING LIGHTS OFF, BAKA");
            // Light switch animation
            gsap.to(".switch", { duration: .3, x: 85, ease: "inOut" });

            // Background color change first
            gsap.to(".background-colorbox", { duration: .5, width: "100%", ease: "inOut" });

            // Text box color change next
            gsap.to(".secondary-bg-box", { duration: .5, height: "67vw", ease: "inOut" });
            
            // Then the text and lightswitch needs to change color
            gsap.to(".switch", { duration: .3, backgroundColor: "#EEEADD", ease: "inOut"});
            gsap.to(".track", { duration: .3, backgroundColor: "#EEEADD", ease: "inOut"});
            gsap.to("p", { duration: .3, color: "#EEEADD", ease: "inOut"});
            gsap.to("h3", { duration: .3, color: "#EEEADD", ease: "inOut"});
            gsap.to("h1", { duration: .3, color: "#EEEADD", ease: "inOut"});
            gsap.to(".main-dec", { duration: .3, color: "#201F1F", ease: "inOut"});
            gsap.to(".poor-mans-mixed-blend-mode", { duration: .3, color: "#201F1F", ease: "inOut"});
            gsap.to(".select-word", {duration: .3, color: "#201F1F", ease: "inOut"});

            $(".about-title").removeClass("light-bar");
            $(".about-title").addClass("dark-bar");

        } else { 
            console.log("TURNING LIGHTS ON, BAKA");
            // Light switch animation
            gsap.to(".switch", { duration: .3, x:0, right: "auto", ease: "inOut" });

            // Background color change first
            gsap.to(".background-colorbox", { duration: .5, width: "0%", ease: "inOut" });

            // Text box color change next
            gsap.to(".secondary-bg-box", { duration: .5, height: "0", ease: "inOut" });
            
            // Then the text and lightswitch needs to change color
            gsap.to(".switch", { duration: .3, backgroundColor: "#201F1F", ease: "inOut"});
            gsap.to(".track", { duration: .3, backgroundColor: "#201F1F", ease: "inOut"});
            gsap.to("p", { duration: .3, color: "#201F1F", ease: "inOut"});
            gsap.to("h3", { duration: .3, color: "#201F1F", ease: "inOut"});
            gsap.to("h1", { duration: .3, color: "#201F1F", ease: "inOut"});
            gsap.to(".main-dec", { duration: .3, color: "#EEEADD", ease: "inOut"});
            gsap.to(".poor-mans-mixed-blend-mode", { duration: .3, color: "#EEEADD", ease: "inOut"});
            gsap.to(".select-word", {duration: .3, color: "#EEEADD", ease: "inOut"});
            gsap.to(".info-box h3", {duration: .3, color: "#EEEADD", ease: "inOut"});
            gsap.to(".info-box p", {duration: .3, color: "#EEEADD", ease: "inOut"});

            $(".about-title").removeClass("dark-bar");
            $(".about-title").addClass("light-bar");
        }

        light = !light;
    });

});
