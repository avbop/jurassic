"use strict";

// The Boot state.

Jurassic.Boot = function (game) {
};

Jurassic.Boot.prototype = {
  init: function () {
    this.input.maxPointers = 1;
    this.stage.disableVisibilityChange = true; // Don't pause when out of focus (while preloading).
  },

  preload: function () {
    this.load.image('preloaderBar', 'assets/orangebar.png');
    this.load.image('preloaderBackground', 'assets/greenbar.png');
  },

  create: function () {
    this.state.start('Preloader');
  }
};


// The Preloader state.

Jurassic.Preloader = function (game) {
  this.preloadBar = null;
  this.ready = false;
};

Jurassic.Preloader.prototype = {
  preload: function () {
    // Set up the orange and green blocks to serve as the loading bar.
    var x = (this.game.width - 400) / 2;
    var y = (this.game.height - 16) / 2;
    var background = this.add.sprite(x, y, 'preloaderBackground');
    background.scale.setTo(1, 0.25);
    this.preloadBar = this.add.sprite(x, y, 'preloaderBar');
    // setPreloadSprite seems to crop it in half again, hence 0.5 vs 0.25.
    this.preloadBar.scale.setTo(1, 0.5);
    this.load.setPreloadSprite(this.preloadBar);

    this.load.spritesheet('fence', 'assets/fence.png', 8, 8);
    this.load.image('bg', 'assets/bg.png');
    this.load.spritesheet('buttons', 'assets/buttons.png', 24, 24);
    this.load.spritesheet('gate', 'assets/gate.png', 8, 30);
    this.load.spritesheet('gate-horiz', 'assets/gate-horiz.png', 30, 8);
    this.load.spritesheet('human', 'assets/squares.png', 8, 8);
    this.load.spritesheet('dino', 'assets/circles.png', 10, 10);
    this.load.spritesheet('building', 'assets/building.png', 50, 50);
  },

  create: function () {
    // Wait for the music to decode.
    this.preloadBar.cropEnabled = false;
    if (this.ready) this.state.start('Game');
  },

  update: function () {
    // From the template: wait until the music is decoded so it starts playing
    // right when the game starts.
    /*if (this.cache.isSoundDecoded('bgmusic') && this.ready == false) {
      this.ready = true;
      this.state.start('Game');
    }*/
    this.state.start('Game');
  }
};

// Initialise the game in the game div. Call this last so it loads the states first.
(function () {
  if (localStorage.getItem(Jurassic.INSTR_LS_KEY) === Jurassic.INSTR_VER) {
    document.getElementById('instructions').style.display = 'none';
  }
  var game = new Phaser.Game(Jurassic.WORLD_WIDTH, Jurassic.WORLD_HEIGHT, Phaser.AUTO, 'game');

  game.state.add('Boot', Jurassic.Boot);
  game.state.add('Preloader', Jurassic.Preloader);
  game.state.add('Game', Jurassic.Game);

  game.state.start('Boot');
})();

// The opening instructions screen.
function closeInstructions() {
  localStorage.setItem(Jurassic.INSTR_LS_KEY, Jurassic.INSTR_VER);
  document.getElementById('instructions').style.display = 'none';
}
