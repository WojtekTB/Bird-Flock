var shipNames = [
  "Argonaute",
  "Atropos",
  "Bellipotent",
  "Caligula",
  "Clam",
  "Clorinda",
  "Crab",
  "Harvey",
  "Flame",
  "Friday",
  "Harpy",
  "Hotspur",
  "Justinian",
  "Lotus",
  "Lydia",
  "Nightingale",
  "Nonsuch",
  "Phoebe",
  "Pinafore",
  "Polychrest",
  "Porta",
  "Pucelle",
  "Pluto",
  "Renown",
  "Roebuck",
  "Sophie",
  "Surprise",
  "Sutherland",
  "Themis",
  "Venus",
  "Witch",
  "Avenger",
  "Defiant",
  "Bounty",
  "Venus",
  "Indefatigable",
  "Surprise",
  "Dauntless",
  "Providence",
  "Clampherdown",
  "Thunder",
  "Original",
  "Charybdis",
  "Rutland",
  "Antigone",
  "Apache",
  "Artemis",
  "Conqueror",
  "Dipper",
  "Defender",
  "Flower",
  "Gladiator",
  "Jubilee",
  "Marlborough",
  "Lomond",
  "Nairn",
  "River",
  "Sirdar",
  "Ulysses",
  "Viking",
  "Vagabond",
  "Viperous",
  "Warlock",
  "Wildebeeste",
  "Torrin",
  "Sea Tiger",
  "Ballantrae",
  "Stratford",
  "Compass Rose",
  "Rockhampton",
  "Solent",
  "Beaufort",
  "Carousel",
  "Leviathan",
  "Medusa",
  "Pandora",
  "Seahorse",
  "Temeraire",
  "Aristotle",
  "Bedford",
  "Berkeley",
  "Dorchester",
  "Gillingham",
  "Hero",
  "Makepeace",
  "Monarch",
  "Sherwood",
  "Suffolk",
  "Troutbridge",
  "Trumpton"
];

var ships = [];
// var mainBossShip;
var asteroids = [];
var screenGrid;
var lazerGrid;
var killfeed;

var globalIDCounter = 0;
var lazerGlobalIDCounter = 0;

var maxDetectionLength = 30;
var screenGridScale = 70;
var hitDetectionLength = 2;
var lazerGridScale = 70;

var lazers = [];

var shipSpeed = {
  min: 0.05,
  max: 0.2
};
let trailSize = 255;
var debug = false;

function updateTrail() {
  let slider = document.getElementById("slider");
  trailSize = parseInt(slider.value);
}

function setup() {
  /* creating a canvas and attatching it to a div */
  let myCanvas = createCanvas(innerWidth, innerHeight);
  myCanvas.parent("mainSketch");

  screenGrid = new Grid(screenGridScale);
  screenGrid.populate(innerWidth, innerHeight);
  lazerGrid = new Grid(lazerGridScale);
  lazerGrid.populate(innerWidth, innerHeight);

  for (let i = 0; i < 50; i++) {
    ships.push(
      new ship(
        random(0, innerWidth),
        random(0, innerHeight),
        random(0, 360),
        random(3, 10),
        random(shipSpeed.min, shipSpeed.max),
        random(1, 5),
        100,
        10,
        screenGrid,
        lazerGrid,
        ships,
        lazers,
        shipNames[Math.floor(random(0, shipNames.length))],
        Math.floor(random(500, 2000))
      )
    );
  }
  // mainBossShip = new ship(
  //   innerWidth / 2,
  //   innerHeight / 2,
  //   0,
  //   20,
  //   0.35,
  //   2,
  //   1000,
  //   30,
  //   screenGrid,
  //   lazerGrid,
  //   [],
  //   lazers
  // );
  //   lazer = new Lazer(100, 100, 20, 3);
  // ships.push(new ship(300, 300, 0, 0.1, 10, screenGrid, ships));
  // background(0);
  killfeed = new killFeed(4, innerHeight - 10, 5);
}

function draw() {
  background(0, 0, 0, trailSize);
  // mainBossShip.showHealthBar();
  for (let i = 0; i < lazers.length; i++) {
    if (lazers[i].delete == true) {
      lazers.splice(i, 1); //should be fine because you remove it from the grid when you set the delete boolean
    } else {
      lazers[i].show();
      lazers[i].run();
      lazers[i].checkGrid();
    }
  }
  for (let i = 0; i < ships.length; i++) {
    ships[i].show();
    ships[i].showHealthBar();
    if (debug) {
      fill(10, 200, 200, 100);
      circle(ships[i].x, ships[i].y, hitDetectionLength * ships[i].size * 5);
      fill(200, 0, 0, 100);
      circle(ships[i].x, ships[i].y, hitDetectionLength * ships[i].size);
    }
    ships[i].runLoop();
    if (ships[i].dead) {
      screenGrid.removeQueue.push({
        x: ships[i].gridX,
        y: ships[i].gridY,
        id: ships[i].ID
      });
      ships.splice(i, 1);
      continue;
    }
    // if (frameCount % 100 == 1) {
    //   let id = Math.floor(random(0, ships.length));
    //   ships[id].shoot();
    //   // console.log(id);
    // }
    killfeed.show();
    // ships[i].rotation++;
  }
  // mainBossShip.show();

  screenGrid.clean();
  lazerGrid.clean();

  //debug stuff
  if (debug) {
    // if (frameCount % 20 == 1) {
    //   ships[Math.floor(random(0, ships.length))].shoot();
    // }
    // lazerDetectionDebugGrid();
    shipDetectionDebugGrid();
    if (keyIsDown(LEFT_ARROW)) {
      ships[0].addRotatio(-3);
    }
    if (keyIsDown(RIGHT_ARROW)) {
      ships[0].addRotatio(3);
    }
    if (keyIsDown(UP_ARROW)) {
      ships[0].addVel();
    }
  }
  // console.log(frameCount);
}

function keyPressed() {
  if (keyCode == 32) {
    ships[0].shoot();
  }
  if (keyCode == 90) {
    ships[0].x = mouseX;
    ships[0].y = mouseY;
  }
  if (keyCode == 88) {
    ships[1].x = mouseX;
    ships[1].y = mouseY;
  }
}

function shipDetectionDebugGrid() {
  noFill();
  strokeWeight(1);
  stroke(200, 50, 200, 100);
  for (let j = 0; j < innerHeight / screenGrid.scale; j++) {
    for (let i = 0; i < innerWidth / screenGrid.scale; i++) {
      rect(
        i * screenGrid.scale,
        j * screenGrid.scale,
        screenGrid.scale,
        screenGrid.scale
      );
    }
  }
}
function lazerDetectionDebugGrid() {
  noFill();
  strokeWeight(1);
  stroke(150, 50, 0, 100);
  for (let j = 0; j < innerHeight / lazerGrid.scale; j++) {
    for (let i = 0; i < innerWidth / lazerGrid.scale; i++) {
      rect(
        i * lazerGrid.scale,
        j * lazerGrid.scale,
        lazerGrid.scale,
        lazerGrid.scale
      );
    }
  }
}
