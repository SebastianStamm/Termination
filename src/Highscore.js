var templates = require('./templates');

var leftPad = function(number, digits) {
  var str = '' + number;
  while(str.length < digits) {
    str = '0' + str;
  }
  return str;
}

var getRemaining = function(millis) {
  return {
    hundreds: Math.floor(millis / 10) % 100,
    milliseconds: millis % 1000,
    seconds: Math.floor(millis / 1000)
  };

}
var Highscore = function(events) {
  this.events = events;
  this.container = document.createElement('div');
  this.container.className = 'container';
  document.body.appendChild(this.container);

  this.scoreboard = document.createElement('div');
  this.scoreboard.className = 'scoreboard';
  document.body.appendChild(this.scoreboard);
  this.scoreboard.style.display = 'none';

  this.nameboard = document.createElement('div');
  this.nameboard.className = 'nameboard';
  document.body.appendChild(this.nameboard);
  this.nameboard.style.display = 'none';

  this.highscore = window.localStorage.getItem('highscore') && JSON.parse(window.localStorage.getItem('highscore')) || [];

  if(typeof this.highscore === 'number') {
    this.highscore = [{score: this.highscore}];
  }

  this.container.innerHTML = templates('game');
  this.scoreboard.innerHTML = templates('scoreboard');
  this.nameboard.innerHTML = templates('nameboard');
  // document.getElementById('yourTime').style.display = 'none';
  // document.getElementById('fastestTime').style.display = 'none';


  this.shotCounter = 0;
  this.hitCounter  = 0;

  events.on('magazine.shoot', () => this.shotCounter++);
  events.on('element.destroyed', () => this.hitCounter++);

  events.once('shot.fired', () => {
    this.startGame();
  });

  this.events.on('game.finish', (remainingTime) => {
    var endTime = Date.now();
    this.scoreboard.style.display = 'block';

    document.getElementById('hit_elements').innerText = this.hitCounter;
    document.getElementById('missed_shots').innerText = this.shotCounter - this.hitCounter;
    document.getElementById('hit_ratio').innerText = Math.round(this.hitCounter / (this.shotCounter) * 100) + '%';


    var remaining = getRemaining(remainingTime);
    document.getElementById('time_bonus').innerText = leftPad(remaining.seconds, 2) + ':' + leftPad(remaining.hundreds, 2);

    document.getElementById('your_score').innerText = Math.round(100 * this.hitCounter * this.hitCounter / this.shotCounter + remainingTime / 100);


    window.setTimeout(() => {
      this.events.once('shot.fired', () => {

      var newEntry = {name: '', score: Math.round(100 * this.hitCounter * this.hitCounter / this.shotCounter)};
      this.highscore.push(newEntry);
      this.highscore.sort(function(a,b) {
        return b.score - a.score;
      });

      if(this.highscore.indexOf(newEntry) < 10) {
        this.scoreboard.style.display = 'none';
        this.showNameBoard(newEntry);
      } else {
        this.scoreboard.style.display = 'none';
        this.showHighscore();
      }

      });
    }, 2000);
  });

};

Highscore.prototype.showNameBoard = function(newEntry) {

  this.nameboard.style.display = 'block';
  var name = ''
  var evtHandler = (data) => {
    var objHit = document.elementFromPoint(data.at.x, data.at.y);

    if(objHit.parentNode.id === 'letterboard') {
      name += objHit.textContent;
      document.getElementById('enteredName').textContent = name;
      if(name.length === 3) {
        this.events.removeListener('shot.fired', evtHandler);
        newEntry.name = name;
        document.getElementById('enteredName').textContent = '___';
        this.nameboard.style.display = 'none';
        this.showHighscore();
        window.localStorage.setItem('highscore', JSON.stringify(this.highscore));
      }
    }
  }
  this.events.on('shot.fired', evtHandler);
};

Highscore.prototype.showHighscore = function() {

  this.container.style.display = 'block';

  for(var i = 0; i < 10; i++) {
    document.getElementById('score' + i).textContent = this.highscore[i] && this.highscore[i].score || 0;
    document.getElementById('name' + i).textContent = this.highscore[i] && this.highscore[i].name || 'AAA';
  }

  window.setTimeout(() => {
    this.events.once('shot.fired', () => {
      this.startGame();
    });
  }, 10);
};

Highscore.prototype.startGame = function() {
  this.container.style.display = 'none';
  this.startTime = Date.now();

  this.shotCounter = 0;
  this.hitCounter  = 0;

  // this.events.emit('game.start', JSON.parse(test));
  this.events.emit('game.start');
};

module.exports = Highscore;
