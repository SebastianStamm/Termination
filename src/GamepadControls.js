var Controls = function(options) {
  var viewer = options.viewer,
      canvas = viewer.get('canvas'),
      modeling = viewer.get('modeling'),
      registry = viewer.get('elementRegistry');

  this.gamepads = [];
  this.markers = [];
  this.shotAllowed = [];

  var debug = document.createElement('div');
  debug.style.position = 'absolute';
  debug.style.top = 0;
  debug.textContent = 'Hello';
  document.body.appendChild(debug);

  var i = 0;
  window.viewer = viewer;

  var checkWin = () => {
    if(Object.keys(registry._elements).length === 1) {
      // if only the process itself remains
      alert('You win');
    }
  };

  var calculateCoords = (x, y) => {
    var size = canvas.getSize();
    return {
      x: size.width / 2 + size.width * x / 2,
      y: size.height / 2 + size.height * y / 2
    }
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
        }
        this.markers[i].style.left = realCoordinates.x + 'px';
        this.markers[i].style.top = realCoordinates.y + 'px';

        if(this.shotAllowed[i] && gp.buttons[0].pressed) {
          debug.innerText = document.elementFromPoint(realCoordinates.x, realCoordinates.y);
          var objHit = document.elementFromPoint(realCoordinates.x, realCoordinates.y);
          while(!objHit.getAttribute('data-element-id') && objHit.parentNode) {
            objHit = objHit.parentNode;
          }
          var dataElementId = objHit.getAttribute('data-element-id');
          if(dataElementId) {
            var el = registry.get(dataElementId);
            if(el.children && el.children.length === 0 && el.type !== 'bpmn:Process') {
              modeling.removeElements([registry.get(dataElementId)]);
              checkWin();
            }
          }
          this.shotAllowed[i] = false;
        }

        if(!gp.buttons[0].pressed) {
          this.shotAllowed[i] = true;
        }

      }
    }

    requestAnimationFrame(update);
  };

  var colors = ['red', 'blue', 'green', 'yellow'];
  var colorCount = 0;
  var createMarker = () => {
    var el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.width = '5px';
    el.style.height = '5px';
    el.style.backgroundColor = colors[colorCount++];
    document.body.appendChild(el);

    return el;
  };

  update();
};

module.exports = Controls;
