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
