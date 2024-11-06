class Club{
    constructor(name) {
        this.name = name;

        this.leagueStats = {}
    }
}

class League{
    constructor(name, clubs=[]) {
        this.name = name;
        this.clubs = clubs;
    }
}

class Match{
    constructor(homeClub, awayClub, homeGoals, awayGoals, league){
        this.homeClub = homeClub;
        this.awayClub = awayClub;
        this.homeGoals = homeGoals;
        this.awayGoals = awayGoals;
        this.league = league;
    }
}

function calculateInput(league, team1, goals1, team2, goals2){
    dLeagues
}