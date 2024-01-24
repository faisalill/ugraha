function keyDownHandler ( event, keys ) {
  switch ( event.keyCode ) {
    case 38: // up
    case 87: // w
      keys.w = true;
      break;
    case 37: // left
    case 65: // a
      keys.a = true;
      break;
    case 40: // down
    case 83: // s
      keys.s = true;
      break;
    case 39: // right
    case 68: // d
      keys.d = true;
      break;
  }
}

function keyUpHandler ( event, keys ) {
  switch ( event.keyCode ) {
    case 38: // up
    case 87: // w
      keys.w = false;
      break;
    case 37: // left
    case 65: // a
      keys.a = false;
      break;
    case 40: // down
    case 83: // s
      keys.s = false;
      break;
    case 39: // right
    case 68: // d
      keys.d = false;
      break;
  }
}

function mouseDownHandler ( event, keys ) {
    switch ( event.button ) {
      case 0: // left
        keys.leftClick = true;
        break;
      case 2: // right
        keys.rightClick = true;
        break;
    }
  }

function mouseUpHandler ( event, keys ) {
    switch ( event.button ) {
      case 0: // left
        keys.leftClick = false;
        break;
      case 2: // right
        keys.rightClick = false;
        break;
    }
  }

export { keyDownHandler, keyUpHandler, mouseDownHandler, mouseUpHandler };
