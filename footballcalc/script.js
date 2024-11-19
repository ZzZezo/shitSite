let promoteColor = "#5FC385";
let promoteplayoffColor = "#A8F5B2";
let relegateColor = "#F87171";
let relegateplayoffColor = "#FEAAAF";
let CLColor = "#3E99FF";
let ELColor = "#EB8F5A";
let CoLColor = "#5FC385";
let championColor = "#FFD700";

let loadedLeagues; //initialized at bottom (later dynamically), stores the leagues the game will cycle through
let activeLeague; //the league thats currently selected, used to dropdown.value
let finshedLeagues = [];
let crntweek = 0; //tracks what week we are in (spieltag)

let isSeasonOver = false;

class Club {
    constructor(name) {
        this.name = name;
        this.leagueStats = {};  //on club creation, initialize the league stats
        this.matches=[];
    }

    //init league stats on league creation
    initializeLeagueStats(leagueName) {
        if (!this.leagueStats[leagueName]) {
            this.leagueStats[leagueName] = 0;  // Set initial points to 0 for the league
        }
    }

    addMatch(match) {
        this.matches.push(match);
    }
}

class League {
    constructor(name, clubs = [], promotePositions = [],promotePlayoffs=[],relegatePositions=[],relegatePlayoffs=[],CLPositions=[],ELPositions=[],CoLPositions=[],hasChampion=true,terms = 2) {
        this.name = name; //whats it called (e.g.: "Premier League")
        this.clubs = clubs;
        this.sortedClubs = this.init_sortedClubs(clubs);
        this.matches = [];
        //who gets relegated/promoted
        this.promotePositions = promotePositions;
        this.promotePlayoffs = promotePlayoffs;
        this.relegatePositions = relegatePositions;
        this.relegatePlayoffs = relegatePlayoffs;
        //who qualifies for Champions-, Euro- and Conferenceleague
        this.CLPositions = CLPositions;
        this.ELPositions = ELPositions;
        this.CoLPositions = CoLPositions;
        //kann man meister werden
        this.hasChampion = hasChampion;
        //Hin und rückrunde?
        this.terms = terms;
        this.currentRound = 1;

        this.matchplan = this.generateMatchplan();
        this.matchdaysThisSeason = this.matchplan.length;
        this.matchdaysPlayed = 0;
        
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
        let clubs = [...this.clubs]; //creates a copy of the clubs array
        clubs = clubs.sort((a,b)=>0.5-Math.random());//shuffles the array, so the matchplan will be unique for everyone.
        let matchplan = [];
        const totalRounds = clubs.length - 1;
        const matchesPerRound = clubs.length / 2;

        for (let round = 0; round < totalRounds; round++) { //every round is one matchday
            const roundMatches = [];
    
            for (let match = 0; match < matchesPerRound; match++) { //runs through every match on each matchday
                let home,away;
                if(Math.random() < 0.5){
                    home = clubs[match];
                    away = clubs[clubs.length - 1 - match];
                }
                else{
                    home = clubs[clubs.length - 1 - match];
                    away = clubs[match];
                }
    
                if (home !== null && away !== null) {
                    roundMatches.push([home, away]);
                }
            }
    
            // Rotate teams, keeping the first team fixed
            clubs.splice(1, 0, clubs.pop());
    
            // Add the current round to the matchplan
            matchplan.push(...roundMatches); //pushes the array CONTENT into the array not the array itself (like array.concat())
        }

        //add second (and potentially 3rd,4th...) term with reversed home and away teams
        let matchplanCopy = [...matchplan];//copy of original match plan to keep reference
        for(let i = 1; i < this.terms; i++) {
            let termMatches = (i % 2 === 0)
                ? matchplanCopy  //for even terms use original order
                : matchplanCopy.map(match => [...match].reverse()); //for odd terms, use reversed order
            matchplan = [...matchplan, ...termMatches];//append term to matchplan
        }

        return matchplan;
    }

    replaceClub(oldClub,newClub){
        let index = this.clubs.indexOf(oldClub);
        this.clubs[index] = newClub;
        newClub.initializeLeagueStats(this.name);
        this.matchplan = this.generateMatchplan();//this line probably should be done somewhere else later
        this.sortedClubs = this.init_sortedClubs(this.clubs);//so should this
        console.log(this.name+": Replaced "+oldClub.name + " with "+newClub.name);
    }

    removeClub(club){
        let index = this.clubs.indexOf(club);
        this.clubs.splice(index,1);
        this.matchplan = this.generateMatchplan();//this line probably should be done somewhere else later
        this.sortedClubs = this.init_sortedClubs(this.clubs);//so should this
        console.log(this.name+": Removed "+club.name);
    }

    addClub(club){
        this.clubs.push(club);
        this.matchplan = this.generateMatchplan();//this line probably should be done somewhere else later
        this.sortedClubs = this.init_sortedClubs(this.clubs);//so should this
        console.log(this.name+": Added "+club.name);
    }
}

class Match {
    constructor(homeClub, awayClub, homeGoals, awayGoals, leagueName) {
        this.homeClub = homeClub;
        this.awayClub = awayClub;
        this.homeGoals = homeGoals;
        this.awayGoals = awayGoals;
        this.played = false;
        
        // Find and assign the league object from the predefined list
        this.league = dLeagues.find(leagueObj => leagueObj.name === leagueName);
        
        // Add match to the league if found
        if (this.league) {
            this.league.addMatch(this);
            this.homeClub.addMatch(this);
            this.awayClub.addMatch(this);
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

        this.played = true;
    }
}

function calculateInput() { //called when the calculate button is pressed, turns user input into actual matches
    const leagueName = activeLeague.name;
    const league = activeLeague;
    let todaysMatches = [];
    if (!league) {
        throw new Error(`League ${leagueName} not found.`);
    }
    
    const container = document.getElementById("inputContainer");
    for (let innerContainer of container.children) {
        if (innerContainer.tagName !== 'DIV') {
            continue; //skip Calc Button and other non-DIV elements
        }
        const homeClubName = innerContainer.children[0].value; //if you wonder why the number dont seem to match. its because of the <br> elements.
        const awayClubName = innerContainer.children[3].value; //if you wonder why the number dont seem to match. its because of the <br> elements.
        const homeGoals = parseInt(innerContainer.children[1].value); //if you wonder why the number dont seem to match. its because of the <br> elements.
        const awayGoals = parseInt(innerContainer.children[4].value); //if you wonder why the number dont seem to match. its because of the <br> elements.
        
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
            throw new Error("Goals cannot be empty.");//also throws when goals entered ar not an int
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
            return b.points - a.points; //sort by points
        }
        if (b.goaldif !== a.goaldif) {
            return b.goaldif - a.goaldif; //if points equal sort by goaldif
        }
        if (b.goals !== a.goals) {
            return b.goals - a.goals; //if goaldif equal sort by goals shot
        }
        if (b.conceded !== a.conceded) {
            return a.conceded - b.conceded; //if equal amount of goals sort by conceded goals
        }
        if (b.wins !== a.wins) {
            return b.wins - a.wins; //if equal amnt of conceded goals sort by victories
        }
        return a.losses - b.losses; //else sort by who lost the least games
    });
    
    console.table(sortedClubs);
    updateTabel(sortedClubs,league);
    league.updateStats(sortedClubs);

    matchesCalculated(league);
}

function matchesCalculated(lastLeague,leagueDone=false) {
    if (leagueDone) {
        //remove from loaded leagues if done
        finshedLeagues.push(lastLeague);
        loadedLeagues.splice(loadedLeagues.indexOf(lastLeague), 1);
    }
    //check if all leagues are done
    if (areAllLeaguesDone()) {
        seasonOver();
        return;
    }
    else{
        if(loadedLeagues.indexOf(lastLeague)==loadedLeagues.length-1){//if its the last loaded league go back to start
            crntweek +=1;
    
            activeLeague = loadedLeagues[0];
            showMatches(activeLeague.name);
            updateTabel(activeLeague.getSortedClubs(),activeLeague)
        }
        else{ //go to next league
            activeLeague = loadedLeagues[loadedLeagues.indexOf(lastLeague)+1];
            showMatches(activeLeague.name);
            updateTabel(activeLeague.getSortedClubs(),activeLeague);
        }
        switchToNextInput(true);
    }
}

function showMatches(leagueName) {
    const league = dLeagues.find(leagueObj => leagueObj.name === leagueName);

    if (!league) {
        throw new Error(`League ${leagueName} not found.`);
    }
    
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
        if(league.matchplan[(matchesAmntMatchday-remainingMatches)+crntweek*matchesAmntMatchday]){
            t1=league.matchplan[(matchesAmntMatchday-remainingMatches)+crntweek*matchesAmntMatchday][0].name;
            t2=league.matchplan[(matchesAmntMatchday-remainingMatches)+crntweek*matchesAmntMatchday][1].name;
            remainingMatches--;
        }
        else{
            matchesCalculated(league,true);
            remainingMatches = 0;
            return;
        }
        
        
//-------------NEW MATCHMAKING--------------


        //show in html
        const inputT1 = document.createElement("input");
            inputT1.type = "text";
            inputT1.value = t1;
            inputT1.disabled = true;
            inputT1.classList.add("teamInput");
            const inputG1 = document.createElement("input");
            inputG1.type = "text";
            inputG1.placeholder = "0";
            inputG1.classList.add("goalInput");
            inputG1.onkeyup = function() {switchToNextInput()};
            const inputT2 = document.createElement("input");
            inputT2.type = "text";
            inputT2.value = t2;
            inputT2.disabled = true;
            inputT2.classList.add("teamInput");
            const inputG2 = document.createElement("input");
            inputG2.type = "text";
            inputG2.placeholder = "0";
            inputG2.classList.add("goalInput");
            inputG2.onkeyup = function() {switchToNextInput()};

        let innerContainer = document.createElement("div");
        //add to container
        innerContainer.classList.add("inputContainer");
        innerContainer.appendChild(inputT1);
        innerContainer.appendChild(inputG1);
        innerContainer.appendChild(document.createElement("br"));
        innerContainer.appendChild(inputT2);
        innerContainer.appendChild(inputG2);
        //add inner container to container
        container.appendChild(innerContainer);
    }
    league.matchdaysPlayed+=1;
    container.appendChild(document.createElement("br"));
    // add following button: <button id="calcButton" onclick="calculateInput()" disabled>Calculate</button>
    const calcButton = document.createElement("button");
    calcButton.id = "calcButton";
    calcButton.innerText = "Continue";
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

function updateDropdownOptionsByList(list){
    const dropdown = document.getElementById('LeagueDropdown2');
    dropdown.innerHTML = "";

    // Add a placeholder option
    const placeholderOption = document.createElement('option');
    placeholderOption.text = "Select League"; // Placeholder text
    placeholderOption.value = ""; // Empty value
    placeholderOption.disabled = true; // Disable this option
    placeholderOption.selected = true; // Make it selected by default
    dropdown.appendChild(placeholderOption);

    list.forEach(leagueObj => {
        leaguename = leagueObj.name;
        const option = document.createElement('option');
        option.value = leaguename;
        option.text = leaguename;
        dropdown.appendChild(option);
    })

    dropdown.addEventListener('change', function() {
        //calls when a league is selected out of the dropdown menu
        leagueName = dropdown.value;
        const league = dLeagues.find(leagueObj => leagueObj.name === leagueName);
        activeLeague=league;
        updateTabel(league.getSortedClubs(),league);
    });
    
    dropdown.style.display = "block";
}

function updateTabel(sortedClubs,league){
    //I know whats coming now is ass as fuck but i did that at 4am or so pls-
    //well do that better eventually. first things first.
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
            element.onclick=function a(){updateClubInfo(activeLeague.sortedClubs[position-1])};
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

function switchToNextInput(first) {
    if(event.key=='Enter'||event.key=="F5")return;
    //create array of all items from class "goalInput"
    const goalInputs = document.querySelectorAll('.goalInput');
    //get the index of the current input element
    const currentIndex = Array.from(goalInputs).indexOf(document.activeElement);
    //get the next input element
    let nextInput = goalInputs[currentIndex + 1];
    if(first) nextInput = goalInputs[0];
    //if there is a next input element, focus on it
    if (nextInput) {
        nextInput.focus();
    }
    else {
        //if there is no next input element, focus on the calcButton
        if(document.getElementById("calcButton"))document.getElementById("calcButton").focus();
    }
}

function resetClubInfo(){
    document.getElementById("ClubInfoContainer").innerHTML = "";
}

function updateClubInfo(clubSorted){
    club = activeLeague.clubs.find(club => club.name == clubSorted.name);

    resetClubInfo();
    infoContainer = document.getElementById("ClubInfoContainer");

    const leaguesHeader = document.createElement("h6");
    leaguesHeader.textContent = activeLeague.name;
    infoContainer.appendChild(leaguesHeader);

    const clubHeader = document.createElement("h1");
    clubHeader.textContent = club.name;
    infoContainer.appendChild(clubHeader);

    // Create the match container
    const matchContainer = document.createElement("div");
    matchContainer.classList.add("matchContainer");

    // Create the table
    const matchTable = document.createElement("table");
    matchTable.classList.add("matchHeader"); // Apply the CSS class for styling

    // Add the header row to the table
    const headerRow = document.createElement("tr");
    ["Home Team", "Home Goals", "Away Goals", "Away Team"].forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    matchTable.appendChild(headerRow);

    // Populate the table with match data
    club.matches.forEach(match => {
        const matchRow = document.createElement("tr");
        const homeCell = document.createElement("td");
        homeCell.textContent = match.homeClub.name;

        const homeGoalsCell = document.createElement("td");
        homeGoalsCell.textContent = match.homeGoals;

        const awayGoalsCell = document.createElement("td");
        awayGoalsCell.textContent = match.awayGoals;

        const awayCell = document.createElement("td");
        awayCell.textContent = match.awayClub.name;

        matchRow.appendChild(homeCell);
        matchRow.appendChild(homeGoalsCell);
        matchRow.appendChild(awayGoalsCell);
        matchRow.appendChild(awayCell);

        matchTable.appendChild(matchRow);
    });

    // Append the table to the match container
    matchContainer.appendChild(matchTable);

    // Append the match container to the info container
    infoContainer.appendChild(matchContainer);

}


function areAllLeaguesDone() {
    return loadedLeagues.every(
        league => league.matchplan.every(match => match.played)
    );
}

function seasonOver(){
    alert("The Season is Over. Because I can't code you now gotta reset everything! WW");
    updateDropdownOptionsByList(finshedLeagues);
}

function saveToStorage(){
    localStorage.clear();
}

function loadFromStorage(){

}

const dropdown = document.getElementById('LeagueDropdown');
dropdown.addEventListener('change', function() {
    //calls when a league is selected out of the dropdown menu
    showMatches(dropdown.value);
    leagueName = dropdown.value;
    const league = dLeagues.find(leagueObj => leagueObj.name === leagueName);
    activeLeague = league;
    updateTabel(league.getSortedClubs(),league);
    dropdown.style.display = "none";
});

window.onload = function exampleFunction(){ 
    updateDropdownOptions();

    //below is tmp, auto loads Bundesliga, 2. Bundesliga and HNL
    loadedLeagues = [dLeagues[4]];
    //below is very tmp. honestly its more testing that tmp. switches out karlsruhe with bochum lol
    dLeagues[0].replaceClub(dClubs[17],dClubs[89]);
    dLeagues[5].replaceClub(dClubs[89],dClubs[17]);

    //below is just tmp, auto selects bundesliga for start
    showMatches(dLeagues[4].name);
    leagueName = dLeagues[4].name;  
    const league = dLeagues[4];
    activeLeague = league;
    updateTabel(league.getSortedClubs(),league);
    dropdown.style.display = "none";
    switchToNextInput(true);
    }