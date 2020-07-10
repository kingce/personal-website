//Sometimes I think about what life would be like if I could write clean performant modular code instead of the spaghetti shit that I churn out
//But oh well, here we are


//Animate triangles and bars first
gsap.from(".bg-triangle-1", { duration: 1, x: 900, opacity: 0,ease: "inOut" });
gsap.from(".bg-triangle-2", { duration: 1, rotationX: -90, opacity: 0, ease: "inOut" });
gsap.from(".bg-triangle-3", { duration: 1, rotationX: 90, opacity: 0, ease: "inOut" });

gsap.from("header .vertical-bar", { duration: 3,height: 0, ease: "circ.out" });
gsap.from(".socials .horizontal-bar", { duration: 1, width: 0, ease: "circ.out" });

//Socials
gsap.from(".socials li", {duration: 1, opacity: 0, y:30, stagger: 0.15, delay: .75, ease: Expo.easeInOut});

gsap.from(".title-bold", {duration: 1, opacity:0, delay: 1, ease: Expo.easeInOut});
gsap.from(".title-stroke", {duration: 2, opacity: 0, delay: 1, ease: Expo.easeInOut});
