"use strict";

// The Game state.

Jurassic.Game = function (game) {
  this.groups = {
    dinos: null,
    humans: null
  };
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
    this.groups.humans = this.add.group();

    var rex = new Jurassic.Dinosaur(this, this.world.centerX, this.world.centerY, 'red');
    //var fido = new Jurassic.Dinosaur(this, 100, 200, 100, 'green');
    this.groups.dinos.add(rex);
    //this.groups.dinos.add(fido);

    for (var i = 0; i < 10; i++) {
      var owen = new Jurassic.Human(this, this.world.randomX, this.world.randomY, 'green');
      this.groups.humans.add(owen);
      owen.setTarget(rex);
      owen.max_velocity = 200;
    }
  },

  update: function () {
    // [FPS] this.fpsText.setText(this.time.fps || '--');
    this.physics.arcade.collide(this.groups.dinos, this.groups.dinos);
    this.physics.arcade.collide(this.groups.humans, this.groups.humans);
    this.physics.arcade.collide(this.groups.humans, this.groups.dinos, this.fight, null, this);
  },

  fight: function (human, dino) {
    dino.fight(human);
    human.fight(dino);
    console.log(dino.health, dino.attackPercent, dino.defendPercent);
  }
};
