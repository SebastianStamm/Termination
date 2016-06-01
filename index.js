var BpmnViewer = require('bpmn-js');
var fs = require('fs');

var xml = fs.readFileSync(__dirname + '/levels/level1.bpmn', 'utf8');

window.addEventListener('load', function() {

  var viewer = new BpmnViewer({ container: document.body });
  viewer.importXML(xml, function(err) {
    if (err) {
      console.log('error rendering', err);
    } else {
      console.log('rendered');
    }
  });
});

