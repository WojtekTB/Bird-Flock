var ships = [];
var mainBossShip;
var asteroids = [];
var screenGrid;
var lazerGrid;

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
var debug = true;

function setup() {
  /* creating a canvas and attatching it to a div */
  let myCanvas = createCanvas(innerWidth, innerHeight);
  myCanvas.parent("mainSketch");

  screenGrid = new Grid(screenGridScale);
  screenGrid.populate(innerWidth, innerHeight);
  lazerGrid = new Grid(lazerGridScale);
  lazerGrid.populate(innerWidth, innerHeight);

  for (let i = 0; i < 1; i++) {
    ships.push(
      new ship(
        random(0, innerWidth),
        random(0, innerHeight),
        random(0, 360),
        random(3, 6),
        random(shipSpeed.min, shipSpeed.max),
        random(1, 5),
        10,
        10,
        screenGrid,
        lazerGrid,
        ships,
        lazers
      )
    );
  }
  mainBossShip = new ship(
    innerWidth / 2,
    innerHeight / 2,
    0,
    20,
    0.35,
    2,
    1000,
    30,
    screenGrid,
    lazerGrid,
    [],
    lazers
  );
  //   lazer = new Lazer(100, 100, 20, 3);
  // ships.push(new ship(300, 300, 0, 0.1, 10, screenGrid, ships));
  // background(0);
}

function draw() {
  background(0);
  mainBossShip.showHealthBar();
  for (let i = 0; i < lazers.length; i++) {
    if (lazers[i].delete == true) {
      lazers.splice(i, 1); //should be fine because you remove it from the grid when you set the delete boolean
      //   console.log("reee");
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
      fill(200, 0, 0, 100);
      circle(ships[i].x, ships[i].y, hitDetectionLength * ships[i].size);
    }
    ships[i].run();
    ships[i].addVel();
    ships[i].checkGrid();
    ships[i].swarmWithOtherShips();
    ships[i].checkIfShot();
    if (ships[i].dead) {
      screenGrid.removeQueue.push({
        x: ships[i].gridX,
        y: ships[i].gridY,
        id: ships[i].ID
      });
      ships.splice(i, 1);
      continue;
    }

    // ships[i].rotation++;
  }
  mainBossShip.show();

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
}

function keyPressed() {
  if (keyCode == 32) {
    ships[0].shoot();
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

class Grid {
  constructor(scale) {
    this.grid = [];
    this.scale = scale;
    this.removeQueue = [];
  }
  populate(width, height) {
    let numOfSquaresW = Math.floor(width / this.scale) + 1;
    let numOfSquaresH = Math.floor(height / this.scale) + 1;
    /*
    [ [], [], [], [], [] ],
    [ [], [], [], [], [] ],
    [ [], [], [], [], [] ],
    [ [], [], [], [], [] ],
    [ [], [], [], [], [] ]
    */
    for (let j = 0; j < numOfSquaresH; j++) {
      let row = [];
      for (let i = 0; i < numOfSquaresW; i++) {
        row.push([]);
      }
      this.grid.push(row.slice());
    }
  }

  addItemTo(x, y, item) {
    this.grid[y][x].push(item);
  }

  clean() {
    /* 
      Basically speaking it has a list of ships with location and their ID that need 
      to be cleaned, it goes to that place on the grid and looks for the ship with that 
      ID, then it removes it.
    */
    if (this.removeQueue.length < 1) {
      return;
    }
    for (let i = 0; i < this.removeQueue.length; i++) {
      for (
        let j = 0;
        j < this.grid[this.removeQueue[i].y][this.removeQueue[i].x].length;
        j++
      ) {
        if (
          this.grid[this.removeQueue[i].y][this.removeQueue[i].x][j].ID ===
          this.removeQueue[i].id
        ) {
          this.grid[this.removeQueue[i].y][this.removeQueue[i].x].splice(j, 1);
          j--;
          // console.log(
          //   `removed at ${this.removeQueue[i].x}, ${this.removeQueue[i].y}`
          // );
        }
      }
    }
    this.removeQueue = [];
  }
}

class bossShip {
  constructor(
    x,
    y,
    rotation,
    size,
    speed,
    rotationSpeed,
    maxHealth,
    AttackStrength,
    grid,
    lazerGrid,
    shipsArray,
    lazersArray
  ) {
    this.x = x;
    this.y = y;
    this.velx = 0;
    this.vely = 0;
    this.rotation = rotation; /* Ship's rotation from the horizontal */
    this.size = size; /* Just how big the ship is, there is no particular scale and it is more or less arbitrary*/
    this.friction = 0.95;
    this.grid = grid;
    this.gridX = Math.floor(this.x / this.grid.scale);
    this.gridY = Math.floor(this.y / this.grid.scale);
    this.grid.addItemTo(this.gridX, this.gridY, this);
    this.lazerGrid = lazerGrid;
    this.ID = globalIDCounter;
    globalIDCounter++;
    this.shipsArray = shipsArray;
    this.speed = speed;
    this.rotationSpeed = rotationSpeed;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.AttackStrength = AttackStrength;
    this.lazersArray = lazersArray;
    this.opacityOfHealth = 0;
  }

  show() {
    /* 
      points to draw the ship itself (angle, magnitude)
      (0, size)
      (100, size)
      (180, size/2)
      (260, size)
      (0, size)
    */
    strokeWeight(1);
    stroke(255);
    noFill();
    beginShape();
    vertex(
      this.x + this.size * 1.5 * Math.cos((this.rotation * PI) / 180),
      this.y + this.size * 1.5 * Math.sin((this.rotation * PI) / 180)
    );
    vertex(
      this.x + this.size * Math.cos(((this.rotation + 140) * PI) / 180),
      this.y + this.size * Math.sin(((this.rotation + 140) * PI) / 180)
    );
    vertex(
      this.x + (this.size / 2) * Math.cos(((this.rotation + 180) * PI) / 180),
      this.y + (this.size / 2) * Math.sin(((this.rotation + 180) * PI) / 180)
    );
    vertex(
      this.x + this.size * Math.cos(((this.rotation + 220) * PI) / 180),
      this.y + this.size * Math.sin(((this.rotation + 220) * PI) / 180)
    );
    vertex(
      this.x + this.size * 1.5 * Math.cos((this.rotation * PI) / 180),
      this.y + this.size * 1.5 * Math.sin((this.rotation * PI) / 180)
    );

    endShape();
    if (this.opacityOfHealth > 0) {
      this.opacityOfHealth -= 2;
    }
  }

  hit(lazer) {
    console.log(
      `Ship ID${this.ID} has been hit by lazer from ${lazer.senderID}`
    );
    this.opacityOfHealth = 255;
  }

  showHealthBar() {
    let pixelsPerPoint = 0.0001;
    let healthBarX = this.x - (this.maxHealth / 2) * pixelsPerPoint;
    let healthBarY = this.y + this.size * 3;
    let healthBarW = this.maxHealth * pixelsPerPoint;
    let healthBarH = this.size / 2;
    fill(159, 159, 159, this.opacityOfHealth);
    stroke(159, 159, 159, this.opacityOfHealth);
    rect(healthBarX, healthBarY, healthBarW, healthBarH);
    fill(255, 0, 0, this.opacityOfHealth);
    rect(healthBarX, healthBarY, healthBarW, healthBarH);
  }

  run() {
    /* adds velocity to its x and y positions, and then reduces vel depending on the value */
    this.x += this.velx;
    this.y += this.vely;
    this.velx *= this.friction;
    this.vely *= this.friction;
    if (this.x < 0) {
      this.x = innerWidth;
    } else if (this.x > innerWidth) {
      this.x = 0;
    }
    if (this.y < 0) {
      this.y = innerHeight;
    } else if (this.y > innerHeight) {
      this.y = 0;
    }
  }

  addRotatio(magnitude) {
    this.rotation += magnitude;
  }

  addVel() {
    this.velx += this.speed * Math.cos((this.rotation * PI) / 180);
    this.vely += this.speed * Math.sin((this.rotation * PI) / 180);
  }

  shoot() {
    /*
      The idea is that you just send a lazer forward, the problem is to make sure it doesn't crash 
      into it instantly so you need to somehow place it in fron of the ship, and at speed higher than, 
      of the same as the ship
    */
    let onGridX = Math.floor(this.x / this.lazerGrid.scale);
    let onGridY = Math.floor(this.y / this.lazerGrid.scale);
    let newLazer = new Lazer(this.x, this.y, this.rotation, 5);
    this.lazerGrid.addItemTo(onGridX, onGridY, newLazer, this.lazerGrid);
    this.lazersArray.push(newLazer);
  }
}

class ship {
  constructor(
    x,
    y,
    rotation,
    size,
    speed,
    rotationSpeed,
    maxHealth,
    AttackStrength,
    grid,
    lazerGrid,
    shipsArray,
    lazersArray
  ) {
    this.x = x;
    this.y = y;
    this.velx = 0;
    this.vely = 0;
    this.rotation = rotation; /* Ship's rotation from the horizontal */
    this.size = size; /* Just how big the ship is, there is no particular scale and it is more or less arbitrary*/
    this.friction = 0.95;
    this.grid = grid;
    this.gridX = Math.floor(this.x / this.grid.scale);
    this.gridY = Math.floor(this.y / this.grid.scale);
    this.grid.addItemTo(this.gridX, this.gridY, this);
    this.lazerGrid = lazerGrid;
    this.ID = globalIDCounter;
    globalIDCounter++;
    this.shipsArray = shipsArray;
    this.speed = speed;
    this.rotationSpeed = rotationSpeed;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.attackStrength = AttackStrength;
    this.lazersArray = lazersArray;
    this.opacityOfHealth = 0;
    this.dead = false;
  }
  show() {
    /* 
      points to draw the ship itself (angle, magnitude)
      (0, size)
      (100, size)
      (180, size/2)
      (260, size)
      (0, size)
    */
    strokeWeight(1);
    stroke(255);
    noFill();
    beginShape();
    vertex(
      this.x + this.size * 1.5 * Math.cos((this.rotation * PI) / 180),
      this.y + this.size * 1.5 * Math.sin((this.rotation * PI) / 180)
    );
    vertex(
      this.x + this.size * Math.cos(((this.rotation + 140) * PI) / 180),
      this.y + this.size * Math.sin(((this.rotation + 140) * PI) / 180)
    );
    vertex(
      this.x + (this.size / 2) * Math.cos(((this.rotation + 180) * PI) / 180),
      this.y + (this.size / 2) * Math.sin(((this.rotation + 180) * PI) / 180)
    );
    vertex(
      this.x + this.size * Math.cos(((this.rotation + 220) * PI) / 180),
      this.y + this.size * Math.sin(((this.rotation + 220) * PI) / 180)
    );
    vertex(
      this.x + this.size * 1.5 * Math.cos((this.rotation * PI) / 180),
      this.y + this.size * 1.5 * Math.sin((this.rotation * PI) / 180)
    );

    endShape();

    if (this.opacityOfHealth > 0) {
      this.opacityOfHealth -= 2;
    }
  }

  checkIfShot() {
    /*
    Very much the same thing as swarming with others, except 
    you perform it on the lazer grid and perform a different function
    when one is close enough
    */
    let surroundingLazers = [];
    surroundingLazers = surroundingLazers.concat(
      this.lazerGrid.grid[this.gridY][this.gridX]
    );
    if (this.gridX > 0) {
      //   console.log(this.grid.grid[this.gridY][this.gridX - 1]);
      surroundingLazers = surroundingLazers.concat(
        this.lazerGrid.grid[this.gridY][this.gridX - 1]
      );
      if (this.gridY > 0) {
        surroundingLazers = surroundingLazers.concat(
          this.lazerGrid.grid[this.gridY - 1][this.gridX - 1]
        );
      }
      if (this.gridY < this.lazerGrid.length) {
        surroundingLazers = surroundingLazers.concat(
          this.lazerGrid.grid[this.gridY + 1][this.gridX - 1]
        );
      }
    }
    if (this.gridX < this.lazerGrid.grid[0].length) {
      surroundingLazers = surroundingLazers.concat(
        this.lazerGrid.grid[this.gridY][this.gridX + 1]
      );
      if (this.gridY > 0) {
        surroundingLazers = surroundingLazers.concat(
          this.lazerGrid.grid[this.gridY - 1][this.gridX + 1]
        );
      }
      if (this.gridY < this.lazerGrid.length) {
        surroundingLazers = surroundingLazers.concat(
          this.lazerGrid.grid[this.gridY + 1][this.gridX + 1]
        );
      }
    }
    if (this.gridY > 0) {
      surroundingLazers = surroundingLazers.concat(
        this.lazerGrid.grid[this.gridY - 1][this.gridX]
      );
    }
    if (this.gridY < this.lazerGrid.length) {
      surroundingLazers = surroundingLazers.concat(
        this.lazerGrid.grid[this.gridY + 1][this.gridX]
      );
    }

    if (surroundingLazers.length < 1) {
      return;
    }
    for (let i = 0; i < surroundingLazers.length; i++) {
      if (surroundingLazers[i] == undefined) {
      } else if (
        Math.sqrt(
          Math.pow(this.x - surroundingLazers[i].x, 2) +
            Math.pow(this.y - surroundingLazers[i].y, 2)
        ) <
        hitDetectionLength * this.size
      ) {
        /*
         basically run this if the lazer is withing your surrounding grids 
         and the distance to it is small enough 
         */

        // console.log(
        //   Math.sqrt(
        //     (Math.pow(this.x - surroundingLazers[i].x, 2) +
        //       Math.pow(this.y - surroundingLazers[i].y),
        //     2)
        //   )
        // );
        if (surroundingLazers[i].senderID != this.ID) {
          this.hit(surroundingLazers[i]);
          surroundingLazers[i].lazerGrid.removeQueue.push({
            x: surroundingLazers[i].gridX,
            y: surroundingLazers[i].gridY,
            id: surroundingLazers[i].ID
          });
          this.lazersArray.splice(i, 1);
          return;
        }
      }
    }
  }

  hit(lazer) {
    // console.log(
    //   `Ship ID${this.ID} has been hit by lazer from ID${lazer.senderID}`
    // );
    this.opacityOfHealth = 255;
    this.currentHealth -= lazer.damage;
    if (this.currentHealth <= 0) {
      this.dead = true;
      console.log(`Ship ID${this.ID} was killed by Ship ID${lazer.senderID}`);
    }
  }

  showHealthBar() {
    let pixelsPerPoint = 0.2;
    let healthBarX = this.x - (this.maxHealth / 2) * pixelsPerPoint;
    let healthBarY = this.y + this.size * 3;
    let maxHealthBarW = this.maxHealth * pixelsPerPoint;
    let healthBarW = this.currentHealth * pixelsPerPoint;
    let healthBarH = this.size / 2;
    fill(159, 159, 159, this.opacityOfHealth);
    stroke(159, 159, 159, this.opacityOfHealth);
    rect(healthBarX, healthBarY, maxHealthBarW, healthBarH);
    fill(255, 0, 0, this.opacityOfHealth);
    rect(healthBarX, healthBarY, healthBarW, healthBarH);
  }

  swarmWithOtherShips() {
    /* 
    adding all the ships that could be in the detection area to the same array
    this is super long because you also need to make sure that you don't check arrays that don't exist
    i.e. you don't check array at position -1 or over what the grid actually has 
    */
    let surroundingShips = [];
    surroundingShips = surroundingShips.concat(
      this.grid.grid[this.gridY][this.gridX]
    );
    if (this.gridX > 0) {
      //   console.log(this.grid.grid[this.gridY][this.gridX - 1]);
      surroundingShips = surroundingShips.concat(
        this.grid.grid[this.gridY][this.gridX - 1]
      );
      if (this.gridY > 0) {
        surroundingShips = surroundingShips.concat(
          this.grid.grid[this.gridY - 1][this.gridX - 1]
        );
      }
      if (this.gridY < this.grid.length) {
        surroundingShips = surroundingShips.concat(
          this.grid.grid[this.gridY + 1][this.gridX - 1]
        );
      }
    }
    if (this.gridX < this.grid.grid[0].length) {
      surroundingShips = surroundingShips.concat(
        this.grid.grid[this.gridY][this.gridX + 1]
      );
      if (this.gridY > 0) {
        surroundingShips = surroundingShips.concat(
          this.grid.grid[this.gridY - 1][this.gridX + 1]
        );
      }
      if (this.gridY < this.grid.length) {
        surroundingShips = surroundingShips.concat(
          this.grid.grid[this.gridY + 1][this.gridX + 1]
        );
      }
    }

    if (this.gridY > 0) {
      surroundingShips = surroundingShips.concat(
        this.grid.grid[this.gridY - 1][this.gridX]
      );
    }
    if (this.gridY < this.grid.length) {
      surroundingShips = surroundingShips.concat(
        this.grid.grid[this.gridY + 1][this.gridX]
      );
    }

    // console.log(surroundingShips);
    if (surroundingShips.length < 1) {
      return;
    }
    for (let i = 0; i < surroundingShips.length; i++) {
      if (surroundingShips[i] == undefined) {
      } else if (
        Math.sqrt(
          Math.pow(this.x - surroundingShips[i].x, 2) +
            Math.pow(this.y - surroundingShips[i].y, 2)
        ) < maxDetectionLength
      ) {
        // console.log("ree");
        let deltaRotation = Math.sign(
          this.rotation - surroundingShips[i].rotation
        );
        this.rotation += -1 * deltaRotation * this.rotationSpeed;
      }
    }
  }

  run() {
    /* adds velocity to its x and y positions, and then reduces vel depending on the value */
    this.x += this.velx;
    this.y += this.vely;
    this.velx *= this.friction;
    this.vely *= this.friction;
    if (this.x < 0) {
      this.x = innerWidth;
    } else if (this.x > innerWidth) {
      this.x = 0;
    }
    if (this.y < 0) {
      this.y = innerHeight;
    } else if (this.y > innerHeight) {
      this.y = 0;
    }
  }

  addRotatio(magnitude) {
    this.rotation += magnitude;
  }

  addVel() {
    this.velx += this.speed * Math.cos((this.rotation * PI) / 180);
    this.vely += this.speed * Math.sin((this.rotation * PI) / 180);
  }

  shoot() {
    /*
      The idea is that you just send a lazer forward, the problem is to make sure it doesn't crash 
      into it instantly so you need to somehow place it in fron of the ship, and at speed higher than, 
      of the same as the ship
    */
    let onGridX = Math.floor(this.x / this.lazerGrid.scale);
    let onGridY = Math.floor(this.y / this.lazerGrid.scale);
    let newLazer = new Lazer(
      this.x,
      this.y,
      this.rotation,
      5,
      this.attackStrength,
      this.ID,
      this.lazersArray,
      this.lazerGrid
    );
    this.lazerGrid.addItemTo(onGridX, onGridY, newLazer);
    this.lazersArray.push(newLazer);
  }

  checkGrid() {
    /* checks if it is still in the same place on the grid, if not, moves it to the other place */
    let newGridX = Math.floor(this.x / this.grid.scale);
    let newGridY = Math.floor(this.y / this.grid.scale);
    if (newGridX != this.gridX || newGridY != this.gridY) {
      this.grid.addItemTo(newGridX, newGridY, this);
      //   console.log(this.grid.grid);
      this.grid.removeQueue.push({ x: this.gridX, y: this.gridY, id: this.ID });
      this.gridX = newGridX;
      this.gridY = newGridY;
      //   console.log(`changed grid square to ${newGridX}, ${newGridY}`);
    }
  }
}

class Lazer {
  constructor(x, y, angle, speed, damage, senderID, lazersArray, lazerGrid) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.vx = this.speed * Math.cos((angle * PI) / 180);
    this.vy = this.speed * Math.sin((angle * PI) / 180);
    this.delete = false;
    this.damage = damage;
    this.senderID = senderID;
    this.lazersArray = lazersArray;
    this.lazerGrid = lazerGrid;
    this.gridX = Math.floor(this.x / this.lazerGrid.scale);
    this.gridY = Math.floor(this.y / this.lazerGrid.scale);
    this.ID = lazerGlobalIDCounter;
    lazerGlobalIDCounter++;
  }

  show() {
    stroke(255, 0, 0);
    strokeWeight(2);
    beginShape();
    vertex(
      this.x + 4 * Math.cos((this.angle * PI) / 180),
      this.y + 4 * Math.sin((this.angle * PI) / 180)
    );
    vertex(
      this.x - 4 * Math.cos((this.angle * PI) / 180),
      this.y - 4 * Math.sin((this.angle * PI) / 180)
    );
    endShape();
  }

  run() {
    if (
      this.x + this.vx < 0 ||
      this.x + this.vx > innerWidth ||
      this.y + this.vy < 0 ||
      this.y + this.vy > innerHeight
    ) {
      this.delete = true;
      this.lazerGrid.removeQueue.push({
        x: this.gridX,
        y: this.gridY,
        id: this.ID
      });
    } else {
      this.x += this.vx;
      this.y += this.vy;
    }
  }

  checkGrid() {
    /* checks if it is still in the same place on the grid, if not, moves it to the other place */
    let newGridX = Math.floor(this.x / this.lazerGrid.scale);
    let newGridY = Math.floor(this.y / this.lazerGrid.scale);
    if (newGridX != this.gridX || newGridY != this.gridY) {
      this.lazerGrid.addItemTo(newGridX, newGridY, this);
      //   console.log(this.grid.grid);
      this.lazerGrid.removeQueue.push({
        x: this.gridX,
        y: this.gridY,
        id: this.ID
      });
      this.gridX = newGridX;
      this.gridY = newGridY;
      //   console.log(`changed grid square to ${newGridX}, ${newGridY}`);
    }
  }
}
