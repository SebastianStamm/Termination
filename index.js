var EventEmitter = require('events');

var Highscore = require('./src/Highscore');
var GamepadControls = require('./src/GamepadControls');
var MouseControls = require('./src/MouseControls');
var PhoneControls = require('./src/PhoneControls');
var Game = require('./src/Game');
var Sounds = require('./src/Sounds');
var ScreenShaking = require('./src/ScreenShaking');
var Particles = require('./src/Particles');

var Termination = window.Termination = {};
window.addEventListener('load', function() {

  var events = Termination.events = new EventEmitter();

  var game = Termination.game = new Game(events);
  var scoreBoard = Termination.scoreBoard = new Highscore(events);
  var controls = Termination.controls = new GamepadControls(events);
  var mouseControls = Termination.mouseControls = new MouseControls(events);
  var phoneControls = Termination.phoneControls = new PhoneControls(events);

  var sounds = Termination.sounds = new Sounds(events);
  var screenShaking = Termination.screenShaking = new ScreenShaking(events);
  var particles = Termination.particles = new Particles(events);
});
