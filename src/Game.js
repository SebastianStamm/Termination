var Modeler = require('bpmn-js/lib/Modeler');

var Timekeeping = require('./Timekeeping');

var fs = require('fs');
var startLevel = fs.readFileSync(__dirname + '/../levels/start.bpmn', 'utf8');

var sections = [
  fs.readFileSync(__dirname + '/../levels/eskalation.bpmn', 'utf8')
];

Modeler.prototype._modules = [
  require('bpmn-js/lib/core'),
  require('bpmn-js/lib/features/modeling')
];

var INITIAL_TIME = 300 * 1000;

var Game = function(events) {
  this.events = events;
  this.container = document.createElement('div');
  this.container.className = 'game-container';
  document.body.appendChild(this.container);

  this.timekeeping = new Timekeeping();

  this.viewers = [];


  this.running = false;
  // this.startTime = 0;

  var progress = () => {
    if(!this.running) {
      return;
    }

    // timekeeping
    var timeSinceLastUpdate = Date.now() - this.lastUpdate;
    this.remainingTime -= timeSinceLastUpdate;
    this.lastUpdate = Date.now();

    if(this.remainingTime < 0) {
      this.gameOver();
    }

    this.timekeeping.update(this.remainingTime);

    // get the lowest element on the screen
    var lowest = this.lowestElementFromScreen();

    var distanceDelta = Math.pow(lowest / 2, 1.12) / 100 * timeSinceLastUpdate / 16.6;
    if(lowest <= 0) {
      distanceDelta = 0;
    }

    // scroll up
    this.viewers.forEach(viewer => {
      var currentBox = viewer.get('canvas').viewbox();
      currentBox.y -= distanceDelta;

      viewer.get('canvas').viewbox(currentBox);
      viewer.get('canvas').zoom(1);
    });

    requestAnimationFrame(progress);
  };

  events.on('game.start', () => {
    this.viewer = new Modeler({ container: this.container });
    this.viewers.push(this.viewer);
    window.c = this.viewer.get('canvas');
    this.viewer.importXML(startLevel, (err) => {
      if (err) {
        alert('Oh no!! ' + err);
      } else {
        this.running = true;
        this.registry = this.viewer.get('elementRegistry');
        this.modeling = this.viewer.get('modeling');
        this.startTime = Date.now();
        this.remainingTime = INITIAL_TIME;
        this.lastUpdate = Date.now();

        // create the next section of the level for smooth game flow
        this.appendSection();


        progress();
      }
    });
  });


  events.on('button2.pressed', () => {
    this.running = false;
    this.container.innerHTML = '';
    events.emit('game.abort');
  });

  events.on('shot.fired', (data) => {

    if(this.running) {

      events.emit('magazine.shoot', data);

      // hide all viewers
      this.viewers.forEach(viewer => {
        viewer.container.style.display = 'none';
      });

      // try every viewer
      this.viewers.forEach(viewer => {

        viewer.container.style.display = 'block';

        var objHit = document.elementFromPoint(data.at.x, data.at.y);

        console.log(objHit);

        while(objHit && !objHit.getAttribute('data-element-id') && objHit.parentNode) {
          objHit = objHit.parentNode;
          if(objHit === document) {
            return;
          }
        }
        if(!objHit) {
          return;
        }
        var dataElementId = objHit.getAttribute('data-element-id');
        if(dataElementId) {
          var el = viewer.get('elementRegistry').get(dataElementId);
          if(el.children && el.children.length === 0 && el.type !== 'bpmn:Process') {
            viewer.get('modeling').removeElements([viewer.get('elementRegistry').get(dataElementId)]);
            events.emit('element.destroyed', {
              id: dataElementId,
              shot: data
            });
          }
        }
      });
    }
  });
};

Game.prototype.appendSection = function() {
  var xml = sections[Math.floor(Math.random() * sections.length)];

  var viewer = new Modeler({ container: this.container });

  this.viewers.push(viewer);

  viewer.importXML(xml, (err) => {
    if (err) {
      alert('Oh no!! ' + err);
    }
  });
};

Game.prototype.gameOver = function() {
  this.running = false;
  this.container.innerHTML = '';
  this.events.emit('game.finish', Math.round(-this.viewers[0].get('canvas').viewbox().y));
  this.viewers = [];
};

Game.prototype.lowestElementFromScreen = function() {
  var lowest = Infinity;

  this.viewers.forEach(viewer => {
    var screenBox = viewer.get('canvas').viewbox();

    // x, y, width, height
    var lowerEdge = screenBox.y + screenBox.height;


    // iterate over all elements in the scene
    viewer.get('elementRegistry').forEach(element => {
      if(element.businessObject.$instanceOf('bpmn:FlowNode')) {
        var lowerElementEdge = element.y + element.height;

        var distanceFromLowerEdge = lowerEdge - lowerElementEdge;

        lowest = Math.min(lowest, distanceFromLowerEdge);
      }
    });

  });

  return lowest;

};

module.exports = Game;
