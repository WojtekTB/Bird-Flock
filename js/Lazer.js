class Lazer {
  constructor(
    x,
    y,
    angle,
    speed,
    damage,
    senderID,
    senderName,
    lazersArray,
    lazerGrid,
    strokeSizeVal
  ) {
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
    this.senderName = senderName;
    lazerGlobalIDCounter++;
    this.strokeSizeVal = strokeSizeVal;
  }

  show() {
    stroke(255, 0, 0);
    strokeWeight(this.strokeSizeVal * 0.5 - 1);
    beginShape();
    vertex(
      this.x + (4 + this.strokeSizeVal / 2) * Math.cos((this.angle * PI) / 180),
      this.y + (4 + this.strokeSizeVal / 2) * Math.sin((this.angle * PI) / 180)
    );
    vertex(
      this.x - (4 + this.strokeSizeVal / 2) * Math.cos((this.angle * PI) / 180),
      this.y - (4 + this.strokeSizeVal / 2) * Math.sin((this.angle * PI) / 180)
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
