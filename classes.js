"use strict";

// Namespace for the game.
var Jurassic = {
  // Configuration constants.
  WORLD_WIDTH: 800,
  WORLD_HEIGHT: 500,
};

Jurassic.directionTo = function (start, finish) {
  var ret = 0;
  if (start.x > 0 && start.y > 0 && finish.x > 0 && finish.y > 0) {
    var dy = finish.y - start.y;
    var dx = finish.x - start.x;
    var dtheta = Math.atan(dy/dx);
    if (dy > 0 && dx > 0) {
      ret = dtheta;
    } else if (dy > 0 && dx < 0) {
      ret = Math.PI + dtheta;
    } else if (dy < 0 && dx < 0) {
      ret = Math.PI + dtheta;
    } else if (dy < 0 && dx > 0) {
      ret = dtheta;
    }
  }
  return ret;
};

Jurassic.Character = function (game, x, y, velocity, assetkey) {
  Phaser.Sprite.call(this, game, x, y, assetkey);
  game.physics.arcade.enable(this);
  this.body.collideWorldBounds = true;
  this.max_velocity = velocity;
  this.velocity = 0;
  this.direction = 0;
  this.target = null;
  this.id = Jurassic.Character.idcounter++;
};
Jurassic.Character.prototype = Object.create(Phaser.Sprite.prototype);
Jurassic.Character.prototype.constructor = Jurassic.Character;
Jurassic.Character.idcounter = 0;
Jurassic.Character.prototype.update = function () {
  this.move();
};
Jurassic.Character.prototype.move = function () {
  if (this.target) {
    this.direction = Jurassic.directionTo(this, this.target);
    this.velocity = this.max_velocity;
  } else {
    this.defaultMove();
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

Jurassic.Dinosaur = function (game, x, y, velocity, colour) {
  Jurassic.Character.call(this, game, x, y, velocity, colour + 'dino');
  this.scale.setTo(10/255, 10/255);
  /*this.body.setCircle(5);
  this.body.collideWorldBounds = true;*/
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

Jurassic.Human = function (game, x, y, velocity, colour) {
  Jurassic.Character.call(this, game, x, y, velocity, colour + 'human');
  this.scale.setTo(10/605, 10/605);
}
Jurassic.Human.prototype = Object.create(Jurassic.Character.prototype);
Jurassic.Human.prototype.constructor = Jurassic.Human;
