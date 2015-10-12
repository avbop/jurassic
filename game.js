"use strict";

// Namespace for the game.
var Jurassic = {
  // Configuration constants.
  WORLD_WIDTH: 800,
  WORLD_HEIGHT: 400,
  BORDER: 250,
  GATE_DELAY: 5 * Phaser.Timer.SECOND
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

    this.groups.fences = this.add.group();
    this.groups.gates = this.add.group();
    this.groups.dinos = this.add.group();
    this.groups.humans = this.add.group();
    this.groups.buildings = this.add.group();

    var gate0 = new Jurassic.Gate(this.game, Jurassic.BORDER, 50);
    this.groups.gates.add(gate0);
    var gate1 = new Jurassic.Gate(this.game, Jurassic.BORDER, 250);
    this.groups.gates.add(gate1);
    var gate2 = new Jurassic.Gate(this.game, Jurassic.BORDER, 350);
    this.groups.gates.add(gate2);

    var fence = new Jurassic.Fence(this.game, Jurassic.BORDER, 0, 50, gate0);
    this.groups.fences.add(fence);
    var fence = new Jurassic.Fence(this.game, Jurassic.BORDER, 80, 85, gate0);
    this.groups.fences.add(fence);
    var fence = new Jurassic.Fence(this.game, Jurassic.BORDER, 165, 85, gate1);
    this.groups.fences.add(fence);
    var fence = new Jurassic.Fence(this.game, Jurassic.BORDER, 280, 70, gate1);
    this.groups.fences.add(fence);
    var fence = new Jurassic.Fence(this.game, Jurassic.BORDER, 380, 30, gate2);
    this.groups.fences.add(fence);

    var office = new Jurassic.Building(this.game, 100, 100);
    this.groups.buildings.add(office);

    var dude = new Jurassic.Human(this.game, 150, 10, office, 'green');
    this.groups.humans.add(dude);
    dude.maxVelocity = 50;
    dude.attackStrength = 10;
    dude.defendPercent = 1;
    dude.stunEnabled = false;
    dude.defaultMove = function () {
      this.direction = Math.PI / 2;
      this.velocity = this.maxVelocity;
    };

    var rex = new Jurassic.Dinosaur(this.game, Jurassic.randomInt(Jurassic.BORDER + 20, this.world.width), this.world.randomY, 'red');
    rex.attackStrength = 2 * (this.score / 1000);
    rex.setPrey(this.groups.buildings.children[0]);
    this.groups.dinos.add(rex);
    dude.setPrey(rex);

    this.scoreText = this.add.text(10, 10, 'score', { fontSize: '16px', fill: '#fff' });
    this.modScore(0); // Set starting score.
  },

  update: function () {
    // [FPS] this.fpsText.setText(this.time.fps || '--');
    this.physics.arcade.collide(this.groups.dinos, this.groups.dinos);
    this.physics.arcade.collide(this.groups.humans, this.groups.humans);
    this.physics.arcade.collide(this.groups.buildings, this.groups.dinos);
    this.physics.arcade.collide(this.groups.buildings, this.groups.humans);
    this.physics.arcade.collide(this.groups.fences, this.groups.dinos, this.onFence, null, this);
    this.physics.arcade.collide(this.groups.fences, this.groups.humans, this.onFence, null, this);
    this.physics.arcade.collide(this.groups.gates, this.groups.dinos, this.dinoOnGate, this.testGate, this);
    this.physics.arcade.collide(this.groups.gates, this.groups.humans, this.openGate, this.testGate, this);
    this.physics.arcade.collide(this.groups.humans, this.groups.dinos, this.fight, null, this);
    /*if (this.groups.dinos.countLiving() <= 0) {
      var rex = new Jurassic.Dinosaur(this.game, Jurassic.randomInt(Jurassic.BORDER + 20, this.world.width), this.world.randomY, 'red');
      rex.attackStrength = 2 * (this.score / 1000);
      rex.setPrey(this.groups.buildings.children[0]);
      this.groups.dinos.add(rex);
      this.groups.humans.forEachAlive(function (human) {
        human.setPrey(this);
      }, rex);
    }*/
    this.groups.humans.forEach(function (dude) {
      if (dude.target) console.log('target', dude.x, dude.y, dude.target.x, dude.target.y);
      if (dude.prey) console.log('prey', dude.x, dude.y, dude.prey.x, dude.prey.y);
    }, this);
  },

  fight: function (human, dino) {
    dino.fight(human);
    human.fight(dino);
    if (!dino.alive) {
      this.modScore(dino.prizeKilled);
      console.log('goodbye dino');
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
  },

  openGate: function (gate, human) {
    gate.open();
  },

  testGate: function (gate, character) {
    if (gate.isOpen && character.prey) {
      character.setTarget(character.prey);
    }
    return !gate.isOpen;
  },

  onFence: function (fence, character) {
    character.setTarget(fence.gate);
  },

  dinoOnGate: function (gate, dino) {
    /*if (dino.prey) {
      dino.setTarget(dino.prey);
    }*/
  }
};
