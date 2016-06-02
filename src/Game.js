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

  events.on('game.start', (xml) => {
    this.viewer = new Modeler({ container: this.container });
    this.viewer.importXML(xml, (err) => {
      if (err) {
        alert('Oh no!! ' + err);
      } else {
        this.running = true;
        this.registry = this.viewer.get('elementRegistry');
        this.modeling = this.viewer.get('modeling');
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
