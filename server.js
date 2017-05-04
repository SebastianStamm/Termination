const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();

app.use(express.static('./'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const viewers = [];
const players = [];

wss.on('connection', function connection(ws) {
  const location = url.parse(ws.upgradeReq.url, true);
  // You might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on('close', function close() {
    if(viewers.indexOf(ws) !== -1) {
      viewers.splice(viewers.indexOf(ws), 1);
    }
    if(players.indexOf(ws) !== -1) {
      sendMsg(ws, 'CLOSE');
      players.splice(players.indexOf(ws), 1);
    }
  });

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    const parts = message.split(' ');

    if(parts[0] === 'INIT' && parts[1] === 'v') {
      viewers.push(ws);

      require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        ws.send('-1!CONF http://' + add + ':' + server.address().port + '/controller.html');
      });
    }

    if(parts[0] === 'INIT' && parts[1] === 'c') {
      ws.send(players.length);
      players.push(ws);
    }

    sendMsg(ws, message);
  });
});

function sendMsg(from, msg) {
  viewers.forEach(viewer => {
    viewer.send(players.indexOf(from) + '!' + msg);
  });
}

server.listen(8080, function listening() {
  console.log('Listening on %d', server.address().port);
});
