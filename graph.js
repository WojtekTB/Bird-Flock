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
        // if (this.min > points[i]) {
        //   this.min = points[i];
        // }
        // if (this.max < points[i]) {
        //   this.max = points[i] * 80;
        // }
        // let yOffset = graphHeight / 2 / this.max;
        curveVertex(
          i * (graphWidth / points.length) + this.x,
          -map(points[i], this.minPos, this.maxPos, 10, graphHeight) +
            this.y 
            // + yOffset
        );
      }
      endShape();
      fill(0, 0, 255);
      text(`Rotation`, this.x, this.y + 10 + yoffset);
      fill(255, 0, 0);
      text(`Speed`, this.x + "Rotation".length * 12, this.y + 10 + yoffset);
    }
  }
  