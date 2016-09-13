var TWEEN = require('tween.js');


var EventEmitter = require('events');
var Highscore = require('./src/Highscore');
var GamepadControls = require('./src/GamepadControls');
var MouseControls = require('./src/MouseControls');
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

  var sounds = Termination.sounds = new Sounds(events);
  var screenShaking = Termination.screenShaking = new ScreenShaking(events);
  var particles = Termination.particles = new Particles(events);

  window.applyParticles = false;
  window.applyScreenshaking = false;
  window.applySound = false;

  document.addEventListener('keydown', (evt) => {
    switch(evt.keyCode) {
      case 87: // w: tilt
        var nodes = document.querySelectorAll('.djs-container');
          var data = {t: 0};
          var tween = new TWEEN.Tween(data)
            .to({ t: 15 }, 7000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function() {
              for (var i = 0; i < nodes.length; i++) {
                nodes[i].style.transform = 'perspective(500px) rotateX('+this.t+'deg) scale(2.5)';
              }
            })
            .start();
            window.setTimeout(function() {
              document.styleSheets[0].insertRule('.djs-container { transform: perspective(500px) rotateX(15deg) scale(2.5) !important; }', 0);
            }, 7000);
        break;

      case 66: // b: add background
        var node = document.querySelector('.game-container');
        node.style.background = 'url(img/background.jpg) center no-repeat';
        document.querySelector('body').style.backgroundColor = 'black';
        break;

      case 78: // n - bpmn.io styling 1
        document.styleSheets[0].insertRule('.djs-container [fill="#ffffff"] { fill: #333; }', 0);
        break;

      case 77: // m - bpmn.io styling 2
        document.styleSheets[0].insertRule('.djs-container text, .djs-container [fill="#000000"] { fill: #00dd00; }', 0);
        break;

      case 188: // , - bpmn.io styling 3
        document.styleSheets[0].insertRule('.djs-container [stroke="#000000"] { stroke: rgb(0,200,0); }', 0);
        break;

      case 68: // d - enable shooting audio
        window.applySound = true;
        break;

      case 70: // f - start background music
        var background = new Audio('sound/bg.wav');
        background.loop = true;
        background.volume = .7;
        background.play();
        break;

      case 71: // g - apply screenshaking
        window.applyScreenshaking = true;
        screenShaking.intensity += 20;
        break;

      case 72: // h - apply particles
        window.applyParticles = true;

        // create 300 particles just for fun :3
        for(var i = 0; i < 300; i++) {
          window.createParticle(1, {x: Math.random() * 1920, y: Math.random()*1080});
        }
        break;


    }
  });

});

