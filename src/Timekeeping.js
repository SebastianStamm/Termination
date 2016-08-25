var Timekeeping = function(events) {
  this.container = document.createElement('div');
  this.container.className = 'timekeeping';
  document.body.appendChild(this.container);


  this.bigContainer = document.createElement('div');
  this.bigContainer.className = 'timekeeping-big';
  document.body.appendChild(this.bigContainer);
  this.bigContainer.style.display = 'none';



  events.on('game.finish', (score) => {
    this.container.style.display = 'none';
    this.bigContainer.style.display = 'none';
  });

  events.on('game.abort', () => {
    this.container.style.display = 'none';
    this.bigContainer.style.display = 'none';
  });

  events.on('game.start', () => {
    this.container.style.display = 'block';
    this.bigContainer.style.display = 'block';
  })
};

Timekeeping.prototype.update = function(newTime) {
  var remaining = getRemaining(newTime);
  this.container.textContent = leftPad(remaining.seconds, 2) + ':' + leftPad(remaining.hundreds, 2);

  if(remaining.seconds <= 5 && newTime > 0) {
    this.bigContainer.style.display = 'block';
    this.bigContainer.style.fontSize = 500 + 0.3 * (1000 - remaining.milliseconds) + 'px';
    this.bigContainer.style.opacity = 0.7;
    if(remaining.seconds === 0) {
      this.bigContainer.style.fontSize = 800 + 0.2 * (1000 - remaining.milliseconds) + 'px';
    } else if(remaining.seconds > 1) {
      if(remaining.milliseconds < 200) {
        this.bigContainer.style.opacity = 0.7 - (0.7 * (1 - remaining.milliseconds / 200))
      }
    }
    this.bigContainer.textContent = remaining.seconds || '1';
  } else {
    this.bigContainer.style.display = 'none';
  }
};

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

module.exports = Timekeeping;
