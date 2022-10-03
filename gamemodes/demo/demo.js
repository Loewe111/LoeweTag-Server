class game{
  constructor(devices, ser){
    this.values = {}
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
      }
    })
    this.intervalID = 0
    this.ser = ser
    console.log(this.values)
    this.ser.write(encodeMessage("gamestate",1))
    this.ser.write(encodeMessages("color",[0,0,255]))
  }
  init(){
    Object.entries(this.values).forEach(([key, value]) =>{
      this.ser.write(encodeMessages("vars",[value.HP, value.MHP, value.SP, value.MSP, value.ATK, value.RT, value.PTS, value.KILL],key))
    })
  }
  start(){
    this.ser.write(encodeMessage("gamestate",2))
    Object.entries(this.values).forEach(([key, value]) =>{//Iterate over all Player, key->player id, value-> object with values
      value.TIMER = 1
    })
  }
  tick(){
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
  hit(sendID, recieveID){
    this.values[recieveID].HP -= this.values[sendID].ATK
    // this.ser.write(encodeMessages("vars",[this.values[recieveID].HP, this.values[recieveID].MHP, this.values[recieveID].SP, this.values[recieveID].MSP, this.values[recieveID].ATK, this.values[recieveID].RT, this.values[recieveID].PTS, this.values[recieveID].KILL],key))
    // this.ser.write(encodeMessages("vars",[this.values[sendID].HP, this.values[sendID].MHP, this.values[sendID].SP, this.values[sendID].MSP, this.values[sendID].ATK, this.values[sendID].RT, this.values[sendID].PTS, this.values[sendID].KILL],key))
  }
  stop(){
    this.ser.write(encodeMessage("gamestate",0))
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