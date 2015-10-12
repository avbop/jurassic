"use strict";

// Namespace for the game.
var Jurassic = {
  // Configuration constants.
  WORLD_WIDTH: 800,
  WORLD_HEIGHT: 400
};

// The Game state.

Jurassic.Game = function (game) {
  this.groups = {
    dinos: null,
    humans: null,
    buildings: null,
    gates: null,
    fences: null
  };
  this.score = 0;
  this.scoreText = null;
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

    var bg = this.add.sprite(0, 0, 'bg');

    this.groups.gates = this.add.group();
    this.groups.fences = this.add.group();
    this.groups.dinos = this.add.group();
    this.groups.humans = this.add.group();
    this.groups.buildings = this.add.group();

    /*for (var i = 0; i < 200; i++) {
      var owen = new Jurassic.Human(this, this.world.randomX, this.world.randomY, 'green');
      this.groups.humans.add(owen);
      owen.maxVelocity = 150;
      owen.stunEnabled = false;
    }*/

    var office = new Jurassic.Building(this, 100, 100);
    this.groups.buildings.add(office);

    var dude = new Jurassic.Human(this, 150, 10, 'green');
    this.groups.humans.add(dude);
    dude.maxVelocity = 200;
    dude.health = 1000000;
    dude.attackStrength = 1000;
    dude.stunEnabled = false;
    dude.defaultMove = function () {
      this.direction = Math.PI / 2;
      this.velocity = this.maxVelocity;
    };

    this.scoreText = this.add.text(10, 10, 'score', { fontSize: '16px', fill: '#fff' });
    this.modScore(0); // Set starting score.
  },

  update: function () {
    // [FPS] this.fpsText.setText(this.time.fps || '--');
    this.physics.arcade.collide(this.groups.dinos, this.groups.dinos);
    this.physics.arcade.collide(this.groups.humans, this.groups.humans);
    this.physics.arcade.collide(this.groups.buildings, this.groups.dinos);
    this.physics.arcade.collide(this.groups.buildings, this.groups.humans);
    this.physics.arcade.collide(this.groups.humans, this.groups.dinos, this.fight, null, this);
    if (this.groups.dinos.countLiving() <= 0) {
      var rex = new Jurassic.Dinosaur(this, this.world.randomX, this.world.randomY, 'red');
      rex.attackStrength = 2 * (this.score / 1000);
      this.groups.dinos.add(rex);
      this.groups.humans.forEachAlive(function (human) {
        human.setTarget(this);
      }, rex);
    }
  },

  fight: function (human, dino) {
    dino.fight(human);
    human.fight(dino);
    if (!dino.alive) {
      this.modScore(dino.prizeKilled);
      dino.destroy();
    } else if (dino.stunned) {
      this.modScore(dino.prizeStunned);
      dino.destroy();
    }
  },

  modScore: function (delta) {
    // Do all score changes here.
    this.score += delta;
    if (this.score < 0) {
      this.score = 0;
    }
    this.scoreText.setText('$' + Math.floor(this.score));
  }
};
