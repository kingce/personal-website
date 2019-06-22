//Basically just ripped from css tricks lmao
follower = document.getElementById('follower');
printout = document.getElementById('printout');

//Get the position of the mouse upon movement
posX = (event) => { 
      return event.clientX;
}

posY = (event) => { 
      return event.clientY;
}

positionElement = (event) =>
      mouse = {
              x: mouseX(event);
              y: mouseY(event);
            }
  follower.style.top = mouse.y + 'px'
  follower.style.left = mouse.x + 'px'

