"use strict";

Jurassic.randomInt = function (min, max) {
  // https://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

Jurassic.directionTo = function (start, finish) {
  var x0 = start.x - start.offsetX + start.width / 2;
  var y0 = start.y - start.offsetY + start.height / 2;
  var x1 = finish.x - finish.offsetX + finish.width / 2;
  var y1 = finish.y - finish.offsetY + finish.height / 2;
  var ret = 0;
  if (x0 >= 0 && y0 >= 0 && x1 >= 0 && y1 >= 0) {
    var dy = y1 - y0;
    var dx = x1 - x0;
    var dtheta = Math.atan(dy/dx);
    if (dy >= 0 && dx > 0) {
      ret = dtheta;
    } else if (dy >= 0 && dx < 0) {
      ret = Math.PI + dtheta;
    } else if (dy < 0 && dx < 0) {
      ret = Math.PI + dtheta;
    } else if (dy < 0 && dx > 0) {
      ret = dtheta;
    }
  }
  // Normalise to -2π <= ret < 2π.
  return ret % (2 * Math.PI);
};

Jurassic.Character = function (game, name, x, y, velocity, health, attack, attackPercent, defendPercent, assetkey) {
  Phaser.Sprite.call(this, game, x, y, assetkey);
  this.anchor.set(0.5, 0.5);
  game.physics.arcade.enable(this);
  this.body.collideWorldBounds = true;
  this.body.gravity.y = 0;
  this.maxVelocity = velocity;
  //this.maxTurn = 5 * Math.PI / 180;
  this.velocity = 0;
  this.direction = 0;
  this.target = null;
  this.prey = null;
  this.targetable = true; // Can be a target of another Character.
  this.id = Jurassic.Character.idcounter++;
  this.name = name; // User-displayable name.
  // Battle characteristics.
  this.fullHealth = health; // Starting hit points.
  this.health = health; // Hit points.
  this.attackStrength = attack; // Damage per attack.
  this.attackPercent = attackPercent; // Percentage of attacks that land.
  this.defendPercent = defendPercent; // Percentage of enemies' attacks that land.
  this.maxAttackPercent = 0.95; // Maximum attack efficacy.
  this.maxDefendPercent = 0.95; // Maximum defence efficacy.
};
Jurassic.Character.prototype = Object.create(Phaser.Sprite.prototype);
Jurassic.Character.prototype.constructor = Jurassic.Character;
Jurassic.Character.idcounter = 0;
Jurassic.Character.prototype.update = function () {
  this.move();
};
Jurassic.Character.prototype.defaultMove = function () {
  this.velocity = 0;
};
Jurassic.Character.prototype.move = function () {
  if (this.target && !this.target.targetable) {
    this.target = null;
  }
  if (this.prey && !this.prey.targetable) {
    this.prey = null;
  }
  if (this.target) {
    /*var theta0 = Jurassic.directionTo(this, this.target);
    var theta = theta0;
    // Normalise to -2π <= ret < 2π.
    this.direction %= (2 * Math.PI);
    // Calculate the "nearest" theta.
    for (var i = -1; i <= 1; i++) {
      var theta1 = theta0 + i * 2 * Math.PI;
      if (Math.abs(theta1 - this.direction) < Math.abs(theta - this.direction)) {
        theta = theta1;
      }
    }
    if (this.direction - theta > this.maxTurn) {
      this.direction -= this.maxTurn;
    } else if (theta - this.direction > this.maxTurn) {
      this.direction += this.maxTurn;
    } else {
      this.direction = theta;
    }*/
    this.direction = Jurassic.directionTo(this, this.target);
    this.velocity = this.maxVelocity;
  } else if (this.alive) {
    this.defaultMove();
  } else {
    this.velocity = 0;
  }
  this.body.velocity.x = this.velocity * Math.cos(this.direction);
  this.body.velocity.y = this.velocity * Math.sin(this.direction);
};
Jurassic.Character.prototype.setTarget = function (target) {
  this.target = target;
};
Jurassic.Character.prototype.setPrey = function (prey) {
  this.prey = prey;
  this.setTarget(prey);
};
Jurassic.Character.prototype.atTarget = function (target) {
  if (this.target == target) {
    if (this.prey) {
      this.setPrey(this.prey);
    } else {
      this.setTarget(null);
    }
  }
};
Jurassic.Character.prototype.damage = function (amount) {
  this.health -= amount;
  if (this.health <= 0) {
    this.targetable = false;
    this.kill();
  }
};
Jurassic.Character.prototype.attackSuccess = function () {
  if (this.attackPercent < this.maxAttackPercent) {
    this.attackPercent += 0.1 * (1 - this.attackPercent);
  } else {
    this.attackPercent = this.maxAttackPercent;
  }
};
Jurassic.Character.prototype.defendSuccess = function () {
  if (this.defendPercent < this.maxDefendPercent) {
    this.defendPercent += 0.1 * (1 - this.defendPercent);
  } else {
    this.defendPercent = this.maxDefendPercent;
  }
};
Jurassic.Character.prototype.fight = function (enemy) {
  if (!this.aerial && enemy.aerial) {
    return false;
  }
  if (Math.random() < this.attackPercent && Math.random() > enemy.defendPercent) {
    // Successful attack.
    enemy.damage(this.attackStrength);
    this.attackSuccess();
    return true;
  } else {
    enemy.defendSuccess();
    return false;
  }
};

Jurassic.Dinosaur = function (game, x, y, colour, health) {
  // context, game, name, x, y, velocity, health, attack strength, attack %, defend %, asset key
  Jurassic.Character.call(this, game, '*-saurus', x, y, 150, health, 5, 0.3, 0.3, 'dino');
  this.prize = 1000;
  this.aerial = false;
  this.maxDefendPercent = 0.8;
  this.maxAttackPercent = 0.8;
  this.animations.add('unselected', [colour], 2, false);
  this.animations.add('selected', [Jurassic.DINO_COLOUR.RED, colour], 2, true);
  this.animations.play('unselected');
}
Jurassic.Dinosaur.prototype = Object.create(Jurassic.Character.prototype);
Jurassic.Dinosaur.prototype.constructor = Jurassic.Dinosaur;
Jurassic.Dinosaur.prototype.defaultMove = function () {
  var rand = Math.random();
  if (rand < .1) {
    this.direction += Math.PI / 10;
  } else if (rand < .2) {
    this.direction -= Math.PI / 10;
  }
  this.velocity = this.maxVelocity;
};

Jurassic.Human = function (game, x, y, homebase, colour, health) {
  name = Jurassic.HUMAN_NAMES[Jurassic.randomInt(0, Jurassic.HUMAN_NAMES.length - 1)];
  // context, game, name, x, y, velocity, health, attack strength, attack %, defend %, asset key
  Jurassic.Character.call(this, game, name, x, y, 100, health, 50, 0.3, 0.3, 'human');
  this.homebase = homebase;
  this.description = 'A rational animal.'
  this.price = 1000;
  this.colour = colour;
  this.aerial = false;
  this.animations.add('unselected', [colour], 2, false);
  this.animations.add('selected', [Jurassic.HUMAN_COLOUR.RED, colour], 2, true);
  this.animations.play('unselected');
}
Jurassic.Human.prototype = Object.create(Jurassic.Character.prototype);
Jurassic.Human.prototype.constructor = Jurassic.Human;
Jurassic.Human.prototype.defaultMove = function () {
  if (this.homebase && this.homebase.position.distance(this.position) > 20) {
    this.setPrey(this.homebase);
  } else {
    this.velocity = 0;
  }
};

Jurassic.Building = function (game, x, y, name) {
  Phaser.Sprite.call(this, game, x, y, 'building');
  game.physics.arcade.enable(this);
  this.body.immovable = true;
  this.targetable = true;
  this.anchor.setTo(0.5, 0.5);
  this.name = name;
  this.animations.add('unselected', [1], 2, false);
  this.animations.add('selected', [0, 1], 2, true);
  this.animations.play('unselected');
};
Jurassic.Building.prototype = Object.create(Phaser.Sprite.prototype);
Jurassic.Building.prototype.constructor = Jurassic.Building;

Jurassic.Gate = function (game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'gate');
  this.anchor.setTo(0.5, 0);
  game.physics.arcade.enable(this);
  this.body.immovable = true;
  this.targetable = true;
  this.health = Jurassic.WALL_HEALTH;
  var openAnim = this.animations.add('open', [5, 6], 2, true);
  var openingAnim = this.animations.add('opening', [0, 2, 3, 4], 10, false);
  openingAnim.onComplete.add(function () {
    this.isOpen = true;
    this.animations.play('open');
    this.game.time.events.add(Jurassic.GATE_DELAY, this.close, this);
  }, this);
  var closedAnim = this.animations.add('closed', [0], 2, false);
  var closingAnim = this.animations.add('closing', [5, 9, 8, 7], 10, false);
  closingAnim.onComplete.add(function () {
    this.isOpen = false;
    this.animations.play('closed');
  }, this);
  this.isOpen = true;
  this.close();
};
Jurassic.Gate.prototype = Object.create(Phaser.Sprite.prototype);
Jurassic.Gate.prototype.constructor = Jurassic.Gate;
Jurassic.Gate.prototype.close = function () {
  this.animations.play('closing');
};
Jurassic.Gate.prototype.open = function () {
  this.animations.play('opening');
};

Jurassic.Fence = function (game, x, y, height, gate) {
  Phaser.TileSprite.call(this, game, x, y, 8, height, 'fence');
  game.physics.arcade.enable(this);
  this.body.immovable = true;
  this.anchor.setTo(0.5, 0);
  this.gate = gate;
  this.health = Jurassic.WALL_HEALTH;
};
Jurassic.Fence.prototype = Object.create(Phaser.TileSprite.prototype);
Jurassic.Fence.prototype.constructor = Jurassic.Fence;

Jurassic.Button = function (game, type, quantity) {
  Phaser.Sprite.call(this, game, Jurassic.STORE_X, Jurassic.Button.nextY, 'human');
  this.scale.setTo(3, 3);
  this.anchor.setTo(0.5, 0.5);
  this.type = type;
  var h = type(game, 0, 0, null);
  this.frame = h.colour;
  this.price = h.price * quantity;
  this.quantity = quantity;
  this.description = h.description;
  if (quantity > 1) {
    this.description += ' (x' + quantity + ')';
  }
  Jurassic.Button.nextY += 30;
  this.caption = null;
}
Jurassic.Button.nextY = 50;
Jurassic.Button.prototype = Object.create(Phaser.Sprite.prototype);
Jurassic.Button.prototype.constructor = Jurassic.Button;
