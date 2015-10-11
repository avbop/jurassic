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
    this.world.setBounds(0, 0, Jurassic.WORLD_WIDTH, Jurassic.WORLD_HEIGHT);
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.groups.dinos = this.add.group();
    var rex = new Jurassic.Dinosaur(this, 100, 100, 50, 'red');
    var fido = new Jurassic.Dinosaur(this, 200, 100, 100, 'green');
    /*fido.defaultMove = function () {
      this.direction = -Math.PI/2;
      this.velocity = 0;
    };*/
    this.groups.dinos.add(rex);
    this.groups.dinos.add(fido);
    this.dinos.push(rex);
    this.dinos.push(fido);

    var dude = new Jurassic.Human(this, 10, 10, 50, 'green');
    this.add.existing(dude);
  },

  update: function () {
    // [FPS] this.fpsText.setText(this.time.fps || '--');
    this.dinos[0].setTarget(this.dinos[1]);
  }
};
