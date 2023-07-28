const colors = ["Red", "Green", "Blue", "Yellow", "Purple", "Cyan", "Orange"];
teams = {};

async function main() {
  gamestate = await window.game.getState();

  div = document.getElementById("gamestate");
  div.innerHTML = "";
  if (gamestate.gameid != undefined) {
    group = document.createElement("div");
    group.classList = "container bg-danger p-2 mt-2 mb-4 rounded";
    description = document.createElement("h6");
    title = document.createElement("h2");
    button = document.createElement("button");
    button.classList = "btn tbn-lg btn-dark mx-1";
    button.style = "float: right";

    title.innerHTML = gamemodes[gamestate.gameid].name;
    description.innerHTML = "SELECTED:";
    if (gamestate.running) {
      button.innerHTML = "STOP GAME";
    } else {
      button.innerHTML = "START GAME";
    }
    button.onclick = new Function("start()");
    if (gamemodes[gamestate.gameid].hasTeams) {
      button2 = document.createElement("button");
      button2.classList = "btn tbn-lg btn-dark mx-1";
      button2.style = "float: right";
      button2.innerHTML = "TEAMS";
      button2.setAttribute("data-bs-toggle", "modal");
      button2.setAttribute("data-bs-target", "#teamSettings");
      button2.onclick = new Function("refreshTeamTable()");
      title.appendChild(button2);
    }
    if (gamemodes[gamestate.gameid].hasSettings) {
      button3 = document.createElement("button");
      button3.classList = "btn tbn-lg btn-dark mx-1";
      button3.style = "float: right";
      button3.innerHTML = "SETTINGS";
      button3.setAttribute("data-bs-toggle", "modal");
      button3.setAttribute("data-bs-target", "#settings");
      button3.onclick = new Function("refreshSettings()");
      title.appendChild(button3);
    }

    group.appendChild(description);
    group.appendChild(title);
    title.appendChild(button);
    div.appendChild(group);
  }
}

async function setup() {
  gamemodes = await window.game.getGamemodes();
  teams = await window.game.getTeams();

  div = document.getElementById("gamemodes");
  Object.entries(gamemodes).forEach(([key, value]) => {
    //List all available Gamemodes
    group = document.createElement("div");
    group.classList = "container bg-danger p-2 my-2 rounded";
    title = document.createElement("h3");
    description = document.createElement("p");
    version = document.createElement("span");
    version.classList = "badge bg-dark";
    button = document.createElement("button");
    button.classList = "btn tbn-lg btn-dark mx-1";
    button.style = "float: right";

    title.innerHTML = value.name;
    description.innerHTML = value.description;
    version.innerHTML = value.versionString;
    button.innerHTML = "SELECT";
    button.onclick = new Function("select('" + key + "')");

    group.appendChild(title);
    group.appendChild(description);
    title.appendChild(button);
    group.appendChild(version);
    div.appendChild(group);
  });
}

async function refreshTeamTable() {
  table = document.getElementById("teams-table");
  players = await window.game.getPlayers();
  table.innerHTML = "";
  for (i of players) {
    row = table.insertRow(-1);
    row.insertCell(-1).innerHTML = i;
    if (typeof teams[i] !== "undefined") {
      row
        .insertCell(-1)
        .appendChild(getDropdown(colors[teams[i]], colors, "setTeam", i));
    } else {
      row
        .insertCell(-1)
        .appendChild(getDropdown("Color", colors, "setTeam", i));
    }
  }
}

async function refreshSettings() {
  values = await window.game.getSettings();
  settings = gamemodes[gamestate.gameid].settings;
  displaySettings(settings, values);
}

async function displaySettings(settings, values) {
  if (values == undefined) {
    values = {};
  }
  table = document.getElementById("settings-table");
  table.innerHTML = "";
  Object.entries(settings).forEach(([key, value]) => {
    row = table.insertRow(-1);
    row.insertCell(-1).innerHTML = value.name;
    if (value.type == "number") {
      input = document.createElement("input");
      input.type = "number";
      input.classList = "form-control";
      input.id = "setting-" + key;

      if (values[key] != undefined) {
        input.value = values[key];
      } else {
        input.value = value.default;
      }
      group = document.createElement("div");
      group.classList = "input-group";
      unit = document.createElement("span");
      unit.classList = "input-group-text";
      unit.innerHTML = value.unit;
      group.appendChild(input);
      group.appendChild(unit);
      row.insertCell(-1).appendChild(group);
    } else if (value.type == "boolean") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.classList = "form-check-input";
      input.id = "setting-" + key;

      if (values[key] != undefined) {
        input.checked = values[key];
      } else {
        input.checked = value.default;
      }
      row.insertCell(-1).appendChild(input);
    }
  });
}

async function setTeam(team, ip) {
  teams[ip] = team;
  document.getElementById("button-" + ip).innerHTML = colors[team];
}

function getDropdown(buttonString, elements, functionString, parameter) {
  //function to create dropdown
  mainDiv = document.createElement("div");
  mainDiv.classList = "dropdown";
  button = document.createElement("button");
  button.classList = "btn btn-dark dropdown-toggle";
  if (typeof parameter !== "undefined") {
    button.id = "button-" + parameter;
  }
  button.setAttribute("data-bs-toggle", "dropdown");
  button.innerHTML = buttonString;
  list = document.createElement("ul");
  list.classList = "dropdown-menu";
  elements.forEach((value, index) => {
    item = document.createElement("li");
    itemButton = document.createElement("button");
    itemButton.innerHTML = value;
    if (typeof parameter !== "undefined") {
      itemButton.onclick = new Function(
        functionString + "(" + index + ", \"" + parameter + "\")"
      );
    } else {
      itemButton.onclick = new Function(functionString + "(" + index + ")");
    }
    itemButton.classList = "dropdown-item";
    item.appendChild(itemButton);
    list.appendChild(item);
  });

  mainDiv.appendChild(button);
  mainDiv.appendChild(list);
  return mainDiv;
}

async function confirmSettings() {
  settings = gamemodes[gamestate.gameid].settings;
  values = {};
  Object.entries(settings).forEach(([key, value]) => {
    if (value.type == "number") {
      values[key] = document.getElementById("setting-" + key).value;
    } else if (value.type == "boolean") {
      values[key] = document.getElementById("setting-" + key).checked;
    }
  });
  window.game.setSettings(values);
}

async function confirmTeams() {
  window.game.setTeams(teams);
}

async function select(gamemode) {
  window.game.selectGame(gamemode);
}

async function start() {
  if (gamestate.running) {
    window.game.stopGame();
  } else {
    window.game.startGame();
  }
}

setup();
main();
setInterval(main, 2000);
