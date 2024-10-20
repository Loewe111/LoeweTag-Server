const containers = $('.team .players').toArray();
containers.forEach(container => {
    new Sortable(container, {
        group: 'teams', // Set the same group to allow drag-and-drop between containers
        animation: 100,
        onAdd: move
    });
});

async function returnAllPlayers() {
    // return all players to unassigned
    let gameTeams = await window.teams.getTeams();
    delete gameTeams[-1];
    console.log(gameTeams);
    Object.entries(gameTeams).forEach(([id, team]) => {
        team.players.forEach((player) => {
            window.teams.movePlayer(player, -1);
        });
    });
    updateTeams();
}

async function spreadPlayers() {
    let gameTeams = await window.teams.getTeams();
    unassigned = gameTeams[-1];
    delete gameTeams[-1];
    let players = unassigned.players;
    // randomize player order
    players.sort(() => Math.random() - 0.5);
    let teamCount = Object.keys(gameTeams).length;
    let teamsArray = Object.values(gameTeams);
    console.log(teamsArray);
    let teamIndex = 0;
    players.forEach((player) => {
        window.teams.movePlayer(player, teamsArray[teamIndex].id);
        teamIndex = (teamIndex + 1) % teamCount;
    });
    updateTeams();
}

function rename(id, element) {
    const name = element.value;
    window.teams.rename(id, name);
}

function move(evt) {
    let element = evt.item;
    let newTeam = parseInt(evt.to.parentElement.getAttribute('data-id'));
    window.teams.movePlayer(element.textContent, newTeam);
}

function addTeam() {
    window.teams.addTeam();
    updateTeams()
}

async function removeAllTeams() {
    let gameTeams = await window.teams.getTeams();
    delete gameTeams[-1];
    Object.keys(gameTeams).forEach((id) => {
        window.teams.removeTeam(id);
        console.log(id);
    });
    updateTeams();
}

function createTeam(id, name, color) {
    const team = document.createElement('div');
    team.setAttribute('data-id', id);
    team.classList.add('team');
    team.style.setProperty('--team-color', `rgb(${color.r}, ${color.g}, ${color.b})`);
    const title = document.createElement('div');
    title.classList.add('title');
    const team_name = document.createElement('input');
    team_name.classList.add('team-name');
    team_name.value = name;
    team_name.onchange = async () => {
        rename(id, team_name);
    };
    delete_button = $('<button class="btn btn-dark btn-symbol"><i class="fa-solid fa-trash"></i></button>')
    delete_button.click(() => {
        window.teams.removeTeam(id);
        updateTeams();
    });
    const players = document.createElement('div');
    players.classList.add('players');
    new Sortable(players, {
        group: 'teams',
        animation: 100,
        onAdd: move
    });
    $(title).append(team_name);
    $(title).append(delete_button);
    $(team).append(title);
    $(team).append(players);
    $('#teams').append(team);
    return team;
}

async function updateTeams() {
    let gameTeams = await window.teams.getTeams();
    let unassigned = gameTeams[-1];
    delete gameTeams[-1];
    $('#teams').empty();
    Object.entries(gameTeams).forEach(([id, team]) => {
        let teamElement = createTeam(id, team.name, team.color);
        team.players.forEach((player) => {
            let playerElement = document.createElement('span');
            playerElement.textContent = player;
            $(teamElement).find('.players').append(playerElement);
        });
    });

    $('#no-team .players').empty();
    unassigned.players.forEach((player) => {
        let playerElement = document.createElement('span');
        playerElement.textContent = player;
        $('#no-team .players').append(playerElement);
    });
    // set unassigned team color
    $('#no-team').css('--team-color', `rgb(${unassigned.color.r}, ${unassigned.color.g}, ${unassigned.color.b})`);
}

updateTeams();