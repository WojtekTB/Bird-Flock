var birds = [];
var canvas;
var asteroids = [];
var titleImage;

var averageSpeed = 0;
var averageRotationSpeed = 0;

var averageSpeedLog = [];
var averageRotationSpeedLog = [];

var speedGraph;
var rotationGraph;

function preload() {
  titleImage = loadImage("./vadim kim website.png");
}

function setup() {
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
  for (let i = 0; i < 100; i++) {
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
  speedGraph = new drawGraph("#FF0000", 2, 230, 0.5, 2);
  rotationGraph = new drawGraph("#0000ff", 2, 230, 2, 5);
}

function draw() {
  resizeCanvas(innerWidth, innerHeight);
  background(0);
  showTitle();
  if (document.getElementById("statsForNerds").checked) {
    showDebug();
  }
  let sumSpeed = 0;
  let sumRotationSpeed = 0;
  for (let i = 0; i < birds.length; i++) {
    let isAlive = birds[i].run();
    // console.log(isAlive);
    if (isAlive === false) {
      birds.splice(i, 1);
      averageRotationSpeedLog.push(averageRotationSpeed);
      averageSpeedLog.push(averageSpeed);
      // console.log(averageSpeedLog.length);
    } else {
      sumSpeed += birds[i].speed;
      sumRotationSpeed += birds[i].rotationSpeed;
    }
  }
  averageSpeed = sumSpeed / birds.length;
  averageRotationSpeed = sumRotationSpeed / birds.length;
  for (let i = 0; i < asteroids.length; i++) {
    asteroids[i].run();
  }
}

class drawGraph {
  constructor(strokeColor, x, y, minPos, maxPos) {
    this.x = x;
    this.y = y;
    this.min = 0;
    this.max = 0;
    this.strokeColor = strokeColor;
    this.minPos = minPos;
    this.maxPos = maxPos;
  }

  show(points, yoffset) {
    let graphWidth = 200;
    let graphHeight = 150;
    noFill();
    stroke(255);
    rect(this.x, this.y + yoffset, graphWidth, -graphHeight);
    beginShape();
    stroke(this.strokeColor);
    for (let i = 0; i < points.length; i++) {
      if (this.min > points[i]) {
        this.min = points[i];
      }
      if (this.max < points[i]) {
        this.max = points[i] * 80;
      }
      let yOffset = graphHeight / 2 / this.max;
      curveVertex(
        i * (graphWidth / points.length) + this.x,
        -map(points[i], this.minPos, this.maxPos, 10, graphHeight) +
          this.y +
          yOffset
      );
    }
    endShape();
    fill(0, 0, 255);
    text(`Rotation`, this.x, this.y + 10 + yoffset);
    fill(255, 0, 0);
    text(`Speed`, this.x + "Rotation".length * 12, this.y + 10 + yoffset);
  }
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

class Asteroid {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.points = [];
    let numberOfPoints = 12; //12 points that asteroid is drawn from
    this.overallSize = random(1, 5);
    for (let i = 0; i < numberOfPoints; i++) {
      let distance = random(
        10 + this.overallSize * 2,
        20 + this.overallSize * 4
      );
      let angle = random(
        (360 / numberOfPoints) * i,
        (360 / numberOfPoints) * (i + 1)
      );
      this.points.push({
        x: distance * Math.cos(toRadians(angle)),
        y: distance * Math.sin(toRadians(angle))
      });
    }
  }

  run() {
    this.render();
    this.move();
  }

  render() {
    noFill();
    stroke(255);
    beginShape();
    for (let i = 0; i < this.points.length; i++) {
      vertex(this.points[i].x + this.x, this.points[i].y + this.y);
    }
    vertex(this.points[0].x + this.x, this.points[0].y + this.y);
    endShape();
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x > innerWidth + this.overallSize * 5) {
      this.x = -(this.overallSize * 5);
    } else if (this.x < -(this.overallSize * 5)) {
      this.x = innerWidth + this.overallSize * 5;
    }
    if (this.y > innerHeight + this.overallSize * 5) {
      this.y = -(this.overallSize * 5);
    } else if (this.y < -(this.overallSize * 5)) {
      this.y = innerHeight + this.overallSize * 5;
    }
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
    this.alive = true;
  }

  run() {
    if (this.alive) {
      this.rotateTowards(this.rotationSpeed, mouseX, mouseY);
      for (let i = 0; i < birds.length; i++) {
        this.rotateFrom(this.rotationSpeed / 2, 50, birds[i].x, birds[i].y);
        birds[i].rotateFrom(birds[i].rotationSpeed / 2, 50, this.x, this.y);
      }
      for (let i = 0; i < asteroids.length; i++) {
        let distance = this.rotateFrom(
          this.rotationSpeed * 4,
          // 0,
          100,
          asteroids[i].x,
          asteroids[i].y
        );
        if (distance < asteroids[i].overallSize * 10) {
          this.alive = false;
        }
      }
      this.calcAcceleration(this.speed);
      this.move();
      this.render();
      return true;
    }
    return false;
  }

  render() {
    // canvas.x = 0;
    // canvas.y = 0;
    if (this.alive) {
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
