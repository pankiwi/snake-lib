/*
 * Registers a unit's class for I/O stuff (saves and net)
 * Requires unit.constructor.get() to have classId: () => unit.classId
 */
 // prog mat js
let registerClass = unit => {
  // Register unit's name
  EntityMapping.nameMap.put(unit.name, unit.constructor);

  // Find available class id and register it
  unit.classId = -1;
  for (var i in EntityMapping.idMap) {
    if (!EntityMapping.idMap[i]) {
      EntityMapping.idMap[i] = unit.constructor;
      unit.classId = i;
      return;
    }
  }

  // Incase you used up all 256 class ids; use the same code for ~250 units you idiot.
  throw new IllegalArgumentException(unit.name + " has no class ID");
};

const clone = obj => {
  if (obj === null || typeof(obj) !== 'object') return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = obj[attr];
    }
  };
  return copy;
}

//IA

const nullIA = () => extend(AIController, {
  updateMovement() {
    //todo
  }
});

let unitBodySnek = (name, obj, objb) => {
  if (obj == undefined) obj = {};
  if (objb == undefined) objb = {};

  obj = Object.assign({
    flying: true,
    offsetSegment: 10,
    engines: 0,
    engineSize: 0,
    engineRotOffset: 0,
    drawEngine(unit) {
      if (!unit.isFlying()) return;

      var scl = unit.elevation;
      var offset = unit.type.engineOffset / 2 + unit.type.engineOffset / 2 * scl;

      Draw.color(unit.team.color);
      for (let i = 0; i < this.engines; i++) {
        Fill.circle(
          unit.x + Angles.trnsx(unit.rotation + this.engineRotOffset + (i * 360 / this.engines), offset),
          unit.y + Angles.trnsy(unit.rotation + this.engineRotOffset + (i * 360 / this.engines), offset),
          (unit.type.engineSize + Mathf.absin(Time.time, 2, unit.type.engineSize / 4)) * scl
        );
      }
      Draw.color(Color.white);
      for (let i = 0; i < this.engines; i++) {
        Fill.circle(
          unit.x + Angles.trnsx(unit.rotation + this.engineRotOffset + (i * 360 / this.engines), offset - 1),
          unit.y + Angles.trnsy(unit.rotation + this.engineRotOffset + (i * 360 / this.engines), offset - 1),
          (unit.type.engineSize + Mathf.absin(Time.time, 2, unit.type.engineSize / 4)) / 2 * scl
        );
      }
      Draw.color();
    }
  }, obj);

  //you can make custom constructor

  objb = Object.assign({
    _owner: null,
    _nextSegment: null, //unit
    offsetNextSegment: 0,
    //nom move
    update() {
      this.super$update();

      if (this.getOwner() != null && this.team != this.getOwner().team) this.team = this.getOwner().team;

      if (this.getOwner() === null || this.getOwner().dead) this.kill();



      this.updateMove();
    },
    updateMove() {
      if (this.getNextSegment() != null && !this.getNextSegment().dead) {
        ;
        let next = this.getNextSegment();

        Tmp.v1.trns(Angles.angle(this.x, this.y, next.x, next.y), -unitBody.offsetSegment);

        let angle = Angles.angle(this.x, this.y, next.x + Tmp.v1.x, next.y + Tmp.v1.y);

        let dst = Mathf.dst(this.x, this.y, next.x + Tmp.v1.x, next.y + Tmp.v1.y);
      // + 8 is for wooble, calculated distance
        if (dst > unitBody.offsetSegment + 8) {

          Tmp.v3.trns(
            angle,
            this.speed()
          );
          this.moveAt(Tmp.v3);
        }
        //if distnace is big
        if (dst > unitBody.offsetSegment * 4) {
          this.set(next.x + Tmp.v1.x, next.y + Tmp.v1.y);
          this.rotation = angle;
        }

      }
    },
    isAI() {
      return false; //you can't control go brrrrrrr
    },
    speed() {
      return this.getOwner().speed();
    },
    cap() {
      return this.count() + 1;
    },
    setOwner(unit) {
      this._owner = unit;
    },
    getOwner() {
      return this._owner;
    },
    setNextSegment(unit) {
      this._nextSegment = unit;
    },
    getNextSegment() {
      return this._nextSegment;
    },
    write(write) {
      this.super$write(write);
      write.i(this.id);

      write.i(this._nextSegment != null ? this._nextSegment.id : -1);

      write.i(this._owner != null ? this._owner.id : -1);
    },
    read(read) {
      this.super$read(read);
      this.id = read.i();

      this.setNextSegment(Groups.unit.getByID(read.i()));

      this.setOwner(Groups.unit.getByID(read.i()));

      this.getOwner().addChild(this.self);

    },
    classId: () => unitBody.classId
  }, objb)


  let unitBody = extend(UnitType, name, obj);

  unitBody.constructor = () => extend(UnitEntity, clone(objb));

  registerClass(unitBody);

  return unitBody;
}

let unitHeadSnek = (name, obj, objb) => {
  if (obj == undefined) obj = {};
  if (objb == undefined) objb = {};

  obj = Object.assign({
    lengthSnake: 1,
    //offset separation
    offsetSegment: 0,
    //body
    body: null,
    end: null,
    flying: true
  }, obj);

  objb = Object.assign({
    _segments: [],
    totalSegments: 0,
    setSneak: false,
    setType(type){
      Log.info("a");
      this.super$setType(type);
    },
    add() {
      //create segments
      this.super$add();

      if (!this.setSneak) this.spawSegments();
    },
    update() {
      this.super$update();

      this.updateListSegments();
    },
    updateListSegments() {
      //if has changes array segments
      if (this._segments.filter(unit => unit != null && !unit.dead).length != this.totalSegments) {
        this._segments = this._segments.filter(unit => unit != null && !unit.dead);
        this.totalSegments = this._segments.length;

        //update segments

        for (let i = 0; i < this._segments.length; i++) {
          let lastUnit = this._segments[i - 1] ? this._segments[i - 1] : this.self;
          let now = this._segments[i];
          
          if(now != null || !now.dead) now.setNextSegment(lastUnit, unitHead.offsetSegments);
        }
      }
      //ohno
      if (this.totalSegments < 1) this.kill();
    },
    setCoords() {
      //create array or use seq
      let coordsSegments = [];

      for (let i = 0; i < unitHead.lengthSnake; i++) {

        let last = coordsSegments[i - 1] ? coordsSegments[i - 1] : new Vec2(this.x, this.y);

        let vec = new Vec2();
        //offset head is default
        vec.trns(this.rotation, -(unitHead.offsetSegment * 2));

        vec.add(last.x, last.y);

        coordsSegments[i] = vec;
      }
      
      return coordsSegments;
    },
    spawSegments() {
      this.setSneak = true;

      Log.info("create sneak");

      let coordsSegments = this.setCoords();
      //:b anti error
      if (unitHead.body != null || unitHead.end != null) {
        //create childs
        for (let i = 0; i < unitHead.lengthSnake; i++) {
          //last unit
          let lastUnit = this._segments[i - 1] ? this._segments[i - 1] : this.self;

          let last = coordsSegments[i - 1] ? coordsSegments[i - 1] : new Vec2(this.x, this.y);
          //rotation
          let rotation = Math.atan2(last.y - coordsSegments[i].y, last.x - coordsSegments[i].x) * 180 / Math.PI;

          //unit
          let unit = i + 1 == unitHead.lengthSnake ? unitHead.end.create(this.team) : unitHead.body.create(this.team);
          //set unit
          unit.setOwner(this.self);

          unit.set(coordsSegments[i].x, coordsSegments[i].y);

          unit.rotation = rotation;

          unit.setNextSegment(lastUnit);

          //multiplayer compatibility

          Events.fire(new UnitCreateEvent(unit, null, this.self));
          if (!Vars.net.client()) {
            unit.add();
          }
          // register segment
          this.addChild(unit);
        }

      } else Log.err("constructor some snake body is null");
    },
    addChild(unit) {
      //this all

      this._segments.push(unit);

      this.totalSegments = this._segments.length;

      Log.info("add child: " + unit.id + "-" + this._segments.length + "-" + this.totalSegments);
    },
    write(write) {
      this.super$write(write);

      write.i(this.id);

      write.bool(this.setSneak);
    },
    read(read) {
      this.super$read(read);

      this.id = read.i();

      this.setSneak = read.bool();
    },
    classId: () => unitHead.classId
  }, objb);

  let unitHead = extend(UnitType, name, obj);

  unitHead.constructor = () => extend(UnitEntity, clone(objb));

  registerClass(unitHead);

  return unitHead;
}

const cannonBullet = extend(MissileBulletType, {
  sprite: "bullet",
  damage: 30,
  speed: 3,
  width: 7,
  height: 9,
  homingPower: 0.15,
  homingRange: 128,
  lifetime: 30
});

const cannonHead = extend(Weapon, "snake-weapon", {
  bullet: cannonBullet,
  rotate: false,
  reload: 6,
  alternate: false,
  x: 16 / 4,
  y: 9 / 4,
  recoil: 7 / 4,
  shootX: -2.5 / 4,
  ejectEffect: Fx.casing1,
  top: false,
  shootSound: Sounds.missile
});

const cannonBody = extend(Weapon, "snakeBody-weapon", {
  bullet: cannonBullet,
  rotate: true,
  reload: 6,
  alternate: false,
  x: 16 / 4,
  y: 9 / 4,
  recoil: 7 / 4,
  shootX: -2.5 / 4,
  ejectEffect: Fx.casing1,
  top: false,
  shootSound: Sounds.missile
});

const bomb = extend(BasicBulletType, {
  sprite: "large-bomb",
  width: 50 / 4,
  height: 50 / 4,
  maxRange: 20,
  ignoreRotation: true,
  backColor: Pal.accent,
  frontColor: Color.white,
  mixColorTo: Color.white,
  hitSound: Sounds.plasmaboom,
  shootCone: 50,
  ejectEffect: Fx.none,
  hitShake: 1.5,
  collidesAir: false,
  lifetime: 40,
  despawnEffect: Fx.flakExplosion,
  hitEffect: Fx.massiveExplosion,
  keepVelocity: false,
  spin: 5,
  shrinkX: 0.3,
  shrinkY: 0.3,
  speed: 0,
  collides: false,
  splashDamage: 80,
  splashDamageRadius: 40
})


const bombBody = extend(Weapon, {
  x: 0,
  y: 0,
  mirror: false,
  reload: 80,
  minShootVelocity: 0.01,
  soundPitchMin: 0.5,
  shootSound: Sounds.plasmadrop,
  bullet: bomb
});




const routerBodyEnd = unitBodySnek("snakeEnd", {
  hitSize: 5,
  //health: 1000,
  shareLife: true,
  offsetSegment: 5
})

routerBodyEnd.defaultController = nullIA;

const routerBody = unitBodySnek("snakeBody", {
  hitSize: 5,
  //health: 2000,
  shareLife: true,
  engines: 2,
  engineSize: 3,
  engineRotOffset: 90,
  engineOffset: 8,
  offsetSegment: 6
})

routerBody.defaultController = nullIA;

routerBody.weapons.add(bombBody, cannonBody);

const routerUnit = unitHeadSnek("snake", {
  body: routerBody,
  end: routerBodyEnd,
  offsetSegment: 6,
  lengthSnake: 10,
  hitSize: 5,
  health: 10000
})

routerUnit.weapons.add(cannonHead);