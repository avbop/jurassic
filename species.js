/* ACU (Humans) */

Jurassic.Dog = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, Jurassic.HUMAN_COLOUR.GREEN, 50);
  h.name = 'Rover';
  h.description = 'A guard dog.';
  h.attackStrength = 10;
  h.maxVelocity = 100;
  h.price = 100;
  return h;
}

Jurassic.Grunt = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, Jurassic.HUMAN_COLOUR.TEAL, 100);
  h.name = 'Joe';
  h.description = 'A dutiful soldier.';
  h.attackStrength = 50;
  h.maxVelocity = 70;
  h.price = 500;
  return h;
}

Jurassic.Armour = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, Jurassic.HUMAN_COLOUR.LIME, 50);
  h.name = 'John';
  h.description = 'An armoured soldier.';
  h.attackStrength = 30;
  h.defendPercent = 0.7;
  h.maxVelocity = 50;
  h.price = 700;
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
  var d = new Jurassic.Dinosaur(game, x, y, Jurassic.DINO_COLOUR.MAROON, 200);
  d.prize = 5000;
  d.name = 'Stegosaurus';
  d.attackStrength = 50;
  d.maxVelocity = 100;
  return d;
}
