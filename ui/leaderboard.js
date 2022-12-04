//create an object containing the team ids and their names
teamNames = {
  "team-red": "Team Red",
  "team-blue": "Team Blue",
  "team-green": "Team Green",
  "team-yellow": "Team Yellow",
  "team-purple": "Team Purple",
  "team-cyan": "Team Cyan",
  "team-orange": "Team Orange",
};

function generateTeamLeaderboard(id, name, players) {
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


//display the leaderboard
function displayLeaderboard(scores, teams) {
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

  //display the leaderboard
  teamsArray.forEach((team) => {
    generateTeamLeaderboard(team.id, teamNames[team.id], team.players);
  });
}

//update the leaderboard
async function updateLeaderboard() {
  //get the scores from the server
  var scores = await window.game.getScores();
  //get the teams from the server
  var teams = await window.game.getTeams();
  //display the leaderboard
  displayLeaderboard(scores, teams);
}

//update the leaderboard every second
setInterval(updateLeaderboard, 1000);