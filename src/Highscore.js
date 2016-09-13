var templates = require('./templates');
var TWEEN = require('tween.js');

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

var animate = function(element, start, end, rendering) {
  var data = {t: start};
  var tween = new TWEEN.Tween(data)
    .to({ t: end }, 2000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onUpdate(function() {
      if(rendering) {
        element.textContent = rendering(Math.round(this.t));
      } else {
        element.textContent = Math.round(this.t);
      }
    })
    .start();
}

function tweenanimation(time) {
  requestAnimationFrame(tweenanimation);
  TWEEN.update(time);
}
requestAnimationFrame(tweenanimation);

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


  this.shotCounter = [0, 0];
  this.hitCounter  = [0, 0];

  events.on('magazine.shoot', (data) => this.shotCounter[data.player]++);
  events.on('element.destroyed', (data) => this.hitCounter[data.shot.player]++);

  events.once('shot.fired', () => {
    this.startGame();
  });

  this.events.on('game.finish', (remainingTime) => {
    var endTime = Date.now();
    this.scoreboard.style.display = 'block';

    var hitSum = this.hitCounter[0] + this.hitCounter[1];
    var shotSum = this.shotCounter[0] + this.shotCounter[1];


    document.getElementById('hit_ratio0').innerText = '100 %';
    document.getElementById('hit_ratio1').innerText = '100 %';

    document.getElementById('missed_shots0').textContent = '0';
    document.getElementById('missed_shots1').textContent = '0';
    document.getElementById('hit_elements0').textContent = '0';
    document.getElementById('hit_elements1').textContent = '0';
    document.getElementById('your_score').textContent = '0';
    document.getElementById('time_bonus').textContent = '00:00';

    animate(document.getElementById('hit_elements0'), 0, this.hitCounter[0]);
    animate(document.getElementById('hit_elements1'), 0, this.hitCounter[1]);
    animate(document.getElementById('your_score'), 0, 100 * hitSum);

    window.setTimeout(() => {
      animate(document.getElementById('missed_shots0'), 0, this.shotCounter[0] - this.hitCounter[0]);
      animate(document.getElementById('missed_shots1'), 0, this.shotCounter[1] - this.hitCounter[1]);
      animate(document.getElementById('your_score'), 100 * hitSum, Math.round(100 * hitSum * hitSum / shotSum));
      if(this.shotCounter[0] > 0) {
        animate(document.getElementById('hit_ratio0'), 100, Math.round(100 * this.hitCounter[0] / this.shotCounter[0]), text => text + ' %');
      }
      if(this.shotCounter[1] > 0) {
        animate(document.getElementById('hit_ratio1'), 100, Math.round(100 * this.hitCounter[1] / this.shotCounter[1]), text => text + ' %');
      }
      window.setTimeout(() => {
        animate(document.getElementById('time_bonus'), 0, remainingTime, text => {
          var remaining = getRemaining(text);
          return leftPad(remaining.seconds, 2) + ':' + leftPad(remaining.hundreds, 2);
        });
        animate(document.getElementById('your_score'), Math.round(100 * hitSum * hitSum / shotSum), Math.round(100 * hitSum * hitSum / shotSum + remainingTime / 100));
      }, 3000);
    }, 3000);

    window.setTimeout(() => {
      this.events.once('shot.fired', () => {

      var newEntry = {name: '', score: Math.round(100 * hitSum * hitSum / shotSum + remainingTime / 100)};
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

  this.shotCounter = [0, 0];
  this.hitCounter  = [0, 0];

  this.events.emit('game.start');
};

module.exports = Highscore;
