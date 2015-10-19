"use strict";

/* ACU (Humans) */

/*Jurassic.Tourist = function (game, x, y) {
  var h = new Jurassic.Human(game, x, y, null, Jurassic.HUMAN_COLOUR.AQUA, 50);
  h.name = Jurassic.HUMAN_NAMES[Jurassic.randomInt(0, Jurassic.HUMAN_NAMES.length - 1)];
  h.description = 'A tourist.';
  h.attackStrength = 0;
  h.maxAttackPercent = 0;
  h.maxVelocity = 30;
  h.defaultMove = function () {
    var rand = Math.random();
    if (rand < .1) {
      this.direction += Math.PI / 10;
    } else if (rand < .2) {
      this.direction -= Math.PI / 10;
    }
    this.velocity = this.maxVelocity;
  };
  return h;
}*/

Jurassic.Dog = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, Jurassic.HUMAN_COLOUR.GREEN, 50);
  h.name = Jurassic.DOG_NAMES[Jurassic.randomInt(0, Jurassic.DOG_NAMES.length - 1)];
  h.description = 'A guard dog.';
  h.attackStrength = 10;
  h.maxVelocity = 150;
  h.price = 100;
  return h;
}

Jurassic.Grunt = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, Jurassic.HUMAN_COLOUR.TEAL, 100);
  h.description = 'A soldier.';
  h.attackStrength = 50;
  h.maxVelocity = 100;
  h.price = 700;
  return h;
}

Jurassic.Armour = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, Jurassic.HUMAN_COLOUR.LIME, 150);
  h.description = 'An armoured soldier.';
  h.attackStrength = 50;
  h.defendPercent = 0.95;
  h.maxVelocity = 90;
  h.price = 1000;
  return h;
}

Jurassic.Tank = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, Jurassic.HUMAN_COLOUR.PURPLE, 1000);
  h.name = 'M1 Abrams';
  h.description = 'A tank.';
  h.attackStrength = 200;
  h.defendPercent = 0.8;
  h.maxVelocity = 150;
  h.price = 15000;
  return h;
}

Jurassic.Helicopter = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, Jurassic.HUMAN_COLOUR.BLUE, 2000);
  h.name = 'AH-64 Apache';
  h.description = 'A helicopter.';
  h.attackStrength = 200;
  h.maxAttackPercent = 0.8;
  h.maxVelocity = 230;
  h.aerial = true;
  h.price = 25000;
  return h;
}

/* Dinosaurs */

Jurassic.BabyStegosaurus = function (game, x, y) {
  var d = new Jurassic.Dinosaur(game, x, y, Jurassic.DINO_COLOUR.PINK, 200);
  d.prize = 1000;
  d.name = 'Baby Stegosaurus';
  d.attackStrength = 30;
  d.maxVelocity = 50;
  return d;
}

Jurassic.Stegosaurus = function (game, x, y) {
  var d = new Jurassic.Dinosaur(game, x, y, Jurassic.DINO_COLOUR.MAROON, 500);
  d.prize = 2000;
  d.name = 'Stegosaurus';
  d.attackStrength = 50;
  d.maxVelocity = 100;
  return d;
}

Jurassic.Brachiosaurus = function (game, x, y) {
  var d = new Jurassic.Dinosaur(game, x, y, Jurassic.DINO_COLOUR.SAND, 3000);
  d.prize = 3000;
  d.name = 'Brachiosaurus';
  d.attackStrength = 50;
  d.maxVelocity = 30;
  return d;
}

Jurassic.Tyrranosaurus = function (game, x, y) {
  var d = new Jurassic.Dinosaur(game, x, y, Jurassic.DINO_COLOUR.BURNT, 10000);
  d.prize = 5000;
  d.name = 'Tyrranosaurus Rex';
  d.attackStrength = 100;
  d.maxVelocity = 150;
  return d;
}

Jurassic.Pterodactyl = function (game, x, y, targets) {
  var d = new Jurassic.Dinosaur(game, x, y, Jurassic.DINO_COLOUR.YELLOW, 2000);
  d.prize = 3000;
  d.name = 'Pterodactyl';
  d.attackStrength = 100;
  d.maxVelocity = 230;
  d.aerial = true;
  d.targets = targets;
  d.defaultMove = function () {
    if (Math.random() < 0.01){
      this.targets.forEachAlive(function (t) {
        if (!this.prey) {
          this.setPrey(t);
        } else if (this.prey.aerial && !t.aerial) {
          this.setPrey(t);
        }
      }, this);
    }
    Jurassic.Dinosaur.prototype.defaultMove.call(this);
  };
  return d;
}

Jurassic.Raptor = function (game, x, y, targets) {
  var d = new Jurassic.Dinosaur(game, x, y, Jurassic.DINO_COLOUR.ORANGE, 2000);
  d.prize = 3000;
  d.name = 'Velociraptor';
  d.attackStrength = 100;
  d.maxVelocity = 200;
  d.targets = targets;
  d.defaultMove = function () {
    if (Math.random() < 0.01){
      this.targets.forEachAlive(function (t) {
        if (!this.prey && !t.aerial) {
          this.setPrey(t);
        }
      }, this);
    }
    Jurassic.Dinosaur.prototype.defaultMove.call(this);
  };
  d.move = function () {
    if (!(this.prey && this.prey.name == this.name && this.prey.position.distance(this.position) < 50)) {
      Jurassic.Dinosaur.prototype.move.call(this);
    } else if (this.prey && this.prey.name == this.name) {
      this.velocity = 0;
    }
  };
  return d;
}

Jurassic.Mutant = function (game, x, y, health) {
  var d = new Jurassic.Dinosaur(game, x, y, Jurassic.DINO_COLOUR.WHITE, health);
  d.prize = 5000;
  d.name = 'Genetic Engineering Model X-' + d.id;
  d.maxVelocity = 350;
  return d;
}
