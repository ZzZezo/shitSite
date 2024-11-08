class Club {
    constructor(name) {
        this.name = name;
        this.leagueStats = {};  // Initializes an empty stats object for each league
    }

    // Initialize league stats only if not already present
    initializeLeagueStats(leagueName) {
        if (!this.leagueStats[leagueName]) {
            this.leagueStats[leagueName] = 0;  // Set initial points to 0 for the league
        }
    }
}

class League {
    constructor(name, clubs = []) {
        this.name = name;
        this.clubs = clubs;
        this.matches = [];
        
        // Initialize league stats for each club in the league
        clubs.forEach(club => club.initializeLeagueStats(this.name));
    }

    addMatch(match) {
        this.matches.push(match);
    }
}

class Match {
    constructor(homeClub, awayClub, homeGoals, awayGoals, leagueName) {
        this.homeClub = homeClub;
        this.awayClub = awayClub;
        this.homeGoals = homeGoals;
        this.awayGoals = awayGoals;
        
        // Find and assign the league object from the predefined list
        this.league = dLeagues.find(leagueObj => leagueObj.name === leagueName);
        
        // Add match to the league if found
        if (this.league) {
            this.league.addMatch(this);
        } else {
            throw new Error(`League ${leagueName} not found.`);
        }
    }

    handleMatch() {
        if (this.homeGoals > this.awayGoals) {
            this.homeClub.leagueStats[this.league.name] += 3;  // Home club wins
        } else if (this.homeGoals < this.awayGoals) {
            this.awayClub.leagueStats[this.league.name] += 3;  // Away club wins
        } else {
            this.homeClub.leagueStats[this.league.name] += 1;  // Draw
            this.awayClub.leagueStats[this.league.name] += 1;
        }
    }
}

// Function to create and handle a match
function calculateInput(leagueName, homeClubName, homeGoals, awayClubName, awayGoals) {
    const homeClub = dClubs.find(club => club.name === homeClubName);
    const awayClub = dClubs.find(club => club.name === awayClubName);

    if (!homeClub || !awayClub) {
        throw new Error(`One or both clubs (${homeClubName}, ${awayClubName}) not found in dClubs.`);
    }

    const match = new Match(homeClub, awayClub, homeGoals, awayGoals, leagueName);
    match.handleMatch();

    //output the league tabel sorted by points
    const league = dLeagues.find(leagueObj => leagueObj.name === leagueName);
    if (league) {
        const sortedClubs = Object.keys(league.clubs).map(clubName => {
            const club = league.clubs[clubName];
            return { name: club.name, points: club.leagueStats[leagueName] };
        }).sort((a, b) => b.points - a.points);
        console.table(sortedClubs);
    } else {
        throw new Error(`League ${leagueName} not found.`);
    }
}
