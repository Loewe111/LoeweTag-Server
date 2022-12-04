class game{
  constructor(devices, ser){//devices is the object containing all connected devices, ser is the serial object used to send values
    this.values = {}
    this.teams = []
    this.players = [] //this value is required, it is a list containing the ids of all participating players
    Object.entries(devices).forEach(([key, value]) => {
      if(value.type == "gun"){
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
          TIMER: -1
        }
        this.players.push(key)
      }
    })
    this.intervalID = 0 //required, do not touch
    this.ser = ser
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
    this.ser.write(encodeMessage("gamestate",1))
    this.ser.write(encodeMessages("color",[255,255,255]))
    Object.entries(this.values).forEach(([key, value]) =>{
      this.ser.write(encodeMessages("vars",[value.HP, value.MHP, value.SP, value.MSP, value.ATK, value.RT, value.PTS, value.KILL],key))
    })
  }
  start(){//requirede function, gets called when the game starts
    this.ser.write(encodeMessage("gamestate",2))
    Object.entries(this.values).forEach(([key, value]) =>{//Iterate over all Player, key->player id, value-> object with values
      value.TIMER = 1
    })
  }
  tick(){//required function, gets called every 0.5s while game is running
    Object.entries(this.values).forEach(([key, value]) =>{//Iterate over all Player, key->player id, value-> object with values
      if(value.TIMER>0){
        value.TIMER-=1
      }
      if(value.TIMER==0){
        value.ATK = value.MATK
        value.HP = value.MHP
        value.TIMER = -1
      }
      if(value.HP<=0 && value.TIMER < 0){
        value.TIMER = value.RT
        value.ATK = 0
      }
      this.ser.write(encodeMessages("vars",[value.HP, value.MHP, value.SP, value.MSP, value.ATK, value.RT, value.PTS, value.KILL],key))
    })
  }
  hit(sendID, recieveID){//required function, gets called when a player is hit, sendID is the ID of the player who has shot the player, recieveID is the ID of the player who has been shot
    if(this.teams[sendID] != this.teams[recieveID]){
      this.values[recieveID].HP -= this.values[sendID].ATK
    }
  }
  stop(){//required function, gets called when the game has been stopped
    this.ser.write(encodeMessage("gamestate",1))
  }
  setTeams(teams){//required if game has Teams, gets called when teams are set using the ui, teams contains an object with all teams
    this.teams = teams;
    log.debug(teams)
    for(i of this.players) {
      log.debug(i)
      this.ser.write(encodeMessages("color",this.colors[teams[i]].rgb, i))
    }
  }
}

function encodeMessage(type, message, id){
  if(id == undefined){
    buf = "@"+type+message+"\n"
  }else{
    buf = id+"@"+type+message+"\n"
  }
  return buf
}

function encodeMessages(type, messages, id){
  if(id == undefined){
    buf = "@"+type
  }else{
    buf = id+"@"+type
  }
  for(i of messages){
    buf = buf + i + "#"
  }
  buf = buf.slice(0, -1)+"\n"
  return buf
}

module.exports = game;