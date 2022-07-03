class Bird {
    constructor(x, y, angle, rotationSpeed_, speed_) {
      this.x = x;
      this.y = y;
      this.angle = angle;
      this.accelerationX = 0;
      this.accelerationY = 0;
      this.vx = 0;
      this.vy = 0;
      this.rotationSpeed = rotationSpeed_;
      this.speed = speed_;
      this.alive = true;
  
      this.previousGridX = this.getGridX();
      this.previousGridY = this.getGridY();
      birdGrid.grid[this.previousGridY][this.previousGridX].push(this);
    }
  
    getGridX(){
      return Math.floor(this.x/gridSize);
    }
    getGridY(){
      return Math.floor(this.y/gridSize);
    }
  
    run() {
      this.previousGridX = this.getGridX();
      this.previousGridY = this.getGridY();
      if (this.alive) {
        // this.rotateTowards(this.rotationSpeed, mouseX, mouseY);
        // for (let i = 0; i < birds.length; i++) {
        //   this.rotateFrom(this.rotationSpeed / 2, 50, birds[i].x, birds[i].y);
        //   birds[i].rotateFrom(birds[i].rotationSpeed / 2, 50, this.x, this.y);
        // }

        let nearAsteroids = asteroidGrid.getItemsInArea(this);
        for (let i = 0; i < nearAsteroids.length; i++) {
          let distance = this.rotateFrom(
            this.rotationSpeed * 4,
            // 0,
            100,
            nearAsteroids[i].x,
            nearAsteroids[i].y
          );
          if (distance < asteroids[i].killRadius) {
            this.alive = false;
          }
        }
  
        // get all birds in area
        let nearBirds = birdGrid.getItemsInArea(this);
        for (let i = 0; i < nearBirds.length; i++) {
            this.rotateFrom(this.rotationSpeed / 2, 50, nearBirds[i].x, nearBirds[i].y);
            nearBirds[i].rotateFrom(nearBirds[i].rotationSpeed / 2, 50, this.x, this.y);
        }
  
        this.calcAcceleration(this.speed);
        this.move();
        this.render();
        return true;
      }
      return false;
    }
  
    render() {
      if (this.alive) {
        const placeholderAngle = this.angle;
        const placeholderX = this.x;
        const placeholderY = this.y;
        translate(placeholderX, placeholderY);
        rotate(-placeholderAngle);
        let size = 4;
        noFill();
        stroke(255);
        let birdBody = triangle(size * 2, 0, -size, -size, -size, +size);
        //prettier than triangle but less performent :<
        // beginShape();
        // vertex(size * 2, 0);
        // vertex(-size, -size);
        // vertex(0, 0);
        // vertex(-size, +size);
        // vertex(size * 2, 0);
        // endShape();
        rotate(placeholderAngle);
        translate(-placeholderX, -placeholderY);
      }
    }
  
    rotateFrom(rateOfChange_, distanceOfRepultion_, x, y) {
      //make bird rotate from the point
      let distanceToObject = getDistance(this.x, this.y, x, y);
      let distanceOfRepultion = distanceOfRepultion_;
      if (Math.abs(distanceToObject) > distanceOfRepultion) {
        return distanceToObject;
      } else {
        // if (Math.random() > 0.5) {
        //   this.angle += this.rotationSpeed;
        //   this.calcAcceleration(this.speed / 10);
        //   this.move();
        // } else {
        //   this.angle -= this.rotationSpeed;
        //   this.calcAcceleration(this.speed / 10);
        //   this.move();
        // }
        let rateOfChange = rateOfChange_;
        let neededAngle = getAngleDeg(x, y, this.x, this.y);
        let deltaX = x - this.x;
        let deltaY = this.y - y; //normal math graph locations, aka top right ++, bottom left --
        // console.log({ deltaX, deltaY });
        if ((deltaX > 0) & (deltaY > 0)) {
          //quadrant 1
          neededAngle = Math.abs(neededAngle);
        } else if ((deltaX <= 0) & (deltaY >= 0)) {
          //quadrant 2
          neededAngle = Math.abs(neededAngle - 90) + 90;
        } else if ((deltaX < 0) & (deltaY < 0)) {
          //quadrant 3
          neededAngle = Math.abs(neededAngle) + 180;
        } else if ((deltaX >= 0) & (deltaY <= 0)) {
          //quadrant 4
          neededAngle = Math.abs(neededAngle - 90) + 270;
        }
  
        let deltaAngle = neededAngle - this.angle;
  
        let UnsortedAngle1 = Math.abs(this.angle - neededAngle); //counter clock wise
        let UnsortedAngle2 = 360 - Math.abs(this.angle - neededAngle); //clock wise
  
        let CCW;
        let CW;
  
        if (deltaAngle < 0) {
          CCW = UnsortedAngle1;
          CW = UnsortedAngle2;
        } else {
          CW = UnsortedAngle1;
          CCW = UnsortedAngle2;
        }
  
        if (CCW > CW) {
          this.angle -= rateOfChange;
        } else if (CCW < CW) {
          this.angle += rateOfChange;
        }
        this.calcAcceleration(this.speed / 10);
        this.move();
  
        if (this.angle < 0) {
          this.angle = 360 + this.angle;
        }
        if (this.angle > 359) {
          this.angle = this.angle % 360;
        }
        return distanceToObject;
      }
    }
  
    rotateTowards(rateOfChange_, x, y) {
      //make bird rotate towards the point
      let rateOfChange = rateOfChange_;
      let neededAngle = getAngleDeg(x, y, this.x, this.y);
      let deltaX = x - this.x;
      let deltaY = this.y - y; //normal math graph locations, aka top right ++, bottom left --
      if ((deltaX > 0) & (deltaY > 0)) {
        //quadrant 1
        neededAngle = Math.abs(neededAngle);
      } else if ((deltaX <= 0) & (deltaY >= 0)) {
        //quadrant 2
        neededAngle = Math.abs(neededAngle - 90) + 90;
      } else if ((deltaX < 0) & (deltaY < 0)) {
        //quadrant 3
        neededAngle = Math.abs(neededAngle) + 180;
      } else if ((deltaX >= 0) & (deltaY <= 0)) {
        //quadrant 4
        neededAngle = Math.abs(neededAngle - 90) + 270;
      }
  
      let deltaAngle = neededAngle - this.angle;
  
      let UnsortedAngle1 = Math.abs(this.angle - neededAngle); //counter clock wise
      let UnsortedAngle2 = 360 - Math.abs(this.angle - neededAngle); //clock wise
  
      let CCW;
      let CW;
  
      if (deltaAngle < 0) {
        CCW = UnsortedAngle1;
        CW = UnsortedAngle2;
      } else {
        CW = UnsortedAngle1;
        CCW = UnsortedAngle2;
      }
  
      if (CCW > CW) {
        this.angle += rateOfChange;
      } else if (CCW < CW) {
        this.angle -= rateOfChange;
      }
  
      if (this.angle < 0) {
        this.angle = 360 + this.angle;
      }
      if (this.angle > 359) {
        this.angle = this.angle % 360;
      }
    }
  
    calcAcceleration(speed) {
      // console.log(toRadians(this.angle % 90));
      let deltaX = speed * Math.cos(toRadians(this.angle));
      let deltaY = speed * Math.sin(toRadians(this.angle));
      if ((this.angle > 0) & (this.angle <= 90)) {
        deltaX = Math.abs(deltaX);
        deltaY = -1 * Math.abs(deltaY);
      } else if ((this.angle > 90) & (this.angle <= 180)) {
        deltaX = -1 * Math.abs(deltaX);
        deltaY = -1 * Math.abs(deltaY);
      } else if ((this.angle > 180) & (this.angle <= 270)) {
        deltaX = -1 * Math.abs(deltaX);
        deltaY = Math.abs(deltaY);
      } else if ((this.angle > 270) & (this.angle <= 360)) {
        deltaX = Math.abs(deltaX);
        deltaY = Math.abs(deltaY);
      }
      this.accelerationX = deltaX;
      this.accelerationY = deltaY;
      this.vx += this.accelerationX;
      this.vy += this.accelerationY;
      this.accelerationX = 0;
      this.accelerationY = 0;
    }
  
    move() {
      let maxSpeed = 4;
      if (this.vx > maxSpeed) {
        this.vx = maxSpeed;
      } else if (this.vx < -maxSpeed) {
        this.vx = -maxSpeed;
      }
      if (this.vy > maxSpeed) {
        this.vy = maxSpeed;
      } else if (this.vy < -maxSpeed) {
        this.vy = -maxSpeed;
      }
      this.x += this.vx;
      this.y += this.vy;
      if (this.x > innerWidth) {
        this.x = 0;
      } else if (this.x < 0) {
        this.x = innerWidth;
      }
      if (this.y > innerHeight) {
        this.y = 0;
      } else if (this.y < 0) {
        this.y = innerHeight;
      }
      this.vx *= 0.5;
      this.vy *= 0.5;
    }
  }
  function getAngleDeg(ax, ay, bx, by) {
    let angleRad = Math.atan((ay - by) / (ax - bx));
    let angleDeg = (angleRad * 180) / Math.PI;
  
    return angleDeg;
  }
  