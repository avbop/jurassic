"use strict";

/* ACU (Humans) */

Jurassic.Dog = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, Jurassic.HUMAN_COLOUR.GREEN, 50);
  h.name = Jurassic.DOG_NAMES[Jurassic.randomInt(0, Jurassic.DOG_NAMES.length - 1)];
  h.description = 'A guard dog.';
  h.attackStrength = 10;
  h.maxVelocity = 100;
  h.price = 200;
  return h;
}

Jurassic.Grunt = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, Jurassic.HUMAN_COLOUR.TEAL, 100);
  h.description = 'A soldier.';
  h.attackStrength = 50;
  h.maxVelocity = 70;
  h.price = 1000;
  return h;
}

Jurassic.Armour = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, Jurassic.HUMAN_COLOUR.LIME, 70);
  h.description = 'An armoured soldier.';
  h.attackStrength = 40;
  h.defendPercent = 0.85;
  h.maxVelocity = 50;
  h.price = 1400;
  return h;
}

Jurassic.Tank = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, Jurassic.HUMAN_COLOUR.PURPLE, 500);
  h.name = 'M1 Abrams';
  h.description = 'A tank.';
  h.attackStrength = 200;
  h.defendPercent = 0.5;
  h.maxVelocity = 50;
  h.price = 50000;
  return h;
}

/* Dinosaurs */

Jurassic.BabyStegosaurus = function (game, x, y) {
  var d = new Jurassic.Dinosaur(game, x, y, Jurassic.DINO_COLOUR.PINK, 200);
  d.prize = 1000;
  d.name = 'Baby Stegosaurus';
  d.attackStrength = 10;
  d.maxVelocity = 50;
  return d;
}

Jurassic.Stegosaurus = function (game, x, y) {
  var d = new Jurassic.Dinosaur(game, x, y, Jurassic.DINO_COLOUR.MAROON, 500);
  d.prize = 5000;
  d.name = 'Stegosaurus';
  d.attackStrength = 30;
  d.maxVelocity = 100;
  return d;
}

Jurassic.Brachiosaurus = function (game, x, y) {
  var d = new Jurassic.Dinosaur(game, x, y, Jurassic.DINO_COLOUR.SAND, 2000);
  d.prize = 7000;
  d.name = 'Brachiosaurus';
  d.attackStrength = 100;
  d.maxVelocity = 30;
  d.defendPercent = 0.5;
  return d;
}

Jurassic.Tyrranosaurus = function (game, x, y) {
  var d = new Jurassic.Dinosaur(game, x, y, Jurassic.DINO_COLOUR.BURNT, 10000);
  d.prize = 10000;
  d.name = 'Tyrranosaurus Rex';
  d.attackStrength = 200;
  d.maxVelocity = 200;
  d.defendPercent = 0.5;
  d.attackPercent = 0.5;
  return d;
}

Jurassic.Mutant = function (game, x, y, health) {
  var d = new Jurassic.Dinosaur(game, x, y, Jurassic.DINO_COLOUR.WHITE, health);
  d.prize = 10000;
  d.name = 'Genetic Engineering Model X-' + d.id;
  d.maxVelocity = 400;
  return d;
}
