var Modeler = require('bpmn-js/lib/Modeler');

var Timekeeping = require('./Timekeeping');

var fs = require('fs');
var startLevel = fs.readFileSync(__dirname + '/../levels/1_start.bpmn', 'utf8');

var sections = [
  fs.readFileSync(__dirname + '/../levels/2_subprocesses.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/3_activities_große_abstaende_easy.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/4_langer_baustein_mit_tasks_und_events_1.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/5_arrow.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/6_unexpected_tasks.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/7_viele_tasks_fun.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/8_ezlvl8.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/9_many_data_elements_tricky.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/10_tasks_mit_boundary_events_kurz.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/11_tree.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/12_langer_baustein_mit_tasks_und_events_2.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/13_viele_tasks_schwer.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/14_cards.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/15_viele_events_schwer_2.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/16_eskalation.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/17_ez_lvl5.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/18_multi_instance_orgie.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/19_viele_events_schwer_1.bpmn', 'utf8'),
  fs.readFileSync(__dirname + '/../levels/20_super-mario.bpmn', 'utf8')
];

Modeler.prototype._modules = [
  require('bpmn-js/lib/core'),
  require('bpmn-js/lib/features/modeling')
];

var INITIAL_TIME = 400000 * 1000;

var Game = function(events) {
  this.events = events;
  this.container = document.createElement('div');
  this.container.className = 'game-container';
  document.body.appendChild(this.container);

  this.timekeeping = new Timekeeping(events);

  this.viewers = [];


  this.running = false;

  var progress = () => {
    if(!this.running) {
      return;
    }

    // timekeeping
    var timeSinceLastUpdate = Date.now() - this.lastUpdate;
    this.remainingTime -= timeSinceLastUpdate;
    this.lastUpdate = Date.now();

    if(this.remainingTime <= 0) {
      this.remainingTime = 0;
      this.gameOver();
      return;
    }

    this.timekeeping.update(this.remainingTime);

    // get the lowest element on the screen
    var lowest = this.lowestElementFromScreen();

    if(lowest === Infinity) {
      this.gameOver();
      return;
    }

    if(lowest > 700) {
      var distanceDelta = Math.pow(lowest / 2, 1.30) / 100 * timeSinceLastUpdate / 16.6;
    } else if(lowest > 500) {
      var distanceDelta = Math.pow(lowest / 2, 1.15) / 100 * timeSinceLastUpdate / 16.6;
    } else {
      var distanceDelta = Math.pow(lowest / 2, 1.12) / 100 * timeSinceLastUpdate / 16.6;
    }


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
    // HACK to keep the timekeeper from showing
    this.remainingTime = INITIAL_TIME;

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

          // trigger new section if timer start event was killed
          if(el.type === 'bpmn:IntermediateCatchEvent' &&
             el.businessObject &&
             el.businessObject.eventDefinitions &&
             el.businessObject.eventDefinitions[0] &&
             el.businessObject.eventDefinitions[0].$type === 'bpmn:TimerEventDefinition' &&
             el.businessObject.eventDefinitions[0].timeDuration &&
             el.businessObject.eventDefinitions[0].timeDuration.body) {


            // scale the time addition with the level progress
            this.remainingTime += parseInt(el.businessObject.eventDefinitions[0].timeDuration.body, 10) * 1000/* / Math.pow(this.viewers.length - 1, 1.2)*/;

            window.setTimeout(() => {
              console.log('appending another section');
              this.appendSection();
            }, 200);

          }


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

  var lastSection = this.viewers[this.viewers.length - 1];

  var finalElement;
  lastSection.get('elementRegistry').forEach(element => {
    if(element.type === 'bpmn:IntermediateCatchEvent' &&
       element.businessObject &&
       element.businessObject.eventDefinitions &&
       element.businessObject.eventDefinitions[0] &&
       element.businessObject.eventDefinitions[0].$type === 'bpmn:TimerEventDefinition' &&
       !element.businessObject.eventDefinitions[0].timeDuration) {
      finalElement = element;
    }
  });

  var xml = sections[this.viewers.length - 1];
  if(!xml) {
    return;
  }

  var viewer = new Modeler({ container: this.container });

  this.viewers.push(viewer);

  viewer.importXML(xml, (err) => {
    if (err) {
      throw err;
    } else {

      // get the first element
      var firstElement;
      viewer.get('elementRegistry').forEach(element => {
        if(element.type === 'bpmn:IntermediateCatchEvent' &&
           element.businessObject &&
           element.businessObject.eventDefinitions &&
           element.businessObject.eventDefinitions[0] &&
           element.businessObject.eventDefinitions[0].$type === 'bpmn:TimerEventDefinition' &&
           element.businessObject.eventDefinitions[0].timeDuration &&
           element.businessObject.eventDefinitions[0].timeDuration.body) {
          firstElement = element;
        }
      });

      var otherViewbox = lastSection.get('canvas').viewbox();

      var vector = {
        x: firstElement.x - finalElement.x + otherViewbox.x,
        y: firstElement.y - finalElement.y + otherViewbox.y
      };

      var currentBox = viewer.get('canvas').viewbox();
      currentBox.x = vector.x;
      currentBox.y = vector.y;

      viewer.get('canvas').viewbox(currentBox);
    }
  });
};

Game.prototype.gameOver = function() {
  this.running = false;
  this.container.innerHTML = '';
  this.events.emit('game.finish', this.remainingTime);
  this.viewers = [];

  // hack to keep the timekeeper from showing 1 very quickly on restart
  this.timekeeping.update(30000);

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
