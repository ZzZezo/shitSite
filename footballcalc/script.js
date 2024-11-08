class Club {
    constructor(name) {
        this.name = name;
        this.leagueStats = {};  //on club creation, initialize the league stats
    }

    //init league stats on league creation
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
        
        //init league stats for all clubs
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
function calculateInput() {
    const leagueName = document.getElementById('LeagueDropdown').value;
    const league = dLeagues.find(leagueObj => leagueObj.name === leagueName);
    let todaysMatches = [];
    if (!league) {
        throw new Error(`League ${leagueName} not found.`);
    }
    
    const container = document.getElementById("inputContainer");
    for (let innerContainer of container.children) {
        const homeClubName = innerContainer.children[1].value; //if you wonder why the number dont seem to match. its because of the <br> elements.
        const awayClubName = innerContainer.children[4].value; //if you wonder why the number dont seem to match. its because of the <br> elements.
        const homeGoals = parseInt(innerContainer.children[2].value); //if you wonder why the number dont seem to match. its because of the <br> elements.
        const awayGoals = parseInt(innerContainer.children[5].value); //if you wonder why the number dont seem to match. its because of the <br> elements.
        
        const homeClub = dClubs.find(club => club.name === homeClubName);
        const awayClub = dClubs.find(club => club.name === awayClubName);

        if (!homeClub || !awayClub) {
            throw new Error(`One or both clubs (${homeClubName}, ${awayClubName}) not found in dClubs.`);
        }

         // Check if both clubs are in the league
        const homeClubInLeague = league.clubs.includes(homeClub);
        const awayClubInLeague = league.clubs.includes(awayClub);

        if (!homeClubInLeague || !awayClubInLeague) {
            throw new Error(`One or both clubs (${homeClubName}, ${awayClubName}) are not in the ${leagueName} league.`);
        }
        if(homeGoals<0 || awayGoals<0){
            throw new Error("Goals cannot be negative.");
        }

        if(isNaN(homeGoals) || isNaN(awayGoals)){
            throw new Error("Goals cannot be empty.");
        }

        // Proceed with creating and handling the match if both clubs are in the league
        const match = new Match(homeClub, awayClub, homeGoals, awayGoals, leagueName);
        todaysMatches.push(match);
    };  
    todaysMatches.forEach(match => {
        match.handleMatch();
    }); 
    
    // Output the league table sorted by points
    const sortedClubs = league.clubs.map(club => ({
        name: club.name,
        points: club.leagueStats[leagueName]
    })).sort((a, b) => b.points - a.points);
    
    console.table(sortedClubs);
}

function showMatches(leagueName) {
    const league = dLeagues.find(leagueObj => leagueObj.name === leagueName);

    if (!league) {
        throw new Error(`League ${leagueName} not found.`);
    }

    const clubs = league.clubs;
    let remainingClubs = JSON.parse(JSON.stringify(clubs));
    
    const container = document.getElementById("inputContainer");
    container.innerHTML = "";	

    //show matches until no clubs left ig?
    while(remainingClubs.length>=2){
        // Pick the first team randomly
        const randomIndex1 = Math.floor(Math.random() * remainingClubs.length);
        const t1 = remainingClubs[randomIndex1].name;
        remainingClubs.splice(randomIndex1, 1); // Remove the first team from the array

        // Pick the second team randomly from the remaining clubs
        const randomIndex2 = Math.floor(Math.random() * remainingClubs.length);
        const t2 = remainingClubs[randomIndex2].name;
        remainingClubs.splice(randomIndex2, 1); // Remove the second team from the array

        //show in html
        const inputT1 = document.createElement("input");
            inputT1.type = "text";
            inputT1.value = t1;
            inputT1.disabled = true;
        const inputG1 = document.createElement("input");
            inputG1.type = "text";
            inputG1.placeholder = "0";
        const inputT2 = document.createElement("input");
            inputT2.type = "text";
            inputT2.value = t2;
            inputT2.disabled = true;
        const inputG2 = document.createElement("input");
            inputG2.type = "text";
            inputG2.placeholder = "0";

        let innerContainer = document.createElement("div");
        //add to container
        innerContainer.appendChild(document.createElement("br"));
        innerContainer.appendChild(inputT1);
        innerContainer.appendChild(inputG1);
        innerContainer.appendChild(document.createElement("br"));
        innerContainer.appendChild(inputT2);
        innerContainer.appendChild(inputG2);
        //add inner container to container
        container.appendChild(innerContainer);
    }
    document.getElementById("calcButton").disabled = false;
}

function updateDropdownOptions(){
    const dropdown = document.getElementById('LeagueDropdown');
    dropdown.innerHTML = "";

    // Add a placeholder option
    const placeholderOption = document.createElement('option');
    placeholderOption.text = "Select League"; // Placeholder text
    placeholderOption.value = ""; // Empty value
    placeholderOption.disabled = true; // Disable this option
    placeholderOption.selected = true; // Make it selected by default
    dropdown.appendChild(placeholderOption);

    dLeagues.forEach(leagueObj => {
        leaguename = leagueObj.name;
        const option = document.createElement('option');
        option.value = leaguename;
        option.text = leaguename;
        dropdown.appendChild(option);
    })
}

const dropdown = document.getElementById('LeagueDropdown');
dropdown.addEventListener('change', function() {
    showMatches(dropdown.value);
});

window.onload = function exampleFunction(){ 
    updateDropdownOptions();
    }