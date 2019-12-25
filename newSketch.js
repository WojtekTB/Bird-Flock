var ships = [];
var asteroids = [];
var screenGrid;
var lazerGrid;
var globalIDCounter = 0;
var maxDetectionLength = 70;
var lazers = [];

function setup() {
  /* creating a canvas and attatching it to a div */
  let myCanvas = createCanvas(innerWidth, innerHeight);
  myCanvas.parent("mainSketch");

  screenGrid = new Grid(maxDetectionLength);
  screenGrid.populate(innerWidth, innerHeight);
  lazerGrid = new Grid(maxDetectionLength);
  lazerGrid.populate(innerWidth, innerHeight);

  for (let i = 0; i < 20; i++) {
    ships.push(
      new ship(
        random(0, innerWidth),
        random(0, innerHeight),
        random(0, 360),
        random(0.05, 0.2),
        random(1, 5),
        100,
        10,
        screenGrid,
        lazerGrid,
        ships,
        lazers
      )
    );
  }
  //   lazer = new Lazer(100, 100, 20, 3);
  // ships.push(new ship(300, 300, 0, 0.1, 10, screenGrid, ships));
  background(0);
}

function draw() {
  background(0);
  screenGrid.clean();
  for (let i = 0; i < ships.length; i++) {
    ships[i].show();
    ships[i].run();
    ships[i].addVel();
    ships[i].checkGrid();
    ships[i].swarmWithOtherShips();
    // ships[i].rotation++;
  }
  for (let i = 0; i < lazers.length; i++) {
    if (lazers[i].delete == true) {
      lazers.splice(i, 1);
      //   console.log("reee");
    } else {
      lazers[i].show();
      lazers[i].run();
    }
  }
  debugGrid();
  //   lazer.show();
  //   lazer.run();
}

function debugGrid() {
  noFill();
  strokeWeight(1);
  stroke(200, 50, 200);
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
        }
      }
    }
    this.removeQueue = [];
  }
}

class ship {
  constructor(
    x,
    y,
    rotation,
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
    this.size = 5; /* Just how big the ship is, there is no particular scale and it is more or less arbitrary*/
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
    this.AttackStrength = AttackStrength;
    this.lazersArray = lazersArray;
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
    if (surroundingShips.length < 0) {
      return;
    }
    for (let i = 0; i < surroundingShips.length; i++) {
      if (surroundingShips[i] == undefined) {
      } else if (
        ((this.x - surroundingShips[i].x) ^
          (2 + (this.y - surroundingShips[i].y)) ^
          2 ^
          0.5) <
        maxDetectionLength
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
    let newLazer = new Lazer(this.x, this.y, this.rotation, 3);
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
  constructor(x, y, angle, speed) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.vx = this.speed * Math.cos((angle * PI) / 180);
    this.vy = this.speed * Math.sin((angle * PI) / 180);
    this.delete = false;
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
    this.x += this.vx;
    this.y += this.vy;
    if (
      this.x > innerWidth ||
      this.x < 0 ||
      this.y > innerHeight ||
      this.y < 0
    ) {
      this.delete = true;
    }
  }
}
