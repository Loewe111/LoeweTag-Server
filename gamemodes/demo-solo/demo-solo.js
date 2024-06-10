
class game {
  constructor(players) {
    this.players = players; 
    this.intervalID = 0;
  }
  init() {
    Object.values(this.players).forEach((player) => {
      player.weapon.active = false;
      player.weapon.power = 10;
      player.weapon.reloadTime = 1000;
      player.health = 30;
      player.maxHealth = 30;
      player.color = { r: 255, g: 0, b: 0 };
      player.timer = -1;
    });
  }
  start() {
    Object.values(this.players).forEach((player) => {
      player.weapon.active = true;
    });
  }
  tick() {
    Object.values(this.players).forEach((player) => {
      if (player.timer > 0) {
        player.timer -= 1;
      }
      if (player.timer == 0) {
        player.weapon.active = true;
        player.health = player.maxHealth;
        player.timer = -1;
      }
      if (player.health <= 0 && player.timer < 0) {
        player.timer = 10;
        player.weapon.active = false;
      }
    });
  }
  hit(sendID, recieveID) {
    if (this.players[recieveID] == undefined || this.players[sendID] == undefined) return;
    if (this.players[recieveID].health <= 0) return;
    this.players[recieveID].health -= this.players[sendID].weapon.power;
    this.players[sendID].points += 10 + this.players[recieveID].health;
  }
  stop() {
    Object.values(this.players).forEach((player) => {
      player.weapon.active = false;
    });
  }
}

module.exports = game;
