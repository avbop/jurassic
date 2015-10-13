/* ACU (Humans) */

Jurassic.Dog = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, 'green', 50);
  h.name = 'Rover';
  h.description = 'A guard dog.';
  h.attackStrength = 10;
  h.maxVelocity = 100;
  return h;
}

Jurassic.Grunt = function (game, x, y, homebase) {
  var h = new Jurassic.Human(game, x, y, homebase, 'red', 100);
  h.name = 'Joe';
  h.description = 'A dutiful soldier.';
  h.attackStrength = 50;
  h.maxVelocity = 50;
  return h;
}

/* Dinosaurs */

Jurassic.BabyStegosaurus = function (game, x, y) {
  var d = new Jurassic.Dinosaur(game, x, y, 'red', 200);
  d.prize = 1000;
  d.name = 'Baby Stegosaurus';
  d.attackStrength = 10;
  d.maxVelocity = 50;
  return d;
}
