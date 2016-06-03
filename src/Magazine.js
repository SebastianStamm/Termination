var Magazine = function(bulletCount) {
  this.container = document.createElement('div');
  this.container.className = 'magazine';
  document.body.appendChild(this.container);

  this.maxBullets = bulletCount;
  this.bullets = this.maxBullets;

  this.updateContainer();
};

Magazine.prototype.shoot = function() {
  this.bullets--;
  this.updateContainer();
};

Magazine.prototype.isEmpty = function() {
  return this.bullets <= 0;
};

Magazine.prototype.reload = function() {
  this.bullets = this.maxBullets;
  this.updateContainer();
};

Magazine.prototype.updateContainer = function() {
  var out = '';
  for(var i = 0; i < this.bullets; i++) {
    out += '<img src="img/bullet.png"><br/>';
  }
  this.container.innerHTML = out;
};

module.exports = Magazine;
