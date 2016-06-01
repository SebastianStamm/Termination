var fs = require('fs');
var xml = fs.readFileSync(__dirname + '/../levels/level1.bpmn', 'utf8');
var Highscore = function(events) {
  this.events = events;
  this.container = document.createElement('div');
  this.container.style.position = 'absolute';
  this.container.style.top = 0;
  this.container.style.bottom = 0;
  this.container.style.left = 0;
  this.container.style.right = 0;
  this.container.style.background = 'url(\'img/bg.jpg\')';
  document.body.appendChild(this.container);

  this.container.innerHTML = '<h1>Termination</h1><h2>Fastest Time: <span id="score"></span></h2><h3>Shoot to play!</h3>'
  document.getElementById('score').innerText = 'none';

  events.once('shot.fired', () => {
    this.startGame();
  })
};

Highscore.prototype.startGame = function() {
  this.container.style.display = 'none';
  this.startTime = Date.now();
  this.events.emit('game.start', xml);

  this.events.once('game.finish', () => {
    var endTime = Date.now();
    document.getElementById('score').innerText = (endTime - this.startTime) / 1000 + 's';
    this.container.style.display = 'block';
  });
};

module.exports = Highscore;
