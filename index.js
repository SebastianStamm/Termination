var Controller = require('./src/GamepadControls');

var Modeler = require('bpmn-js/lib/Modeler');

Modeler.prototype._modelingModules = [
  require('bpmn-js/lib/features/modeling')
];


var fs = require('fs');

var xml = fs.readFileSync(__dirname + '/levels/level1.bpmn', 'utf8');

window.addEventListener('load', function() {

  var viewer = new Modeler({ container: document.body, additionalModules: [ require('bpmn-js/lib/features/modeling') ] });
  viewer.importXML(xml, function(err) {
    if (err) {
      alert('Oh no!! ' + err);
    } else {
      var ctrl = new Controller({viewer: viewer});
    }
  });
});

