const { app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const fs = require("fs")

const Logging = require("./logging.js") //Logging class
const Link = require("./link.js") //Link class

log = new Logging(4) //Create logger
log.info("Starting up...") //Log startup

var link = new Link() //Create link

devices = {}
gamestate = {
  state: 0,
  running: false
}

ser = NaN

const createWindow = () => { //Create window
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js') //Preload script
    },
    icon:'icons/icon.png' //Set icon
  })

  win.loadFile('ui/index.html') //Load UI
  win.maximize() //Maximize window

  handleIpc() //Setup IPC handlers
}

function handleIpc(){ //Setup IPC-main handlers
  ipcMain.handle('devices:getDevices', ()=> { //Get devices
    return devices
  })

  ipcMain.handle("serial:getDevices", ()=> { //Get serial devices
    return SerialPort.list()
  })

  ipcMain.handle("serial:connectTo", (event, port)=> { //Connect to serial device
    ser = new SerialPort({path: port, baudRate: 115200}) //Create serial port
    link = new Link(ser) //Create link
    parser = new ReadlineParser() //Create parser
    ser.pipe(parser) //Pipe serial port to parser
    ser.write("@init") //Send initailization message
    parser.on('data', handleSerial) //Setup parser data handler
    link = new Link(ser) //Create link
  })

  ipcMain.handle("serial:disconnect", (event, port)=> { //Disconnect from serial device
    ser.close() //Close serial port
  })

  ipcMain.handle("serial:getState", () => { //Get serial state
    return{
      isOpen: ser.isOpen,
      path: ser.path,
      baudRate: ser.baudRate
    }
  })

  ipcMain.handle("game:getGamemodes", () => { //Get gamemodes
    return gamemodesInfo
  })
  
  ipcMain.handle("game:getState", () => { //Get gamestate
    return gamestate
  })

  ipcMain.handle("game:selectGame", (event, gameid) => { //Select gamemode
    if(typeof gamemode !== 'undefined'){ //If gamemode is defined, stop it
      gamemode.stop()
      gamestate.running = false
      clearInterval(gamemode.intervalID)
    }
    gamemode = new gamemodes[gameid].game(devices, link) //Create gamemode
    gamemode.init() //Initialize gamemode
    gamestate.gameid = gameid
  })

  ipcMain.handle("game:startGame", () => { //Start game
    gamemode.start()
    gamestate.running = true
    gamemode.intervalID = setInterval(()=>{//Start gamemode interval
      gamemode.tick()
    }, 500) 
  })

  ipcMain.handle("game:stopGame", () => { //Stop game
    gamemode.stop()
    gamestate.running = false
    clearInterval(gamemode.intervalID)
  })

  ipcMain.handle("game:getPlayers", () => { //Get players
    if(typeof gamemode !== 'undefined'){ //If gamemode is defined, return players
      return gamemode.players
    }else{
      return []
    }
  })

  ipcMain.handle("game:setTeams", (event, teams) => { //Set teams
    if(typeof gamemode !== 'undefined'){ //If gamemode is defined, set teams
      gamemode.setTeams(teams)
    }
  })

  ipcMain.handle("game:getTeams", (event) => { //Get teams
    if(typeof gamemode !== 'undefined'){ //If gamemode is defined, return teams
      return gamemode.teams
    }else{
      return []
    }
  })
  
  ipcMain.handle("game:getScores", (event) => {
    if(typeof gamemode !== 'undefined'){ //If gamemode is defined, return scores
      buf = {}
      Object.entries(gamemode.values).forEach(([key, value]) => {
        buf[key] = value.PTS
      });
      return buf
    }else{
      return []
    }
  })
}


function handleSerial(data){// Handle serial data
  data = data.replaceAll("'",'"') //Replace all ' with " for compability with old gun software
  try { //Try to parse data
    message = JSON.parse(data)
  } catch (e) { //If parsing fails, log error and return
    log.error("Error while parsing data: '"+e+"', Original Input: "+data)
    return
  }
  log.debug(message)
  if(message.type == "thisNode"){ //If message is a thisNode message, save it to devices as master
    devices[message.id] = {
      master: true,
      firmware: message.fw,
      type: "master"
    }
  }else if(message.type == "connectionChange"){ //If message is a connectionChange message, save it to devices
    Object.entries(devices).forEach(([key, value]) => {
      if(!value.master && !message.nodes.includes(key)){
        delete devices[key]
      }
    })
    message.nodes.forEach((id, index)=>{
      if(!(id in devices)){
        devices[id] = {master: false}
      }
    })
  }else if(message.type == "deviceInfo"){ //If message is a deviceInfo message, save it to devices
    devices[message.id].firmware = message.fw
    devices[message.id].type = message.deviceType
  }else if(message.type == "request"){ //If message is a request message, handle it
    if(message.request == "gamestate"){//If request is gamestate, send gamestate
      link.setGamestate(gamestate.state, message.from)
    }
  }else if(message.type == "hit"){//If message is a hit message, handle it
    if(typeof gamemode !== 'undefined' && gamemode.players.includes(message.id)){//If gamemode is defined, handle hit
      gamemode.hit(message.id, message.from)//Call gamemode hit function
    }
  }else{
    log.warn("Unknown Message Type: "+message.type)//If message type is unknown, log warning
  }
}

function encodeMessage(type, message, id){//Encode message
  if(id == NaN){
    buf = "@"+type+message+"\n"
  }else{
    buf = id+"@"+type+message+"\n"
  }
  log.debug(buf)
  return buf
}

function encodeMessages(type, messages, id){//Encode multiple messages
  if(id == undefined){
    buf = "@"+type
  }else{
    buf = id+"@"+type
  }
  for(i in messages){
    buf = buf + i + "#"
  }
  buf = buf.slice(0, -1)+"\n"
  log.debug(buf)
  return buf
}

//Gamemode Plugin System
gamemodes = {}
gamemodesInfo = {}

//Load gamemodes
function loadGamemodes(pathString="gamemodes"){//Load gamemodes from path
  plugins = JSON.parse(fs.readFileSync(path.join(__dirname, pathString, "gamemodes.json"))) //Read gamemodes.json
  Object.entries(plugins).forEach(([key, value]) => { //For each gamemode
    info = JSON.parse(fs.readFileSync(path.join(__dirname, pathString, value.info))) //Read info JSON file
    gamemodes[key] = { //Add gamemode to gamemodes object
      game: require(path.join(__dirname, pathString, value.path)),
      name: info.name,
      description: info.description,
      version: info.version,
      versionString: info.versionString,
      hasTeams: info.hasTeams
    }
    gamemodesInfo[key] = { //Add gamemode to gamemodesInfo object
      name: info.name, 
      description: info.description,
      version: info.version,
      versionString: info.versionString,
      hasTeams: info.hasTeams
    }
  })
}

loadGamemodes()
//Init Code

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    console.error("Closing App")
    app.quit()  //Quit app when window is closed
})
