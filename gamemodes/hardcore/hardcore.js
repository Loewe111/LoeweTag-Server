class game {
  //the class needs to be called "game"
  constructor(devices, link) {
    //devices is the object containing all connected devices, link is the link object used to set values
    this.intervalID = 0; //required, do not touch
    this.values = {}; // required Object for keeping values for each player including points
    this.teams = [];
    this.players = []; //this value is required, it is a list containing the ids of all participating players
    Object.entries(devices).forEach(([key, value]) => {
      if (value.type == "pistol") {
        this.values[key] = {
          HP: 2,
          MHP: 2,
          SP: 50,
          MSP: 100,
          ATK: 0,
          MATK: 1,
          RT: 10,
          PTS: 0,
          KILL: 0,
        };
        this.players.push(key);
      }
    });
    this.link = link;
    this.colors = [
      { name: "Red", rgb: [255, 0, 0] },
      { name: "Green", rgb: [0, 255, 0] },
      { name: "Blue", rgb: [0, 0, 255] },
      { name: "Yellow", rgb: [255, 255, 0] },
      { name: "Purple", rgb: [255, 0, 255] },
      { name: "Cyan", rgb: [0, 255, 255] },
      { name: "Orange", rgb: [255, 128, 0] },
    ];
  }
  init() {
    //required function, gets called when the gamemode gets selected
    this.link.setGamestate(1);
    this.link.setColor([0, 0, 0]);
    Object.entries(this.values).forEach(([id, value]) => {
      this.link.setValues(value, id);
    });
  }
  start() {
    //requirede function, gets called when the game starts
    this.link.setGamestate(2);
    Object.entries(this.values).forEach(([id, value]) => {
      value.ATK = value.MATK;
      this.link.setValues(value, id);
    });
  }
  tick() {
    //required function, gets called every 0.5s while game is running
    Object.entries(this.values).forEach(([id, value]) => {
      this.link.setValues(value, id);
    });
  }
  hit(sendID, recieveID) {
    //required function, gets called when a player is hit, sendID is the ID of the player who has shot the player, recieveID is the ID of the player who has been shot
    this.values[recieveID].HP -= this.values[sendID].ATK;
    this.values[sendID].PTS += 10;
    if (this.values[recieveID].HP <= 0) {
      this.values[recieveID].ATK = 0;
      this.values[recieveID].HP = 0;
      this.values[sendID].PTS += 20;
      this.values[sendID].KILL += 1;
      this.link.setValues(this.values[recieveID], recieveID);
      this.link.setColor([255, 0, 0], recieveID);
    }
  }
  stop() {
    //required function, gets called when the game has been stopped
    this.link.setGamestate(1);
  }
  setSettings(settings) {
    //required if game has settings, gets called when settings are set using the ui, settings contains an object with all settings
    this.settings = settings;
    Object.entries(this.values).forEach(([id, value]) => {
      value.MHP = settings["max-hp"];
      value.MATK = settings["attack-damage"];
    });
  }
}

module.exports = game;
