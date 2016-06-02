var EventEmitter = require('events');

var Highscore = require('./src/Highscore');
var GamepadControls = require('./src/GamepadControls');
var Game = require('./src/Game');
var Sounds = require('./src/Sounds');
var ScreenShaking = require('./src/ScreenShaking');

var Termination = window.Termination = {};
window.addEventListener('load', function() {

  var events = Termination.events = new EventEmitter();

  var game = Termination.game = new Game(events);
  var scoreBoard = Termination.scoreBoard = new Highscore(events);
  var controls = Termination.controls = new GamepadControls(events);

  var sounds = Termination.sounds = new Sounds(events);
  var screenShaking = Termination.screenShaking = new ScreenShaking(events);
});

