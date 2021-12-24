//depracet version
const snakeAI = () => extend(AIController, {
  //i stole from prog mat js
  updateMovement() { //Just don't move, but still turn.
    if (!Units.invalidateTarget(this.target, this.unit, this.unit.range()) && this.unit.type.rotateShooting) {
      if (this.unit.type.hasWeapons()) {
        this.unit.lookAt(Predict.intercept(this.unit, this.target, this.unit.type.weapons.first().bullet.speed));
      }
    }
  },
  retarget() {
    return this.timer.get(this.timerTarget, this.target == null ? 10 : 20);
  }
});

const snakeBody = extend(UnitType, "snakeBody", {
  flying: true,
  drawEngine() {}
})

snakeBody.constructor = () => extend(UnitEntity, {
  _owner: null,
  update() {
    this.super$update();

    if (this.getOwner() === null || this.getOwner().dead) this.kill();
  },
  cap() {
    return Infinity;
  },
  setOwner(unit) {
    this._owner = unit;
    Log.info(unit.id);
  },
  getOwner() {
    return this._owner
  },
  write(write) {
  //  this.super$write(write);
   Log.info(write);
 //   write.i(this.getOwner() != null ? this.getOwner().id : -1);
  },
  read(read, revision) {
//    this.super$read(read, revision);
    
//    this.setOwner(read.i());
    Log.info(read + "-" + revision);
  },
  classId: () => snakeBody.classId
})

snakeBody.defaultController = snakeAI;

const snakeEnd = extend(UnitType, "snakeEnd", {
  flying: true,
})

snakeEnd.constructor = () => extend(UnitEntity, {
  cap() {
    return Infinity;
  }
})

snakeEnd.defaultController = snakeAI;

/*
const snake = extend(UnitType, "snake", {
  lengthSnake: 10,
  segmentOffset: 8,
  body: snakeBody,
  end: snakeBody,
  flying: true,
  create(team) {
    let unit = this.constructor.get();
    unit.team = team;
    unit.setType(this);
    unit.ammo = this.ammoCapacity;
    unit.elevation = this.flying ? 1 : 0;
    unit.health = unit.maxHealth;
    return unit;
  },
  drawEngine() {}
})

snake.constructor = () => extend(UnitEntity, {
  _segmnets: [],
  _coordsSegments: [],
  add() {
    this.createSegments();
    this.super$add();
    
  },
  update() {
    this.super$update();
    
   this.updateMove();
   
   for(let i = 0; i < this._coordsSegments.length; i++){
     Log.info(this._coordsSegments[i])
   }

  },
  updateMove() {
   if(this._coordsSegments[0] === null) return;
    if (this._coordsSegments.length > this._segmnets.length) this._coordsSegments.shift();
    
    
    if (!Mathf.sqrt(Mathf.pow(this._coordsSegments[0].x - this.x, 2) + Mathf.pow(this._coordsSegments[0].y - this.y, 2)) >= snake.segmentOffset * 2) return;

    for (let i = 0; i < this._segmnets.length; i++) {
      let last = i != 0 ? this._coordsSegments[i - 1] : { x: this.x, y: this.y };
      let now = this._coordsSegments[i];

      if (Mathf.sqrt(Mathf.pow(now.x - last.y, 2) + Mathf.pow(now.y - last.y, 2)) >= snake.segmentOffset) {

        let newCoords = {
          x: last.x + Angles.trnsx(this.rotation, -snake.segmentOffset),
          y: last.y + Angles.trnsy(this.rotation, -snake.segmentOffset),
          rotation: Math.atan2(last.y - now.y, last.x - now.x) * 180 / Math.PI
        }

        this._coordsSegments.push(newCoords);

        this.moveSegments();
      }
    }
  },
  moveSegments() {
    for (let i = 0; i < this._segmnets.length; i++) {
      let segment = this._segmnets[i]
      let coords = this._coordsSegments[i]
      segment.set(coords.x, coords.y);
      segment.rotation = coords.rotation;
    }
  },
  createSegments() {
    this.setCoords();
    this.setSegments();
  },
  
  setCoords() {
    for (let i = 0; i < snake.lengthSnake; i++) {
      let newCoords = {
        x: this.x,
        y: this.y,
        rotation: this.rotation
      }

      let last = this._coordsSegments[i - 1] ? this._coordsSegments[i - 1] : newCoords;

      let angle = (Math.atan2(last.y - this.y, last.x - this.x) * 180 / Math.PI) + Mathf.randomSeed(this.id + i * 100, -30, 30);

      newCoords.x = last.x + Angles.trnsx(angle, -snake.segmentOffset);
      newCoords.y = last.y - Angles.trnsy(angle, -snake.segmentOffset);
      newCoords.rotation = angle;

      this._coordsSegments[i] = newCoords;
    }
  },
  setSegments() {
    for (let i = 0; i < snake.lengthSnake; i++) {
      let segment = this._segmnets[i]
      let coords = this._coordsSegments[i]
      segment = i + 1 === snake.lengthSnake ? snake.end.create(this.team) : snake.body.create(this.team);
      segment.setOwner(this.self);
      segment.set(coords.x, coords.y);
      segment.rotation = coords.rotation;
      segment.add();
    }
  }
})

snake.defaultController = snakeAI;
*/

const snake = extend(UnitType, "snake", {
  lengthSnake: 10,
  //offset separation off segments
  offsetSegments: 10,
  //body
  body: snakeBody,
  end: snakeBody,
  //not chance
  flying: true,
  create(team) {
    let unit = this.constructor.get();
    unit.team = team;
    unit.setType(this);
    unit.ammo = this.ammoCapacity;
    unit.elevation = this.flying ? 1 : 0;
    unit.health = unit.maxHealth;
    //create segments
    unit.createSegments(team);
    return unit;
  }
})

const a = new Effect(1, e => {
  Draw.color(e.data[0]);
  Fill.circle(e.x, e.y, 2);
  Lines.lineAngle(e.x, e.y, e.rotation, 4);
})

snake.constructor = () => extend(UnitEntity, {
  _segments: [],
  _coordsSegments: [],
  add() {
    //create segments
    this.spawSegments();
    this.super$add();
  },
  update() {
    this.super$update();
    /*
        if (this.coords.length > this.segments.length) this.coords.shift();
        Log.info(Mathf.sqrt(Mathf.pow(this.coords[0].x - this.x, 2) + Mathf.pow(this.coords[0].y - this.y, 2)));
        if (Mathf.sqrt(Mathf.pow(this.coords[0].x - this.x, 2) + Mathf.pow(this.coords[0].y - this.y, 2)) >= snake.body.hitSize * 2) {
          if(this.counter += Time.delta >= 0.99){
          let offset = snake.body.hitSize;
          let newCoords = {
            x: this.x + Angles.trnsx(this.rotation, -offset),
            y: this.y + Angles.trnsy(this.rotation, -offset),
            rotation: Math.atan2(this.y - this.coords[0].y, this.x - this.coords[0].x) * 180 / Math.PI
          }
          
          this.coords.push(newCoords);
          this.updateCoordsSegments();
          
          this.counter = 0;
          }
        }
        */
  },
  createSegments(team) {
    if (snake.body != null || snake.end != null) {
      for (let i = 0; i < snake.lengthSnake; i++) {
        this._segments[i] = i + 1 == snakeAI.lengthSnake ? snake.end.create(team) : snake.body.create(team);
        this._segments[i].setOwner(this.self);
      }
    } else Log.err("constructor some snake body is null");
  },
  setCoords() {
    for (let i = 0; i < this._segments.length; i++) {
      let last = this._coordsSegments[i - 1] ? this._coordsSegments[i - 1] : new Vec2(this.x, this.y);

      let vec = new Vec2();

      vec.trns(this.rotation, -(snake.offsetSegments));

      vec.add(last.x, last.y);

      this._coordsSegments[i] = vec;
    }
  },
  spawSegments() {
    this.setCoords();

    for (let i = 0; i < this._segments.length; i++) {
      let last = this._coordsSegments[i - 1] ? this._coordsSegments[i] : new Vec2(this.x, this.y);
      let rotation = Math.atan2(last.y - this._coordsSegments[i].y, last.x - this._coordsSegments[i].x) * 180 / Math.PI;

      this._segments[i].set(this._coordsSegments[i].x, this._coordsSegments[i].y);
      this._segments[i].rotation = rotation;
      this._segments[i].add();
    }
  },
  moveSegments() {
    for (let i = 0; i < this._segments.length; i++) {
      let last = this._segments[i - 1] ? this._coordsSegments[i] : new Vec2(this.x, this.y);
      this._segments[i].set(this._coordsSegments[i].x, this._coordsSegments[i].y);

    }
  },
  classId: () => snake.classId
})

snake.defaultController = snakeAI;

