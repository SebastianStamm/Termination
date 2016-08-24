var Modeler = require('bpmn-js/lib/Modeler');

var Magazine = require('./Magazine');

Modeler.prototype._modules = [
  require('bpmn-js/lib/core'),
  require('bpmn-js/lib/features/modeling')
];

var Game = function(events) {
  this.container = document.createElement('div');
  this.container.className = 'game-container';
  document.body.appendChild(this.container);

  this.running = false;
  // this.startTime = 0;

  var progress = () => {
    if(!this.running) {
      return;
    }

    // scroll up
    var currentBox = this.viewer.get('canvas').viewbox();
    currentBox.y -= 1;

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
        progress();
      }
    });
  });


  events.on('button2.pressed', () => {
    this.running = false;
    this.container.innerHTML = '';
    events.emit('game.abort');
  });

  events.on('button3.pressed', data => {
    if(this.magazine[data.player] && !this.magazine[data.player].reloading) {
      events.emit('reload.start', data);
      this.magazine[data.player].reloading = true;
      window.setTimeout(() => {
        this.magazine[data.player].reload();
        this.magazine[data.player].reloading = false;
      }, 500);
    }
  });

  this.magazine = [];
  events.on('shot.fired', (data) => {

    if(this.running) {

      // check magazine
      if(typeof this.magazine[data.player] === 'undefined') {
        this.magazine[data.player] = new Magazine(10);
      }

      if(this.magazine[data.player].isEmpty() || this.magazine[data.player].reloading) {
        console.log('magazine is empty or reloading');
        events.emit('magazine.empty', data);
        return;
      }

      this.magazine[data.player].shoot();
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

module.exports = Game;
