var templates = require('./templates');

var Highscore = function(events) {
  this.events = events;
  this.container = document.createElement('div');
  this.container.className = 'container';
  document.body.appendChild(this.container);

  this.scoreboard = document.createElement('div');
  this.scoreboard.className = 'scoreboard';
  document.body.appendChild(this.scoreboard);
  this.scoreboard.style.display = 'none';

  this.highscore = window.localStorage.getItem('highscore') && parseInt(JSON.parse(window.localStorage.getItem('highscore'))) || [];

  if(typeof this.highscore === 'number') {
    this.highscore = [{score: this.highscore}];
  }

  this.container.innerHTML = templates('game');
  this.scoreboard.innerHTML = templates('scoreboard');
  // document.getElementById('yourTime').style.display = 'none';
  // document.getElementById('fastestTime').style.display = 'none';


  this.shotCounter = 0;
  this.hitCounter  = 0;

  events.on('magazine.shoot', () => this.shotCounter++);
  events.on('element.destroyed', () => this.hitCounter++);

  events.once('shot.fired', () => {
    this.startGame();
  });

  this.events.on('game.finish', (score) => {
    var endTime = Date.now();
    // document.getElementById('latest').innerText = (endTime - this.startTime) / 1000 + 's';
    // document.getElementById('latest').innerText = score;
    // document.getElementById('score').innerText = this.highscore;
    this.scoreboard.style.display = 'block';

    document.getElementById('hit_elements').innerText = this.hitCounter;
    document.getElementById('missed_shots').innerText = this.shotCounter - this.hitCounter;
    document.getElementById('hit_ratio').innerText = Math.round(this.hitCounter / (this.shotCounter) * 100) + '%';
    document.getElementById('your_score').innerText = Math.round(100 * this.hitCounter * this.hitCounter / this.shotCounter);

    // document.getElementById('yourTime').style.display = 'block';
    // document.getElementById('fastestTime').style.display = 'block';

    // if(score > this.highscore) {
    //   this.highscore = score;
    //   document.getElementById('score').innerText = score;

    // }

    window.setTimeout(() => {
      this.events.once('shot.fired', () => {

      var newEntry = {name: '', score: Math.round(100 * this.hitCounter * this.hitCounter / this.shotCounter)};
      this.highscore.push(newEntry);
      this.highscore.sort(function(a,b) {
        return b.score - a.score;
      });

      if(this.highscore.indexOf(newEntry) < 10) {
        var name = window.prompt('You got a new Highscore! Please enter your name:');
        newEntry.name = name.substr(0, 6);
      }

      window.localStorage.setItem('highscore', JSON.stringify(this.highscore));


        this.scoreboard.style.display = 'none';
        this.showHighscore();
      });
    }, 2000);
  });

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
