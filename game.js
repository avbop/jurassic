// Namespace for the game.
var Jurassic = {
  // Configuration constants.
  WORLD_WIDTH: 800,
  WORLD_HEIGHT: 400,
  BORDER: 250,
  GATE_DELAY: 3 * Phaser.Timer.SECOND,
  INFO_UI_ID: 'info',
  HUMAN_COLOUR: {
    RED: 0,
    TEAL: 1,
    BLUE: 2,
    NAVY: 3,
    AQUA: 4,
    LIME: 5,
    GREEN: 6,
    PURPLE: 7
  },
  DINO_COLOUR: {
    RED: 0,
    YELLOW: 1,
    ORANGE: 2,
    BURNT: 3,
    MAROON: 4,
    WHITE: 5,
    SAND: 6,
    PINK: 7
  }
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
  this.defaultBarracks = null;
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

    var bg = this.add.sprite(0, 0, 'bg');
    bg.inputEnabled = true;
    bg.events.onInputDown.add(function () {
      if (this.selectedDino) {
        this.selectedDino.animations.play('unselected');
        this.selectedDino = null;
      }
      if (this.selectedHuman) {
        this.selectedHuman.animations.play('unselected');
        this.selectedHuman = null;
      }
      if (this.selectedBarracks) {
        this.selectedBarracks.animations.play('unselected');
        this.selectedBarracks = null;
      }
    }, this);

    this.groups.fences = this.add.group();
    this.groups.gates = this.add.group();
    this.groups.buildings = this.add.group();
    this.groups.dinos = this.add.group();
    this.groups.humans = this.add.group();

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

    this.addBarracks(new Jurassic.Building(this.game, 150, 50, 'Barracks A'));
    var barracks = new Jurassic.Building(this.game, 150, 200, 'Barracks B');
    this.addBarracks(barracks);
    this.defaultBarracks = barracks;
    this.addBarracks(new Jurassic.Building(this.game, 150, 350, 'Barracks C'));

    // Starting complement.
    for (var i = 0; i < 10; i++) {
      this.addHuman(Jurassic.Grunt(this.game, 150 + Jurassic.randomInt(-50, 50), 10, barracks0));
      this.addHuman(Jurassic.Dog(this.game, 150 + Jurassic.randomInt(-50, 50), 10, barracks0));
      this.addHuman(Jurassic.Grunt(this.game, 150 + Jurassic.randomInt(-50, 50), 300, barracks1));
      this.addHuman(Jurassic.Dog(this.game, 150 + Jurassic.randomInt(-50, 50), 300, barracks1));
    }

    // Starting enemy.
    this.addDino(Jurassic.BabyStegosaurus(this.game, Jurassic.randomInt(Jurassic.BORDER + 20, this.world.width), this.world.randomY));

    this.scoreText = this.add.text(10, 10, 'score', { fontSize: '16px', fill: '#fff' });
    this.modScore(0); // Set starting score.

    var pauseKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    pauseKey.onDown.add(function () {
      if (this.physics.arcade.isPaused) {
        this.physics.arcade.isPaused = false;
        this.time.events.resume();
      } else {
        this.physics.arcade.isPaused = true;
        this.time.events.pause();
      }
    }, this);

    this.updateUI();
  },

  update: function () {
    // [FPS] this.fpsText.setText(this.time.fps || '--');
    if (!this.physics.arcade.isPaused) {
      this.physics.arcade.collide(this.groups.dinos, this.groups.dinos);
      this.physics.arcade.collide(this.groups.humans, this.groups.humans);
      this.physics.arcade.collide(this.groups.buildings, this.groups.dinos);
      this.physics.arcade.overlap(this.groups.buildings, this.groups.humans, this.inBuilding, null, this);
      this.physics.arcade.collide(this.groups.fences, this.groups.dinos, this.onFence, null, this);
      this.physics.arcade.collide(this.groups.fences, this.groups.humans, this.onFence, null, this);
      this.physics.arcade.collide(this.groups.gates, this.groups.dinos, null, this.testGate, this);
      this.physics.arcade.collide(this.groups.gates, this.groups.humans, this.openGate, this.testGate, this);
      this.physics.arcade.collide(this.groups.humans, this.groups.dinos, this.fight, null, this);
      if (this.groups.dinos.countLiving() <= this.dinosLost / 5 && Math.random() < 0.004) {
        this.addDino(Jurassic.BabyStegosaurus(this.game, Jurassic.randomInt(Jurassic.BORDER + 20, this.world.width), this.world.randomY));
      }
      this.groups.dinos.forEachDead(function (dino) {
        this.dinosLost++;
        this.modScore(dino.prize);
        dino.destroy();
      }, this);
      this.groups.humans.forEachDead(function (human) {
        this.humansLost++;
        human.destroy();
      }, this);
    }
    this.updateUI();
  },

  addDino: function (dino) {
    this.groups.dinos.add(dino);
    dino.inputEnabled = true;
    dino.events.onInputDown.add(this.dinoClick, this);
  },

  addHuman: function (human) {
    this.groups.humans.add(human);
    human.inputEnabled = true;
    human.events.onInputDown.add(this.humanClick, this);
  },

  addBarracks: function (barracks) {
    this.groups.buildings.add(barracks);
    barracks.inputEnabled = true;
    barracks.events.onInputDown.add(this.barracksClick, this);
  },

  fight: function (human, dino) {
    dino.fight(human);
    human.fight(dino);
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
    if (character.prey) {
      character.setTarget(character.prey);
    } else if (character.target == gate) {
      character.setTarget(null);
    }
    return !gate.isOpen;
  },

  onFence: function (fence, character) {
    if (character.target || character.prey) {
      character.setTarget(fence.gate);
    }
  },

  inBuilding: function (building, human) {
    if (human.prey && human.prey == building) {
      human.setPrey(null);
    } else if (human.target && human.target == building) {
      human.setTarget(null);
    }
  },

  humanClick: function (human, ptr) {
    this.selectedHuman = human;
    this.selectedHuman.animations.play('selected');
  },

  dinoClick: function (dino, ptr) {
    this.selectedDino = dino;
    this.selectedDino.animations.play('selected');
  },

  barracksClick: function (barracks, ptr) {
    if (this.selectedBarracks == barracks) {
      this.groups.humans.forEach(function (human) {
        if (human.homebase == this.selectedBarracks) {
          human.setPrey(human.homebase);
        }
      }, this);
      this.selectedBarracks.animations.play('unselected');
      this.selectedBarracks = null;
    } else if (this.selectedBarracks) {
      this.groups.humans.forEach(function (human) {
        if (human.homebase == this.selectedBarracks) {
          human.homebase = barracks;
          human.setPrey(human.homebase);
        }
      }, this);
      this.selectedBarracks.animations.play('unselected');
      this.selectedBarracks = null;
    } else {
      this.selectedBarracks = barracks;
      this.selectedBarracks.animations.play('selected');
    }
  },

  updateUI: function () {
    if (this.selectedDino && !this.selectedDino.alive) {
      this.selectedDino = null;
    }
    if (this.selectedHuman && !this.selectedHuman.alive) {
      this.selectedHuman.animations.play('unselected');
      this.selectedHuman = null;
    }
    if (this.selectedDino && this.selectedHuman) {
      this.selectedHuman.setPrey(this.selectedDino);
      this.selectedHuman.animations.play('unselected');
      this.selectedHuman = null;
      this.selectedDino.animations.play('unselected');
      this.selectedDino = null;
    }
    if (this.selectedDino && this.selectedBarracks) {
      this.groups.humans.forEach(function (human) {
        if (human.homebase == this.selectedBarracks) {
          human.setPrey(this.selectedDino);
        }
      }, this);
      this.selectedBarracks.animations.play('unselected');
      this.selectedBarracks = null;
      this.selectedDino.animations.play('unselected');
      this.selectedDino = null;
    }
    if (this.selectedHuman && this.selectedBarracks) {
      this.selectedHuman.homebase = this.selectedBarracks;
      this.selectedHuman.setPrey(this.selectedBarracks);
      this.selectedHuman.animations.play('unselected');
      this.selectedHuman = null;
      this.selectedBarracks.animations.play('unselected');
      this.selectedBarracks = null;
    }
    var infoText = 'Assets neutralised: ' + this.dinosLost;
    infoText += ' | ACUs lost: ' + this.humansLost;
    if (this.selectedDino) {
      infoText += '<br/>Selected: ';
      infoText += this.selectedDino.name;
      infoText += ' (' + this.selectedDino.health + '/' + this.selectedDino.fullHealth + ')';
    } else if (this.selectedHuman) {
      infoText += '<br/>Selected: ';
      infoText += this.selectedHuman.name;
      infoText += ' - ';
      infoText += this.selectedHuman.description;
      infoText += ' (' + this.selectedHuman.health + '/' + this.selectedHuman.fullHealth + ')';
    } else if (this.selectedBarracks) {
      infoText += '<br/>Selected: ';
      infoText += this.selectedBarracks.name;
      infoText += '<br />Available troops: <ul>';
      for (var i = 0; i < this.groups.humans.children.length; i++) {
        var human = this.groups.humans.children[i];
        if (human.homebase == this.selectedBarracks) {
          infoText += '<li>';
          infoText += human.name + ', ' + human.description;
          infoText += ' (' + human.health + '/' + human.fullHealth + ')';
          infoText += '</li>';
        }
      }
      infoText += '</ul>';
    } else {
      infoText += '<br/>Click something to select it. Spacebar to pause.';
    }
    document.getElementById(Jurassic.INFO_UI_ID).innerHTML = infoText;
  }
};
