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
    var hitSum = this.hitCounter[0] + this.hitCounter[1];
    var shotSum = this.shotCounter[0] + this.shotCounter[1];

    // commit the new highscore entry to localstorage, just to make sure it is persistet
    var newEntry = {
      name: '???',
      score: Math.round(100 * hitSum * hitSum / shotSum + remainingTime / 100),
      time: new Date().toString()
    };

    if(newEntry.score) {
      this.highscore.push(newEntry);
      this.highscore.sort(function(a,b) {
        return b.score - a.score;
      });
      window.localStorage.setItem('highscore', JSON.stringify(this.highscore));
    }

    // this.showScoreCounter(newEntry, hitSum, shotSum);
    if(newEntry.score) {
      if(this.highscore.indexOf(newEntry) < 10) {
        // this.scoreboard.style.display = 'none';
        this.showNameBoard(newEntry, this.shotCounter[0] && this.shotCounter[1], hitSum, shotSum, remainingTime);
      } else {
        this.showScoreCounter(newEntry, hitSum, shotSum, remainingTime);
      }
    } else {
      this.showScoreCounter(newEntry, hitSum, shotSum, remainingTime);
    }


  });
};

Highscore.prototype.showScoreCounter = function(newEntry, hitSum, shotSum, remainingTime) {
    this.scoreboard.style.display = 'block';

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

      // if(newEntry.score) {
      //   if(this.highscore.indexOf(newEntry) < 10) {
      //     this.scoreboard.style.display = 'none';
      //     this.showNameBoard(newEntry, this.shotCounter[0] && this.shotCounter[1]);
      //   } else {
      //     this.scoreboard.style.display = 'none';
      //     this.showHighscore();
      //   }
      // } else {
        this.scoreboard.style.display = 'none';
        this.showHighscore();
      // }

      });
    }, 2000);
};

Highscore.prototype.showNameBoard = function(newEntry, multiplayer, hitSum, shotSum, remainingTime) {

  var name = '';
  var secondName = ''

  if(multiplayer) {
    document.getElementById('highscore_multiplayer').style.display = 'inline';
  } else {
    document.getElementById('highscore_multiplayer').style.display = 'none';
  }

  this.nameboard.style.display = 'block';
  var evtHandler = (data) => {
    var player = data.player;
    var objHit = document.elementFromPoint(data.at.x, data.at.y);

    if(!objHit) {
      return;
    }

    if(objHit.id === 'skipEntryButton') {
      this.events.removeListener('shot.fired', evtHandler);
      this.highscore.splice(this.highscore.indexOf(newEntry), 1);
      window.localStorage.setItem('highscore', JSON.stringify(this.highscore));
      document.getElementById('namePlayer0').textContent = '___';
      document.getElementById('namePlayer1').textContent = '___';
      this.nameboard.style.display = 'none';
      this.showScoreCounter(newEntry, hitSum, shotSum, remainingTime);
    }

    if(objHit.parentNode && objHit.parentNode.id === 'letterboard') {
      if(multiplayer) {
        if(player === 0 && name.length < 3) {
          name += objHit.textContent;
        } else if(player === 1 && secondName.length < 3) {
          secondName += objHit.textContent;
        }
      } else {
        name += objHit.textContent;
      }

      newEntry.name = secondName ? (name + ' + ' + secondName) : name;
      window.localStorage.setItem('highscore', JSON.stringify(this.highscore));

      document.getElementById('namePlayer0').textContent = name;
      document.getElementById('namePlayer1').textContent = secondName;
      if(multiplayer && name.length === 3 && secondName.length === 3 ||
         !multiplayer && name.length === 3) {
        this.events.removeListener('shot.fired', evtHandler);
        document.getElementById('namePlayer0').textContent = '___';
        document.getElementById('namePlayer1').textContent = '___';
        this.nameboard.style.display = 'none';
        this.showScoreCounter(newEntry, hitSum, shotSum, remainingTime);
        // window.localStorage.setItem('highscore', JSON.stringify(this.highscore));
      }
    }
  }
  this.events.on('shot.fired', evtHandler);
};

Highscore.prototype.showHighscore = function() {

  this.container.style.display = 'block';

  for(var i = 0; i < 10; i++) {
    document.getElementById('score' + i).textContent = this.highscore[i] && this.highscore[i].score || 0;
    document.getElementById('name' + i).textContent = this.highscore[i] && this.highscore[i].name || '___';
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
