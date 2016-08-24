var Modeler = require('bpmn-js/lib/Modeler');

var Timekeeping = require('./Timekeeping');

Modeler.prototype._modules = [
  require('bpmn-js/lib/core'),
  require('bpmn-js/lib/features/modeling')
];

var INITIAL_TIME = 15 * 1000;

var Game = function(events) {
  this.events = events;
  this.container = document.createElement('div');
  this.container.className = 'game-container';
  document.body.appendChild(this.container);

  this.timekeeping = new Timekeeping();

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

    var distanceDelta = Math.pow(lowest / 2, 1.12) / 100;
    if(lowest <= 0) {
      distanceDelta = 0;
    }

    // scroll up
    var currentBox = this.viewer.get('canvas').viewbox();
    currentBox.y -= distanceDelta;

    this.viewer.get('canvas').viewbox(currentBox);
    this.viewer.get('canvas').zoom(1);

    requestAnimationFrame(progress);
  };

  events.on('game.start', (gameData) => {
    this.gameData = gameData;
    this.viewer = new Modeler({ container: this.container });
    window.c = this.viewer.get('canvas');
    this.viewer.importXML(gameData, (err) => {
      if (err) {
        alert('Oh no!! ' + err);
      } else {
        this.running = true;
        this.registry = this.viewer.get('elementRegistry');
        this.modeling = this.viewer.get('modeling');
        this.startTime = Date.now();
        this.remainingTime = INITIAL_TIME;
        this.lastUpdate = Date.now();
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

      var objHit = document.elementFromPoint(data.at.x, data.at.y);
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
        var el = this.registry.get(dataElementId);
        if(el.children && el.children.length === 0 && el.type !== 'bpmn:Process') {
          this.modeling.removeElements([this.registry.get(dataElementId)]);
          events.emit('element.destroyed', {
            id: dataElementId,
            shot: data
          });
          if(Object.keys(this.registry._elements).length === 1) {
            // if only the process itself remains
            this.running = false;
            this.container.innerHTML = '';
            events.emit('game.finish');
          }
        }
      }
    }
  });
};

Game.prototype.gameOver = function() {
  this.running = false;
  this.container.innerHTML = '';
  this.events.emit('game.finish', Math.round(-this.viewer.get('canvas').viewbox().y));
};

Game.prototype.lowestElementFromScreen = function() {
  var screenBox = this.viewer.get('canvas').viewbox();

  // x, y, width, height
  var lowerEdge = screenBox.y + screenBox.height;

  var lowest = Infinity;

  // iterate over all elements in the scene
  this.viewer.get('elementRegistry').forEach(element => {
    if(element.businessObject.$instanceOf('bpmn:FlowNode')) {
      var lowerElementEdge = element.y + element.height;

      var distanceFromLowerEdge = lowerEdge - lowerElementEdge;

      lowest = Math.min(lowest, distanceFromLowerEdge);
    }
  });

  return lowest;

};

module.exports = Game;
