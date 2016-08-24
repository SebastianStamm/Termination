  var ScreenShaking = function(events) {
  this.intensity = 0;

  var shake = () => {

    // cap to maximum shake 40
    this.intensity = Math.min(this.intensity, 40);

    document.body.style.marginTop  = 2 * Math.random() * this.intensity - this.intensity + 'px';
    document.body.style.marginLeft = 2 * Math.random() * this.intensity - this.intensity + 'px';

    this.intensity--;
    if(this.intensity < 0) {
      this.intensity = 0;
    }

    requestAnimationFrame(shake);
  };

  events.on('magazine.shoot', () => {
    this.intensity += 5;
  });

  events.on('element.destroyed', () => {
    this.intensity += 7;
  });

  shake();

};

module.exports = ScreenShaking;
