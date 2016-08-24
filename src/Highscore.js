var fs = require('fs');
var xml = fs.readFileSync(__dirname + '/../levels/start.bpmn', 'utf8');

// var test = fs.readFileSync(__dirname + '/../levels/termination.json', 'utf8');

var templates = require('./templates');

var Highscore = function(events) {
  this.events = events;
  this.container = document.createElement('div');
  this.container.className = 'container';
  document.body.appendChild(this.container);

  this.highscore = Infinity;

  this.container.innerHTML = templates('game');
  document.getElementById('yourTime').style.display = 'none';
  document.getElementById('fastestTime').style.display = 'none';

  events.once('shot.fired', () => {
    this.startGame();
  });

  this.events.on('game.finish', () => {
    var endTime = Date.now();
    document.getElementById('latest').innerText = (endTime - this.startTime) / 1000 + 's';
    this.container.style.display = 'block';
    document.getElementById('yourTime').style.display = 'block';
    document.getElementById('fastestTime').style.display = 'block';

    if(endTime - this.startTime < this.highscore) {
      this.highscore = endTime - this.startTime;
      document.getElementById('score').innerText = this.highscore / 1000 + 's';
    }
    window.setTimeout(() => {
      this.events.once('shot.fired', () => {
        this.startGame();
      });
    }, 2000);
  });

  this.events.on('game.abort', () => {
    this.container.style.display = 'block';
    document.getElementById('yourTime').style.display = 'none';
    document.getElementById('fastestTime').style.display = 'block';
    window.setTimeout(() => {
      this.events.once('shot.fired', () => {
        this.startGame();
      });
    }, 2000);
  });
};

Highscore.prototype.startGame = function() {
  this.container.style.display = 'none';
  this.startTime = Date.now();
  // this.events.emit('game.start', JSON.parse(test));
  this.events.emit('game.start', xml);
};

module.exports = Highscore;
