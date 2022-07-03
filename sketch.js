var canvas;
var birds = [];
var asteroids = [];

var averageSpeed = 0;
var averageRotationSpeed = 0;

var averageSpeedLog = [];
var averageRotationSpeedLog = [];

var speedGraph;
var rotationGraph;

var statsShow = false;
var trailing = 255;

var trail = 128;

// grid of the field
var birdGrid;
var asteroidGrid;
// pixel size of grid squares
var gridSize = 200;

function setup() {
  gridSize = Math.max(150, Math.floor(innerWidth > innerHeight? innerHeight/10:innerWidth/10));
  // create grid
  birdGrid = new Grid(Math.ceil(innerWidth/gridSize), Math.ceil(innerHeight/gridSize), (bird)=>{ return !bird.alive;});
  asteroidGrid = new Grid(Math.ceil(innerWidth/gridSize) + 1, Math.ceil(innerHeight/gridSize) + 1, ()=>{return false;});

  angleMode(DEGREES);
  canvas = createCanvas(innerWidth, innerHeight);
  canvas.parent("mainSketch");
  for (let i = 0; i < 12; i++) {
    asteroids.push(
      new Asteroid(
        random(0, innerWidth),
        random(0, innerHeight),
        random(-1, 1),
        random(-1, 1)
      )
    );
  }
  let numOfBirds = 100;
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    // if mobile, half it
    numOfBirds /= 2;
  }
  for (let i = 0; i < numOfBirds; i++) {
    birds.push(
      new Bird(
        random(0, width),
        random(0, height),
        random(0, 360),
        random(2, 5), //rotation speed
        random(0.5, 2) //speed
      )
    );
  }
  speedGraph = new drawGraph("#FF0000", 2, 230, 0.9, 3);
  rotationGraph = new drawGraph("#0000ff", 2, 230, 2, 5);
}

function updateTrail() {
  let slider = document.getElementById("slider");
  console.log(slider.value);
  trail = parseInt(slider.value);
}

function draw() {
  // fill(255, 0, 0);
  // rect(0, 0, gridSize, gridSize);

  if (width != innerWidth || height != innerHeight) {
    resizeCanvas(innerWidth, innerHeight);
  }
  background(0, trail);
  // background(0);
  
  processGraphs();
  for (let i = 0; i < birds.length; i++) {
    let isAlive = birds[i].run();
    if (!isAlive) {
      birds.splice(i, 1);
    }
  }
  for (let i = 0; i < asteroids.length; i++) {
    asteroids[i].run();
  }

  birdGrid.run();
  asteroidGrid.run();
  
  if (statsShow) {
    showDebug();
  }
}

function processGraphs(){
  let sumSpeed = 0;
  let sumRotationSpeed = 0;
  for (let i = 0; i < birds.length; i++) {
    sumSpeed += birds[i].speed;
    sumRotationSpeed += birds[i].rotationSpeed;
  }
  averageSpeed = sumSpeed / birds.length;
  averageRotationSpeed = sumRotationSpeed / birds.length;
  averageRotationSpeedLog.push(averageRotationSpeed);
  averageSpeedLog.push(averageSpeed);
  if(averageSpeedLog.length > 100){
    averageSpeedLog.shift();
    averageRotationSpeedLog.shift();
  }
}

function mousePressed() {
  birds.push(
    new Bird(
      mouseX,
      mouseY,
      random(0, 360),
      random(2, 5), //rotation speed
      random(0.5, 2) //speed
    )
  );
}

function StatsCliked() {
  statsShow = !statsShow;
}

function showTitle() {
  let titleScale = 0.5;
  image(
    titleImage,
    width / 2 - (titleImage.width * titleScale) / 2,
    height * 0.5 - titleImage.height * titleScale,
    titleImage.width * titleScale,
    titleImage.height * titleScale
  );
}

function showDebug() {
  let yoffset = 20;
  fill(255);
  noStroke();
  text(`Number of ships: ${birds.length}`, 10, 20 + yoffset);
  // fill(255, 0, 0);
  text(`Average ship speed: ${averageSpeed.toFixed(2)}`, 10, 40 + yoffset);
  // fill(0, 0, 255);
  text(
    `Average ship turning speed: ${averageRotationSpeed.toFixed(2)}`,
    10,
    60 + yoffset
  );
  speedGraph.show(averageSpeedLog, yoffset);
  rotationGraph.show(averageRotationSpeedLog, yoffset);
}

function getDistance(x1, y1, x2, y2) {
  if (x1 === x2 && y1 === y2) {
    return Infinity;
  }
  let a = x1 - x2;
  let b = y1 - y2;
  let c = Math.sqrt(a * a + b * b);
  return c;
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}