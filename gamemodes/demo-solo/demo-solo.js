/**
 * The game mode class.
 * @param {Object} devices - The devices object.
 * @param {Link} link - The link object.
 */
class game{
  constructor(devices, link){
    this.values = {}
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
    this.intervalID = 0
    this.link = link
    this.link.setGamestate(1)
    this.link.setColor([0,0,255])
  }
  init(){
    Object.entries(this.values).forEach(([id, value]) =>{
      this.link.setValues(value, id)
    })
  }
  start(){
    this.link.setGamestate(2)
    Object.entries(this.values).forEach(([id, value]) =>{//Iterate over all Player, id->player id, value-> object with values
      value.TIMER = 1
    })
  }
  tick(){
    Object.entries(this.values).forEach(([id, value]) =>{//Iterate over all Player, id->player id, value-> object with values
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
      this.link.setValues(value, id)
    })
  }
  hit(sendID, recieveID){
    this.values[recieveID].HP -= this.values[sendID].ATK
  }
  stop(){
    this.link.setGamestate(1)
  }

}

module.exports = game;