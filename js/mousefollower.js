//Basically just ripped from css tricks lmao
follower = document.getElementById('follower');
printout = document.getElementById('printout');

//Get the position of the mouse upon movement
var posX = (event) => { 
      return event.clientX;
}

var posY = (event) => { 
      return event.clientY;
}

var positionElement = (event) => { 
  mouse = {
      x: mouseX(event);
      y: mouseY(event);
  }
  follower.style.top = mouse.y + 'px';
  follower.style.left = mouse.x + 'px';
}

