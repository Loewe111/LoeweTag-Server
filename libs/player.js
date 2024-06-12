class Player {
  constructor(id, callback) {
    this.id = id;
    
    this._health = 30;
    this._maxHealth = 30;
    this.points = 0;
    this.callback = callback;
    this._frozen = false;
    this._changes = {};
  }

  weapon = new Proxy({
      reloadType: 0,
      reloadTime: 0,
      power: 0,
      active: false,
    },
    {
    set: (target, property, value) => {
      target[property] = value;
      this.onchange('weapon');
      return true;
    },
  });

  _color = new Proxy({
    r: 255,
    g: 0,
    b: 0,
  },
  {
    set: (target, property, value) => {
      target[property] = value;
      this.onchange('color');
      return true;
    },
  });

  set health(value) {
    this._health = Math.max(value, 0);
    this.onchange('health');
  }

  get health() {
    return this._health;
  }

  set maxHealth(value) {
    this._maxHealth = Math.max(value, 0);
    this.onchange('health');
  }

  get maxHealth() {
    return this._maxHealth;
  }

  onchange(type) {
    if (!this._frozen) {
      this.callback(this, type)
    } else {
      this._changes[type] = true;
    }
  }

  freeze() {
    this._frozen = true;
  }

  unfreeze() {
    this._frozen = false;
    for (let type in this._changes) {
      this.onchange(type);
    }
    this._changes = {};
  }

}

module.exports = Player;