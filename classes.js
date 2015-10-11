"use strict";

// Namespace for the game.
var Jurassic = {
  // Configuration constants.
  WORLD_WIDTH: 900,
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

Jurassic.Dinosaur = function (game, x, y, velocity, colour) {
  Phaser.Sprite.call(this, game, x, y, colour + 'circle');
  this.scale.setTo(10/255, 10/255);
  game.physics.p2.enable(this);
  this.body.setCircle(5);
  this.body.collideWorldBounds = true;
  this.velocity = velocity;
  this.direction = 0;
  this.target = null;
  this.id = Jurassic.Dinosaur.idcounter++;
};
Jurassic.Dinosaur.prototype = Object.create(Phaser.Sprite.prototype);
Jurassic.Dinosaur.prototype.constructor = Jurassic.Dinosaur;
Jurassic.Dinosaur.idcounter = 0;
Jurassic.Dinosaur.prototype.update = function () {
  this.move();
  this.body.velocity.x = this.velocity * Math.cos(this.direction);
  this.body.velocity.y = this.velocity * Math.sin(this.direction);
};
Jurassic.Dinosaur.prototype.move = function () {
  if (this.target) {
    this.direction = Jurassic.directionTo(this, this.target);
  } else {
    var rand = Math.random();
    if (rand < .1) {
      this.direction += Math.PI / 4;
    } else if (rand < .2) {
      this.direction -= Math.PI / 4;
    }
  }
};
Jurassic.Dinosaur.prototype.setTarget = function (target) {
  this.target = target;
};
