var Timekeeping = function() {
  this.container = document.createElement('div');
  this.container.className = 'timekeeping';
  document.body.appendChild(this.container);
};

Timekeeping.prototype.update = function(newTime) {
  this.container.textContent = newTime;
};

module.exports = Timekeeping;
