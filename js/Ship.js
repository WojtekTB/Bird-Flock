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
    lazersArray,
    name,
    probToShoot
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
    this.name = name;
    this.probToShoot = probToShoot;
    this.followingId = Math.floor(random(0, this.shipsArray.length));
    // if(debug){
    //   this.color =
    // }
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
    // noFill();
    fill(0);
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

    if (surroundingLazers.length == 0) {
      this.safe = true;
      return;
    }
    for (let i = 0; i < surroundingLazers.length; i++) {
      if (surroundingLazers[i] == undefined) {
        // console.log("undef");
      } else if (
        (Math.sqrt(
          Math.pow(this.x - surroundingLazers[i].x, 2) +
            Math.pow(this.y - surroundingLazers[i].y, 2)
        ) <
          hitDetectionLength * this.size) &
        (surroundingLazers[i].senderID != this.ID)
      ) {
        /*
           basically run this if the lazer is withing your surrounding grids 
           and the distance to it is small enough 
           */
        this.hit(surroundingLazers[i]);
        surroundingLazers[i].lazerGrid.removeQueue.push({
          x: surroundingLazers[i].gridX,
          y: surroundingLazers[i].gridY,
          id: surroundingLazers[i].ID
        });
        this.lazersArray.splice(i, 1);
        // i--;
        this.safe = false;
        return;
      } else if (
        (Math.sqrt(
          Math.pow(this.x - surroundingLazers[i].x, 2) +
            Math.pow(this.y - surroundingLazers[i].y, 2)
        ) <
          hitDetectionLength * this.size * 5) &
        (surroundingLazers[i].senderID != this.ID)
      ) {
        /*
         * Check if the lazer didn't hit the ship but is somewhere nearby
         * if it is then turn away from it so you don't get hit
         */
        this.turnAwayFrom(surroundingLazers[i].x, surroundingLazers[i].y);
        // this.addVel(this.speed);
        this.safe = false;
      } else {
        this.safe = true;
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
      // console.log(`Ship ID${this.ID} was killed by Ship ID${lazer.senderID}`);
      killfeed.addToFeed(`${lazer.senderName} has destroyed ${this.name}`);
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

  detectShipsNearby() {
    /* 
      finds ships nearby and runs away if they are too close
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
        ) <
        hitDetectionLength * this.size
      ) {
        // console.log("ree");
        this.turnAwayFrom(surroundingShips[i].x, surroundingShips[i].y);
      }
    }
  }

  runLoop() {
    if (Math.floor(random(0, 10000)) == 0) {
      this.followingId = Math.floor(random(0, this.shipsArray.length));
    }
    this.run();
    if (!debug) {
      this.addVel();
    }
    this.checkGrid();
    // this.swarmWithOtherShips();
    this.checkIfShot();
    if (this.safe & !debug) {
      try {
        this.turnTowards(
          this.shipsArray[this.followingId].x,
          this.shipsArray[this.followingId].y
        );
      } catch {
        this.followingId = Math.floor(random(0, this.shipsArray.length));
      }
    }
    if (Math.floor(random(0, this.probToShoot)) == this.probToShoot - 1) {
      this.shoot();
    }

    // this.detectShipsNearby();
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
    this.rotation = this.rotation % 360;

    // if (this.rotation < 0) {
    //   this.rotation = 360 + this.rotation;
    // }
  }

  addVel() {
    this.velx += this.speed * Math.cos((this.rotation * PI) / 180);
    this.vely += this.speed * Math.sin((this.rotation * PI) / 180);
  }
  addVelM(M) {
    this.velx += M * this.speed * Math.cos((this.rotation * PI) / 180);
    this.vely += M * this.speed * Math.sin((this.rotation * PI) / 180);
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
      this.name,
      this.lazersArray,
      this.lazerGrid,
      this.size
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

  turnTowards(x, y) {
    let deltaX = this.x - x;
    let deltaY = this.y - y;
    // let angle = Math.abs(
    //   this.rotation - (Math.atan(deltaY / deltaX) * 180) / PI - 180
    // );
    let angle = (Math.atan(deltaY / deltaX) * 180) / PI;
    let deltaAngle = (angle - (this.rotation - 180)) % 360;
    if (deltaX < 0) {
      if (deltaAngle < 180) {
        this.addRotatio(-this.rotationSpeed / 2);
      } else {
        this.addRotatio(this.rotationSpeed / 2);
      }
    } else {
      if (deltaAngle < 0) {
        this.addRotatio(-this.rotationSpeed / 2);
      } else {
        this.addRotatio(this.rotationSpeed / 2);
      }
    }
    // console.log({ delta: deltaAngle, current: this.rotation });
  }

  turnAwayFrom(x, y) {
    let deltaX = this.x - x;
    let deltaY = this.y - y;
    // let angle = Math.abs(
    //   this.rotation - (Math.atan(deltaY / deltaX) * 180) / PI - 180
    // );
    let angle = (Math.atan(deltaY / deltaX) * 180) / PI;
    let deltaAngle = (angle - this.rotation) % 360;
    if (deltaX < 0) {
      if (deltaAngle < 180) {
        this.addRotatio(-this.rotationSpeed);
      } else {
        this.addRotatio(this.rotationSpeed);
      }
    } else {
      if (deltaAngle < 0) {
        this.addRotatio(-this.rotationSpeed);
      } else {
        this.addRotatio(this.rotationSpeed);
      }
    }
    // console.log(deltaAngle);
    this.addVelM(0.2);
  }
}
