var X_DEGREES = 15;
var Y_DEGREES = 25;
var MARKER_SIZE = 70;

var Controls = function(events) {
  var socket = new WebSocket("ws://"+window.location.host);
  var players = [];

  var container = document.createElement('div');
  document.body.appendChild(container);

  socket.onopen = function(evt) {
    socket.send('INIT v'); // send info that this is a viewer
  }

  socket.onmessage = function (event) {
    var player = event.data.split(':')[0];
    var msg = event.data.split(':')[1].split(' ');

    if(msg[0] === 'INIT' && msg[1] === 'c') {
      createPlayer(player);
    }

    if(msg[0] === 'POS') {
      updatePlayerPosition(player, msg[1], msg[2]);
    }

    if(msg[0] === 'BAM') {
      var coords = calculateCoords(msg[1], msg[2]);
      events.emit('shot.fired', {
        player: player,
        at: {
          x: coords.x,
          y: coords.y
        }
      });
    }
  };

  var calculateCoords = (x, y) => {
    var size = {
      width: document.body.clientWidth,
      height: document.body.clientHeight
    };
    return {
      x: size.width / 2 + size.width * (x / X_DEGREES) / 2,
      y: size.height / 2 + size.height * (y / Y_DEGREES) / 2
    };
  };

  function updatePlayerPosition(player, x, y) {
    var el = players[player].element;

    var realCoordinates = calculateCoords(x, y);

    el.style.top = realCoordinates.y - MARKER_SIZE / 2 + 'px';
    el.style.left = realCoordinates.x - MARKER_SIZE / 2 + 'px';
  }

  function createPlayer(newPlayer) {
    var el = document.createElement('div');
    el.className = 'marker';
    el.style= 'position: absolute';
    el.innerHTML = '<img src="img/crosshair.png" style="height: 70px; width: 70px; filter: hue-rotate('+(players.length * 90)+'deg);"/>';
    container.appendChild(el);

    players.push({
      id: newPlayer,
      element: el
    });

    updatePlayerPosition(players[players.length - 1], 0, 0);
  }
}

module.exports = Controls;
