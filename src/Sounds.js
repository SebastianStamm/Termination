var shoot = [new Audio('sound/shoot.wav'),new Audio('sound/shoot.wav'),new Audio('sound/shoot.wav')];
var shootCount = 0;
var explosion = [new Audio('sound/explosion.wav'),new Audio('sound/explosion.wav'),new Audio('sound/explosion.wav')];
var explosionCount = 0;
var empty = new Audio('sound/empty.wav');
var reload = new Audio('sound/reload.wav');

var Sounds = function(events) {
  events.on('magazine.shoot', () => {
    if(window.applySound) {
      shoot[shootCount++%3].play();
    }
  });
  events.on('reload.start', () => {
    reload.play();
  });
  events.on('element.destroyed', () => {
    if(window.applySound) {
      explosion[explosionCount++%3].play();
    }
  });
  events.on('magazine.empty', () => {
    empty.play();
  })
};

module.exports = Sounds;
