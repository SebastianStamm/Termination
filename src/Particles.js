var Particles = function(events) {
  var container = document.createElement('div');
  container.className = 'particleContainer';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.position = 'absolute';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  var canvas = document.createElement('canvas');
  canvas.setAttribute('width', container.clientWidth);
  canvas.setAttribute('height', container.clientHeight);
  container.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';

  window.canvas = canvas;

  this.particles = [];

  window.particles = this.particles;

  var lastUpdate = Date.now();

  var animate = () => {
    var now = Date.now();
    var delta = now - lastUpdate;
    lastUpdate = now;

    ctx.clearRect(0,0,container.clientWidth, container.clientHeight);
    this.particles.forEach(particle => {

      if(now - particle.created > 2000) {
        this.particles.splice(this.particles.indexOf(particle), 1);
      }

      particle.pos.x += particle.vel.x * delta / 16.6;
      particle.pos.y += particle.vel.y * delta / 16.6;

      particle.vel.y +=  delta / 16.6;

      ctx.fillRect(Math.round(particle.pos.x), Math.round(particle.pos.y), 5, 5);
    });

    requestAnimationFrame(animate);
  };

  var createParticle = (amount, pos) => {
    for(var i = 0; i < amount; i++) {
      this.particles.push({
        created: Date.now(),
        pos: {
          x: pos.x,
          y: pos.y
        },
        vel: {
          x: Math.random() * 10 - 5,
          y: - Math.random() * 15
        }
      });
    }
  };

  events.on('element.destroyed', (data) => {
    createParticle(30, data.shot.at);
  });
  events.on('magazine.shoot', (data) => {
    createParticle(1, data.at);
  });

  animate();

};

module.exports = Particles;
