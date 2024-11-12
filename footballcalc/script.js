let promoteColor = "#5FC385";
let promoteplayoffColor = "#A8F5B2";
let relegateColor = "#F87171";
let relegateplayoffColor = "#FEAAAF";
let CLColor = "#3E99FF";
let ELColor = "#EB8F5A";
let CoLColor = "#5FC385";
let championColor = "#FFD700";

let crntweek = 0; //tracks what weej we are in (spieltag)

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
    constructor(name, clubs = [], promotePositions = [],promotePlayoffs=[],relegatePositions=[],relegatePlayoffs=[],CLPositions=[],ELPositions=[],CoLPositions=[],hasChampion=true) {
        this.name = name;
        this.clubs = clubs;
        this.sortedClubs = this.init_sortedClubs(clubs);
        this.matches = [];
        this.promotePositions = promotePositions;
        this.promotePlayoffs = promotePlayoffs;
        this.relegatePositions = relegatePositions;
        this.relegatePlayoffs = relegatePlayoffs;
        this.CLPositions = CLPositions;
        this.ELPositions = ELPositions;
        this.CoLPositions = CoLPositions;
        this.hasChampion = hasChampion;

        this.matchplan = this.generateMatchplan();
        console.log(this.matchplan);
        
        //init league stats for all clubs
        clubs.forEach(club => club.initializeLeagueStats(this.name));
    }

    addMatch(match) {
        this.matches.push(match);
    }

    updateStats(sortedClubs){
        this.sortedClubs = sortedClubs;
    }

    getSortedClubs(){
        return this.sortedClubs;
    }

    init_sortedClubs(clubs){
        const sortedClubs = clubs.map(club => ({
            name: club.name,
            points: 0,
            goaldif: 0,
            goals: 0,
            conceded: 0,
            wins: 0,
            draws: 0,
            losses: 0
        }));

        return sortedClubs;
    }

    generateMatchplan(){
        const clubs = [...this.clubs];
        const matchplan = [];
        const totalRounds = clubs.length - 1;
        const matchesPerRound = clubs.length / 2;

        for (let round = 0; round < totalRounds; round++) {
            const roundMatches = [];
    
            for (let match = 0; match < matchesPerRound; match++) {
                const home = clubs[match];
                const away = clubs[clubs.length - 1 - match];
    
                if (home !== null && away !== null) {
                    roundMatches.push([home, away]);
                }
            }
    
            // Rotate teams, keeping the first team fixed
            clubs.splice(1, 0, clubs.pop());
    
            // Add the current round to the matchplan
            matchplan.push(...roundMatches);
        }
        return matchplan;
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
        //check if leagueStats is initialized for home club
        if (!Array.isArray(this.homeClub.leagueStats[this.league.name])) {
            this.homeClub.leagueStats[this.league.name] = [0, 0, 0, 0, 0, 0]; // [points, goalsFor, goalsAgainst,wins,draws,losses]
        }
    
        //check if leagueStats is initialized for away club
        if (!Array.isArray(this.awayClub.leagueStats[this.league.name])) {
            this.awayClub.leagueStats[this.league.name] = [0, 0, 0, 0, 0, 0]; // [points, goalsFor, goalsAgainst,wins,draws,losses]
        }
        //determine result and update points
        if (this.homeGoals > this.awayGoals) {
            this.homeClub.leagueStats[this.league.name][0] += 3;// Home club wins
            this.homeClub.leagueStats[this.league.name][3] += 1;
            this.awayClub.leagueStats[this.league.name][5] += 1;
        } else if (this.homeGoals < this.awayGoals) {
            this.awayClub.leagueStats[this.league.name][0] += 3;//Away club wins
            this.awayClub.leagueStats[this.league.name][3] += 1;
            this.homeClub.leagueStats[this.league.name][5] += 1;
        } else {
            this.homeClub.leagueStats[this.league.name][0] += 1;//Draw
            this.awayClub.leagueStats[this.league.name][0] += 1;
            this.homeClub.leagueStats[this.league.name][4] += 1;
            this.awayClub.leagueStats[this.league.name][4] += 1;
        }
        //add the goals
        this.homeClub.leagueStats[this.league.name][1] += this.homeGoals;
        this.homeClub.leagueStats[this.league.name][2] += this.awayGoals;
        this.awayClub.leagueStats[this.league.name][1] += this.awayGoals;
        this.awayClub.leagueStats[this.league.name][2] += this.homeGoals;
    }
}

function calculateInput() {
    const leagueName = document.getElementById('LeagueDropdown').value;
    const league = dLeagues.find(leagueObj => leagueObj.name === leagueName);
    let todaysMatches = [];
    if (!league) {
        throw new Error(`League ${leagueName} not found.`);
    }
    
    const container = document.getElementById("inputContainer");
    for (let innerContainer of container.children) {
        if (innerContainer.tagName !== 'DIV') {
            continue; // Skip non-DIV elements
        }
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
        points: club.leagueStats[leagueName][0],
        goaldif: club.leagueStats[leagueName][1] - club.leagueStats[leagueName][2],
        goals: club.leagueStats[leagueName][1],
        conceded: club.leagueStats[leagueName][2],
        wins: club.leagueStats[leagueName][3],
        draws: club.leagueStats[leagueName][4],
        losses: club.leagueStats[leagueName][5]
    })).sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        if (b.goaldif !== a.goaldif) {
            return b.goaldif - a.goaldif;
        }
        if (b.goals !== a.goals) {
            return b.goals - a.goals;
        }
        if (b.conceded !== a.conceded) {
            return a.conceded - b.conceded;
        }
        if (b.wins !== a.wins) {
            return b.wins - a.wins;
        }
        return a.losses - b.losses;
    });
    
    console.table(sortedClubs);
    updateTabel(sortedClubs,league);
    league.updateStats(sortedClubs);

    crntweek +=1;
    showMatches(leagueName);
}

function showMatches(leagueName) {
    const league = dLeagues.find(leagueObj => leagueObj.name === leagueName);

    if (!league) {
        throw new Error(`League ${leagueName} not found.`);
    }

    const clubs = league.clubs;
    
    const container = document.getElementById("inputContainer");
    container.innerHTML = "";	
    
    //-------------LEGACY MATCHMAKING--------------
    // let remainingClubs = JSON.parse(JSON.stringify(clubs));
    // while(remainingClubs.length>=2){
    //     // Pick the first team randomly
    //     const randomIndex1 = Math.floor(Math.random() * remainingClubs.length);
    //     const t1 = remainingClubs[randomIndex1].name;
    //     remainingClubs.splice(randomIndex1, 1); // Remove the first team from the array

    //     // Pick the second team randomly from the remaining clubs
    //     const randomIndex2 = Math.floor(Math.random() * remainingClubs.length);
    //     const t2 = remainingClubs[randomIndex2].name;
    //     remainingClubs.splice(randomIndex2, 1); // Remove the second team from the array
//-------------LEGACY MATCHMAKING--------------


//-------------NEW MATCHMAKING--------------
    let matchesAmntMatchday = league.clubs.length / 2;
    let remainingMatches = matchesAmntMatchday;
    while(remainingMatches > 0){
        t1=league.matchplan[(matchesAmntMatchday-remainingMatches)+crntweek*matchesAmntMatchday][0].name;
        t2=league.matchplan[(matchesAmntMatchday-remainingMatches)+crntweek*matchesAmntMatchday][1].name;
        remainingMatches--;
//-------------NEW MATCHMAKING--------------


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
    container.appendChild(document.createElement("br"));
    // add following button: <button id="calcButton" onclick="calculateInput()" disabled>Calculate</button>
    const calcButton = document.createElement("button");
    calcButton.id = "calcButton";
    calcButton.innerText = "Calculate";
    calcButton.onclick = calculateInput;
    calcButton.disabled = false;
    container.appendChild(calcButton);
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

function updateTabel(sortedClubs,league){
    const tableBody = document.getElementById("LeagueTable");
    tableBody.innerHTML = "";
    const theadrow = document.createElement("tr");
    const positionHeader = document.createElement("th");
    positionHeader.textContent = "Position";
    const nameHeader = document.createElement("th");
    nameHeader.textContent = "Name";
    const pointsHeader = document.createElement("th");
    pointsHeader.textContent = "Points";
    const goalDiffHeader = document.createElement("th");
    goalDiffHeader.textContent = "+/- Goals";
    const goalsHeader = document.createElement("th");
    goalsHeader.textContent = "Goals";
    const concededHeader = document.createElement("th");
    concededHeader.textContent = "Conceded";
    const winsHeader = document.createElement("th");
    winsHeader.textContent = "W";
    const drawsHeader = document.createElement("th");
    drawsHeader.textContent = "D";
    const lossesHeader = document.createElement("th");
    lossesHeader.textContent = "L";
    theadrow.appendChild(positionHeader);
    theadrow.appendChild(nameHeader);
    theadrow.appendChild(pointsHeader);
    theadrow.appendChild(goalDiffHeader);
    theadrow.appendChild(goalsHeader);
    theadrow.appendChild(concededHeader);
    theadrow.appendChild(winsHeader);
    theadrow.appendChild(drawsHeader);
    theadrow.appendChild(lossesHeader);
    tableBody.appendChild(theadrow);
    sortedClubs.forEach(club => {
        const row = document.createElement("tr");
        const positionCell = document.createElement("td");
        positionCell.textContent = sortedClubs.indexOf(club)+1;
        const nameCell = document.createElement("td");
        nameCell.innerHTML = "<b>"+club.name;
        const pointsCell = document.createElement("td");
        pointsCell.innerHTML = "<b>"+club.points;
        const goalDiffCell = document.createElement("td");
        goalDiffCell.textContent = club.goaldif;
        const goalsCell = document.createElement("td");
        goalsCell.textContent = club.goals;
        const concededCell = document.createElement("td");
        concededCell.textContent = club.conceded;
        const winsCell = document.createElement("td");
        winsCell.textContent = club.wins;
        const drawsCell = document.createElement("td");
        drawsCell.textContent = club.draws;
        const lossesCell = document.createElement("td");
        lossesCell.textContent = club.losses;

        const position = sortedClubs.indexOf(club)+1;

        row.appendChild(positionCell);
        row.appendChild(nameCell);
        row.appendChild(pointsCell);
        row.appendChild(goalDiffCell);
        row.appendChild(goalsCell);
        row.appendChild(concededCell);
        row.appendChild(winsCell);
        row.appendChild(drawsCell);
        row.appendChild(lossesCell);
        row.childNodes.forEach(element => {
            if(position==1 && league.hasChampion){
                element.style.color=championColor;
            }
            if(league.promotePositions.includes(position)){
                element.style.backgroundColor=promoteColor;
            }
            if(league.promotePlayoffs.includes(position)){
                element.style.backgroundColor=promoteplayoffColor;
            }
            if(league.relegatePositions.includes(position)){
                element.style.backgroundColor=relegateColor;
            }
            if(league.relegatePlayoffs.includes(position)){
                element.style.backgroundColor=relegateplayoffColor;
            }
            if(league.CLPositions.includes(position)){
                element.style.backgroundColor=CLColor;
            }
            if(league.ELPositions.includes(position)){
                element.style.backgroundColor=ELColor;
            }
            if(league.CoLPositions.includes(position)){
                element.style.backgroundColor=CoLColor;
            }
        });
        tableBody.appendChild(row);
    });
}

const dropdown = document.getElementById('LeagueDropdown');
dropdown.addEventListener('change', function() {
    showMatches(dropdown.value);
    leagueName = dropdown.value;
    const league = dLeagues.find(leagueObj => leagueObj.name === leagueName);
    updateTabel(league.getSortedClubs(),league);
});

window.onload = function exampleFunction(){ 
    updateDropdownOptions();
    }