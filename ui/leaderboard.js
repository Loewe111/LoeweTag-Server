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
  if(!players) return -1;
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
}

// test all teams with random scores
Object.entries(teamNames).forEach(([id, name]) => {
  generateTeamLeaderboard(id, name, [
    { name: "Player 1", score: Math.floor(Math.random() * 100) },
    { name: "Player 2", score: Math.floor(Math.random() * 100) },
    { name: "Player 3", score: Math.floor(Math.random() * 100) },
  ]);
});