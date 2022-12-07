class game{
  constructor(devices, link){//devices is the object containing all connected devices, link is the link object used to set values
    this.values = {}
    this.teams = {}
    this.players = [] //this value is required, it is a list containing the ids of all participating players
    //generate values for 15 players with id 0-14 random Points and Kills
    for(var i=0;i<15;i++){
      this.values[i] = {
        HP: 30,
        MHP: 30,
        SP: 50,
        MSP: 100,
        ATK: 0,
        MATK: 10,
        RT: 10,
        PTS: Math.floor(Math.random()*100),
        KILL: Math.floor(Math.random()*10),
        TIMER: -1
      }
      this.players.push(i)
    }

    this.intervalID = 0 //required, do not touch
    this.link = link
    this.colors = [
      {name:"Red", rgb:[255,0,0]},
      {name:"Green", rgb:[0,255,0]},
      {name:"Blue", rgb:[0,0,255]},
      {name:"Yellow",rgb:[255,255,0]},
      {name:"Purple",rgb:[255,0,255]},
      {name:"Cyan",rgb:[0,255,255]},
      {name:"Yellow",rgb:[255,128,0]}
    ]
  }
  init(){//required function, gets called when the gamemode gets selected
    
  }
  start(){//requirede function, gets called when the game starts
    
  }
  tick(){//required function, gets called every 0.5s while game is running
    
  }
  hit(sendID, recieveID){//required function, gets called when a player is hit, sendID is the ID of the player who has shot the player, recieveID is the ID of the player who has been shot
    
  }
  stop(){//required function, gets called when the game has been stopped
    
  }
  setTeams(teams){//required if game has Teams, gets called when teams are set using the ui, teams contains an object with all teams
    this.teams = teams;
  }
}

module.exports = game;