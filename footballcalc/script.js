let partClubs = [];
let clubs = ["München","Dortmund","Leverkusen","Freiburg","Karlsruhe","Berlin","Wolfsburg"]
let tmpPoints = [23,16,16,16,20,15,9]
let tmpGoals = [25,2,5,2,10,1,-1]

class Club{
    constructor(name, points = 0, goals = 0){
        this.name = name;
        this.points = points;
        this.goals = goals;
    }
}

function updateTable(){
    partClubs.sort((a, b) => b.goals - a.goals);
    partClubs.sort((a, b) => b.points - a.points);
    partClubs.forEach(club => {
        document.getElementById("testElement").innerHTML += partClubs.indexOf(club)+1 + ". " + club.name + "<br>";
    });
}

clubs.forEach(club => {
    partClubs.push(new Club(club,tmpPoints[clubs.indexOf(club)],tmpGoals[clubs.indexOf(club)]));
});
updateTable();