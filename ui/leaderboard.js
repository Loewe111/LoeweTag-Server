//create an object containing the team ids and their names
teamNames = {
  "team-red": "Team Red",
  "team-green": "Team Green",
  "team-blue": "Team Blue",
  "team-yellow": "Team Yellow",
  "team-purple": "Team Purple",
  "team-cyan": "Team Cyan",
  "team-orange": "Team Orange",
};
//create an object containing the team ids and their classes
teamClasses = {
  "team-red": "bg-team-red",
  "team-green": "bg-team-green",
  "team-blue": "bg-team-blue",
  "team-yellow": "bg-team-yellow",
  "team-purple": "bg-team-purple",
  "team-cyan": "bg-team-cyan",
  "team-orange": "bg-team-orange",
};

function generateLeaderboard(id, name, players) {
  //return false if there are no players in the team
  if (players.length == 0) return false;
  //Overall score
  parent = document.getElementById(id);
  headerDiv = document.createElement("div");
  headerDiv.classList = "d-flex justify-content-between mx-1 mb-1";
  header = document.createElement("h2");
  header.innerHTML = name;

  var sum = 0;
  players.forEach((player) => {
    sum += player.score;
  });
  scoreSum = document.createElement("h2");
  scoreSum.innerHTML = sum;

  headerDiv.appendChild(header);
  headerDiv.appendChild(scoreSum);
  parent.innerHTML = "";
  parent.appendChild(headerDiv);

  //Scores for each player

  //sort players by score
  players.sort((a, b) => {
    return b.score - a.score;
  });

  players.forEach((player) => {
    playerDiv = document.createElement("div");
    playerDiv.classList = "d-flex justify-content-between mx-1";
    playerName = document.createElement("h4");
    playerName.innerHTML = player.name;
    playerScore = document.createElement("h4");
    playerScore.innerHTML = player.score;
    playerDiv.appendChild(playerName);
    playerDiv.appendChild(playerScore);
    parent.appendChild(playerDiv);
  });

  //show the leaderboard
  parent.classList.remove("hidden");
  return true; //return true if the leaderboard is displayed
}

//create the leaderboard fields
function createLeaderboardFields(teamsArray, MAX_COLUMNS) {
  //create a div for each team and put them in an object
  divs = {};
  teamsArray.forEach((team) => {
    //create the div
    div = document.createElement("div");
    div.classList = "container text-black rounded m-2 p-2 hidden ";
    div.classList.add(teamClasses[team.id]);
    div.id = team.id;
    //put the div in the object
    divs[team.id] = div;
  });

  //get the leaderboard div
  leaderboard = document.getElementById("leaderboard");
  var columnsLeft = 0; //number of columns left to fill
  //display the teams in the leaderboard
  Object.values(divs).forEach((team) => {
    if(columnsLeft == 0){
      //create a new row
      row = document.createElement("div");
      row.classList = "container d-flex justify-content-around";
      //add the row to the leaderboard
      leaderboard.appendChild(row);
      //reset the columnsLeft
      columnsLeft = MAX_COLUMNS;
    }
    //add the div to the row
    row.appendChild(divs[team.id]);
    //decrement the columnsLeft
    columnsLeft--;
  });
}

//generate a teamsArray from the scores and teams
function generateTeamsArray(scores, teams) {
  //create an array of objects containing the player's name and score
  var players = [];
  for (player in scores) {
    players.push({ name: player, score: scores[player] });
  }

  //create an array of objects containing the team id and the players in that team
  var teamsArray = [];
  for (team in teamNames) {
    teamsArray.push({ id: team, players: [] });
  }

  //add the players to their respective teams
  for (player in teams) {
    teamsArray[teams[player]].players.push({
      name: player,
      score: scores[player],
    });
  }
  //return the teamsArray
  return teamsArray;
}

function generateScoresArray(scores) {
  //create an array of objects containing the player's name and score
  var players = [];
  for (player in scores) {
    players.push({ name: player, score: scores[player] });
  }
  //sort players by score
  players.sort((a, b) => {
    return b.score - a.score;
  });
  return players;
}

function displayLeaderboard(players){
  //create div
  var leaderboard = document.getElementById("leaderboard");
  var parentDiv = document.createElement("div");
  parentDiv.classList = "container d-flex justify-content-around";
  var div = document.createElement("div");
  div.classList = "container text-black rounded m-2 p-2 bg-team-none";
  div.id = "team-none";

  //sort players by score
  players.sort((a, b) => {
    return b.score - a.score;
  });

  //display the scores
  players.forEach((player) => {
    playerDiv = document.createElement("div");
    playerDiv.classList = "d-flex justify-content-between mx-1";
    playerName = document.createElement("h4");
    playerName.innerHTML = player.name;
    playerScore = document.createElement("h4");
    playerScore.innerHTML = player.score;
    playerDiv.appendChild(playerName);
    playerDiv.appendChild(playerScore);
    div.appendChild(playerDiv);
  });

  //clear leaderboard and put the div in the leaderboard
  parentDiv.appendChild(div);
  leaderboard.appendChild(parentDiv);
  
}

//display the leaderboard
function displayTeamLeaderboard(teamsArray) {
  //display the leaderboard
  teamsArray.forEach((team) => {
    generateLeaderboard(team.id, teamNames[team.id], team.players);
  });
}

//update the leaderboard
async function updateTeamLeaderboard() {
  //get the scores from the server
  var scores = await window.game.getScores();
  //get the teams from the server
  var teams = await window.game.getTeams();
  //generate the teamsArray
  var teamsArray = generateTeamsArray(scores, teams);
  //display the leaderboard
  createLeaderboardFields(teamsArray, 3);
  displayTeamLeaderboard(teamsArray);
}

async function updateLeaderboard() {
  //get the scores from the server
  var scores = await window.game.getScores();
  //generate the scoresArray
  var players = generateScoresArray(scores);
  //display the leaderboard
  displayLeaderboard(players);
}

async function teamsEnabled() {
  //get the gamestate from the server
  var gamestate = await window.game.getState();
  //get the gamemodes from the server
  var gamemodes = await window.game.getGamemodes();
  //get the current gamemode
  var gamemode = gamemodes[gamestate.gameid];
  //return true if teams are enabled
  return gamemode.hasTeams;
}

async function main() {
  //check if teams are enabled
  if (await teamsEnabled()) {
    //update the team leaderboard
    await updateTeamLeaderboard();
  } else {
    //update the leaderboard
    await updateLeaderboard();
  }
}

//update the leaderboard every second
// setInterval(main, 1000);

//update the leaderboard once when the page loads
main();
