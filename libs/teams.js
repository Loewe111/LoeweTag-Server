class Team {
    constructor(id, name, color, players = []) {
        this.id = id;
        this.name = name;
        this.players = players;
        this._color = color;
    }
    addPlayer(player) {
        this.players.push(player);
        player.color = this._color;
        // player.color.r = this._color.r;
        // player.color.g = this._color.g;
        // player.color.b = this._color.b;
        player.team = this.id;
    }
    removePlayer(player) {
        player.team = undefined;
        this.players = this.players.filter((p) => p != player);
    }
    get color() {
        return this._color;
    }
    set color(color) {
        this._color = color;
        this.players.forEach((player) => {
            player.color = color;
        });
    }
    get score() {
        return this.players.reduce((acc, player) => acc + player.points, 0);
    }
}

class Teams {
    constructor(players) {
        this.players = players;
        this.teams = {};
        this.defaultTeam = new Team(-1, "Unassigned", { r: 255, g: 255, b: 255 });
        this.teams[-1] = this.defaultTeam;
        this.defaultColors = [
            { r: 255, g: 0, b: 0 },
            { r: 0, g: 255, b: 0 },
            { r: 0, g: 0, b: 255 },
            { r: 255, g: 255, b: 0 },
            { r: 255, g: 0, b: 255 },
            { r: 0, g: 255, b: 255 }
        ];
        this.idCount = 0;
    }
    addTeam(name, color) {
        let id = this.idCount++;
        if (color == undefined) {
            color = this.defaultColors[id % this.defaultColors.length];
        }
        if (name == undefined) {
            name = "Team " + (id + 1);
        }
        let team = new Team(id, name, color);
        this.teams[id] = team;
        return team;
    }
    removeTeam(id) {
        // Remove all players from the team
        console.log("Removing team", id);
        console.log(this.teams[id]);
        this.teams[id].players.forEach((player) => {
            this.movePlayer(player.id, -1);
        });
        delete this.teams[id];
    }
    getTeam(id) {
        return this.teams[id];
    }
    movePlayer(playerId, teamId) {
        console.log("Moving player", playerId, "to team", teamId);
        let player = this.players[playerId];
        console.log(player);
        if (player.team != undefined && this.teams[player.team] != undefined) {
            this.teams[player.team].removePlayer(player);
        }
        console.log(this.teams);
        console.log(this.teams[teamId], teamId, typeof teamId);
        this.teams[teamId].addPlayer(player);
    }
    getTeams() {
        let teams = {};
        teams[-1] = {
            name: this.defaultTeam.name,
            color: this.defaultTeam.color,
            players: this.defaultTeam.players.map((player) => player.id)
        };
        Object.values(this.teams).forEach((team) => {
            teams[team.id] = {
                id: team.id,
                name: team.name,
                color: team.color,
                players: team.players.map((player) => player.id),
                score: team.score
            };
        });
        return teams;
    }
    rename(id, name) {
        console.log("Renaming team", id, "to", name);
        this.teams[id].name = name;
    }
}

module.exports = Teams;