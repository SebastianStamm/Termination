var Modeler = require('bpmn-js/lib/Modeler');

Modeler.prototype._modules = [
  require('bpmn-js/lib/core'),
  require('bpmn-js/lib/features/modeling')
];

var Game = function(events) {
  this.container = document.createElement('div');
  this.container.style.position = 'absolute';
  this.container.style.top = 0;
  this.container.style.bottom = 0;
  this.container.style.left = 0;
  this.container.style.right = 0;
  document.body.appendChild(this.container);

  this.running = false;
  this.startTime = 0;

  var progress = () => {
    if(!this.running) {
      return;
    }

    var delta = Date.now() - this.startTime;

    for(var i = 0; i < this.gameData.progress.length; i++) {
      if(this.gameData.progress[i].timestamp > delta) {
        break;
      }
    }
    var next = this.gameData.progress[i];
    var prev = this.gameData.progress[i-1];

    if(!prev) {
      prev = {
        "timestamp": 0,
        "position": {
          "x": 0,
          "y": 0
        },
        "zoom": 1
      };
    }
    if(next) {
      var innerProgress = (delta - prev.timestamp) / (next.timestamp - prev.timestamp);
      var current = {
        position: {
          x: prev.position.x + (next.position.x - prev.position.x) * innerProgress,
          y: prev.position.y + (next.position.y - prev.position.y) * innerProgress
        },
        zoom: prev.zoom + (next.zoom - prev.zoom) * innerProgress
      };
      var currentBox = this.viewer.get('canvas').viewbox();
      currentBox.x = current.position.x;
      currentBox.y = current.position.y;

      this.viewer.get('canvas').viewbox(currentBox);
      this.viewer.get('canvas').zoom(current.zoom);
    }


    requestAnimationFrame(progress);
  }

  events.on('game.start', (gameData) => {
    this.gameData = gameData;
    this.viewer = new Modeler({ container: this.container });
    this.viewer.importXML(gameData.xml, (err) => {
      if (err) {
        alert('Oh no!! ' + err);
      } else {
        this.running = true;
        this.registry = this.viewer.get('elementRegistry');
        this.modeling = this.viewer.get('modeling');
        this.startTime = Date.now();
        progress();
      }
    });
  });

  events.on('shot.fired', (data) => {
    if(this.running) {
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

module.exports = Game;
