"use strict";

// Namespace for the game.
var Jurassic = {
  // Configuration constants.
  WORLD_WIDTH: 800,
  WORLD_HEIGHT: 500
};

Jurassic.directionTo = function (start, finish) {
  var ret = 0;
  if (start.x > 0 && start.y > 0 && finish.x > 0 && finish.y > 0) {
    var dy = finish.y - start.y;
    var dx = finish.x - start.x;
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
  return ret;
};

Jurassic.Character = function (game, name, x, y, velocity, health, attack, attackPercent, defendPercent, assetkey) {
  Phaser.Sprite.call(this, game, x, y, assetkey);
  game.physics.arcade.enable(this);
  this.body.collideWorldBounds = true;
  this.max_velocity = velocity;
  this.velocity = 0;
  this.direction = 0;
  this.target = null;
  this.targetable = true; // Can be a target of another Character.
  this.id = Jurassic.Character.idcounter++;
  this.name = name; // User-displayable name.
  // Battle characteristics.
  this.health = health; // Hit points.
  this.attack = attack; // Damage per attack.
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
Jurassic.Character.prototype.move = function () {
  if (this.target && !this.target.targetable) {
    this.target = null;
  }
  if (this.target) {
    this.direction = Jurassic.directionTo(this, this.target);
    this.velocity = this.max_velocity;
  } else if (this.alive && !this.stunned) {
    this.defaultMove();
  } else {
    this.velocity = 0;
  }
  this.body.velocity.x = this.velocity * Math.cos(this.direction);
  this.body.velocity.y = this.velocity * Math.sin(this.direction);
};
Jurassic.Character.prototype.defaultMove = function () {
  this.velocity = 0;
};
Jurassic.Character.prototype.setTarget = function (target) {
  this.target = target;
};
Jurassic.Character.prototype.damage = function (amount) {
  this.health -= amount;
  if (this.health <= 0) {
    this.targetable = false;
    this.kill();
  }
};
Jurassic.Character.prototype.increaseAttackPercent = function () {
  this.attackPercent += 0.01 * (1 - this.attackPercent);
};
Jurassic.Character.prototype.increaseDefendPercent = function () {
  this.defendPercent += 0.01 * (1 - this.defendPercent);
};
Jurassic.Character.prototype.fight = function (enemy) {
  if (Math.random() < this.attackPercent && Math.random() > enemy.defendPercent) {
    // Successful attack.
    enemy.damage(this.attack);
    this.increaseAttackPercent();
    return true;
  } else {
    enemy.increaseDefendPercent();
    return false;
  }
};
Jurassic.Character.prototype.stun = function () {
  this.stunned = true;
  this.targetable = false;
};

Jurassic.Dinosaur = function (game, x, y, colour) {
  // context, game, name, x, y, velocity, health, attack, attack %, defend %, asset key
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
    this.direction += Math.PI / 4;
  } else if (rand < .2) {
    this.direction -= Math.PI / 4;
  }
  this.velocity = this.max_velocity;
};

Jurassic.Human = function (game, x, y, colour) {
  // context, game, name, x, y, velocity, health, attack, attack %, defend %, asset key
  Jurassic.Character.call(this, game, 'Socrates', x, y, 50, 10, 10, 0.3, 0.1, colour + 'human');
  this.scale.setTo(5/605, 5/605);
  this.stunStrength = 70;
  this.stunEnabled = true;
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
      enemy.damage(this.attack);
    }
    this.increaseAttackPercent();
    return true;
  } else {
    enemy.increaseDefendPercent();
    return false;
  }
};
