const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const fs = require("fs");

const Logging = require("./libs/logging"); //Logging class
const Link = require("./libs/link"); //Link class

log = new Logging(4); //Create logger
log.info("Starting up..."); //Log startup

var link = new Link(); //Create link

devices = {};
gamestate = {
  state: 0,
  running: false,
};

ser = NaN;

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
    link.locateDevice(ip);
  });

  ipcMain.handle("serial:getDevices", () => {
    //Get serial devices
    return SerialPort.list();
  });

  ipcMain.handle("serial:connectTo", (event, port) => {
    //Connect to serial device
    devices = {}; //Clear devices
    ser = new SerialPort({ path: port, baudRate: 115200 }); //Create serial port
    link = new Link(ser); //Create link
    parser = new ReadlineParser(); //Create parser
    ser.pipe(parser); //Pipe serial port to parser
    parser.on("data", handleSerial); //Setup parser data handler
    link = new Link(ser); //Create link
    link.getDevices(); //Request devices
    link.getInformation(); //Request information of already connected devices
  });

  ipcMain.handle("serial:disconnect", (event, port) => {
    //Disconnect from serial device
    ser.close(); //Close serial port
  });

  ipcMain.handle("serial:getState", () => {
    //Get serial state
    return {
      isOpen: ser.isOpen,
      path: ser.path,
      baudRate: ser.baudRate,
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
    gamemode = new gamemodes[gameid].game(devices, link); //Create gamemode
    gamemode.init(); //Initialize gamemode
    gamestate.gameid = gameid;
  });

  ipcMain.handle("game:startGame", () => {
    //Start game
    gamemode.start();
    gamestate.running = true;
    gamemode.intervalID = setInterval(() => {
      //Start gamemode interval
      gamemode.tick();
    }, 500);
  });

  ipcMain.handle("game:stopGame", () => {
    //Stop game
    gamemode.stop();
    gamestate.running = false;
    clearInterval(gamemode.intervalID);
  });

  ipcMain.handle("game:getPlayers", () => {
    //Get players
    if (typeof gamemode !== "undefined") {
      //If gamemode is defined, return players
      return gamemode.players;
    } else {
      return [];
    }
  });

  ipcMain.handle("game:setTeams", (event, teams) => {
    //Set teams
    if (typeof gamemode !== "undefined") {
      //If gamemode is defined, set teams
      gamemode.setTeams(teams);
    }
  });

  ipcMain.handle("game:getTeams", (event) => {
    //Get teams
    if (typeof gamemode !== "undefined") {
      //If gamemode is defined, return teams
      return gamemode.teams;
    } else {
      return {};
    }
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

function handleSerial(data) {
  // Handle serial data
  try {
    //Try to parse data
    message = JSON.parse(data);
  } catch (e) {
    //If parsing fails, log error and return
    log.error("Error while parsing data: '" + e + "', Original Input: " + data);
    return;
  }
  log.debug(message);
  if (message.type == "devices") {
    // Remove all devices that are not in message
    Object.keys(devices).forEach((key) => {
      if (!message.devices.includes(key)) {
        delete devices[key];
      }
    });
    // Add new devices
    for(device of message.devices) {
      if (!devices.hasOwnProperty(device)) {
        devices[device] = {
          type: "unknown",
          firmware: "unknown"
        };
      }
    }
  } else if (message.type == "device_information") {
    //If message is a deviceInfo message, save it to devices
    devices[message.ip].firmware = message.firmware;
    devices[message.ip].type = message.device_type;
    devices[message.ip].id = message.device_id;
  } else if (message.type == "hit") { 
    //If message is a hit message, handle it
    if (
      typeof gamemode !== "undefined" &&
      gamemode.players.includes(message.sender) &&
      gamemode.players.includes(message.ip)
    ) {
      //If gamemode is defined and players exist, handle hit
      gamemode.hit(message.ip, message.sender); //Call gamemode hit function
    }
  } else {
    log.warn("Unknown Message Type: " + message.type); //If message type is unknown, log warning
  }
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
