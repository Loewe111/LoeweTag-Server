class game {
  //the class needs to be called "game"
  constructor(devices, ser) {
    //devices is the object containing all connected devices, ser is the serial object used to send values
    this.intervalID = 0; //required, do not touch
    this.values = {}; //required, stores all values of all players
    this.teams = [];
    this.players = []; //this value is required, it is a list containing the ids of all participating players
    Object.entries(devices).forEach(([key, value]) => {
      if (value.type == "pistol") {
        this.values[key] = {
          HP: 30,
          MHP: 30,
          SP: 50,
          MSP: 100,
          ATK: 0,
          MATK: 10,
          RT: 10,
          PTS: 0,
          KILL: 0,
          TIMER: -1,
        };
        this.players.push(key);
      }
    });
    this.ser = ser;
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
  }
  start() {
    //requirede function, gets called when the game starts
  }
  tick() {
    //required function, gets called every 0.5s while game is running
  }
  hit(sendID, recieveID) {
    //required function, gets called when a player is hit, sendID is the ID of the player who has shot the player, recieveID is the ID of the player who has been shot
  }
  stop() {
    //required function, gets called when the game has been stopped
  }
  setTeams(teams) {
    //required if game has Teams, gets called when teams are set using the GUI, teams contains an object with all teams
  }
}

module.exports = game;
