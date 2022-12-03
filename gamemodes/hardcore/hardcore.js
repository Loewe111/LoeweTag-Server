class game{ //the class needs to be called "game"
  constructor(devices, ser){//devices is the object containing all connected devices, ser is the serial object used to send values
    this.intervalID = 0 //required, do not touch
    this.values = {} // required Object for keeping values for each player including points
    this.teams = []
    this.players = [] //this value is required, it is a list containing the ids of all participating players
    Object.entries(devices).forEach(([key, value]) => {
      if(value.type == "gun"){
        this.values[key] = {
          HP: 60,
          MHP: 60,
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
    this.ser = ser
    this.colors = [
      {name:"Red", rgb:[255,0,0]},
      {name:"Green", rgb:[0,255,0]},
      {name:"Blue", rgb:[0,0,255]},
      {name:"Yellow",rgb:[255,255,0]},
      {name:"Purple",rgb:[255,0,255]},
      {name:"Cyan",rgb:[0,255,255]},
      {name:"Orange",rgb:[255,128,0]}
    ]
  }
  init(){//required function, gets called when the gamemode gets selected
    this.ser.write(encodeMessage("gamestate",1))
    this.ser.write(encodeMessages("color",[0,50,0]))
    Object.entries(this.values).forEach(([key, value]) =>{
      this.ser.write(encodeMessages("vars",[value.HP, value.MHP, value.SP, value.MSP, value.ATK, value.RT, value.PTS, value.KILL],key))
    })
  }
  start(){//requirede function, gets called when the game starts
    this.ser.write(encodeMessage("gamestate",2))
    Object.entries(this.values).forEach(([key, value]) =>{
      value.ATK = value.MATK
      this.ser.write(encodeMessages("vars",[value.HP, value.MHP, value.SP, value.MSP, value.ATK, value.RT, value.PTS, value.KILL],key))
    })
  }
  tick(){//required function, gets called every 0.5s while game is running
    Object.entries(this.values).forEach(([key, value]) =>{
      this.ser.write(encodeMessages("vars",[value.HP, value.MHP, value.SP, value.MSP, value.ATK, value.RT, value.PTS, value.KILL],key))
    })
  }
  hit(sendID, recieveID){//required function, gets called when a player is hit, sendID is the ID of the player who has shot the player, recieveID is the ID of the player who has been shot
    this.values[recieveID].HP -= this.values[sendID].ATK
    this.values[sendID].PTS += 10
    if(this.values[recieveID].HP <= 0){
      this.values[recieveID].ATK = 0
      this.values[recieveID].HP = 0
      this.ser.write(encodeMessages("color",[255,0,0],recieveID))
      this.values[sendID].PTS += 20
      this.values[sendID].KILL += 1
    }
  }
  stop(){//required function, gets called when the game has been stopped
    this.ser.write(encodeMessage("gamestate",1))
  }
}

function encodeMessage(type, message, id){  //used to encode a message to send to every or a specific device
  if(id == undefined){
    buf = "@"+type+message+"\n"
  }else{
    buf = id+"@"+type+message+"\n"
  }
  return buf
}

function encodeMessages(type, messages, id){ //used to encode multiple messages to send to every or a specific device
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

module.exports = game