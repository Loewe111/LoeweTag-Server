const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const fs = require("fs");

const Logging = require("./libs/logging"); //Logging class
const serialHandler = require("./libs/serialHandler"); //Serial handler class
const Player = require("./libs/player"); //Player class
const Teams = require("./libs/teams"); //Teams class
const { send } = require("process");

log = new Logging(4); //Create logger
log.info("Starting up..."); //Log startup

var serHandler = new serialHandler(handleSerial); //Create serial handler

devices = {};
players = {};
gamestate = {
  state: 0,
  running: false,
};
teams = new Teams(players);

// add 10 players for testing
for (let i = 0; i < 10; i++) {
  players[i] = new Player(i, playerCallback);
  teams.defaultTeam.addPlayer(players[i]);
}

serPort = NaN;

var leaderboardOpen = false;

function toggleLeaderboardWindow() {
  if (!leaderboardOpen) {
    leaderboardWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"), //Preload script
      },
      autoHideMenuBar: true, //Hide menu bar
      icon: "icons/icon.png", //Set icon
    });
    leaderboardWindow.loadFile("ui/leaderboard-fullscreen.html"); //Load UI
    leaderboardOpen = true;
    leaderboardWindow.on("closed", () => {
      leaderboardOpen = false;
    });
  } else {
    //Close window
    leaderboardWindow.close();
    leaderboardOpen = false;
  }
}

function createWindow() {
  //Create window
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), //Preload script
    },
    autoHideMenuBar: true, //Hide menu bar
    icon: "icons/icon.png", //Set icon
  });

  win.loadFile("ui/index.html"); //Load UI
  win.maximize(); //Maximize window

  handleIpc(); //Setup IPC handlers
}

function handleIpc() {
  //Setup IPC-main handlers
  ipcMain.handle("devices:getDevices", () => {
    //Get devices
    return devices;
  });

  ipcMain.handle("devices:locateDevice", (event, ip) => {
    //Locate device
    // TODO: Implement on pistols
  });

  ipcMain.handle("serial:getDevices", () => {
    //Get serial devices
    return SerialPort.list();
  });

  ipcMain.handle("serial:connectTo", (event, port) => {
    //Connect to serial device
    devices = {}; //Clear devices
    serPort = new SerialPort({ path: port, baudRate: 115200 }); //Create serial port
    serHandler.port = serPort; 
    serPort.on("data", (data) => {
      serHandler.dataHandler(data);
    });
    serHandler.send(serHandler.message_types["MESSAGE_INIT_MASTER"]); //Request devices list
  });

  ipcMain.handle("serial:disconnect", (event, port) => {
    //Disconnect from serial device
    serPort.close(); //Close serial port
  });

  ipcMain.handle("serial:getState", () => {
    //Get serial state
    return {
      isOpen: serPort.isOpen,
      path: serPort.path,
      baudRate: serPort.baudRate,
    };
  });

  ipcMain.handle("game:getGamemodes", () => {
    //Get gamemodes
    return gamemodesInfo;
  });

  ipcMain.handle("game:getState", () => {
    //Get gamestate
    return gamestate;
  });

  ipcMain.handle("game:selectGame", (event, gameid) => {
    //Select gamemode
    if (typeof gamemode !== "undefined") {
      //If gamemode is defined, stop it
      gamemode.stop();
      gamestate.running = false;
      clearInterval(gamemode.intervalID);
    }
    gamemode = new gamemodes[gameid].game(players); //Create gamemode
    gamemode.init(); //Initialize gamemode
    gamestate.gameid = gameid;
    serHandler.send(serHandler.message_types["MESSAGE_SET_GAMESTATE"], { state: 0 });
    console.log(serHandler.message_types["MESSAGE_SET_GAMESTATE"]);
  });

  ipcMain.handle("game:startGame", () => {
    //Start game
    gamemode.start();
    gamestate.running = true;
    serHandler.send(serHandler.message_types["MESSAGE_SET_GAMESTATE"], { state: 1 });
    gamemode.intervalID = setInterval(() => {
      //Start gamemode interval
      gamemode.tick();
    }, 500);
  });

  ipcMain.handle("game:stopGame", () => {
    //Stop game
    gamemode.stop();
    gamestate.running = false;
    serHandler.send(serHandler.message_types["MESSAGE_SET_GAMESTATE"], { state: 0 });
    clearInterval(gamemode.intervalID);
  });

  ipcMain.handle("game:getPlayers", () => {
    //Get players
    console.log(players);
    return players;
  });

  ipcMain.handle("teams:getTeams", (event) => {
    console.log(teams.getTeams());
    return teams.getTeams();
  });

  ipcMain.handle("teams:addTeam", (event) => {
    return teams.addTeam();
  });

  ipcMain.handle("teams:removeTeam", (event, id) => {
    return teams.removeTeam(id);
  });

  ipcMain.handle("teams:movePlayer", (event, player, team) => {
    return teams.movePlayer(player, team);
  });

  ipcMain.handle("teams:rename", (event, id, name) => {
    return teams.rename(id, name);
  });

  ipcMain.handle("game:getScores", (event) => {
    if (typeof gamemode !== "undefined") {
      //If gamemode is defined, return scores
      buf = {};
      Object.entries(gamemode.values).forEach(([key, value]) => {
        buf[key] = value.PTS;
      });
      return buf;
    } else {
      return [];
    }
  });

  ipcMain.handle("game:setSettings", (event, settings) => {
    if (typeof gamemode !== "undefined") {
      //If gamemode is defined, set settings
      gamemode.setSettings(settings);
    }
  });

  ipcMain.handle("game:getSettings", (event) => {
    if (typeof gamemode !== "undefined") {
      //If gamemode is defined, return settings
      return gamemode.settings;
    } else {
      return [];
    }
  });

  ipcMain.handle("game:toggleLeaderboardWindow", () => {
    //Toggle leaderboard window
    toggleLeaderboardWindow();
  });
}

function handleSerial(type, data) {
  log.debug(type);
  if (type == serHandler.message_types["MESSAGE_DEVICES_LIST"]) {
    let newDevices = {};
    data.forEach((device) => {
      newDevices[device.id] = device;
      if (players[device.id] == undefined && device.type == 1) {
        players[device.id] = new Player(device.id, playerCallback);
        teams.defaultTeam.addPlayer(players[device.id]);
        console.log("new player added");
        console.log(players);
        console.log(teams);
        sendPlayer(device.id);
      }
    });
    devices = newDevices;
  } else if (type == serHandler.message_types["MESSAGE_HIT"]) { 
    //If message is a hit message, handle it
    if (typeof gamemode !== "undefined") {
      //If gamemode is defined and players exist, handle hit
      gamemode.hit(data.shooter, data.target); //Call gamemode hit function
    }
  } else if (type == serHandler.message_types["MESSAGE_REQUEST_INFO"]) {
    if (players[data.id] != undefined) {
      sendPlayer(data.id);
    } else {
      log.warn("Player requested info, but player does not exist: " + data.id);
    }
  } else {
    log.warn("Unknown Message Type: " + type); //If message type is unknown, log warning
  }
}

function playerCallback(player, type) {
  if (type == "health") {
    serHandler.send(serHandler.message_types["MESSAGE_SET_HEALTH"], {
      health: player.health,
      maxHealth: player.maxHealth,
    }, player.id);
  } else if (type == "weapon") {
    serHandler.send(serHandler.message_types["MESSAGE_SET_WEAPON"], player.weapon, player.id);
  } else if (type == "color") {
    serHandler.send(serHandler.message_types["MESSAGE_SET_COLOR"], player.color, player.id);
  }
}

function sendPlayer(id) {
  player = players[id];
  serHandler.send(serHandler.message_types["MESSAGE_SET_HEALTH"], {
    health: player.health,
    maxHealth: player.maxHealth,
  }, player.id);
  serHandler.send(serHandler.message_types["MESSAGE_SET_WEAPON"], player.weapon, player.id);
  serHandler.send(serHandler.message_types["MESSAGE_SET_COLOR"], player.color, player.id);
}

//Load gamemodes
function loadGamemodes(pathString = "gamemodes") {
  gamemodes = {};
  gamemodesInfo = {};
  //Load gamemodes from path
  plugins = JSON.parse(
    fs.readFileSync(path.join(__dirname, pathString, "gamemodes.json"))
  ); //Read gamemodes.json
  Object.entries(plugins).forEach(([name, plugin]) => {
    //For each gamemode
    info = JSON.parse(
      fs.readFileSync(path.join(__dirname, pathString, plugin.info))
    ); //Read info JSON file
    gamemodes[name] = {
      //Add gamemode to gamemodes object
      game: require(path.join(__dirname, pathString, plugin.path)),
      name: info.name,
      description: info.description,
      version: info.version,
      versionString: info.versionString,
      hasTeams: info.hasTeams,
      hasSettings: info.hasSettings,
      settings: info.settings,
    };
    gamemodesInfo[name] = {
      //Add gamemode to gamemodesInfo object
      name: info.name,
      description: info.description,
      version: info.version,
      versionString: info.versionString,
      hasTeams: info.hasTeams,
      hasSettings: info.hasSettings,
      settings: info.settings,
    };
  });
}

//Init Code
loadGamemodes();

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  log.info("Quitting...");
  app.quit(); //Quit app when window is closed
});
