class Grid{
    constructor(w, h, deleteCheckFunction){
        this.nearMap = new Map();
        this.grid = [];
        for(let y = 0; y < h; y++){
            let newGridLine = [];
            for(let x = 0; x < w; x++){
                newGridLine.push([]);
            }
            this.grid[y] = newGridLine;
        }
        this.deleteCheckFunction = deleteCheckFunction;
    }

    run(){
        for(let y = this.grid.length - 1; y >= 0; y--){
            for(let x = this.grid[y].length - 1; x >= 0; x--){
                for(let i = this.grid[y][x].length - 1; i >= 0; i--){
                    let birdOnGrid = this.grid[y][x][i];
                    if(birdOnGrid == undefined || this.deleteCheckFunction(birdOnGrid)){
                        this.grid[y][x].splice(i, 1);
                        continue;
                    }
                    let newGridX = birdOnGrid.getGridX();
                    let newGridY = birdOnGrid.getGridY();
                    if(newGridX !== birdOnGrid.previousGridX || newGridY !== birdOnGrid.previousGridY){
                        this.grid[y][x].splice(i, 1);
                        this.grid[newGridY][newGridX].push(birdOnGrid);
                    }
                }
            }
        }
        this.nearMap = new Map();
    }

    getItemsInArea(item){
        let mapKey = item.getGridX() + ", " + item.getGridY();
        if(this.nearMap.has(mapKey)){
            return this.nearMap.get(mapKey);
        }
        let itemsInArea = this.grid[item.previousGridY][item.previousGridX];
        if(this.previousGridY - 1 > 0){
            itemsInArea = itemsInArea.concat(this.grid[item.previousGridY - 1][item.previousGridX]);
        }
        if(this.previousGridY + 1 < this.grid.length){
            itemsInArea = itemsInArea.concat(this.grid[item.previousGridY + 1][item.previousGridX]);
        }
        if(this.previousGridX - 1 > 0){
            itemsInArea = itemsInArea.concat(this.grid[item.previousGridY][item.previousGridX - 1]);
            if(this.previousGridY - 1 > 0){
                itemsInArea = itemsInArea.concat(this.grid[item.previousGridY - 1][item.previousGridX - 1]);
            }
            if(this.previousGridY + 1 < this.grid.length){
                itemsInArea = itemsInArea.concat(this.grid[item.previousGridY + 1][item.previousGridX - 1]);
            }
        }
        if(this.previousGridX + 1 > this.grid[item.previousGridY].length){
            itemsInArea = itemsInArea.concat(this.grid[item.previousGridY][item.previousGridX + 1]);
            if(this.previousGridY - 1 > 0){
                itemsInArea = itemsInArea.concat(this.grid[item.previousGridY - 1][item.previousGridX + 1]);
            }
            if(this.previousGrid + 1 < this.grid.length){
                itemsInArea = itemsInArea.concat(this.grid[item.previousGridY + 1][item.previousGridX + 1]);
            }
        }
        this.nearMap.set(mapKey, itemsInArea);
        return itemsInArea;
    }
}