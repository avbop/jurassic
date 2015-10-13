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

    this.load.image('reddino', 'assets/redcircle.png');
    this.load.image('greendino', 'assets/greencircle.png');
    this.load.image('redhuman', 'assets/redsquare.png');
    this.load.image('greenhuman', 'assets/greensquare.png');
    this.load.image('building', 'assets/redsquare.png');
    this.load.image('fence', 'assets/fence.png');
    this.load.image('bg', 'assets/bg.png');
    this.load.spritesheet('gate', 'assets/gate.png', 10, 30);
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
  var game = new Phaser.Game(Jurassic.WORLD_WIDTH, Jurassic.WORLD_HEIGHT, Phaser.AUTO, 'game');

  game.state.add('Boot', Jurassic.Boot);
  game.state.add('Preloader', Jurassic.Preloader);
  game.state.add('Game', Jurassic.Game);

  game.state.start('Boot');
})();
