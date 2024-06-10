class Player {
  constructor(id, callback) {
    this.id = id;
    
    this._health = 30;
    this._maxHealth = 30;
    this.points = 0;
    this.callback = callback;
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
      this.callback(this, 'weapon');
      return true;
    },
  });

  color = new Proxy({
    r: 255,
    g: 0,
    b: 0,
  },
  {
    set: (target, property, value) => {
      target[property] = value;
      this.callback(this, 'color');
      return true;
    },
  });

  set health(value) {
    this._health = Math.max(value, 0);
    this.callback(this, 'health');
  }

  get health() {
    return this._health;
  }

  set maxHealth(value) {
    this._maxHealth = Math.max(value, 0);
    this.callback(this, 'health');
  }

  get maxHealth() {
    return this._maxHealth;
  }

}

module.exports = Player;