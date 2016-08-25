var Timekeeping = function() {
  this.container = document.createElement('div');
  this.container.className = 'timekeeping';
  document.body.appendChild(this.container);
};

Timekeeping.prototype.update = function(newTime) {
  var remaining = getRemaining(newTime);
  this.container.textContent = leftPad(remaining.seconds, 2) + ':' + leftPad(remaining.hundreds, 2);
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
