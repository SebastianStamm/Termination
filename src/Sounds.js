var shoot = [new Audio('sound/shoot.wav'),new Audio('sound/shoot.wav'),new Audio('sound/shoot.wav')];
var shootCount = 0;
var explosion = [new Audio('sound/explosion.wav'),new Audio('sound/explosion.wav'),new Audio('sound/explosion.wav')];
var explosionCount = 0;

var Sounds = function(events) {

  events.on('shot.fired', () => {
    shoot[shootCount++%3].play();
  });
  events.on('element.destroyed', () => {
    explosion[explosionCount++%3].play();
  });
};

module.exports = Sounds;
