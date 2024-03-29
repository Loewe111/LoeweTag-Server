class game {
  constructor(devices, link) {
    //devices is the object containing all connected devices, link is the link object used to set values
    this.values = {};
    this.teams = [];
    this.players = []; //this value is required, it is a list containing the ids of all participating players
    Object.entries(devices).forEach(([key, value]) => {
      if (value.type == "pistol") {
        this.values[key] = {
          HP: 100,
          MHP: 100,
          SP: 50,
          MSP: 100,
          ATK: 100,
          MATK: 100,
          RT: 10,
          PTS: 0,
          KILL: 0,
        };
        this.players.push(key);
      }
    });
    this.intervalID = 0; //required, do not touch
    this.link = link;
    this.colors = [
      { name: "Red", rgb: [255, 0, 0] },
      { name: "Green", rgb: [0, 255, 0] },
      { name: "Blue", rgb: [0, 0, 255] },
      { name: "Yellow", rgb: [255, 255, 0] },
      { name: "Purple", rgb: [255, 0, 255] },
      { name: "Cyan", rgb: [0, 255, 255] },
      { name: "Yellow", rgb: [255, 128, 0] },
    ];
  }
  init() {
    //required function, gets called when the gamemode gets selected
    this.link.setGamestate(1);
    this.link.setColor([255, 255, 255]);
    Object.entries(this.values).forEach(([id, value]) => {
      this.link.setValues(value, id);
    });
  }
  start() {
    //requirede function, gets called when the game starts
    this.link.setGamestate(2);
    Object.entries(this.values).forEach(([id, value]) => {
      //Iterate over all Player, id->player id, value-> object with values
      value.TIMER = 1;
    });
  }
  tick() {
    //required function, gets called every 0.5s while game is running
    Object.entries(this.values).forEach(([id, value]) => {
      //Iterate over all Player, id->player id, value-> object with values
      this.link.setValues(value, id);
    });
  }
  hit(sendID, recieveID) {
    //required function, gets called when a player is hit, sendID is the ID of the player who has shot the player, recieveID is the ID of the player who has been shot
    if (this.teams[sendID] != this.teams[recieveID]) {
      this.values[recieveID].HP -= this.values[sendID].ATK;
      this.values[sendID].PTS += 100;
      this.values[sendID].KILL += 1;
    } else {
      if (this.values[recieveID].HP <= 0) {
        this.values[recieveID].HP = this.values[recieveID].MHP;
      }
    }
  }
  stop() {
    //required function, gets called when the game has been stopped
    this.link.setGamestate(1);
  }
  setTeams(teams) {
    //required if game has Teams, gets called when teams are set using the ui, teams contains an object with all teams
    this.teams = teams;
    for (var id of this.players) {
      this.link.setColor(this.colors[teams[id]].rgb, id);
    }
  }
}

module.exports = game;
