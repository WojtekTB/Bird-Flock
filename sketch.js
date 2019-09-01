var birds = [];
var canvas;

function setup() {
  angleMode(DEGREES);
  canvas = createCanvas(innerWidth, innerHeight);
  canvas.parent("mainSketch");
  // background(0);
  // for (let i = 0; i < 100; i++) {
  //   birds.push(
  //     new Bird(
  //       random(0, innerWidth),
  //       random(0, innerHeight),
  //       random(0, 360),
  //       random(0.01, 5),
  //       random(0.5, 1.5)
  //     )
  //   );
  // }
  // for (let i = 0; i < 100; i++) {
  //   birds.push(new Bird(innerWidth / 2, innerHeight / 2, random(0, 360), 5, 1));
  // }
}

function draw() {
  background(0);
  showDebug();
  // for (let i = 0; i < birds.length; i++) {
  //   birds[i].run();
  // }
}

// function drawGradient(x, y, radius) {
//   for (let r = radius; r > 0; --r) {
//     let lightnes = map(r, 0, radius, 50, 20);
//     let c = color(`hsl(0, 0%, ${lightnes}%)`);
//     fill(c);
//     // debugger
//     noStroke();
//     ellipse(x, y, r, r);
//   }
// }

function showDebug() {
  fill(255);
  noStroke();
  text(`Number of ships: ${birds.length}`, 10, 20);
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

class Asteroid {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
  }
}

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
  }

  run() {
    this.rotateTowards(this.rotationSpeed, mouseX, mouseY);
    for (let i = 0; i < birds.length; i++) {
      // this.rotateFrom(this.rotationSpeed, birds[i].x, birds[i].y);

      this.rotateFrom(this.rotationSpeed / 2, birds[i].x, birds[i].y);
      birds[i].rotateFrom(birds[i].rotationSpeed / 2, this.x, this.y);
    }
    this.calcAcceleration(this.speed);
    this.move();
    this.render();
  }

  render() {
    // canvas.x = 0;
    // canvas.y = 0;
    const placeholderAngle = this.angle;
    const placeholderX = this.x;
    const placeholderY = this.y;
    translate(placeholderX, placeholderY);
    rotate(-placeholderAngle);
    // drawGradient(0, 0, 50);
    let size = 4;
    noFill();
    stroke(255);
    // let birdBody = triangle(size * 2, 0, -size, -size, -size, +size);
    beginShape();
    vertex(size * 2, 0);
    vertex(-size, -size);
    vertex(0, 0);
    vertex(-size, +size);
    vertex(size * 2, 0);
    endShape();
    rotate(placeholderAngle);
    translate(-placeholderX, -placeholderY);
  }

  rotateFrom(rateOfChange_, x, y) {
    //make bird rotate from the point
    let distanceToObject = getDistance(this.x, this.y, x, y);
    let distanceOfRepultion = 50;
    if (Math.abs(distanceToObject) > distanceOfRepultion) {
      return;
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
    }
  }

  rotateTowards(rateOfChange_, x, y) {
    //make bird rotate towards the point
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
    // console.log({ deltaX, deltaY });
  }

  move() {
    let maxSpeed = 4;
    if (this.vx > maxSpeed) {
      this.vx = maxSpeed;
      // console.log("Max speed reached!");
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
