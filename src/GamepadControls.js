var Controls = function(events) {

  this.gamepads = [];
  this.markers = [];
  this.shotAllowed = [];
  this.btn2 = [];
  this.btn3 = [];

  var container = document.createElement('div');
  document.body.appendChild(container);

  var calculateCoords = (x, y) => {
    var size = {
      width: document.body.clientWidth,
      height: document.body.clientHeight
    };
    return {
      x: size.width / 2 + size.width * x / 2,
      y: size.height / 2 + size.height * y / 2
    };
  };

  var update = () => {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    if (!gamepads) {
      return;
    }

    for(var i = 0; i < gamepads.length; i++) {
      var gp = gamepads[i];
      if(gp) {
        var realCoordinates = calculateCoords(gp.axes[0], gp.axes[1]);
        if(!this.markers[i]) {
          this.markers[i] = createMarker();
          this.shotAllowed[i] = true;
          this.btn2[i] = true;
          this.btn3[i] = true;
        }
        this.markers[i].style.left = realCoordinates.x + 'px';
        this.markers[i].style.top = realCoordinates.y + 'px';

        if(this.shotAllowed[i] && gp.buttons[0].pressed) {
          events.emit('shot.fired', {
            player: i,
            at: realCoordinates
          });
          this.shotAllowed[i] = false;
        }

        if(!gp.buttons[0].pressed) {
          this.shotAllowed[i] = true;
        }
        if(this.btn2[i] && gp.buttons[1].pressed) {
          events.emit('button2.pressed', {
            player: i,
            at: realCoordinates
          });
          this.btn2[i] = false;
        }

        if(!gp.buttons[1].pressed) {
          this.btn2[i] = true;
        }
        if(this.btn3[i] && gp.buttons[2].pressed) {
          events.emit('button3.pressed', {
            player: i,
            at: realCoordinates
          });
          this.btn3[i] = false;
        }

        if(!gp.buttons[2].pressed) {
          this.btn3[i] = true;
        }

      }
    }

    requestAnimationFrame(update);
  };

  var colors = ['lightgreen', 'yellow', 'red', 'white'];
  var colorCount = 0;
  var createMarker = () => {
    var el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.width = '12px';
    el.style.height = '12px';
    el.style.pointerEvents = 'none';
    el.style.backgroundColor = colors[colorCount++];
    container.appendChild(el);

    return el;
  };

  update();
};

module.exports = Controls;
