var Magazine = function(bulletCount) {
  this.container = document.createElement('div');
  this.container.style.position = 'absolute';
  this.container.style.top = 0;
  this.container.style.right = 0;
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
    out += '<div style="width: 20px; height: 20px; background-color: black; border: 2px solid white;"></div>';
  }
  this.container.innerHTML = out;
};

module.exports = Magazine;
