var fs = require('fs');
var xml = fs.readFileSync(__dirname + '/../levels/level1.bpmn', 'utf8');

var test = fs.readFileSync(__dirname + '/../levels/level.json', 'utf8');

var Highscore = function(events) {
  this.events = events;
  this.container = document.createElement('div');
  this.container.className = 'container';
  document.body.appendChild(this.container);

  this.highscore = Infinity;

  this.container.innerHTML = document.querySelector('[type="text/template"]#game').innerHTML;
  document.getElementById('yourTime').style.display = 'none';
  document.getElementById('fastestTime').style.display = 'none';

  events.once('shot.fired', () => {
    this.startGame();
  });
};

Highscore.prototype.startGame = function() {
  this.container.style.display = 'none';
  this.startTime = Date.now();
  this.events.emit('game.start', JSON.parse(test));

  this.events.once('game.finish', () => {
    var endTime = Date.now();
    document.getElementById('latest').innerText = (endTime - this.startTime) / 1000 + 's';
    this.container.style.display = 'block';
    document.getElementById('yourTime').style.display = 'block';
    document.getElementById('fastestTime').style.display = 'block';

    if(endTime - this.startTime < this.highscore) {
      this.highscore = endTime - this.startTime;
      document.getElementById('score').innerText = this.highscore / 1000 + 's';
    }

    this.events.once('shot.fired', () => {
      this.startGame();
    });
  });
};

module.exports = Highscore;
