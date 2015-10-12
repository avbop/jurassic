"use strict";

// Namespace for the game.
var Jurassic = {
  // Configuration constants.
  WORLD_WIDTH: 800,
  WORLD_HEIGHT: 400,
  BORDER: 250,
  GATE_DELAY: 2 * Phaser.Timer.SECOND,
  INFO_UI_ID: 'info'
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
  this.dinosLost = 0;
  this.humansLost = 0;
  this.selectedHuman = null;
  this.selectedDino = null;
  this.selectedBarracks = null;
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

    var barracks0 = new Jurassic.Building(this.game, 100, 65, 'Barracks A');
    barracks0.inputEnabled = true;
    barracks0.events.onInputDown.add(this.barracksClick, this);
    this.groups.buildings.add(barracks0);

    var barracks1 = new Jurassic.Building(this.game, 100, 365, 'Barracks B');
    barracks1.inputEnabled = true;
    barracks1.events.onInputDown.add(this.barracksClick, this);
    this.groups.buildings.add(barracks1);

    var dude = new Jurassic.Human(this.game, 150, 300, barracks0, 'green');
    this.groups.humans.add(dude);
    dude.inputEnabled = true;
    dude.events.onInputDown.add(this.humanClick, this);

    var dude = new Jurassic.Human(this.game, 150, 10, barracks1, 'red');
    this.groups.humans.add(dude);
    dude.inputEnabled = true;
    dude.events.onInputDown.add(this.humanClick, this);

    this.scoreText = this.add.text(10, 10, 'score', { fontSize: '16px', fill: '#fff' });
    this.modScore(0); // Set starting score.

    this.updateUI();
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
    if (this.groups.dinos.countLiving() <= this.dinosLost / 10 && Math.random() < 0.007) {
      var rex = new Jurassic.Dinosaur(this.game, Jurassic.randomInt(Jurassic.BORDER + 20, this.world.width), this.world.randomY, 'red');
      rex.attackStrength = 2 * (this.score / 1000);
      rex.setPrey(this.groups.buildings.children[0]);
      rex.inputEnabled = true;
      rex.events.onInputDown.add(this.dinoClick, this);
      this.groups.dinos.add(rex);
    }
  },

  fight: function (human, dino) {
    dino.fight(human);
    human.fight(dino);
    if (!dino.alive || !human.alive) {
      this.updateUI();
    }
    if (!dino.alive) {
      this.dinosLost++;
      this.modScore(dino.prize);
      dino.destroy();
    }
    if (!human.alive) {
      this.humansLost++;
      human.destroy();
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
  },

  humanClick: function (human, ptr) {
    this.selectedHuman = human;
    this.updateUI();
  },

  dinoClick: function (dino, ptr) {
    this.selectedDino = dino;
    this.updateUI();
  },

  barracksClick: function (barracks, ptr) {
    if (this.selectedBarracks == barracks) {
      this.groups.humans.forEach(function (human) {
        if (human.homebase == this.selectedBarracks) {
          human.setPrey(human.homebase);
        }
      }, this);
    }
    this.selectedBarracks = barracks;
    this.updateUI();
  },

  updateUI: function () {
    if (this.selectedDino && !this.selectedDino.alive) {
      this.selectedDino = null;
    }
    if (this.selectedHuman && !this.selectedHuman.alive) {
      this.selectedHuman = null;
    }
    if (this.selectedDino && this.selectedHuman) {
      this.selectedHuman.setPrey(this.selectedDino);
      this.selectedHuman = null;
      this.selectedDino = null;
    }
    if (this.selectedDino && this.selectedBarracks) {
      this.groups.humans.forEach(function (human) {
        if (human.homebase == this.selectedBarracks) {
          human.setPrey(this.selectedDino);
        }
      }, this);
      this.selectedDino = null;
      this.selectedBarracks = null;
    }
    if (this.selectedHuman && this.selectedBarracks) {
      this.selectedHuman.homebase = this.selectedBarracks;
      this.selectedHuman.setPrey(this.selectedBarracks);
      this.selectedHuman = null;
      this.selectedBarracks = null;
    }
    var infoDiv = document.getElementById(Jurassic.INFO_UI_ID);
    if (this.selectedDino) {
      infoDiv.innerHTML = this.selectedDino.name;
    } else if (this.selectedHuman) {
      infoDiv.innerHTML = this.selectedHuman.name;
    } else if (this.selectedBarracks) {
      infoDiv.innerHTML = this.selectedBarracks.name;
    } else {
      infoDiv.innerHTML = '<>';
    }
  }
};
