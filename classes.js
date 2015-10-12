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
  this.maxTurn = 5 * Math.PI / 180;
  this.velocity = 0;
  this.direction = 0;
  this.target = null;
  this.prey = null;
  this.targetable = true; // Can be a target of another Character.
  this.id = Jurassic.Character.idcounter++;
  this.name = name; // User-displayable name.
  // Battle characteristics.
  this.health = health; // Hit points.
  this.attackStrength = attack; // Damage per attack.
  this.attackPercent = attackPercent; // Percentage of attacks that land.
  this.defendPercent = defendPercent; // Percentage of enemies' attacks that land.
  this.stunned = false; // Is not stunned.
  this.stunnable = false; // Can't be stunned.
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
  if (this.target) {
    var theta0 = Jurassic.directionTo(this, this.target);
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
    }
    this.velocity = this.maxVelocity;
  } else if (this.alive && !this.stunned) {
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
Jurassic.Character.prototype.damage = function (amount) {
  this.health -= amount;
  if (this.health <= 0) {
    this.targetable = false;
    this.kill();
  }
};
Jurassic.Character.prototype.attackSuccess = function () {
  this.attackPercent += 0.01 * (1 - this.attackPercent);
};
Jurassic.Character.prototype.defendSuccess = function () {
  this.defendPercent += 0.01 * (1 - this.defendPercent);
};
Jurassic.Character.prototype.fight = function (enemy) {
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
Jurassic.Character.prototype.stun = function () {
  this.stunned = true;
  this.targetable = false;
};

Jurassic.Dinosaur = function (game, x, y, colour) {
  // context, game, name, x, y, velocity, health, attack strength, attack %, defend %, asset key
  Jurassic.Character.call(this, game, '*-saurus', x, y, 100, 100, 5, 0.3, 0.3, colour + 'dino');
  this.scale.setTo(7/255, 7/255);
  this.stunnable = true;
  this.prizeStunned = 1000000;
  this.prizeKilled = 1000;
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

Jurassic.Human = function (game, x, y, homebase, colour) {
  // context, game, name, x, y, velocity, health, attack strength, attack %, defend %, asset key
  Jurassic.Character.call(this, game, 'Socrates', x, y, 50, 10, 10, 0.3, 0.3, colour + 'human');
  this.scale.setTo(5/605, 5/605);
  this.stunStrength = 70;
  this.stunEnabled = true;
  this.homebase = homebase;
}
Jurassic.Human.prototype = Object.create(Jurassic.Character.prototype);
Jurassic.Human.prototype.constructor = Jurassic.Human;
Jurassic.Human.prototype.fight = function (enemy) {
  if (Math.random() < this.attackPercent && Math.random() > enemy.defendPercent) {
    // Successful attack.
    if (this.stunEnabled) {
      if (enemy.stunnable && enemy.health <= this.stunStrength) {
        enemy.stun();
      } else {
        enemy.damage(Math.floor(this.stunStrength/20));
      }
    } else {
      enemy.damage(this.attackStrength);
    }
    this.attackSuccess();
    return true;
  } else {
    enemy.defendSuccess();
    return false;
  }
};
/*Jurassic.Human.prototype.defaultMove = function () {
  this.setPrey(this.homebase);
};*/

Jurassic.Building = function (game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'building');
  game.physics.arcade.enable(this);
  this.body.immovable = true;
  this.targetable = true;
  this.scale.setTo(100/605, 100/605);
  this.anchor.setTo(0.5, 0.5);
};
Jurassic.Building.prototype = Object.create(Phaser.Sprite.prototype);
Jurassic.Building.prototype.constructor = Jurassic.Building;

Jurassic.Gate = function (game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'gate');
  this.anchor.setTo(0.5, 0);
  game.physics.arcade.enable(this);
  this.body.immovable = true;
  this.targetable = true;
  var openAnim = this.animations.add('open', [0], 10, false);
  openAnim.onComplete.add(function () {
    this.isOpen = true;
    this.game.time.events.add(Jurassic.GATE_DELAY, this.close, this);
  }, this);
  var closeAnim = this.animations.add('close', [1], 10, false);
  closeAnim.onComplete.add(function () {
    this.isOpen = false;
  }, this);
  this.isOpen = true;
  this.close();
};
Jurassic.Gate.prototype = Object.create(Phaser.Sprite.prototype);
Jurassic.Gate.prototype.constructor = Jurassic.Gate;
Jurassic.Gate.prototype.close = function () {
  this.animations.play('close');
};
Jurassic.Gate.prototype.open = function () {
  this.animations.play('open');
};

Jurassic.Fence = function (game, x, y, height, gate) {
  Phaser.TileSprite.call(this, game, x, y, 10, height, 'fence');
  game.physics.arcade.enable(this);
  this.body.immovable = true;
  this.anchor.setTo(0.5, 0);
  this.gate = gate;
};
Jurassic.Fence.prototype = Object.create(Phaser.TileSprite.prototype);
Jurassic.Fence.prototype.constructor = Jurassic.Fence;
