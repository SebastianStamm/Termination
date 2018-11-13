var QRCode = require('qrcodejs2');

var X_DEGREES = 15;
var Y_DEGREES = 15;
var MARKER_SIZE = 70;

var Controls = function(events) {
  var socket = new WebSocket("wss://"+window.location.host);
  var players = [];

  var container = document.createElement('div');
  document.body.appendChild(container);

  socket.onopen = function(evt) {
    socket.send('INIT v'); // send info that this is a viewer
  }

  socket.onmessage = function (event) {
    var player = event.data.split('!')[0];
    var msg = event.data.split('!')[1].split(' ');

    if(msg[0] === 'CONF') {
      var qrCodeContainer = document.createElement('div');
      qrCodeContainer.setAttribute('id', 'qrcode');
      qrCodeContainer.setAttribute('class', 't-qrcode');
      document.body.appendChild(qrCodeContainer);

      var code = new QRCode(qrCodeContainer, {
        text: window.location.href + 'controller.html#' + player,
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });

      var qrCodeContainerS = document.createElement('div');
      qrCodeContainerS.setAttribute('id', 'qrcode');
      qrCodeContainerS.setAttribute('class', 't-qrcode small');
      document.body.appendChild(qrCodeContainerS);

      var jointext = document.createElement('div');
      jointext.style.fontSize = '1.5em';
      jointext.textContent = 'Join Now!';

      var code = new QRCode(qrCodeContainerS, {
        text: window.location.href + 'controller.html#' + player,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });

      qrCodeContainerS.appendChild(jointext);

      events.on('game.start', function() {
        qrCodeContainer.style.display = 'none';
        qrCodeContainerS.style.display = 'block';
      });
      events.on('showHighscore', function() {
        qrCodeContainer.style.display = 'block';
        qrCodeContainerS.style.display = 'none';
      });
    }

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

    if(msg[0] === 'CLOSE') {
      removePlayer(player);
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

  function removePlayer(player) {
    container.removeChild(players[player].element);

    players.splice(player, 1);
  }

  function updatePlayerPosition(player, x, y) {
    while(!players[player]) { createPlayer(player); }
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

    updatePlayerPosition(players.length - 1, 0, 0);
  }
}

module.exports = Controls;
