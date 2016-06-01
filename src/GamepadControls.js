var Controls = function(options) {
  var viewer = options.viewer,
      canvas = viewer.get('canvas');

  console.log(viewer);

  this.gamepads = [];
  this.markers = [];

  var debug = document.createElement('div');
  debug.style.position = 'absolute';
  debug.style.top = 0;
  debug.textContent = 'Hello';
  document.body.appendChild(debug);

  var i = 0;
  window.viewer = viewer;

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
        debug.innerText = realCoordinates.x + ', ' + realCoordinates.y;
        if(this.markers[i]) {
          this.markers[i].style.left = realCoordinates.x + 'px';
          this.markers[i].style.top = realCoordinates.y + 'px';
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

    return el;
  };

  window.addEventListener("gamepadconnected", e => {
    this.gamepads.push(e.gamepad);
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
      e.gamepad.index, e.gamepad.id,
      e.gamepad.buttons.length, e.gamepad.axes.length);

    var marker = createMarker();
    this.markers.push(marker);
    document.body.appendChild(marker);

    requestAnimationFrame(update);

  });
};

Controls.prototype.update = function() {

};

module.exports = Controls;
