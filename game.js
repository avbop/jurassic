"use strict";

// Namespace for the game.
var Jurassic = {
  // Configuration constants.
  WORLD_WIDTH: 800,
  WORLD_HEIGHT: 400,
  BORDER: 250,
  STORE_X: 15,
  GATE_DELAY: 3 * Phaser.Timer.SECOND,
  INFO_UI_ID: 'info', // HTML ID of div that shows info.
  INSTR_LS_KEY: 'instructions', // localStorage key for instructions box.
  INSTR_VER: '3', // Version of instructions.
  MAX_DINOS: 10, // Maximum number of dinos to have alive at once.
  WALL_HEALTH: 30000, // Health of fences and gates.
  N_TOURISTS: 20, // Number of starting tourists.
  INCOME: 10, // Income per tourist per second.
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
  },
  HUMAN_NAMES: ['Joe', 'John', 'Socrates', 'Robert', 'Steve', 'Owen', 'Malcolm', 'Rick', 'Chris', 'Victor', 'Zachary', 'Henry', 'Alan', 'Ian', 'Tim', 'Ray', 'Dennis'],
  DOG_NAMES: ['Fido', 'Rover', 'Rex'],
  LOSS_MESSAGE: 'The park is closed pending a health and safety investigation.'
};

// The Game state.

Jurassic.Game = function (game) {
  this.groups = {
    dinos: null,
    humans: null,
    tourists: null,
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
  this.pauseButton = null;
  this.clock = null;
};

Jurassic.Game.prototype = {
  create: function () {
    this.stage.disableVisibilityChange = true; // Pause when out of focus.
    this.world.setBounds(0, 0, Jurassic.WORLD_WIDTH, Jurassic.WORLD_HEIGHT);
    this.physics.startSystem(Phaser.Physics.ARCADE);

    var bg = this.add.sprite(0, 0, 'bg');

    this.addButton(Jurassic.Dog, 10);
    this.addButton(Jurassic.Grunt, 5);
    this.addButton(Jurassic.Armour, 5);
    this.addButton(Jurassic.Tank, 1);
    this.addButton(Jurassic.Helicopter, 1);

    this.groups.gates = this.add.group();
    this.groups.fences = this.add.group();
    this.groups.buildings = this.add.group();
    this.groups.tourists = this.add.group();
    this.groups.dinos = this.add.group();
    this.groups.humans = this.add.group();

    var gate0 = new Jurassic.Gate(this.game, Jurassic.BORDER, 50, true);
    this.groups.gates.add(gate0);
    var gate1 = new Jurassic.Gate(this.game, Jurassic.BORDER, 250, true);
    this.groups.gates.add(gate1);
    var gate2 = new Jurassic.Gate(this.game, Jurassic.BORDER, 350, true);
    this.groups.gates.add(gate2);

    var fence = new Jurassic.Fence(this.game, Jurassic.BORDER, 0, 8, 50, gate0);
    this.groups.fences.add(fence);
    var fence = new Jurassic.Fence(this.game, Jurassic.BORDER, 80, 8, 85, gate0);
    this.groups.fences.add(fence);
    var fence = new Jurassic.Fence(this.game, Jurassic.BORDER, 165, 8, 85, gate1);
    this.groups.fences.add(fence);
    var fence = new Jurassic.Fence(this.game, Jurassic.BORDER, 280, 8, 35, gate1);
    this.groups.fences.add(fence);
    var fence = new Jurassic.Fence(this.game, Jurassic.BORDER, 315, 8, 35, gate2);
    this.groups.fences.add(fence);
    var fence = new Jurassic.Fence(this.game, Jurassic.BORDER, 380, 8, 30, gate2);
    this.groups.fences.add(fence);

    var barracks0 = new Jurassic.Building(this.game, 150, 50, 'Barracks A');
    this.addBarracks(barracks0);
    var barracks1 = new Jurassic.Building(this.game, 150, 200, 'Barracks B');
    this.addBarracks(barracks1);
    this.defaultBarracks = barracks1;
    var barracks2 = new Jurassic.Building(this.game, 150, 350, 'Barracks C');
    this.addBarracks(barracks2);
    var barracks3 = new Jurassic.Building(this.game, this.world.width - 50, this.world.height - 50, 'Barracks X');
    this.addBarracks(barracks3);

    // Starting complement.
    for (var i = 0; i < 5; i++) {
      this.addHuman(Jurassic.Grunt(this.game, 150 + Jurassic.randomInt(-50, 50), 10, barracks0));
      this.addHuman(Jurassic.Dog(this.game, 150 + Jurassic.randomInt(-50, 50), 10, barracks0));
      this.addHuman(Jurassic.Grunt(this.game, 150 + Jurassic.randomInt(-50, 50), 300, barracks2));
      this.addHuman(Jurassic.Dog(this.game, 150 + Jurassic.randomInt(-50, 50), 300, barracks2));
    }

    for (var i = 0; i < Jurassic.N_TOURISTS; i++) {
      var t = Jurassic.Tourist(this.game, Jurassic.randomInt(10, Jurassic.BORDER - 10), Jurassic.randomInt(10, this.world.height - 10));
      t.inputEnabled = true;
      t.events.onInputDown.add(this.humanClick, this);
      this.groups.tourists.add(t);
    }

    // Starting enemy.
    this.addDino(Jurassic.BabyStegosaurus(this.game, Jurassic.randomInt(Jurassic.BORDER + 20, this.world.width), this.world.randomY));

    this.scoreText = this.add.text(70, 10, 'score', { fontSize: '16px', fill: '#fff' });
    this.modScore(0); // Set starting score.
    var t = this.add.text(10, 10, '00:00', { fontSize: '16px', fill: '#fff' });
    this.clock = new Jurassic.Clock(t);
    this.time.events.loop(Phaser.Timer.SECOND, function () {
      this.clock.tick();
      this.modScore(Jurassic.INCOME * this.groups.tourists.countLiving());
    }, this);

    var pauseKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    pauseKey.onDown.add(this.togglePause, this);
    this.pauseButton = this.add.button(this.world.width - 10, 10, 'buttons', this.togglePause, this);
    this.pauseButton.anchor.setTo(1, 0);
    this.pauseButton.animations.add('paused', [0, 1], 2, true);
    this.pauseButton.animations.add('unpaused', [0], 10, false);
    this.pauseButton.animations.play('unpaused');

    this.updateUI();
    /* [FPS]
    this.time.advancedTiming = true;
    this.fpsText = this.add.text(300, 10, 'score', { fontSize: '16px', fill: '#000' });
    this.fpsText.fixedToCamera = true; //*/
  },

  update: function () {
    // [FPS] this.fpsText.setText(this.time.fps || '--');
    if (!this.physics.arcade.isPaused) {
      this.physics.arcade.collide(this.groups.dinos, this.groups.dinos, null, this.isAerial, this);
      this.physics.arcade.collide(this.groups.humans, this.groups.humans, null, this.isAerial, this);

      this.physics.arcade.collide(this.groups.buildings, this.groups.dinos, this.attackWall, this.testWall, this);
      this.physics.arcade.overlap(this.groups.buildings, this.groups.humans, this.inBuilding, null, this);

      this.physics.arcade.collide(this.groups.fences, this.groups.dinos, this.onFence, this.testWall, this);
      this.physics.arcade.collide(this.groups.fences, this.groups.humans, this.onFence, this.testWall, this);

      this.physics.arcade.collide(this.groups.gates, this.groups.dinos, this.onGate, this.testGate, this);
      this.physics.arcade.collide(this.groups.gates, this.groups.humans, this.onGate, this.testGate, this);

      this.physics.arcade.overlap(this.groups.humans, this.groups.dinos, this.fight, null, this);

      this.physics.arcade.overlap(this.groups.tourists, this.groups.dinos, this.fight, null, this);
      this.physics.arcade.collide(this.groups.fences, this.groups.tourists, null, null, this);
      this.physics.arcade.collide(this.groups.buildings, this.groups.tourists, null, null, this);
      this.physics.arcade.collide(this.groups.gates, this.groups.tourists, null, this.testGate, this);

      if (this.groups.dinos.countLiving() < Jurassic.MAX_DINOS && Math.random() < 0.004) {
        var x = Jurassic.randomInt(Jurassic.BORDER + 20, this.world.width - 100);
        var y = Jurassic.randomInt(Jurassic.BORDER + 20, this.world.height - 100);
        var rand = Math.random();
        if (this.dinosLost < 4) {
          this.addDino(Jurassic.BabyStegosaurus(this.game, x, y));
        } else if (this.dinosLost < 6) {
          if (rand < 0.3) {
            this.addDino(Jurassic.BabyStegosaurus(this.game, x, y));
          } else {
            this.addDino(Jurassic.Stegosaurus(this.game, x, y));
          }
        } else if (this.dinosLost < 10) {
          if (rand < 0.1) {
            this.addDino(Jurassic.Stegosaurus(this.game, x, y));
          } else if (rand < 0.5) {
            this.addDino(Jurassic.Brachiosaurus(this.game, x, y));
          } else {
            this.addDino(Jurassic.Tyrranosaurus(this.game, x, y));
          }
        } else if (this.dinosLost < 15) {
          if (rand < 0.1) {
            this.addDino(Jurassic.Brachiosaurus(this.game, x, y));
          } else if (rand < 0.5) {
            this.addDino(Jurassic.Tyrranosaurus(this.game, x, y));
          } else {
            var r0 = Jurassic.Raptor(this.game, x, y, this.groups.tourists);
            var r1 = Jurassic.Raptor(this.game, x, y, this.groups.tourists);
            r1.setPrey(r0);
            this.addDino(r0);
            this.addDino(r1);
          }
        } else if (this.dinosLost < 30) {
          if (rand < 0.1) {
            this.addDino(Jurassic.Brachiosaurus(this.game, x, y));
          } else if (rand < 0.4) {
            var r0 = Jurassic.Raptor(this.game, x, y, this.groups.humans);
            var r1 = Jurassic.Raptor(this.game, x + 10, y + 10, this.groups.tourists);
            r1.setPrey(r0);
            this.addDino(r0);
            this.addDino(r1);
          } else if (rand < 0.8) {
            this.addDino(Jurassic.Pterodactyl(this.game, x, y, this.groups.tourists));
          } else {
            this.addDino(Jurassic.Tyrranosaurus(this.game, x, y));
          }
        } else {
          if (rand < 0.1) {
            var r0 = Jurassic.Raptor(this.game, x, y, this.groups.humans);
            var r1 = Jurassic.Raptor(this.game, x + 10, y + 10, this.groups.tourists);
            r1.setPrey(r0);
            this.addDino(r0);
            this.addDino(r1);
          } else if (rand < 0.6) {
            this.addDino(Jurassic.Pterodactyl(this.game, x, y, this.groups.tourists));
          } else if (rand < 0.7) {
            this.addDino(Jurassic.Tyrranosaurus(this.game, x, y));
          } else {
            var irex = Jurassic.Mutant(this.game, x, y, this.dinosLost * 100);
            irex.attackStrength = this.dinosLost * 10;
            irex.setPrey(this.groups.humans.children[Jurassic.randomInt(0, this.groups.tourists.children.length - 1)]);
            this.addDino(irex);
          }
        }
      }
      this.groups.dinos.forEachDead(function (dino) {
        this.dinosLost++;
        dino.destroy();
      }, this);
      this.groups.humans.forEachDead(function (human) {
        this.humansLost++;
        human.destroy();
      }, this);
      this.groups.tourists.forEachDead(function (tourist) {
        tourist.destroy();
      }, this);
    }
    if (this.groups.tourists.countLiving() < 1) {
      this.modScore(-this.score * 10 - 100);
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

  addButton: function (type, quantity) {
    var button = new Jurassic.Button(this.game, type, quantity);
    button.inputEnabled = true;
    button.events.onInputOver.add(function (button, ptr) {
      if (this.score >= button.price) {
        button.caption = this.add.text(button.x, button.y, button.description, { fontSize: '12px', fill: '#fff' });
        button.caption.anchor.setTo(0, 0.5);
        this.add.existing(button.caption);
      } else {
        button.caption = this.add.text(button.x, button.y, '$' + button.price, { fontSize: '12px', fill: '#fff' });
        button.caption.anchor.setTo(0, 0.5);
        this.add.existing(button.caption);
      }
    }, this);
    button.events.onInputOut.add(function (button, ptr) {
      if (button.caption) {
        button.caption.destroy();
      }
    }, this);
    button.events.onInputDown.add(function (button, ptr) {
      if (button.caption) {
        button.caption.destroy();
      }
      if (button.price <= this.score) {
        this.modScore(-button.price);
        for (var i = 0; i < button.quantity; i++) {
          this.addHuman(button.type(this.game, this.defaultBarracks.x + Jurassic.randomInt(-20, 20), this.defaultBarracks.y + Jurassic.randomInt(-20, 20), this.defaultBarracks));
        }
      }
    }, this);
    this.add.existing(button);
  },

  fight: function (human, dino) {
    dino.fight(human);
    human.fight(dino);
  },

  modScore: function (delta) {
    // Do all score changes here.
    if (this.score > -1) {
      this.score += delta;
      this.scoreText.setText('$' + Math.floor(this.score));
    }
    else {
      this.score = -10;
      this.scoreText.setText(Jurassic.LOSS_MESSAGE);
    }
  },

  onGate: function (gate, character) {
    character.atTarget(gate);
    if (this.groups.humans.getIndex(character) > -1) {
      gate.open();
    }
    if (this.groups.dinos.getIndex(character) > -1) {
      this.attackWall(gate, character);
    }
  },

  testGate: function (gate, character) {
    character.atTarget(gate);
    if (character.aerial) return false;
    return !gate.isOpen && gate.visible;
  },

  onFence: function (fence, character) {
    if (character.target || character.prey) {
      character.setTarget(fence.gate);
    }
    if (this.groups.dinos.getIndex(character) > -1) {
      this.attackWall(fence, character);
    }
  },

  testWall: function (fence, character) {
    if (character.aerial) return false;
    return fence.visible;
  },

  attackWall: function (wall, dino) {
    if (dino.aerial) return;
    if (Math.random() < dino.attackPercent) {
      wall.health -= dino.attackStrength;
      if (wall.health < Jurassic.WALL_HEALTH / 10) {
        wall.animations.play('attack');
      }
    }
    if (wall.health < 1) {
      wall.visible = false;
    }
  },

  inBuilding: function (building, human) {
    if (human.prey && human.prey == building) {
      human.setPrey(null);
    } else if (human.target && human.target == building) {
      human.setTarget(null);
    }
  },

  isAerial: function (x, y) {
    return !(x.aerial || y.aerial);
  },

  humanClick: function (human, ptr) {
    if (this.selectedHuman == human) {
      this.selectedHuman.animations.play('unselected');
      this.selectedHuman = null;
    } else {
      if (this.selectedHuman) {
        this.selectedHuman.animations.play('unselected');
      }
      this.selectedHuman = human;
      this.selectedHuman.animations.play('selected');
    }
  },

  dinoClick: function (dino, ptr) {
    if (this.selectedDino == dino) {
      this.selectedDino.animations.play('unselected');
      this.selectedDino = null;
    } else {
      if (this.selectedDino) {
        this.selectedDino.animations.play('unselected');
      }
      this.selectedDino = dino;
      this.selectedDino.animations.play('selected');
    }
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
      if (this.selectedBarracks) {
        this.selectedBarracks.animations.play('unselected');
      }
      this.selectedBarracks = barracks;
      this.selectedBarracks.animations.play('selected');
    }
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
    infoText += ' | Tourists remaining: ' + this.groups.tourists.countLiving();
    if (this.selectedDino) {
      infoText += '<br/>Selected: ';
      infoText += this.selectedDino.name;
      infoText += ' ('
      infoText += 'health: ' + this.selectedDino.health + '/' + this.selectedDino.fullHealth + ' | ';
      infoText += 'att: ' + Math.round(this.selectedDino.attackPercent * 100) / 10 + ' | ';
      infoText += 'def: ' + Math.round(this.selectedDino.defendPercent * 100) / 10;
      infoText +=  ')'
    } else if (this.selectedHuman) {
      infoText += '<br/>Selected: ';
      infoText += this.selectedHuman.name;
      infoText += ' - ';
      infoText += this.selectedHuman.description;
      infoText += ' ('
      infoText += 'health: ' + this.selectedHuman.health + '/' + this.selectedHuman.fullHealth + ' | ';
      infoText += 'att: ' + Math.round(this.selectedHuman.attackPercent * 100) / 10 + ' | ';
      infoText += 'def: ' + Math.round(this.selectedHuman.defendPercent * 100) / 10;
      infoText +=  ')'
    } else if (this.selectedBarracks) {
      infoText += '<br/>Selected: ';
      infoText += this.selectedBarracks.name;
      /*infoText += '<br />Available troops: <ul>';
      for (var i = 0; i < this.groups.humans.children.length; i++) {
        var human = this.groups.humans.children[i];
        if (human.homebase == this.selectedBarracks) {
          infoText += '<li>';
          infoText += human.name + ', ' + human.description;
          infoText += ' (' + human.health + '/' + human.fullHealth + ')';
          infoText += '</li>';
        }
      }
      infoText += '</ul>';*/
    } else {
      infoText += '<br/>Click something to select it. Spacebar to pause.';
    }
    document.getElementById(Jurassic.INFO_UI_ID).innerHTML = infoText;
  },

  togglePause: function () {
    if (this.physics.arcade.isPaused) {
      this.physics.arcade.isPaused = false;
      this.time.events.resume();
      this.pauseButton.animations.play('unpaused');
    } else {
      this.physics.arcade.isPaused = true;
      this.time.events.pause();
      this.pauseButton.animations.play('paused');
    }
  },

  deselectAll: function () {
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
  }
};
