var Controller = require('./src/GamepadControls');

var BpmnViewer = require('bpmn-js');
var fs = require('fs');

var xml = fs.readFileSync(__dirname + '/levels/level1.bpmn', 'utf8');

window.addEventListener('load', function() {

  var viewer = new BpmnViewer({ container: document.body });
  viewer.importXML(xml, function(err) {
    if (err) {
      alert('Oh no!! ' + err);
    } else {
      var ctrl = new Controller({viewer: viewer});
    }
  });
});

