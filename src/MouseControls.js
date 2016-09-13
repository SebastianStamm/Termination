var Controls = function(events) {

  document.body.addEventListener('click', function(evt) {
    events.emit('shot.fired', {
      player: Math.floor(Math.random() * 2),
      at: {
        x: evt.clientX,
        y: evt.clientY
      }
    });
  });

  document.body.addEventListener('contextmenu', function(evt) {
    evt.preventDefault();
    events.emit('button3.pressed', {
      player: 0,
      at: {
        x: evt.clientX,
        y: evt.clientY
      }
    });
  });

};

module.exports = Controls;
