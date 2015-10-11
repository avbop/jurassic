"use strict";

// The Game state.

Jurassic.Game = function (game) {
  this.groups = {
    dinos: null
  };
  this.dinos = [];
};

Jurassic.Game.prototype = {
  create: function () {
    /* [FPS]
    this.time.advancedTiming = true;
    this.fpsText = this.add.text(100, 10, 'score', { fontSize: '16px', fill: '#000' });
    this.fpsText.fixedToCamera = true; */

    this.stage.disableVisibilityChange = false; // Pause when out of focus.

    this.physics.startSystem(Phaser.Physics.P2JS);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.groups.dinos = this.add.group();
    var rex = new Jurassic.Dinosaur(this, 100, 100, 10, 'red');
    var fido = new Jurassic.Dinosaur(this, 300, 100, 100, 'green');
    this.groups.dinos.add(rex);
    this.groups.dinos.add(fido);
    this.dinos.push(rex);
    this.dinos.push(fido);
  },

  update: function () {
    // [FPS] this.fpsText.setText(this.time.fps || '--');
    this.dinos[0].setTarget(this.dinos[1]);
    console.log(this.dinos[0].direction * 180 / Math.PI);
  }
};
