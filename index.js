var EventEmitter = require('events');

var Highscore = require('./src/Highscore');
var GamepadControls = require('./src/GamepadControls');
var Game = require('./src/Game');
var Sounds = require('./src/Sounds');
var ScreenShaking = require('./src/ScreenShaking');

window.addEventListener('load', function() {

  var events = new EventEmitter();

  var game = new Game(events);
  var scoreBoard = new Highscore(events);
  var controls = new GamepadControls(events);

  var sounds = new Sounds(events);
  var screenShaking = new ScreenShaking(events);
});

