var Particles = function(events) {
  var container = document.createElement('div');
  document.body.appendChild(container);

  this.particles = [];

  window.particles = this.particles;

  var animate = () => {
    var now = Date.now();
    this.particles.forEach(particle => {

      if(now - particle.created > 2000) {
        container.removeChild(particle.node);
        this.particles.splice(this.particles.indexOf(particle), 1);
      }

      particle.pos.x += particle.vel.x;
      particle.pos.y += particle.vel.y;

      particle.vel.y += 1;

      particle.node.style.left = particle.pos.x + 'px';
      particle.node.style.top = particle.pos.y + 'px';
    });

    requestAnimationFrame(animate);
  };

  var createParticle = (amount, pos) => {
    for(var i = 0; i < amount; i++) {
      var el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.width = '5px';
      el.style.height = '5px';
      el.style.pointerEvents = 'none';
      el.style.backgroundColor = 'white';
      container.appendChild(el);
      this.particles.push({
        created: Date.now(),
        node: el,
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
    createParticle(20, data.shot.at);
  });
  events.on('magazine.shoot', (data) => {
    createParticle(1, data.at);
  });

  animate();

};

module.exports = Particles;
