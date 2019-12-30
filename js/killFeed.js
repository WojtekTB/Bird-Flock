class killFeed {
  constructor(x, y, lengthLimit) {
    this.x = x;
    this.y = y;
    this.lengthLimit = lengthLimit;
    this.feed = [];
    this.opacity = 255;
  }
  show() {
    fill(255, 255, 255, this.opacity);
    for (let i = 0; i < this.feed.length; i++) {
      text(this.feed[i], this.x, this.y - i * 12);
    }
    this.opacity -= 0.3;
  }
  addToFeed(entry) {
    this.feed.push(entry);
    if (this.feed.length > this.lengthLimit) {
      this.feed.splice(0, 1);
    }
    this.opacity = 255;
  }
}
