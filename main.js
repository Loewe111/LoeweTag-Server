const { app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const Logging = require("./logging.js")
const fs = require("fs")

log = new Logging(4)

devices = {}
gamestate = {
  state: 0,
  running: false
}

ser = NaN

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('ui/index.html')

  handleIpc()
}

function handleIpc(){ //Setup IPC-main handlers
  ipcMain.handle('devices:getDevices', ()=> {
    return devices
  })

  ipcMain.handle("serial:getDevices", ()=> {
    return SerialPort.list()
  })

  ipcMain.handle("serial:connectTo", (event, port)=> {
    ser = new SerialPort({path: port, baudRate: 115200})
    parser = new ReadlineParser()
    ser.pipe(parser)
    ser.write(".")
    parser.on('data', handleSerial)
  })

  ipcMain.handle("serial:disconnect", (event, port)=> {
    ser.close()
  })

  ipcMain.handle("serial:getState", () => {
    return{
      isOpen: ser.isOpen,
      path: ser.path,
      baudRate: ser.baudRate
    }
  })

  ipcMain.handle("game:getGamemodes", () => {
    return gamemodesInfo
  })
  
  ipcMain.handle("game:getState", () => {
    return gamestate
  })

  ipcMain.handle("game:selectGame", (event, gameid) => {
    if(typeof gamemode !== 'undefined'){
      gamemode.stop()
      gamestate.running = false
      clearInterval(gamemode.intervalID)
    }
    gamemode = new gamemodes[gameid].game(devices, ser)
    gamemode.init()
    gamestate.gameid = gameid
  })

  ipcMain.handle("game:startGame", () => {
    gamemode.start()
    gamestate.running = true
    gamemode.intervalID = setInterval(()=>{
      gamemode.tick()
    }, 500) 
  })

  ipcMain.handle("game:stopGame", () => {
    gamemode.stop()
    gamestate.running = false
    clearInterval(gamemode.intervalID)
  })
}


function handleSerial(data){
  data = data.replaceAll("'",'"')
  try {
    message = JSON.parse(data)
  } catch (e) {
    log.error("Error while parsing data: '"+e+"', Original Input: "+data)
    return
  }
  log.debug(message)
  if(message.type == "thisNode"){
    devices[message.id] = {
      master: true,
      firmware: message.fw,
      type: "master"
    }
  }else if(message.type == "connectionChange"){
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
  }else if(message.type == "deviceInfo"){
    devices[message.id].firmware = message.fw
    devices[message.id].type = message.deviceType
  }else if(message.type == "request"){
    if(message.request == "gamestate"){
      ser.write(encodeMessage("gamestate",gamestate.state,message.from))
    }
  }else if(message.type == "hit"){
    if(typeof gamemode !== 'undefined'){
      gamemode.hit(message.id, message.from)
    }
  }else{
    log.warn("Unknown Message Type: "+message.type)
  }
}

function encodeMessage(type, message, id){
  if(id == NaN){
    buf = "@"+type+message+"\n"
  }else{
    buf = id+"@"+type+message+"\n"
  }
  log.debug(buf)
  return buf
}

function encodeMessages(type, messages, id){
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
function loadGamemodes(path="./gamemodes"){
  plugins = JSON.parse(fs.readFileSync(path+"/gamemodes.json"))
  Object.entries(plugins).forEach(([key, value]) => {
    info = JSON.parse(fs.readFileSync(path+value.info))
    gamemodes[key] = {
      game: require(path+value.path),
      name: info.name,
      description: info.description,
      version: info.version,
      versionString: info.versionString
    }
    gamemodesInfo[key] = {
      name: info.name,
      description: info.description,
      version: info.version,
      versionString: info.versionString
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
