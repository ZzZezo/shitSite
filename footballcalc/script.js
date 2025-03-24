let promoteColor = "#5FC385";
let promoteplayoffColor = "#A8F5B2";
let relegateColor = "#F87171";
let relegateplayoffColor = "#FEAAAF";
let CLColor = "#3E99FF";
let ELColor = "#EB8F5A";
let CoLColor = "#5FC385";
let championColor = "#FFD700";

let loadedLeagues; //initialized at bottom (later dynamically), stores the leagues the game will cycle through
let loadedCups; //initialized at bottom (later dynamically), stores the leagues the game will cycle through
let activeLeague; //the league thats currently selected, used to dropdown.value
let finshedLeagues = [];

let seasonCalendar; //stores the one Object of the Calendar class
let seasonManager;

let isSeasonOver = false; //set to true when season is over, but maybe won't be needed ?

let userRandomness = 13.5;

//IS SAVING ENABLED?
let savingEnabled = false;

//settings or idk
let show_color_in_match_list = true;

//debug variables
let debug_fast_skip = false; //if true, fills out every game with 1-1
let debug_console_tables = false; //if true, prints the tables to the console
let debug_log_everything = false; //if true, a lot more things are being logged in the console

class Club { //all clubs
    constructor(name,HardcodedRating) {
        this.name = name;
        this.leagueStats = {};  //a list of all leagues it takes part and the points it has in that league
        this.matches=[]; //lists every match the club plays in (or should, i'm not sure if it also tracks cup games etc.)
        this.hardcodedRating = HardcodedRating; //used for simulation^

        this.highestVictorySpan = 0;
        this.highestVictoryGoals = 0;
        this.highestVictoryMatch = null;

        this.highestLossSpan = 0;
        this.highestLossGoals = 0;
        this.highestLossMatch = null;//

        this.totalGoals = 0;
        this.totalMatches = 0;
        this.totalVictories = 0;
        this.totalDefeats = 0;
        this.totalDraws = 0;

        this.seasonalPositions = [];
    }

    //init league stats on league creation --> is called when a league is created, for any club in the league
    initializeLeagueStats(leagueName) {
        if (!this.leagueStats[leagueName]) {
            this.leagueStats[leagueName] = 0;  //Set initial points to 0 for the league
        }
    }

    addMatch(match) {
        this.matches.push(match);
    }

    getLeagues() {
        return Object.keys(this.leagueStats);
    }

    checkHighestVictory(match){
        if(match.homeClub ==this){
            //CLUB IS HOME
            if(match.homeGoals-match.awayGoals > this.highestVictorySpan){
                this.highestVictorySpan = match.homeGoals-match.awayGoals;
                this.highestVictoryGoals = match.homeGoals;
                this.highestVictoryMatch = match;
            }
            else if(match.homeGoals-match.awayGoals == this.highestVictorySpan){
                if(match.homeGoals > this.highestVictoryGoals){
                    this.highestVictoryMatch = this;
                    this.highestVictoryGoals = match.homeGoals;
                }
            }
        }
        else if(match.awayClub == this){
            //CLUB IS AWAY
            if(match.awayGoals-match.homeGoals > this.highestVictorySpan){
                this.highestVictorySpan = match.awayGoals-match.homeGoals;
                this.highestVictoryGoals = match.awayGoals;
                this.highestVictoryMatch = match;
            }
            else if(match.awayGoals-match.homeGoals == this.highestVictorySpan){
                if(match.awayGoals > this.highestVictoryGoals){
                    this.highestVictoryMatch = this;
                    this.highestVictoryGoals = match.awayGoals;
                }
            }   
        }

        if(this.highestVictoryMatch == {}){
            console.log("JESUS!");
            console.log(this);
        }
    }

    checkHighestLoss(match){
        if(match.homeClub ==this){
            //CLUB IS HOME
            if(match.awayGoals-match.homeGoals > this.highestLossSpan){
                this.highestLossSpan = match.awayGoals-match.homeGoals;
                this.highestLossGoals = match.awayGoals;
                this.highestLossMatch = match;
            }
            else if(match.awayGoals-match.homeGoals == this.highestLossSpan){
                if(match.awayGoals > this.highestLossGoals){
                    this.highestLossMatch = this;
                    this.highestLossGoals = match.awayGoals;
                }
            }
        }
        else if(match.awayClub == this){
            //CLUB IS AWAY
            if(match.homeGoals-match.awayGoals > this.highestLossSpan){
                this.highestLossSpan = match.homeGoals-match.awayGoals;
                this.highestLossGoals = match.homeGoals;
                this.highestLossMatch = match;
            }
            else if(match.homeGoals-match.awayGoals == this.highestLossSpan){
                if(match.homeGoals > this.highestLossGoals){
                    this.highestLossMatch = this;
                    this.highestLossGoals = match.homeGoals;
                }
            }
        }

        if(this.highestLossMatch == {}){
            console.log("JESUS!");
            console.log(this);
        }
    }
}

class League {
    constructor(name, clubs = [], matchLimit = 0, promotePositions = [],promotePlayoffs=[],relegatePositions=[],relegatePlayoffs=[],CLPositions=[],ELPositions=[],CoLPositions=[],association="FIFA",level=1,hasChampion=true,terms = 2,playable = true,knockoutTeams = 0) {
        this.name = name; //whats it called (e.g.: "Premier League")
        this.clubs = clubs; //list of all participating clubs
        if(this.name != "Champions League" && this.name != "Europa League" && this.name != "Conference League") this.sortedClubs = this.init_sortedClubs(clubs); //all clubs of the league, but in order they are shown in tabel (is not done for uefa leagues cuz they are populated later on)
        this.matches = [];
        //who gets relegated/promoted
        this.promotePositions = promotePositions;
        this.promotePlayoffs = promotePlayoffs;
        this.relegatePositions = relegatePositions;
        this.relegatePlayoffs = relegatePlayoffs;
        //what association and what level the league is, used for promotion and relegation
        this.association = association;
        this.level = level; //the higher the level, the lower the league -> Bundesliga.level=1  2.Bundesliga.level=2
        //who qualifies for Champions-, Euro- and Conferenceleague
        this.CLPositions = CLPositions;
        this.ELPositions = ELPositions;
        this.CoLPositions = CoLPositions;
        //kann man meister werden
        this.hasChampion = hasChampion;
        //Hin und rückrunden
        this.terms = terms;
        this.crntweek = 0; //tracks what week we are in (spieltag)
        this.lastShownMatchIndex = 0;
        //for uefa cups
        //the number of teams that will qualify for the knockout stage (if 0, behaves like a normal league)
        this.knockoutTeams = knockoutTeams;
        this.knockoutTeamsList = [];
        this.isInKnockoutPhase = false;

        this.matchLimit = matchLimit; //the max amnt of games each club gonna play, no matter, if they didnt play every other team (will go over this limit if terms is not 1)
        if(this.matchLimit <=0) this.matchLimit = 999999; //so if 0 is input that means there is no limit at all

        this.matchplan = this.generateMatchplan(); //array: [Spieltag][Spiel] --> e.g.: [7][2] = Spieltag 8, Spiel 3
        this.matchesThisSeason = this.matchplan.length;
        this.matchdaysThisSeason = Math.floor(this.matchesThisSeason / (this.clubs.length / 2))
        if(this.knockoutTeams>0) this.matchdaysThisSeason+=logBase2(this.knockoutTeams);
        //console.log(this.name+": "+this.matchdaysThisSeason);
        this.matchdaysPlayed = 0;
        
        //if the league can be played (or only simulated, used for lower divisions, so all playbable leagues can relegate clubs)
        this.playable = playable;

        //init league stats for all clubs (is not done for uefa leagues cuz they are populated later on)
        if(this.name != "Champions League" && this.name != "Europa League" && this.name != "Conference League") clubs.forEach(club => club.initializeLeagueStats(this.name));
    }

    addMatch(match) {
        this.matches.push(match);
    }

    updateStats(sortedClubs){
        this.sortedClubs = sortedClubs;

        let currentPos = 1;
        sortedClubs.forEach(club => {
            let clubObj = findClubObjByName(club.name);
            clubObj.seasonalPositions.push(currentPos);
            currentPos+=1;
        })
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

    generateMatchplan(totalRounds = this.clubs.length - 1){
        if(totalRounds>this.matchLimit) totalRounds = this.matchLimit; //limits the games
        let clubs = [...this.clubs]; //creates a copy of the clubs array
        clubs = clubs.sort((a,b)=>0.5-Math.random());//shuffles the array, so the matchplan will be unique for everyone.
        let matchplan = [];
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
    
            //Rotate teams, keeping the first team fixed
            clubs.splice(1, 0, clubs.pop());
    
            //Add the current round to the matchplan
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

        //@UEFA, add knockout stage. we dont know which teams qualified yet so this is a placeholder.
        //this means we have to update the teams whenever the previous matchday was finished (first time after the 8. matchday, then after every knockout matchday)
        if(this.knockoutTeams > 0){
            //get the amnt of rounds. should be the number of teams with log 2, if my math doesnt stand corrected
            let knockoutRounds = logBase2(this.knockoutTeams);
            let projectedTeamsLeft = this.knockoutTeams;
            let knockoutMatches = [];
            for(let i = 0; i < knockoutRounds; i++){
                for(let j = 0; j < projectedTeamsLeft / 2; j++){
                    knockoutMatches.push([null,null])
                }
                projectedTeamsLeft = projectedTeamsLeft / 2;
            }
            matchplan = [...matchplan, ...knockoutMatches];
        }

        return matchplan;
    }

    replaceClub(oldClub,newClub){
        let index = this.clubs.indexOf(oldClub);
        this.clubs[index] = newClub;
        newClub.initializeLeagueStats(this.name);
        this.matchplan = this.generateMatchplan();//this line probably should be done somewhere else later
        this.sortedClubs = this.init_sortedClubs(this.clubs);//so should this
        if(debug_log_everything)console.log(this.name+": Replaced "+oldClub.name + " with "+newClub.name);
    }

    removeClub(club){
        let index = this.clubs.indexOf(club);
        this.clubs.splice(index,1);
        this.matchplan = this.generateMatchplan();//this line probably should be done somewhere else later
        this.sortedClubs = this.init_sortedClubs(this.clubs);//so should this
        if(debug_log_everything)console.log(this.name+": Removed "+club.name);
    }

    addClub(club){
        this.clubs.push(club);
        this.matchplan = this.generateMatchplan();//this line probably should be done somewhere else later
        this.sortedClubs = this.init_sortedClubs(this.clubs);//so should this
        if(debug_log_everything)console.log(this.name+": Added "+club.name);
    }

    fullSimulation(randomness){//the higher the randomness value the LESS random are the results //maybe 13 is good?
        let simulatedList = [...this.clubs];//copys all clubs to the new list
        let weightedList = simulatedList.map(club =>({ //creates new array with objects out of list
           weightedClub: club, 
           weight: Math.random() * Math.pow(club.hardcodedRating,randomness) //gives random value and scales with rating
        }));
        //sort based on generated & scaled weight
        weightedList.sort((a,b)=> b.weight-a.weight);
        simulatedList = [...weightedList];
        return simulatedList;
    }
}

class Cup{
    constructor(name,clubs = [], HasThirdPlace = false, country = "World"){
        this.name = name;
        this.clubs = clubs;
        if(!isPowerOfTwo(this.clubs.length) || this.clubs.length < 2) console.warn(`Cup ${this.name} has ${this.clubs.length} participants.`);
        this.remainingClubs = [...this.clubs];
        this.HasThirdPlace = HasThirdPlace; //yep, this does absolutely nothing but nice to store it anyways :D
        this.country = country;
        this.matches = [];
        this.totalRounds = this.calculateRounds();
        this.matchplan = [];
        this.crntweek = 0;

        this.drawNewRound();
    }

    calculateRounds(){
        //Calculate the number of rounds based on the number of clubs
        if(isPowerOfTwo(this.clubs.length) && this.clubs.length >= 2){
            return logBase2(this.clubs.length);
        }
        else throw new Error(`Cup ${this.name} has an invalid number of participants. (${this.clubs.length})`);
    }

    drawNewRound(){
        this.matchplan = [];
        let clubsToDraw = [...this.remainingClubs]; //copy remaining clubs
        clubsToDraw = clubsToDraw.sort((a,b)=>0.5-Math.random());//randomize it
        if(isPowerOfTwo(clubsToDraw.length)){
            let gamesThisRound = clubsToDraw.length/2;

            for (let i = 0; i < gamesThisRound; i++) {
                const homeClub = clubsToDraw.pop();
                const awayClub = clubsToDraw.pop();
                this.matchplan.push([homeClub,awayClub]);
            }
        }
        else throw new Error(`Cup ${this.name} has an invalid number of remaining participants.`);
    }

    resetCup(){//this currently does not pull new clubs (so lets say Offenburg gets promoted to Bundesliga, it would still only rarely show up, cuz the cups use the same set of clubs every year --> NEEDS TO BE FIXED)
        this.remainingClubs = [...this.clubs];
        this.matches = [];
        this.totalRounds = this.calculateRounds();
        this.matchplan = [];
        this.crntweek = 0;

        this.drawNewRound();
    }

    async roundFinished(){
        const teamInputs = document.querySelectorAll('.teamInput');
        const goalInputs = document.querySelectorAll('.goalInput');

        let clubsToKickOut = [];

        for (let i = 0; i < teamInputs.length; i += 2) {
            const tmpcup = this;
            //get club NAMES
            const name_homeClub = teamInputs[i].value;
            const name_awayClub = teamInputs[i + 1].value;
            //get club obj from club name
            const homeClub = this.clubs.find(club => club.name === name_homeClub);
            const awayClub = this.clubs.find(club => club.name === name_awayClub);
            //get goals
            const homeGoals = parseInt(goalInputs[i].value);
            const awayGoals = parseInt(goalInputs[i + 1].value);

            if(homeClub===undefined || awayClub===undefined){
                throw new Error(`One or both clubs (${name_homeClub}, ${name_awayClub}) not found in dClubs.`);
            }
            if(homeGoals<0 || awayGoals<0){
                throw new Error("Goals cannot be negative.");
            }
    
            if(isNaN(homeGoals) || isNaN(awayGoals)){
                throw new Error("Goals cannot be empty.");//also throws when goals entered ar not an int
            }
            if(homeGoals>awayGoals){
                //kick out away Team
                clubsToKickOut.push(awayClub);
            }
            else if(homeGoals<awayGoals){
                //kick out home team
                clubsToKickOut.push(homeClub);
            }
            else if (homeGoals === awayGoals) {
                //Handle penalty shootout asynchronously
                const winner = await new Promise((resolve) => {
                    createPopup(
                        this.name,
                        "Who wins in Penalty Shootout?",
                        2,
                        [homeClub.name, awayClub.name],
                        [
                            () => resolve(homeClub),
                            () => resolve(awayClub),
                        ]
                    );
                });
                clubsToKickOut.push(winner === homeClub ? awayClub : homeClub);
                closePopup();
            }
        }

        clubsToKickOut.forEach(clubb => {
            this.remainingClubs = this.remainingClubs.filter(club => club !== clubb);
        });

        if(isPowerOfTwo(this.remainingClubs.length) && this.remainingClubs.length>=2){
            this.drawNewRound();
            document.getElementById("LeagueTable").style.display = "block";
            if(debug_log_everything)console.log("CALL A");
            matchesCalculated(this,false);
        }
        else if(this.remainingClubs.length=1){
            console.log(this.remainingClubs[0].name + " wins the cup!");
            document.getElementById("LeagueTable").style.display = "block";
            if(debug_log_everything)console.log("CALL B");
            matchesCalculated(this,false);
        }
        else throw new Error("Cup has an invalid number of clubs left!");
    }
}

class Match {
    constructor(homeClub, awayClub, homeGoals, awayGoals, leagueName, played = false) {
        this.homeClub = homeClub;
        this.awayClub = awayClub;
        this.homeGoals = homeGoals;
        this.awayGoals = awayGoals;
        this.played = played;
        
        // Find and assign the league object from the predefined list
        this.league = dLeagues.find(leagueObj => leagueObj.name === leagueName);
        
        // Add match to the league if found
        if (this.league) {
            this.league.addMatch(this);
            this.homeClub.addMatch(this);
            this.awayClub.addMatch(this);
        } else {
            console.warn("League not found for match: ", this);
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
            
            this.homeClub.checkHighestVictory(this);
            this.awayClub.checkHighestLoss(this);

            this.homeClub.totalVictories +=1;
            this.awayClub.totalDefeats +=1;

        } else if (this.homeGoals < this.awayGoals) {
            this.awayClub.leagueStats[this.league.name][0] += 3;//Away club wins
            this.awayClub.leagueStats[this.league.name][3] += 1;
            this.homeClub.leagueStats[this.league.name][5] += 1;

            this.homeClub.checkHighestLoss(this);
            this.awayClub.checkHighestVictory(this);

            this.homeClub.totalDefeats +=1;
            this.awayClub.totalVictories +=1;

        } else {
            this.homeClub.leagueStats[this.league.name][0] += 1;//Draw
            this.awayClub.leagueStats[this.league.name][0] += 1;
            this.homeClub.leagueStats[this.league.name][4] += 1;
            this.awayClub.leagueStats[this.league.name][4] += 1;

            this.homeClub.totalDraws+=1;
            this.awayClub.totalDraws+=1;
        }
        //add the goals
        this.homeClub.leagueStats[this.league.name][1] += this.homeGoals;
        this.homeClub.leagueStats[this.league.name][2] += this.awayGoals;
        this.awayClub.leagueStats[this.league.name][1] += this.awayGoals;
        this.awayClub.leagueStats[this.league.name][2] += this.homeGoals;

        //add stats
        this.homeClub.totalGoals += this.homeGoals;
        this.awayClub.totalGoals += this.awayGoals;
        this.homeClub.totalMatches += 1;
        this.awayClub.totalMatches += 1;

        this.played = true;
    }
}

class Calendar{
    constructor(Leagues = []){
        this.partakingLeagues = Leagues;
        this.Calendar = this.initCalendar();
        this.calendarIndex = 0;
    }
      
      initCalendar() {
        if(this.partakingLeagues.length == 0) return [];
        console.log(this.partakingLeagues.length);
        console.log(this.partakingLeagues);
        if(this.partakingLeagues.length == 0) return [];
        const leagues = this.partakingLeagues.map(league => ({
            name: league.name,
            matchdays: league.matchdaysThisSeason,
        }));
        // console.log(leagues);
        const calendar = [];
        let leaguesLeft = leagues.length;
        
        //find lowest number of matchdays
        const minMatchdays = Math.min(...leagues.map(league => league.matchdays));
        
        //add the first "minMatchdays" of each league to the calendar BUT save a list of all matchdays that were not used
        for (let i = 0; i < minMatchdays; i++) {
          leagues.forEach(league => {
            if (league.matchdays > 0) {
              calendar.push(league);
              league.matchdays--;
              if(league.matchdays == 0) leaguesLeft-=1;
            }
          });
        }

        //add the remaining matchdays to the calendar at a random position
        //for (let i = 0; i < minMatchdays; i++) { // @future erik: lol u cant just put minMatchdays here too. (i just copy pasted it for now) (wont work later) @past erik: i am future erik and i wanna kill u for not just implementing this correctly, i just spent 3h debugging bcs of this u bastard
        while (leaguesLeft > 0) {
            console.log("Loop Iteration - leaguesLeft:", leaguesLeft);
            
            let didSomething = false; // Track if anything changed

            console.log(leagues);
        
            leagues.forEach(league => {
                if (league.matchdays > 0) {
                    console.log(`Processing league: ${league.name}, matchdays left: ${league.matchdays}`);
                    
                    const randomIndex = Math.floor(Math.random() * calendar.length);
                    calendar.splice(randomIndex, 0, league);
                    league.matchdays--;
                    didSomething = true;
        
                    if (league.matchdays === 0) {
                        leaguesLeft--;
                        console.log(`League ${league.name} finished. leaguesLeft: ${leaguesLeft}`);
                    }
                }
            });
        
            if (!didSomething) {
                console.error("⚠️ Infinite Loop Detected: No changes happening!");
                break;
            }
        }

        //update the calendar to only return league names not objects
        for (let i = 0; i < calendar.length; i++) {
          calendar[i] = calendar[i].name;
        }
        
      
        return calendar;
      }

      getRemaining(){
        return this.Calendar.length - this.calendarIndex;
      }

      spreadIntoCalendar(name,matchdays){
        let gameInterval = Math.floor(this.getRemaining() / matchdays);

        for (let i = 1; i<=matchdays;i++){
            let index = this.calendarIndex + gameInterval * i;
            this.Calendar.splice(index,0,name);
        }
      }
}

class SeasonManager {
    constructor() {
    }

    handleSeasonTransition() {
        // Store the current standings before resetting
        const leagueStandings = {};
        dLeagues.forEach(league => {
            leagueStandings[league.name] = [...league.sortedClubs];
        });

        // Group leagues by association
        const leaguesByAssociation = {};
        dLeagues.forEach(league => {
            if (!leaguesByAssociation[league.association]) {
                leaguesByAssociation[league.association] = [];
            }
            leaguesByAssociation[league.association].push(league);
        });
        
        // Handle each association separately
        for (const association in leaguesByAssociation) {
            // Sort leagues inside association
            const sortedLeagues = leaguesByAssociation[association].sort((a, b) => a.level - b.level);
            
            // Handle promotion+relegation
            for (let i = 0; i < sortedLeagues.length; i++) {
                const currentLeague = sortedLeagues[i];
                const lowerLeague = sortedLeagues[i + 1];
                const higherLeague = sortedLeagues[i - 1];

                // Use stored standings for relegation/promotion decisions
                currentLeague.sortedClubs = leagueStandings[currentLeague.name];
                
                // Get the clubs to be relegated/promoted
                const clubsToRelegate = this.getClubsToRelegate(currentLeague);
                const clubsToPromote = this.getClubsToPromote(currentLeague);

                // Handle promotion
                if (clubsToPromote.length > 0 && higherLeague) {
                    console.log("%c"+currentLeague.name + " Promotion:","color:cornflowerblue")
                    clubsToPromote.forEach(club => {
                        console.log(club.name);
                        currentLeague.removeClub(club);
                        higherLeague.addClub(club);
                    });
                }

                // Handle relegation
                if (clubsToRelegate.length > 0 && lowerLeague) {
                    console.log("%c"+currentLeague.name + " Relegation:","color:cornflowerblue")
                    clubsToRelegate.forEach(club => {
                        console.log(club.name);
                        currentLeague.removeClub(club);
                        lowerLeague.addClub(club);
                    });
                }
            }
        }

        // Reset league statistics for the new season after all promotions/relegations are done
        this.resetLeagueStats();
        
        //reset cups as well
        dTournaments.forEach(cup => {
            cup.resetCup();
        });
        
        return 1;
    }

    // Rest of the SeasonManager class methods remain unchanged
    getClubsToRelegate(league) {
        const sortedClubs = [...league.sortedClubs];
        const clubsToRelegate = [];
    
        league.relegatePositions.forEach(position => {
            const clubName = sortedClubs[position - 1]?.name;
    
            // Only log when clubName is undefined or invalid
            if (!clubName) {
                console.error('Error: Club name is undefined at position in relegatePositions:', position);
                return;  // Skip processing for this position if clubName is invalid
            }
    
            const club = league.clubs.find(c => c.name === clubName);
            
            // Only log if the club is not found
            if (!club) {
                console.error('Error: Club not found in league.clubs for name:', clubName);
                return;  // Skip processing for this position if club is not found
            }
    
            clubsToRelegate.push(club);
        });
    
        if (league.relegatePlayoffs.length > 0) {
            league.relegatePlayoffs.forEach(position => {
                const clubName = sortedClubs[position - 1]?.name;
    
                // Only log when clubName is undefined or invalid
                if (!clubName) {
                    console.error('Error: Club name is undefined at position in relegatePlayoffs:', position);
                    return;  // Skip processing for this position if clubName is invalid
                }
    
                const club = league.clubs.find(c => c.name === clubName);
                
                // Only log if the club is not found
                if (!club) {
                    console.error('Error: Club not found in league.clubs for name:', clubName);
                    return;  // Skip processing for this position if club is not found
                }
    
                clubsToRelegate.push(club);
            });
        }
    
        return clubsToRelegate;
    }
    

    getClubsToPromote(league) {
        const sortedClubs = [...league.sortedClubs];
        const clubsToPromote = [];

        league.promotePositions.forEach(position => {
            const clubName = sortedClubs[position - 1].name;
            const club = league.clubs.find(c => c.name === clubName);
            if (club) clubsToPromote.push(club);
        });

        if(league.promotePlayoffs.length > 0) {
            league.promotePlayoffs.forEach(position => {
                const clubName = sortedClubs[position - 1].name;
                const club = league.clubs.find(c => c.name === clubName);
                if (club) clubsToPromote.push(club);
            });
        }

        return clubsToPromote;
    }

    resetLeagueStats() {
        dLeagues.forEach(league => {
            league.isInKnockoutPhase=false;

            league.matches = [];
            league.crntweek = 0;
            league.lastShownMatchIndex = 0;
            league.matchdaysPlayed = 0;
            league.sortedClubs = league.init_sortedClubs(league.clubs);
            league.matchplan = league.generateMatchplan();
            

            league.clubs.forEach(club => {
                club.matches = [];
                club.leagueStats = {};
                club.initializeLeagueStats(league.name);
            });
        });
    }
}


async function calculateInput() { //called when the calculate button is pressed, turns user input into actual matches
    const leagueName = activeLeague.name;
    const league = activeLeague;
    let todaysMatches = [];
    let todaysWinnerNames = [];
    if (!league) {
        throw new Error(`League ${leagueName} not found.`);
    }
    
    const container = document.getElementById("inputContainer");
    for (let innerContainer of container.children) {
        if (innerContainer.tagName !== 'DIV') {
            continue; //skip Calc Button and other non-DIV elements
        }
        const homeClubName = innerContainer.children[0].value;
        const awayClubName = innerContainer.children[3].value;
        const homeGoals = parseInt(innerContainer.children[1].value);
        const awayGoals = parseInt(innerContainer.children[4].value);
        
        // Search for clubs in dClubs first, then in the pools if not found
        let homeClub = dClubs.find(club => club.name === homeClubName);
        if (!homeClub) {
            homeClub = clPool.find(club => club.name === homeClubName) ||
                       elPool.find(club => club.name === homeClubName) ||
                       colPool.find(club => club.name === homeClubName);
        }
        if(!homeClub){
            homeClub = realChampionsLeagueClubs.find(club => club.name === homeClubName) ||
                       realEuropaLeagueClubs.find(club => club.name === homeClubName) ||
                       realConferenceLeagueClubs.find(club => club.name === homeClubName);
        }
        
        let awayClub = dClubs.find(club => club.name === awayClubName);
        if (!awayClub) {
            awayClub = clPool.find(club => club.name === awayClubName) ||
                       elPool.find(club => club.name === awayClubName) ||
                       colPool.find(club => club.name === awayClubName);
        }
        if(!awayClub){
            awayClub = realChampionsLeagueClubs.find(club => club.name === awayClubName) ||
                       realEuropaLeagueClubs.find(club => club.name === awayClubName) ||
                       realConferenceLeagueClubs.find(club => club.name === awayClubName);
        }

        if (!homeClub || !awayClub) {
            throw new Error(`One or both clubs (${homeClubName}, ${awayClubName}) not found in dClubs or pools.`);
        }

        // Check if both clubs are in the league
        const homeClubInLeague = league.clubs.includes(homeClub);
        const awayClubInLeague = league.clubs.includes(awayClub);

        if (!homeClubInLeague || !awayClubInLeague) {
            throw new Error(`One or both clubs (${homeClubName}, ${awayClubName}) are not in the ${leagueName} league.`);
        }
        if (homeGoals < 0 || awayGoals < 0) {
            throw new Error("Goals cannot be negative.");
        }

        if (isNaN(homeGoals) || isNaN(awayGoals)) {
            throw new Error("Goals cannot be empty."); //also throws when goals entered are not an int
        }

        if (homeGoals > awayGoals) todaysWinnerNames.push(homeClub.name);
        else if (homeGoals < awayGoals) todaysWinnerNames.push(awayClub.name);
        else if (homeGoals === awayGoals && league.isInKnockoutPhase) {
            // Handle penalty shootout asynchronously
            const winner = await new Promise((resolve) => {
                createPopup(
                    leagueName, // Use leagueName instead of this.name
                    "Who wins in Penalty Shootout?",
                    2,
                    [homeClub.name, awayClub.name],
                    [
                        () => resolve(homeClub),
                        () => resolve(awayClub),
                    ]
                );
            });
            todaysWinnerNames.push(winner.name);
            closePopup();
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

    // @UEFA: Handle knockout phase
    if (league.knockoutTeams > 0) {
        if (league.matchLimit === league.crntweek + 1 && !league.isInKnockoutPhase) {
            console.log(league.name + " knockout phase started");
            league.isInKnockoutPhase = true;

            const top16Teams = sortedClubs.slice(0, league.knockoutTeams);
            league.knockoutTeamsList = top16Teams.map(team => team.name);
            top16Teams.sort(() => Math.random() - 0.5);
            const matchplanIndex = (league.crntweek + 1) * league.clubs.length / 2;
            for (let i = 0; i < league.knockoutTeams / 2; i++) {
                league.matchplan[matchplanIndex + i] = [top16Teams[i], top16Teams[league.knockoutTeams - i - 1]];
            }
        } else if (league.isInKnockoutPhase) {
            console.log("okay so we just played a knockout round for " + league.name);
            const advancingTeams = todaysWinnerNames;
            if(debug_log_everything)console.log("Advancing Teams: " + advancingTeams); //DEBUG
            league.knockoutTeamsList = advancingTeams.map(team => team.name);
            if(debug_log_everything)console.log("Teams Left: " +league.knockoutTeamsList); //DEBUG
            advancingTeams.sort(() => Math.random() - 0.5);
            if(debug_log_everything)console.log("Shuffled List of Advancing Teams: " + advancingTeams); //DEBUG
            if(debug_log_everything)console.log("Length of Advancing Teams List: " + advancingTeams.length); //DEBUG
            if (advancingTeams.length === 1) {
                let LeagueChampion = advancingTeams[0];
                console.log(LeagueChampion + " has won " + league.name);
            }
            let index = league.matchplan.findIndex(item => item[0] === null && item[1] === null);
            if(index<0) index = league.matchplan.findIndex(item => item[0] === undefined && item[1] === undefined);
            if(debug_log_everything)console.log("Index: " + index); //DEBUG
            if(debug_log_everything)console.log("Matchplan: "); //DEBUG
            if(debug_log_everything)console.log(league.matchplan); //DEBUG
            for (let i = 0; i < advancingTeams.length / 2; i++) {
                if(debug_log_everything)console.log("Next up: " + advancingTeams[i] + " vs " + advancingTeams[advancingTeams.length - i - 1]); //DEBUG
                league.matchplan[index + i] = [
                    { name: advancingTeams[i] }, 
                    { name: advancingTeams[advancingTeams.length - i - 1] }
                ];
            }
            if(debug_log_everything)console.log("The Matchplan now: "); //DEBUG
            if(debug_log_everything)console.log(league.matchplan); //DEBUG
        }
    }
    
    if (debug_console_tables || debug_log_everything) console.table(sortedClubs);
    updateTabel(sortedClubs, league);
    league.updateStats(sortedClubs);
    if (debug_log_everything) console.log("CALL C");
    matchesCalculated(league);
}

function matchesCalculated(lastLeague,leagueDone=false) {
    if(debug_log_everything)console.log("huh")
    seasonCalendar.calendarIndex+=1;
    // console.log("Remaining:" + seasonCalendar.getRemaining());
    resetClubInfo();
    if (leagueDone) {
        //remove from loaded leagues if done
        finshedLeagues.push(lastLeague);
    }
    //check if all leagues are done
    if (seasonCalendar.calendarIndex >= seasonCalendar.Calendar.length) {
        seasonOver();
        return;
    }
    //continue if not
    lastLeague.crntweek +=1;

    activeLeagueName = seasonCalendar.Calendar[seasonCalendar.calendarIndex];
    activeLeague = dLeagues.find(league => league.name === activeLeagueName);
    if(!activeLeague){ //IF NOT A LEAGUE, LOOK FOR TORNAMENT INSTEAD
        activeLeague = dTournaments.find(tournament => tournament.name === activeLeagueName);
        if(!activeLeague){ //if also not a tournament... idk... lick my balls cuz idk how that got into the calendar then...
            throw new Error(`League/Cup ${activeLeagueName} not found.`);
        }
        //run this if it is a cup
        switchToCup(activeLeague);
    }
    else{
        //or run this if it is a league
        showMatches(activeLeague.name);
        updateTabel(activeLeague.getSortedClubs(),activeLeague)
    }

    switchToNextInput(false);


    // every time the button was pressed, save it to local storage
    if(savingEnabled) saveToStorage();
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
    if(league.isInKnockoutPhase){
        matchesAmntMatchday = league.knockoutTeamsList.length/2;
    }
    let remainingMatches = matchesAmntMatchday;

    if(debug_log_everything)console.log(`Spieltag: ${league.crntweek}, Geplante Matches: ${matchesAmntMatchday}`);
    if(debug_log_everything)console.log("[DEBUG] League: ", league);
    if(debug_log_everything)console.log("[DEBUG] Matchplan: ", league.matchplan);

    while (remainingMatches > 0) {
        // let index = (matchesAmntMatchday - remainingMatches) + league.crntweek * matchesAmntMatchday;
        let index = league.lastShownMatchIndex;
        let match = league.matchplan[index];

        if(debug_log_everything)console.log(`\n[DEBUG] Prüfe Match Index: ${index}`);
        if(debug_log_everything)console.log(`[DEBUG] Prüfe Last Shown Match Index: ${league.lastShownMatchIndex}`);

        if (match) {
            try {
                t1 = match[0].name;
                t2 = match[1].name;
                
                if(debug_log_everything)console.log(`  → Match gefunden: ${t1} vs. ${t2}`);
                remainingMatches--;
            } catch (error) {
                console.error(`[ERROR] Fehler bei Match ${index}:`, error);

                remainingMatches = 0;
                league.matchdaysPlayed += 1;
                container.appendChild(document.createElement("br"));

                const calcButton = document.createElement("button");
                calcButton.id = "calcButton";
                calcButton.innerText = "Continue";
                calcButton.onclick = calculateInput;
                calcButton.disabled = false;
                container.appendChild(calcButton);
                return;
            }
        } else {
            console.warn(`[WARN] Kein Match gefunden an Index ${index}. Schleife wird abgebrochen.`);
            return;
        }
        
        
//-------------NEW MATCHMAKING--------------

        league.lastShownMatchIndex+=1;
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
            if(debug_fast_skip)inputG1.value = 0;
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
            if(debug_fast_skip)inputG2.value = 0;

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

    const calcButton = document.createElement("button");
    calcButton.id = "calcButton";
    calcButton.classList.add("gameButton");
    calcButton.innerText = "Continue";
    calcButton.onclick = calculateInput;
    calcButton.disabled = false;
    container.appendChild(calcButton);

    const simulationButton = document.createElement("button");
    simulationButton.id = "simButton";
    simulationButton.classList.add("gameButton");
    simulationButton.innerText = "Simulate All";
    simulationButton.onclick = simulateAll;
    simulationButton.disabled = false;
    container.appendChild(simulationButton);
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
    document.getElementById("LeagueTable").style.display = "block";
    //I know whats coming now is ass as fuck but i did that at 4am or so pls-
    //well do that better eventually. first things first.
    const tableBody = document.getElementById("LeagueTable");
    tableBody.innerHTML = "";
    const theadrow = document.createElement("tr");
    const positionHeader = document.createElement("th");
    positionHeader.textContent = "Pos.";
    const nameHeader = document.createElement("th");
    nameHeader.textContent = "Name";
    const playedHeader = document.createElement("th");
    playedHeader.textContent = "M";
    const pointsHeader = document.createElement("th");
    pointsHeader.textContent = "Pts.";
    const goalDiffHeader = document.createElement("th");
    goalDiffHeader.textContent = "+/-";
    const goalsHeader = document.createElement("th");
    goalsHeader.textContent = "Goals";
    const concededHeader = document.createElement("th");
    concededHeader.textContent = "Rcvd.";
    const winsHeader = document.createElement("th");
    winsHeader.textContent = "W";
    const drawsHeader = document.createElement("th");
    drawsHeader.textContent = "D";
    const lossesHeader = document.createElement("th");
    lossesHeader.textContent = "L";
    theadrow.appendChild(positionHeader);
    theadrow.appendChild(nameHeader);
    theadrow.appendChild(playedHeader);
    theadrow.appendChild(pointsHeader);
    theadrow.appendChild(goalDiffHeader);
    theadrow.appendChild(goalsHeader);
    theadrow.appendChild(concededHeader);
    theadrow.appendChild(winsHeader);
    theadrow.appendChild(drawsHeader);
    theadrow.appendChild(lossesHeader);
    if(!league.isInKnockoutPhase)tableBody.appendChild(theadrow);
    sortedClubs.forEach(club => {
        const row = document.createElement("tr");
        const positionCell = document.createElement("td");
        positionCell.textContent = sortedClubs.indexOf(club)+1;
        const nameCell = document.createElement("td");
        nameCell.innerHTML = "<b>"+club.name;
        const playedCell = document.createElement("td");
        playedCell.innerHTML = +league.crntweek;
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
        row.appendChild(playedCell);
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
        if(!league.isInKnockoutPhase)tableBody.appendChild(row);
    });
}

function switchToNextInput(first) {
    if(event.key=='Enter'||event.key=="F5" || event.key == "Backspace")return;
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
        if(document.getElementById("submitButton"))document.getElementById("submitButton").focus();
    }
}

function resetClubInfo(){
    document.getElementById("ClubInfoContainer").innerHTML = "";
}

function updateClubInfo(clubSorted) {
    const club = dClubs.find(club => club.name === clubSorted.name) || clPool.find(club => club.name === clubSorted.name) || elPool.find(club => club.name === clubSorted.name) || colPool.find(club => club.name === clubSorted.name) || realChampionsLeagueClubs.find(club => club.name === clubSorted.name) || realEuropaLeagueClubs.find(club => club.name === clubSorted.name) || realConferenceLeagueClubs.find(club => club.name === clubSorted.name);

    resetClubInfo();
    const infoContainer = document.getElementById("ClubInfoContainer");
    
    // Club name header
    if(debug_log_everything)console.log("opened menu for "+club.name);
    const clubHeader = document.createElement("h1");
    clubHeader.textContent = club.name;
    clubHeader.classList.add("win95-window-title");
    clubHeader.style.marginTop = "20px";

    // Close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "X";
    closeButton.classList.add("win95-close");
    closeButton.onclick = () => {
        resetClubInfo();
    };
    clubHeader.appendChild(closeButton);

    infoContainer.appendChild(clubHeader);

    // Create tab container
    const tabContainer = document.createElement("div");
    tabContainer.classList.add("win95-tab-container");
    infoContainer.appendChild(tabContainer);
    
    // Create tabs
    const tabs = [
        { id: "matchHistory", label: "Match History" },
        { id: "clubStats", label: "Club Stats" }
    ];
    
    // Content containers
    const contentContainers = {};
    
    tabs.forEach((tab, index) => {
        // Create tab button
        const tabButton = document.createElement("button");
        tabButton.textContent = tab.label;
        tabButton.id = `tab-${tab.id}`;
        tabButton.classList.add("win95-tab");
        if (index === 0) tabButton.classList.add("win95-tab-active");
        tabContainer.appendChild(tabButton);
        
        // Create content container
        const contentContainer = document.createElement("div");
        contentContainer.id = `content-${tab.id}`;
        contentContainer.classList.add("win95-content");
        if (index !== 0) contentContainer.classList.add("win95-content-hidden");
        infoContainer.appendChild(contentContainer);
        contentContainers[tab.id] = contentContainer;
        
        // Add click event
        tabButton.addEventListener("click", () => {
            // Update active tab
            tabs.forEach(t => {
                document.getElementById(`tab-${t.id}`).classList.remove("win95-tab-active");
                document.getElementById(`content-${t.id}`).classList.add("win95-content-hidden");
            });
            tabButton.classList.add("win95-tab-active");
            contentContainer.classList.remove("win95-content-hidden");
        });
    });
    
    // Setup Match History tab content
    const matchContent = contentContainers.matchHistory;
    
    // League selection header
    const leagues = ["All", ...club.getLeagues()];
    let currentLeagueIndex = 0;

    // Initialize with active league if available
    if (activeLeague && activeLeague.name) {
        const activeIndex = leagues.indexOf(activeLeague.name);
        if (activeIndex !== -1) currentLeagueIndex = activeIndex;
    }

    // Create league navigation container
    const leagueNav = document.createElement("div");
    leagueNav.classList.add("win95-nav-container");

    // Navigation arrows
    const leftArrow = document.createElement("button");
    leftArrow.innerHTML = "&larr;";
    leftArrow.classList.add("win95-button", "win95-arrow");

    const leagueTitle = document.createElement("div");
    leagueTitle.textContent = leagues[currentLeagueIndex];
    leagueTitle.classList.add("win95-title-box");

    const rightArrow = document.createElement("button");
    rightArrow.innerHTML = "&rarr;";
    rightArrow.classList.add("win95-button", "win95-arrow");

    // Assemble navigation
    if(leagues.length > 2) leagueNav.appendChild(leftArrow);
    leagueNav.appendChild(leagueTitle);
    if(leagues.length > 2) leagueNav.appendChild(rightArrow);
    matchContent.appendChild(leagueNav);

    // Match table setup
    const matchContainer = document.createElement("div");
    matchContainer.classList.add("win95-table-container");
    const matchTable = document.createElement("table");
    matchTable.classList.add("win95-table");

    // Table header
    const headerRow = document.createElement("tr");
    ["Home Team", "Home Goals", "Away Goals", "Away Team"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        th.classList.add("win95-table-header");
        headerRow.appendChild(th);
    });
    matchTable.appendChild(headerRow);
    matchContainer.appendChild(matchTable);
    matchContent.appendChild(matchContainer);

    // Match rendering function
    const updateMatches = (leagueFilter) => {
        // Clear existing matches
        while (matchTable.rows.length > 1) matchTable.deleteRow(1);

        club.matches.forEach(match => {
            if (leagueFilter === "All" || match.league.name === leagueFilter) {
                const row = document.createElement("tr");
                
                const homeCell = document.createElement("td");
                homeCell.textContent = match.homeClub.name;
                if(match.homeClub.name == club.name) homeCell.style.fontWeight = "bold";
                homeCell.classList.add("win95-table-cell");
                
                const homeGoals = document.createElement("td");
                homeGoals.textContent = match.homeGoals;
                homeGoals.classList.add("win95-table-cell");
                
                const awayGoals = document.createElement("td");
                awayGoals.textContent = match.awayGoals;
                awayGoals.classList.add("win95-table-cell");
                
                const awayCell = document.createElement("td");
                awayCell.textContent = match.awayClub.name;
                if(match.awayClub.name == club.name) awayCell.style.fontWeight = "bold";
                awayCell.classList.add("win95-table-cell");

                row.classList.add("win95-table-row");
                
                if(show_color_in_match_list){
                    if(match.homeGoals > match.awayGoals && club.name == match.homeClub.name) row.classList.add("win95-result-win");
                    else if(match.homeGoals > match.awayGoals && club.name == match.awayClub.name) row.classList.add("win95-result-loss");
                    else if(match.homeGoals < match.awayGoals && club.name == match.homeClub.name) row.classList.add("win95-result-loss");
                    else if(match.homeGoals < match.awayGoals && club.name == match.awayClub.name) row.classList.add("win95-result-win");
                    else row.classList.add("win95-result-draw");
                }

                row.append(homeCell, homeGoals, awayGoals, awayCell);
                matchTable.appendChild(row);
            }
        });
    };

    // Initial population
    updateMatches(leagues[currentLeagueIndex]);

    // Navigation handlers
    leftArrow.addEventListener("click", () => {
        currentLeagueIndex = (currentLeagueIndex - 1 + leagues.length) % leagues.length;
        leagueTitle.textContent = leagues[currentLeagueIndex];
        updateMatches(leagues[currentLeagueIndex]);
    });

    rightArrow.addEventListener("click", () => {
        currentLeagueIndex = (currentLeagueIndex + 1) % leagues.length;
        leagueTitle.textContent = leagues[currentLeagueIndex];
        updateMatches(leagues[currentLeagueIndex]);
    });
    
    // Setup Club Stats tab content
    const statsContent = contentContainers.clubStats;
    
    // Placeholder stats content
    const statsContainer = document.createElement("div");
    statsContainer.classList.add("win95-stats-container");

    const developmentButton = document.createElement("button");
    developmentButton.textContent = "Development";
    developmentButton.classList.add("win95-button");
    developmentButton.style.backgroundColor = "#DDDDDD";
    developmentButton.style.padding = "12px";
    developmentButton.addEventListener("click", () => {
        showDiagram(club.seasonalPositions, activeLeague.name, club.name);
    });

    statsContainer.appendChild(developmentButton);
    
    // Create stats cards
    const statsData = [
        { 
            title: "Highest Victory",
            value: club.highestVictoryMatch ? formatMatch(club.highestVictoryMatch, club.name) : "No matches won"
        },
        { 
            title: "Worst Defeat", 
            value: club.highestLossMatch ? formatMatch(club.highestLossMatch, club.name) : "No matches lost"
        },
        { 
            title: "Total Matches", 
            value: `${club.totalMatches} matches played`
        },
        { 
            title: "Total Goals", 
            value: `${club.totalGoals} goals shot \n avg. ${(club.totalGoals / club.totalMatches).toFixed(1)} per match`
        },
        {
            title: "Wins/Draws/Losses",
            value: `${club.totalVictories} / ${club.totalDraws} / ${club.totalDefeats} \n  ${((club.totalVictories / club.totalMatches) * 100).toFixed(0)}% / ${((club.totalDraws / club.totalMatches) * 100).toFixed(0)}% / ${((club.totalDefeats / club.totalMatches) * 100).toFixed(0)}%`
        }        
    ];
    
    
    statsData.forEach(stat => {
        const statCard = document.createElement("div");
        statCard.classList.add("win95-stat-card");
        
        const statTitle = document.createElement("div");
        statTitle.textContent = stat.title;
        statTitle.classList.add("win95-stat-title");
        
        const statValue = document.createElement("div");
        statValue.innerHTML = stat.value.replace(/\n/g, "<br>");
        statValue.classList.add("win95-stat-value");
        
        statCard.appendChild(statTitle);
        statCard.appendChild(statValue);
        statsContainer.appendChild(statCard);
    });
    
    statsContent.appendChild(statsContainer);
}

function formatMatch(match, clubName) {
    if(!match || !match.homeClub || !match.awayClub) return "🔴 Unexpected Error 🔴";
    const isHomeMatch = match.homeClub.name === clubName;
    const opponent = isHomeMatch ? match.awayClub.name : match.homeClub.name;
    const score = `${match.homeGoals} - ${match.awayGoals}`;
    const result = isHomeMatch 
        ? (match.homeGoals > match.awayGoals ? "Win" : (match.homeGoals < match.awayGoals ? "Loss" : "Draw"))
        : (match.awayGoals > match.homeGoals ? "Win" : (match.awayGoals < match.homeGoals ? "Loss" : "Draw"));
    
    return `${score} ${isHomeMatch ? "vs." : "at"} ${opponent}`;
}

function populateInternationalLeagues() {
    const qualifiedClubs = new Set();
    const clQualifiers = [];
    const elQualifiers = [];
    const colQualifiers = [];

    // Function to get qualifying clubs from a league based on positions
    const getQualifyingClubs = (league, positions) => {
        return positions.map(pos => {
            const clubName = league.sortedClubs[pos - 1]?.name;
            return league.clubs.find(club => club.name === clubName);
        }).filter(club => club); // Filter out undefined
    };

    // Step 1: Collect all qualifiers from domestic leagues
    dLeagues.forEach(domesticLeague => {
        if (domesticLeague.association !== "UCL" && 
            domesticLeague.association !== "UEL" && 
            domesticLeague.association !== "UCoL") {
            // Champions League qualifiers
            if (domesticLeague.CLPositions?.length > 0) {
                const qualifiers = getQualifyingClubs(domesticLeague, domesticLeague.CLPositions);
                qualifiers.forEach(club => {
                    if (!qualifiedClubs.has(club)) {
                        clQualifiers.push(club);
                        qualifiedClubs.add(club);
                    }
                });
            }
            // Europa League qualifiers
            if (domesticLeague.ELPositions?.length > 0) {
                const qualifiers = getQualifyingClubs(domesticLeague, domesticLeague.ELPositions);
                qualifiers.forEach(club => {
                    if (!qualifiedClubs.has(club)) {
                        elQualifiers.push(club);
                        qualifiedClubs.add(club);
                    }
                });
            }
            // Conference League qualifiers
            if (domesticLeague.CoLPositions?.length > 0) {
                const qualifiers = getQualifyingClubs(domesticLeague, domesticLeague.CoLPositions);
                qualifiers.forEach(club => {
                    if (!qualifiedClubs.has(club)) {
                        colQualifiers.push(club);
                        qualifiedClubs.add(club);
                    }
                });
            }
        }
    });

    console.log(`CL Qualifiers from domestic leagues: ${clQualifiers.length}`);
    console.log(`EL Qualifiers from domestic leagues: ${elQualifiers.length}`);
    console.log(`CoL Qualifiers from domestic leagues: ${colQualifiers.length}`);

    // Step 2: Assign qualifiers and fill each league
    const processLeague = (leagueName, qualifiers, fillPool) => {
        const league = dLeagues.find(l => l.name === leagueName);
        if (!league) {
            console.error(`League ${leagueName} not found`);
            return;
        }

        // Clear current clubs
        league.clubs = [];
        league.sortedClubs = [];
        league.matches = [];
        league.matchplan = [];

        // Add domestic qualifiers
        league.clubs = [...qualifiers];
        console.log(`${leagueName} - Assigned qualifiers: ${league.clubs.length}`);

        // Fill remaining slots (up to 36) from the specific pool
        const targetClubCount = 36;
        const remainingSlots = targetClubCount - league.clubs.length;
        if (remainingSlots > 0) {
            // Shuffle the pool to randomize selection
            const shuffledPool = [...fillPool].sort(() => Math.random() - 0.5);
            let addedCount = 0;

            for (let i = 0; i < shuffledPool.length && addedCount < remainingSlots; i++) {
                const club = shuffledPool[i];
                if (!qualifiedClubs.has(club)) { // Ensure no duplicates across competitions
                    league.clubs.push(club);
                    qualifiedClubs.add(club);
                    addedCount++;
                }
            }

            if (addedCount < remainingSlots) {
                console.warn(`${leagueName} - Not enough unique clubs in pool to fill all slots (Added: ${addedCount}, Needed: ${remainingSlots})`);
            }
        }

        console.log(`${leagueName} - Total clubs after filling: ${league.clubs.length}`);

        // Initialize league stats and regenerate matchplan
        league.clubs.forEach(club => club.initializeLeagueStats(league.name));
        league.sortedClubs = league.init_sortedClubs(league.clubs);
        league.matchplan = league.generateMatchplan();
    };

    // Process all leagues with their respective pools
    processLeague("Champions League", clQualifiers, clPool);
    processLeague("Europa League", elQualifiers, elPool);
    processLeague("Conference League", colQualifiers, colPool);

    // Final verification
    const cl = dLeagues.find(l => l.name === "Champions League");
    const el = dLeagues.find(l => l.name === "Europa League");
    const col = dLeagues.find(l => l.name === "Conference League");
    console.log(`Final Counts - CL: ${cl.clubs.length}, EL: ${el.clubs.length}, CoL: ${col.clubs.length}`);
    if (debug_log_everything) {
        console.log("CL Clubs:", cl.clubs.map(c => `${c.name} (${c.hardcodedRating})`));
        console.log("EL Clubs:", el.clubs.map(c => `${c.name} (${c.hardcodedRating})`));
        console.log("CoL Clubs:", col.clubs.map(c => `${c.name} (${c.hardcodedRating})`));
    }
}

// Call this function at the start of a new season, after standings are finalized
function startNewSeasonWithInternationalLeagues() {
    // Then populate international leagues
    populateInternationalLeagues();

    // First handle domestic league transitions
    seasonManager.handleSeasonTransition();

    // Reset calendar with all leagues (including international ones)
    seasonCalendar = new Calendar(loadedLeagues);
    loadedCups.forEach(cup => {
        seasonCalendar.spreadIntoCalendar(cup.name, cup.totalRounds);
    });
    console.log("ft");
    // Start with first league
    activeLeagueName = seasonCalendar.Calendar[seasonCalendar.calendarIndex];
    console.log("ftt "+activeLeagueName)
    activeLeague = dLeagues.find(league => league.name === activeLeagueName);
    if(!activeLeague){
        switchToCup(dTournaments.find(cup => cup.name === activeLeagueName));
        return;
    }
    console.log("ftt")
    showMatches(activeLeague.name);
    updateTabel(activeLeague.getSortedClubs(), activeLeague);
    dropdown.style.display = "none";
    switchToNextInput(true);
}


function areAllLeaguesDone() {
    return loadedLeagues.every(
        league => league.matchplan.every(match => match.played)
    );
}

function logBase2(x){
    return Math.log2(x);
}

function isPowerOfTwo(n) {
    return n > 0 && (n & (n - 1)) === 0;
}

function seasonOver() {
    simulateUnloadedLeagues();

    const startNewSeason = confirm("Season is over! Would you like to promote clubs and start a new season?");
    
    if (startNewSeason) {
        startNewSeasonWithInternationalLeagues();
    } else {
        updateDropdownOptionsByList(loadedLeagues);
    }
}
function simulateUnloadedLeagues(){
    const notLoadedLeagues = dLeagues.filter(league => !loadedLeagues.includes(league));

    notLoadedLeagues.forEach(league => {
        let simulatedList = league.fullSimulation(userRandomness);

        league.sortedClubs = simulatedList.map(simulatedClub => {
            return { name: simulatedClub.weightedClub.name };
        });
    })
}

function switchToCup(cup){
    document.getElementById("LeagueTable").style.display = "none";
    console.log("its time for "+cup.name);
    showCupMatches(cup);
}

function showCupMatches(cup) {
    inputContainer = document.getElementById("inputContainer");
    inputContainer.innerHTML = "";
    cup.matchplan.forEach(match => {
        const home = match[0];
        const away = match[1];

        //show in html
        const inputT1 = document.createElement("input");
        inputT1.type = "text";
        inputT1.value = home.name;
        inputT1.disabled = true;
        inputT1.classList.add("teamInput");
        const inputG1 = document.createElement("input");
        inputG1.type = "text";
        inputG1.placeholder = "0";
        inputG1.classList.add("goalInput");
        inputG1.onkeyup = function() {switchToNextInput()};
        const inputT2 = document.createElement("input");
        inputT2.type = "text";
        inputT2.value = away.name;
        inputT2.disabled = true;
        inputT2.classList.add("teamInput");
        const inputG2 = document.createElement("input");
        inputG2.type = "text";
        inputG2.placeholder = "0";
        inputG2.classList.add("goalInput");
        inputG2.onkeyup = function() {switchToNextInput()};

        if(debug_fast_skip)inputG1.value=0;
        if(debug_fast_skip)inputG2.value=3;

        let innerContainer = document.createElement("div");
        //add to container
        innerContainer.classList.add("inputContainer");
        innerContainer.appendChild(inputT1);
        innerContainer.appendChild(inputG1);
        innerContainer.appendChild(document.createElement("br"));
        innerContainer.appendChild(inputT2);
        innerContainer.appendChild(inputG2);
        //add inner container to container
        inputContainer.appendChild(innerContainer);
    })

    const submitButton = document.createElement("button");
    submitButton.id = "submitButton";
    submitButton.classList.add("gameButton")
    submitButton.innerText = "Next Round";
    submitButton.onclick = function(){cup.roundFinished()};
    inputContainer.appendChild(submitButton);

    const simulationButton = document.createElement("button");
    simulationButton.id = "simButton";
    simulationButton.classList.add("gameButton");
    simulationButton.innerText = "Simulate All";
    simulationButton.onclick = simulateAll;
    inputContainer.appendChild(simulationButton);
}

function toggleSaving(){
    if(savingEnabled){
        savingEnabled = false;
        document.getElementById("savingIndicator").querySelector("img").src = "assets/images/saving_disabled.png"
    }
    else{
        savingEnabled = true;
        document.getElementById("savingIndicator").querySelector("img").src = "assets/images/saving_enabled.png"
    }
}

function loadSaveFile(){
    createPopup("Load Save File","Want to load back to where you left off?",2,["Yes","No"],[function(){loadFromStorage();savingEnabled=true;closePopup();},closePopup])
}

function checkForSavefile(){
    //loop through all items in local storage
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith("FBC_")) {
            //if there is any element that starts with FBC_ the player has already a save file
            return true;
        }
    } 
    //else
    return false;
}

function serialize_club_array(array) {
    return array.map((club, index) => {
        try {
            return {
                name: club.name,
                leagueStats: club.leagueStats,
                matches: club.matches.map(match => ({
                    homeClub: match.homeClub.name,
                    awayClub: match.awayClub.name,
                    homeGoals: match.homeGoals,
                    awayGoals: match.awayGoals,
                    leagueName: match.league.name,
                    played: match.played
                })),
                hardcodedRating: club.hardcodedRating,

                highestVictorySpan: club.highestVictorySpan,
                highestVictoryGoals: club.highestVictoryGoals,
                highestVictoryMatch: club.highestVictoryMatch ? {
                    homeClub: club.highestVictoryMatch.homeClub?.name,
                    awayClub: club.highestVictoryMatch.awayClub?.name,
                    homeGoals: club.highestVictoryMatch.homeGoals,
                    awayGoals: club.highestVictoryMatch.awayGoals,
                    leagueName: club.highestVictoryMatch.league?.name,
                    played: club.highestVictoryMatch.played
                } : null,

                highestLossSpan: club.highestLossSpan,
                highestLossGoals: club.highestLossGoals,
                highestLossMatch: club.highestLossMatch ? {
                    homeClub: club.highestLossMatch.homeClub?.name,
                    awayClub: club.highestLossMatch.awayClub?.name,
                    homeGoals: club.highestLossMatch.homeGoals,
                    awayGoals: club.highestLossMatch.awayGoals,
                    leagueName: club.highestLossMatch.league?.name,
                    played: club.highestLossMatch.played
                } : null,

                totalGoals: club.totalGoals,
                totalMatches: club.totalMatches,
                totalVictories: club.totalVictories,
                totalDefeats: club.totalDefeats,
                totalDraws: club.totalDraws,

                seasonalPositions: club.seasonalPositions
            };
        } catch (error) {
            console.error(`Error in club at index ${index}:`, club);
            console.error(error);
            return null; // Return null or handle it gracefully
        }
    });
}

function unserialize_club_array(array) {
    console.log(array);
    return array.map(c=> {
        try{
            const club = new Club(c.name, c.hardcodedRating);
            club.leagueStats = c.leagueStats;
            club.matches = c.matches; 
    
            club.highestVictoryGoals = c.highestVictoryGoals;
            club.highestVictorySpan = c.highestVictorySpan;
            club.highestVictoryMatch = c.highestVictoryMatch;
    
            club.highestLossSpan = c.highestLossSpan;
            club.highestLossGoals = c.highestLossGoals;
            club.highestLossMatch = c.highestLossMatch;
    
            club.totalGoals = c.totalGoals;
            club.totalMatches = c.totalMatches;
            club.totalVictories = c.totalVictories;
            club.totalDefeats = c.totalDefeats;
            club.totalDraws = c.totalDraws;

            club.seasonalPositions = c.seasonalPositions;
            return club;

        }catch (error){
            console.error(`Error in club:`, c);
            console.error(error);
            return null;
        }
    });
}


function saveToStorage() {
    // Serialize complex objects
    const serializedClubs = serialize_club_array(dClubs);

    const serialized_clPool = serialize_club_array(clPool);

    const serialized_elPool = serialize_club_array(elPool);

    const serialized_colPool = serialize_club_array(colPool);

    const serialized_realChampionsLeagueClubs = serialize_club_array(realChampionsLeagueClubs);

    const serialized_realEuropaLeagueClubs = serialize_club_array(realEuropaLeagueClubs);

    const serialized_realConferenceLeagueClubs = serialize_club_array(realConferenceLeagueClubs);

    const serializedLeagues = dLeagues.map(league => ({
        name: league.name,
        clubs: league.clubs.map(c => c.name),
        sortedClubs: league.sortedClubs,
        promotePositions: league.promotePositions,
        promotePlayoffs: league.promotePlayoffs,
        relegatePositions: league.relegatePositions,
        relegatePlayoffs: league.relegatePlayoffs,
        CLPositions: league.CLPositions,
        ELPositions: league.ELPositions,
        CoLPositions: league.CoLPositions,
        association: league.association,
        level: league.level,
        hasChampion: league.hasChampion,
        terms: league.terms,
        crntweek: league.crntweek,
        lastShownMatchIndex: league.name === activeLeague.name 
        ? (league.isInKnockoutPhase 
            ? league.lastShownMatchIndex - league.knockoutTeamsList.length / 2 
            : league.lastShownMatchIndex - league.clubs.length / 2) 
        : league.lastShownMatchIndex,
        knockoutTeams: league.knockoutTeams,
        knockoutTeamsList: league.knockoutTeamsList,
        isInKnockoutPhase: league.isInKnockoutPhase,
        matchLimit: league.matchLimit,
        matchdaysThisSeason: league.matchdaysThisSeason,
        matchdaysPlayed: league.matchdaysPlayed,
        playable: league.playable,
        matchplan: league.matchplan.map(match => [
            match[0]?.name || null, 
            match[1]?.name || null
        ]),
    }));

    const serializedTournaments = dTournaments.map(tournament => ({
        name: tournament.name,
        clubs: tournament.clubs.map(c => c.name),
        remainingClubs: tournament.remainingClubs.map(c => c.name),
        HasThirdPlace: tournament.HasThirdPlace,
        country: tournament.country,
        totalRounds: tournament.totalRounds,
        matchplan: tournament.matchplan.map(m => [m[0]?.name, m[1]?.name]),
        crntweek: tournament.crntweek
    }));

    // Save state
    localStorage.setItem("FBC_dClubs", JSON.stringify(serializedClubs));
    localStorage.setItem("FBC_clPool", JSON.stringify(serialized_clPool));
    localStorage.setItem("FBC_elPool", JSON.stringify(serialized_elPool));
    localStorage.setItem("FBC_colPool", JSON.stringify(serialized_colPool));
    localStorage.setItem("FBC_realChampionsLeagueClubs", JSON.stringify(serialized_realChampionsLeagueClubs));
    localStorage.setItem("FBC_realEuropaLeagueClubs", JSON.stringify(serialized_realEuropaLeagueClubs));
    localStorage.setItem("FBC_realConferenceLeagueClubs", JSON.stringify(serialized_realConferenceLeagueClubs));
    localStorage.setItem("FBC_dLeagues", JSON.stringify(serializedLeagues));
    localStorage.setItem("FBC_dTournaments", JSON.stringify(serializedTournaments));
    localStorage.setItem("FBC_loadedLeagues", JSON.stringify(loadedLeagues.map(l => l.name)));
    localStorage.setItem("FBC_loadedCups", JSON.stringify(loadedCups.map(c => c.name)));
    localStorage.setItem("FBC_activeLeague", activeLeague?.name || "");
    localStorage.setItem("FBC_finshedLeagues", JSON.stringify(finshedLeagues.map(l => l.name)));
    
    // Calendar state
    localStorage.setItem("FBC_seasonCalendar", JSON.stringify({
        partakingLeagues: seasonCalendar?.partakingLeagues.map(l => l.name) || [],
        calendar: seasonCalendar?.Calendar || [],
        calendarIndex: seasonCalendar?.calendarIndex || 0
    }));
    
    // Settings and game state
    localStorage.setItem("FBC_isSeasonOver", isSeasonOver);
    localStorage.setItem("FBC_userRandomness", userRandomness);
    localStorage.setItem("FBC_show_color_in_match_list", show_color_in_match_list);
    localStorage.setItem("FBC_debug_flags", JSON.stringify({
        fast_skip: debug_fast_skip,
        console_tables: debug_console_tables,
        log_everything: debug_log_everything
    }));
}

function loadFromStorage() {
    dClubs = unserialize_club_array(JSON.parse(localStorage.getItem("FBC_dClubs")));
    clPool = unserialize_club_array(JSON.parse(localStorage.getItem("FBC_clPool")));
    elPool = unserialize_club_array(JSON.parse(localStorage.getItem("FBC_elPool")));
    colPool = unserialize_club_array(JSON.parse(localStorage.getItem("FBC_colPool")));
    realChampionsLeagueClubs = unserialize_club_array(JSON.parse(localStorage.getItem("FBC_realChampionsLeagueClubs")));
    realEuropaLeagueClubs = unserialize_club_array(JSON.parse(localStorage.getItem("FBC_realEuropaLeagueClubs")));
    realConferenceLeagueClubs = unserialize_club_array(JSON.parse(localStorage.getItem("FBC_realConferenceLeagueClubs")));

    // Rebuild leagues
    const leagueData = JSON.parse(localStorage.getItem("FBC_dLeagues") || []);
    dLeagues = leagueData.map(ld => {
        const league = new League(
            ld.name,
            [], // clubs will be populated later
            ld.matchLimit,
            ld.promotePositions,
            ld.promotePlayoffs,
            ld.relegatePositions,
            ld.relegatePlayoffs,
            ld.CLPositions,
            ld.ELPositions,
            ld.CoLPositions,
            ld.association,
            ld.level,
            ld.hasChampion,
            ld.terms,
            ld.playable,
            ld.knockoutTeams
        );
        
        // Restore league-specific state
        Object.assign(league, {
            sortedClubs: ld.sortedClubs,
            crntweek: ld.crntweek,
            lastShownMatchIndex: ld.lastShownMatchIndex,
            knockoutTeamsList: ld.knockoutTeamsList,
            isInKnockoutPhase: ld.isInKnockoutPhase,
            matchdaysPlayed: ld.matchdaysPlayed,
            matchdaysThisSeason: ld.matchdaysThisSeason
        });

        // Restore matchplan with actual club references
        league.matchplan = ld.matchplan.map(matchPair => [
            findClub(matchPair[0]), // Home club
            findClub(matchPair[1])  // Away club
        ]);
        
        return league;
    });

    // Rebuild tournaments
    const tournamentData = JSON.parse(localStorage.getItem("FBC_dTournaments") || []);
    dTournaments = tournamentData.map(td => {
        // Map club names to actual club objects before creating the Cup instance
        const clubs = td.clubs.map(cName => findClub(cName)).filter(c => c);
        
        // Create the Cup instance with the populated clubs array
        const cup = new Cup(
            td.name,
            clubs, // Pass the clubs here instead of an empty array
            td.HasThirdPlace,
            td.country
        );
        
        // Restore additional properties
        Object.assign(cup, {
            remainingClubs: td.remainingClubs.map(cName => findClub(cName)).filter(c => c),
            totalRounds: td.totalRounds,
            matchplan: td.matchplan.map(m => [
                findClub(m[0]),
                findClub(m[1])
            ]),
            crntweek: td.crntweek
        });
        
        return cup;
    });

    // Rebuild references
    function findClub(name) {
        return dClubs.find(c => c.name === name) ||
               clPool.find(c => c.name === name) ||
               elPool.find(c => c.name === name) ||
               colPool.find(c => c.name === name) ||
               realChampionsLeagueClubs.find(c => c.name === name) ||
               realEuropaLeagueClubs.find(c => c.name === name) ||
               realConferenceLeagueClubs.find(c => c.name === name);
    }

    // Reconnect league clubs
    dLeagues.forEach(league => {
        league.clubs = leagueData.find(ld => ld.name === league.name).clubs
            .map(cName => findClub(cName))
            .filter(c => c);
    });

    // Reconnect tournament clubs
    dTournaments.forEach(tournament => {
        const td = tournamentData.find(t => t.name === tournament.name);
        tournament.clubs = td.clubs.map(cName => findClub(cName)).filter(c => c);
        tournament.remainingClubs = td.remainingClubs.map(cName => findClub(cName)).filter(c => c);
        tournament.matchplan = td.matchplan.map(m => [
            findClub(m[0]),
            findClub(m[1])
        ]);
    });

    // Before your forEach loop
    const uniqueClubNames = new Set();
    dClubs.forEach(club => {
        if (uniqueClubNames.has(club.name)) {
            console.warn(`Duplicate club found: ${club.name}`);
        }
        uniqueClubNames.add(club.name);
    });

    //OKAY STOP CTRL Z ING HERE PLS PLS PLS PLS STOP
    dClubs2 = [...dClubs, ...clPool, ...elPool, ...colPool, ...realChampionsLeagueClubs, ...realEuropaLeagueClubs, ...realConferenceLeagueClubs];
    // I SAID STOP

    //RESTORING MATCEHS (try 37) try number 11 might be the one fr || nevermind 💀 but 18 is actually the one i believe || idk maybe its gonna be try 26 well see but i wouldt have my hopes up || YEAAAHHHHH TRY 37 SEEMS TO HAVE WORKED OMG YESYESYSESYES (surely i will never encounter another bug that shows me this was wrong again right) || well well well... guess what? I'm back here || 2 days later and i am still here btw || i lost count ig we are at try 400 or something
    // Add this at the very start of loadFromStorage to see raw data
    console.log("Initial raw clubs data:", JSON.parse(localStorage.getItem("FBC_dClubs") || "[]"));

    // Modified restoration with extra debugging
    dClubs2.forEach((club) => {
        if(club.matches>0)console.log(`Before processing ${club.name} - current matches:`, club.matches);

        const matchSignatures = new Set();
        const restoredMatches = [];

        club.matches.forEach((match, index) => {
            // Log each match we're trying to process
            console.log(`Processing match ${index} for ${club.name}:`, match);

            if (!match || typeof match.homeClub !== 'string' || typeof match.awayClub !== 'string') {
                console.warn(`Invalid match data at index ${index} for ${club.name}:`, match);
                return;
            }

            const matchSignature = `${match.homeClub}-${match.awayClub}-${match.leagueName}-${match.homeGoals}-${match.awayGoals}`;
            
            if (matchSignatures.has(matchSignature)) {
                console.warn(`Found duplicate match for ${club.name}: ${matchSignature}`);
                return;
            }

            const homeClub = dClubs.find(c => c.name === match.homeClub) || clPool.find(c => c.name === match.homeClub) || elPool.find(c => c.name === match.homeClub) || colPool.find(c => c.name === match.homeClub) || realChampionsLeagueClubs.find(c => c.name === match.homeClub) || realEuropaLeagueClubs.find(c => c.name === match.homeClub) || realConferenceLeagueClubs.find(c => c.name === match.homeClub);
            const awayClub = dClubs.find(c => c.name === match.awayClub) || clPool.find(c => c.name === match.awayClub) || elPool.find(c => c.name === match.awayClub) || colPool.find(c => c.name === match.awayClub) || realChampionsLeagueClubs.find(c => c.name === match.awayClub) || realEuropaLeagueClubs.find(c => c.name === match.awayClub) || realConferenceLeagueClubs.find(c => c.name === match.awayClub);

            if (!homeClub || !awayClub) {
                console.warn(`Could not find clubs for ${match.homeClub} vs ${match.awayClub}`);
                return;
            }

            const newMatch = new Match(
                homeClub,
                awayClub,
                match.homeGoals,
                match.awayGoals,
                match.leagueName,
                match.played
            );

            matchSignatures.add(matchSignature);
            restoredMatches.push(newMatch);
        });

        if(club.highestVictoryMatch) club.highestVictoryMatch = new Match(
            findClub(club.highestVictoryMatch.homeClub),
            findClub(club.highestVictoryMatch.awayClub),
            club.highestVictoryMatch.homeGoals,
            club.highestVictoryMatch.awayGoals,
            club.highestVictoryMatch.leagueName,
            club.highestVictoryMatch.played
        );

        if(club.highestLossMatch) club.highestLossMatch = new Match(
            findClub(club.highestLossMatch.homeClub),
            findClub(club.highestLossMatch.awayClub),
            club.highestLossMatch.homeGoals,
            club.highestLossMatch.awayGoals,
            club.highestLossMatch.leagueName,
            club.highestLossMatch.played
        )

        // Explicitly clear and replace matches
        club.matches = []; // Clear existing matches
        club.matches = restoredMatches;
        if(club.matches.length>0)console.log(`After restoration ${club.name} has ${club.matches.length} matches`);
    });

    
    // Final verification with duplicate removal
    dClubs2.forEach(club => {
        if(club.matches.length>0)console.log(`Final verification for ${club.name} - starting with ${club.matches.length} matches`);
        
        const uniqueMatches = [];
        const seenSignatures = new Set();
        
        club.matches.forEach((match, index) => {
            const signature = `${match.homeClub.name}-${match.awayClub.name}-${match.leagueName}-${match.homeGoals}-${match.awayGoals}`;
            if (!seenSignatures.has(signature)) {
                seenSignatures.add(signature);
                uniqueMatches.push(match);
            } else {
                console.warn(`Removed duplicate in final check for ${club.name}: ${signature}`);
            }
        });

        club.matches = uniqueMatches;
        if(club.matches.length>0)console.log(`Final count for ${club.name}: ${club.matches.length} unique matches:`);
        club.matches.forEach((m, i) => {
            console.log(`${i + 1}: ${m.homeClub.name} ${m.homeGoals} - ${m.awayGoals} ${m.awayClub.name}`);
        });
    });

    // Restore loaded leagues/cups
    loadedLeagues = JSON.parse(localStorage.getItem("FBC_loadedLeagues") || [])
        .map(name => dLeagues.find(l => l.name === name))
        .filter(l => l);

    loadedCups = JSON.parse(localStorage.getItem("FBC_loadedCups") || [])
        .map(name => dTournaments.find(t => t.name === name))
        .filter(t => t);

    // Restore active league
    activeLeague = dLeagues.find(l => l.name === localStorage.getItem("FBC_activeLeague")) ||
                  dTournaments.find(t => t.name === localStorage.getItem("FBC_activeLeague"));

    // Restore finished leagues
    finshedLeagues = JSON.parse(localStorage.getItem("FBC_finshedLeagues") || [])
        .map(name => dLeagues.find(l => l.name === name))
        .filter(l => l);

    // Restore calendar
    const rawCalendarData = localStorage.getItem("FBC_seasonCalendar");
    console.log("Raw Calendar Data:", rawCalendarData);

    const calendarData = JSON.parse(rawCalendarData || "{}");
    console.log("Parsed Calendar Data:", calendarData);

    const partakingLeagues = calendarData.partakingLeagues?.map(name => {
        const league = dLeagues.find(l => l.name === name);
        const tournament = dTournaments.find(t => t.name === name);
        console.log("Matching League or Tournament for", name, ":", league || tournament);
        return league || tournament;
    }) || [];

    console.log("Final League/Tournament Array:", partakingLeagues);

    seasonCalendar = new Calendar();

    if (partakingLeagues){
        console.log("Restoring partaking leagues...");
        seasonCalendar.partakingLeagues = partakingLeagues;
    }

    if (calendarData.calendar) {
        console.log("Restoring calendar data...");
        seasonCalendar.Calendar = calendarData.calendar;
    }

    if (calendarData.calendarIndex !== undefined) {
        console.log("Setting calendarIndex:", calendarData.calendarIndex);
        seasonCalendar.calendarIndex = calendarData.calendarIndex;
    }

    //restore season manager
    seasonManager = new SeasonManager();

    // Restore settings
    isSeasonOver = localStorage.getItem("FBC_isSeasonOver") === "true";
    userRandomness = parseFloat(localStorage.getItem("FBC_userRandomness") || 13.5);
    show_color_in_match_list = localStorage.getItem("FBC_show_color_in_match_list") === "true";
    
    // Restore debug flags
    const debugFlags = JSON.parse(localStorage.getItem("FBC_debug_flags") || "{}");
    debug_fast_skip = debugFlags.fast_skip || false;
    debug_console_tables = debugFlags.console_tables || false;
    debug_log_everything = debugFlags.log_everything || false;

    // Initialize UI
    updateDropdownOptions();
    document.getElementById('checkboxContainer').style.display = "none";
    document.getElementById('FlagGrid').style.display = "none";
    document.getElementById('editButton').style.display = "none";
    document.getElementById('savingIndicator').style.display = "none";
    document.getElementById('loadButton').style.display = "none";
    if (activeLeague) {
        if (activeLeague instanceof League) {
            showMatches(activeLeague.name);
            updateTabel(activeLeague.getSortedClubs(), activeLeague);
        } else {
            switchToCup(activeLeague);
        }
    }

    console.log("Game state loaded successfully!");
}

function findClubObjByName(name) {
    return dClubs.find(c => c.name === name) ||
           clPool.find(c => c.name === name) ||
           elPool.find(c => c.name === name) ||
           colPool.find(c => c.name === name) ||
           realChampionsLeagueClubs.find(c => c.name === name) ||
           realEuropaLeagueClubs.find(c => c.name === name) ||
           realConferenceLeagueClubs.find(c => c.name === name);
}

function showInfo(flag, country) {
    let container = flag.parentElement;
    Array.from(container.children).forEach(child => child.classList.remove("selectedFlag"));
    let infoElement = container.querySelector('.info');
    if(infoElement)infoElement.remove();

    container.appendChild(createInfoBox(country));

    flag.classList.add("selectedFlag");
}

function createInfoBox(country) {
    checkboxContainer = document.createElement('div');
    if(window.innerWidth>=600)checkboxContainer.style.left = "460px";
    else checkboxContainer.style.left = "0px";
    checkboxContainer.style.display = 'block';
    checkboxContainer.className = 'info';

    // Set up checkbox container for playable leagues
    for (let i = 0; i < dLeagues.length; i++) {
        if(country=="Germany") if (dLeagues[i].playable == false || dLeagues[i].association != "DFB") continue;
        if(country=="Croatia") if (dLeagues[i].playable == false || dLeagues[i].association != "HNS") continue;
        if(country=="Spain") if (dLeagues[i].playable == false || dLeagues[i].association != "ESP") continue;
        if(country=="England") if (dLeagues[i].playable == false || dLeagues[i].association != "ENG") continue;
        if(country=="Italy") if (dLeagues[i].playable == false || dLeagues[i].association != "ITA") continue;
        if(country=="France") if (dLeagues[i].playable == false || dLeagues[i].association != "FRA") continue;
        if(country=="Netherlands") if (dLeagues[i].playable == false || dLeagues[i].association != "NED") continue;
        if(country=="Turkey") if (dLeagues[i].playable == false || dLeagues[i].association != "TUR") continue;
        if(country=="UEFA") if (dLeagues[i].playable == false || dLeagues[i].association != "UCL" && dLeagues[i].association != "UEL" && dLeagues[i].association != "UCoL") continue;

        const checkbox = document.createElement('input');
        checkbox.classList.add("win95-checkbox");
        checkbox.type = 'checkbox';
        checkbox.id = 'checkbox' + i;
        checkbox.name = 'checkbox';
        checkbox.value = dLeagues[i].name;
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                loadedLeagues.push(dLeagues[i]);
            } else {
                loadedLeagues = loadedLeagues.filter(league => league.name !== dLeagues[i].name);
            }
            const startButton = document.getElementById("startbutton");
            if(loadedLeagues.length>= 1 || loadedCups.length >= 1){
                startButton.style.display = "block";
                if((loadedCups.length+loadedLeagues.length)>1)startButton.textContent = "⚽ Start Game ("+ (loadedLeagues.length + loadedCups.length) + " Competitions selected)"
                else if((loadedCups.length+loadedLeagues.length)==1)startButton.textContent = "⚽ Start Game ("+ (loadedLeagues.length + loadedCups.length) + " Competition selected)"
            }
            else startButton.style.display = "none";
        });
        const label = document.createElement('label');
        label.htmlFor = 'checkbox' + i;
        label.textContent = dLeagues[i].name;
        if(loadedLeagues.find(league => league.name === dLeagues[i].name)) checkbox.checked = true;
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);
        checkboxContainer.appendChild(document.createElement('br'));
    }

    // Set up checkbox container for playable cups
    for (let i = 0; i < dTournaments.length; i++) {
        if(dTournaments[i].country != country) continue;
        // Assuming dTournaments is an array of cup objects similar to dLeagues
        const checkbox = document.createElement('input');
        checkbox.classList.add("win95-checkbox");
        checkbox.type = 'checkbox';
        checkbox.id = 'cupCheckbox' + i;
        checkbox.name = 'cupCheckbox';
        checkbox.value = dTournaments[i].name;
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                loadedCups.push(dTournaments[i]);
            } else {
                loadedCups = loadedCups.filter(cup => cup.name !== dTournaments[i].name);
            }
            const startButton = document.getElementById("startbutton");
            if(loadedLeagues.length>= 1 || loadedCups.length >= 1){
                startButton.style.display = "block";
                if((loadedCups.length+loadedLeagues.length)>1)startButton.textContent = "⚽ Start Game ("+ (loadedLeagues.length + loadedCups.length) + " Competitions selected)"
                else if((loadedCups.length+loadedLeagues.length)==1)startButton.textContent = "⚽ Start Game ("+ (loadedLeagues.length + loadedCups.length) + " Competition selected)"
            }
            else startButton.style.display = "none";
        });
        const label = document.createElement('label');
        label.htmlFor = 'cupCheckbox' + i;
        label.textContent = dTournaments[i].name;
        if(loadedCups.find(cup => cup.name === dTournaments[i].name)) checkbox.checked = true;
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);
        checkboxContainer.appendChild(document.createElement('br'));
    }

    return checkboxContainer;
}

function openEditMode() {
    //collect all clubs from dClubs and all pools
    const allClubs = [...dClubs];
    [clPool, elPool, colPool, realChampionsLeagueClubs, realEuropaLeagueClubs, realConferenceLeagueClubs].forEach(pool => {
        pool.forEach(club => {
            if (!allClubs.find(c => c.name === club.name)) {
                allClubs.push(club);
            }
        });
    });

    const sortedClubs = allClubs.sort((a, b) => a.name.localeCompare(b.name));

    //create the search container
    const searchContainer = document.createElement('div');
    searchContainer.style.marginTop = "-25px";

    //add search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.classList.add('popup-input');
    searchInput.style.width = '95%';
    searchInput.placeholder = 'Search clubs...';
    searchInput.style.marginBottom = "7px";

    //create club list container
    const clubList = document.createElement('div');
    clubList.style.maxHeight = '60vh';
    clubList.style.overflowY = 'auto';

    //function to filter clubs
    const filterClubList = (searchTerm) => {
        const filtered = sortedClubs.filter(club => 
            club.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        clubList.innerHTML = '';
        filtered.forEach(club => {
            const clubItem = document.createElement('div');
            clubItem.style.padding = '8px';
            clubItem.style.cursor = 'pointer';
            clubItem.style.borderBottom = '1px solid #ddd';
            clubItem.textContent = club.name;
            clubItem.addEventListener('click', () => showClubProfile(club));
            clubList.appendChild(clubItem);
        });
    };

    //initial population
    filterClubList('');

    //add input listener
    searchInput.addEventListener('input', (e) => {
        filterClubList(e.target.value);
    });

    //append to container
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(clubList);

    //add clickable club items
    sortedClubs.forEach(club => {
        const clubItem = document.createElement('div');
        clubItem.style.padding = '8px';
        clubItem.style.cursor = 'pointer';
        clubItem.style.borderBottom = '1px solid #ddd';
        clubItem.textContent = club.name;
        
        clubItem.addEventListener('click', () => showClubProfile(club));
        clubList.appendChild(clubItem);
    });

    //show popup with club list
    createPopup(
        "Edit Mode - Select Club",
        "",
        1,
        ["Close"],
        [closePopup],
        [searchContainer]
    );
    searchInput.focus();
}

function showClubProfile(club) {
    const profileContainer = document.createElement('div');
    
    // Club Name
    const nameHeader = document.createElement('h2');
    nameHeader.textContent = club.name;
    profileContainer.appendChild(nameHeader);

    // Leagues List
    const leaguesHeader = document.createElement('h3');
    // Get leagues from leagueStats
    const leagues = Object.keys(club.leagueStats);
    if(leagues.length>=1)leaguesHeader.textContent = 'Participating Leagues:';
    profileContainer.appendChild(leaguesHeader);

    const leaguesList = document.createElement('ul');

    // Find leagues that include the club
    dLeagues.forEach(league => {
        if (league.clubs.includes(club)) {
            if (!leagues.includes(league.name)) {
                leagues.push(league.name);
            }
        }
    });
    
    leagues.forEach(leagueName => {
        const li = document.createElement('li');
        li.textContent = leagueName;
        leaguesList.appendChild(li);
    });

    // Back button
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to List';
    backButton.style.marginTop = '16px';
    backButton.onclick = () => {
        closePopup();
        openEditMode();
    };

    profileContainer.appendChild(leaguesList);

    closePopup();
    createPopup("Club Profile", "", 2, ["Rename","Back"], [function(){showClubRename(club)},function(){closePopup();openEditMode();}], [profileContainer]);
}

function showClubRename(club) {
    clubObj = dClubs.find(clubObj => clubObj.name === club.name);
    closePopup();
    createPrompt(club.name,"Enter the new Name here:",function(newName){
        //the user input will be saved in the variable "answer"
        if (newName) {
            console.log("Renamed "+ club.name + " to " + newName);
            club.name = newName;
            clubObj.name = newName;
            closePopup();
            showClubProfile(club);
        }
    });
    
}

function simulateMatch(homeTeamName, awayTeamName) {
    // Constants for simulation tuning
    const HOME_ADVANTAGE_MULTIPLIER = 1.25; // 25% boost for home team
    const BASE_GOAL_RATE = 1.15; // Base goals per team (before ratings)
    const RED_CARD_CHANCE = 0.03; // 3% chance per team
    const PENALTY_CHANCE = 0.15; // 15% chance per match
    const CRAZY_MATCH_CHANCE = 0.03; // 3% chance for wild result
    const GOAL_CAP = 9; // Maximum goals per team

    // Find team objects
    const homeTeam = findClubObjByName(homeTeamName);
    const awayTeam = findClubObjByName(awayTeamName);
    if (!homeTeam || !awayTeam) {
        console.error("Team not found");
        return null;
    }

    // Calculate effective ratings with home advantage
    const homeAttack = Math.sqrt(homeTeam.hardcodedRating) * HOME_ADVANTAGE_MULTIPLIER;
    const homeDefense = Math.sqrt(homeTeam.hardcodedRating) * 0.9;
    const awayAttack = Math.sqrt(awayTeam.hardcodedRating);
    const awayDefense = Math.sqrt(awayTeam.hardcodedRating) * 1.1;

    // Calculate goal expectations using attack/defense balance
    let homeLambda = (homeAttack / awayDefense) * BASE_GOAL_RATE;
    let awayLambda = (awayAttack / homeDefense) * BASE_GOAL_RATE;

    // Add competitive balance variance
    homeLambda *= 0.9 + Math.random() * 0.3;
    awayLambda *= 0.9 + Math.random() * 0.3;

    // Generate base goals using Poisson distribution
    let homeGoals = poisson(homeLambda);
    let awayGoals = poisson(awayLambda);

    // Apply match context effects
    const goalDifference = homeGoals - awayGoals;
    
    // Momentum effect (team behind gets small boost)
    if (goalDifference > 1) {
        awayLambda *= 1.2; // Away team pushes harder
        awayGoals += poisson(awayLambda * 0.3);
    } else if (goalDifference < -1) {
        homeLambda *= 1.2; // Home team pushes harder
        homeGoals += poisson(homeLambda * 0.3);
    }

    // Special match events
    // Crazy match scenario
    if (Math.random() < CRAZY_MATCH_CHANCE) {
        homeGoals += poisson(2.5);
        awayGoals += poisson(2.5);
    }

    // Red cards
    if (Math.random() < RED_CARD_CHANCE) {
        if (Math.random() < 0.5) {
            homeGoals = Math.max(0, homeGoals - 1 - Math.floor(Math.random() * 2));
        } else {
            awayGoals = Math.max(0, awayGoals - 1 - Math.floor(Math.random() * 2));
        }
    }

    // Penalties
    if (Math.random() < PENALTY_CHANCE) {
        const strongerTeam = homeTeam.hardcodedRating > awayTeam.hardcodedRating ? 'home' : 'away';
        const successChance = strongerTeam === 'home' ? 0.75 : 0.65;
        
        if (Math.random() < successChance) {
            strongerTeam === 'home' ? homeGoals++ : awayGoals++;
        }
    }

    // Final adjustments
    homeGoals = Math.min(homeGoals, GOAL_CAP);
    awayGoals = Math.min(awayGoals, GOAL_CAP);

    // Goalkeeper error chance
    if (homeGoals === 0 && Math.random() < 0.1) homeGoals += Math.random() < 0.3 ? 1 : 0;
    if (awayGoals === 0 && Math.random() < 0.1) awayGoals += Math.random() < 0.3 ? 1 : 0;

    // Ensure non-negative goals
    homeGoals = Math.max(0, homeGoals);
    awayGoals = Math.max(0, awayGoals);

    if(debug_log_everything)console.log("Simulation Result: "+homeTeamName + " " + homeGoals + " - " + awayGoals + " " + awayTeamName);

    // Return match result
    return {
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        homeGoals: homeGoals,
        awayGoals: awayGoals
    };
}

// Poisson distribution implementation
function poisson(lambda) {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    while (p > L) {
        k++;
        p *= Math.random();
    }
    return k - 1;
}

function simulateAll(){
    //from all the elements on screen get all teamInput elements and create matches (first and second, third and fourth etc.)
    const teamInputs = document.querySelectorAll('.teamInput');
    const matches = [];
    for (let i = 0; i < teamInputs.length; i += 2) {
        matches.push(simulateMatch(teamInputs[i].value, teamInputs[i + 1].value));
    }
    
    //now put the match results back into the goalInput fields
    const goalInputs = document.querySelectorAll('.goalInput');
    for (let i = 0; i < goalInputs.length; i += 2) {
        goalInputs[i].value = matches[i / 2].homeGoals;
        goalInputs[i + 1].value = matches[i / 2].awayGoals;
    }
}


function showDiagram(list, leagueName, clubname = "Diagram") {
    // Create the popup window
    const windowDiv = document.createElement('div');
    windowDiv.className = 'win95-window';

    // Find league object
    const leagueObj = dLeagues.find(league => league.name === leagueName);
    if (!leagueObj) throw new Error(`League ${leagueName} not found in dLeagues.`);

    // Calculate dynamic height and width
    const height = leagueObj.clubs.length;
    const width = Math.min((leagueObj.clubs.length - 1) * leagueObj.terms, leagueObj.matchLimit);

    // Title bar with club name
    const clubHeader = document.createElement("h1");
    clubHeader.textContent = clubname;
    clubHeader.classList.add("win95-window-title");

    // Close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "X";
    closeButton.classList.add("win95-close");
    closeButton.onclick = () => {
        document.body.removeChild(windowDiv);
    };
    clubHeader.appendChild(closeButton);

    // Content area
    const contentDiv = document.createElement('div');
    contentDiv.className = 'win95-content';

    // Grid
    const gridDiv = document.createElement('div');
    gridDiv.className = 'diagram-grid';

    // Dynamically set grid template properties
    gridDiv.style.gridTemplateColumns = `repeat(${width}, 20px)`; // Dynamic columns
    gridDiv.style.gridTemplateRows = `repeat(${height}, 20px)`;   // Dynamic rows

    gridDiv.style.maxWidth = '800px'; // Example max width
    gridDiv.style.maxHeight = '500px';
    gridDiv.style.overflow = 'auto';

    // Populate the grid
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        // Check if this column has a list entry
        if (col < list.length) {
          const n = list[col]; // Value between 1 and height
          // Fill if row index (0-based) is >= n-1
          if (row == n-1) {
              cell.style.color = 'white';
              cell.style.alignContent = 'center';
              cell.style.textAlign = 'center';
              cell.innerHTML = n;
          }
          if (row >= n - 1) {
            cell.classList.add('filled');
          }
        }
        gridDiv.appendChild(cell);
      }
    }

    // Assemble the popup
    windowDiv.appendChild(clubHeader);
    contentDiv.appendChild(gridDiv);
    windowDiv.appendChild(contentDiv);
    document.body.appendChild(windowDiv);
}


function startGame_saveMode(){
    if(savingEnabled){
        //if the user has saving enabled check if user already has something in local storage:
        if (checkForSavefile()) {
            //if the user already has a save file, warn him that he is overwriting his data
            createPopup("⚠️ Warning - Autosaving activated","If you do this, your current Save File will be overwritten!",2,["I know","Cancel"],[function(){startGame();closePopup();},closePopup]);
        }
        else{
            //else its no problem to save, so dont warn user
            startGame();
        }
    }
    else{
        startGame();
    }
}

function startGame() {
    if (loadedLeagues.length < 1 && loadedCups.length < 1) return;

    loadedLeagues.forEach(league => {
        league.sortedClubs = league.init_sortedClubs(league.clubs);
    });

    document.getElementById('checkboxContainer').style.display = "none";
    document.getElementById('FlagGrid').style.display = "none";
    document.getElementById('editButton').style.display = "none";
    document.getElementById('savingIndicator').style.display = "none";
    document.getElementById('loadButton').style.display = "none";
    updateDropdownOptions();

    // Initialize the calendar with the loaded leagues and cups
    seasonCalendar = new Calendar(loadedLeagues);
    seasonManager = new SeasonManager();

    if (loadedCups.length > 0) {
        loadedCups.forEach(cup => {
            seasonCalendar.spreadIntoCalendar(cup.name, cup.totalRounds);
        });
    }

    // Get the first item in the calendar (could be a league or a cup)
    activeLeagueName = seasonCalendar.Calendar[seasonCalendar.calendarIndex];

    // Check if the active item is a league or a cup
    activeLeague = dLeagues.find(league => league.name === activeLeagueName);
    if (!activeLeague) {
        // If it's not a league, it must be a cup
        activeLeague = dTournaments.find(cup => cup.name === activeLeagueName);
        if (!activeLeague) {
            throw new Error(`League/Cup ${activeLeagueName} not found.`);
        }
        // If it's a cup, switch to cup mode
        switchToCup(activeLeague);
    } else {
        // If it's a league, show matches and update the table
        showMatches(activeLeague.name);
        updateTabel(activeLeague.getSortedClubs(), activeLeague);
    }

    dropdown.style.display = "none";
    switchToNextInput(true);
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

window.onload = function exampleFunction() {
    loadedLeagues = [];
    loadedCups = [];

    // Set up the real participants for the first season
    const clLeague = dLeagues.find(l => l.name === "Champions League");
    const elLeague = dLeagues.find(l => l.name === "Europa League");
    const colLeague = dLeagues.find(l => l.name === "Conference League");

    // Assign real clubs and initialize
    clLeague.clubs = [...realChampionsLeagueClubs];
    clLeague.clubs.forEach(club => club.initializeLeagueStats(clLeague.name));
    clLeague.sortedClubs = clLeague.init_sortedClubs(clLeague.clubs);
    clLeague.matchplan = clLeague.generateMatchplan();

    elLeague.clubs = [...realEuropaLeagueClubs];
    elLeague.clubs.forEach(club => club.initializeLeagueStats(elLeague.name));
    elLeague.sortedClubs = elLeague.init_sortedClubs(elLeague.clubs);
    elLeague.matchplan = elLeague.generateMatchplan();

    colLeague.clubs = [...realConferenceLeagueClubs];
    colLeague.clubs.forEach(club => club.initializeLeagueStats(colLeague.name));
    colLeague.sortedClubs = colLeague.init_sortedClubs(colLeague.clubs);
    colLeague.matchplan = colLeague.generateMatchplan();

    // Log initial setup for verification
    if(debug_log_everything){
        console.log("CL Initial Clubs:", clLeague.clubs.map(c => `${c.name} (${c.hardcodedRating})`));
        console.log("EL Initial Clubs:", elLeague.clubs.map(c => `${c.name} (${c.hardcodedRating})`));
        console.log("CoL Initial Clubs:", colLeague.clubs.map(c => `${c.name} (${c.hardcodedRating})`));
    }

    const startButton = document.createElement('button');
    startButton.id="startbutton";
    startButton.textContent = 'Start Game';
    startButton.addEventListener('click', startGame_saveMode);
    startButton.style.display = "none";
    checkboxContainer.appendChild(startButton);


    let saveFileFound = checkForSavefile();
    if (saveFileFound) {
        //if the user already has a save file, don't enable saving
        savingEnabled = false;
        document.getElementById("savingIndicator").querySelector("img").src = "assets/images/saving_disabled.png"
    }
    else{
        //else its no problem to save, cuz nothing can be overwritten
        savingEnabled = true;
        document.getElementById("savingIndicator").querySelector("img").src = "assets/images/saving_enabled.png"
        document.getElementById("loadButton").style.display = "none";
    }
};