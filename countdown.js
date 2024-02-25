var possibleTimes=[
    "9.05",
    "10.55",
    "12.45",
    "15.00",
    "16.40",
]

var besttime;

function updateCountdown(){
    var now = new Date();

    var timeuntil = pauseTime.getTime() - now.getTime();
    
    var hours = Math.floor(timeuntil/(1000*60*60))
    var minutes = Math.floor((timeuntil % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timeuntil % (1000 * 60)) / 1000);

    var totalhours = hours
    var totalminutes = minutes +totalhours*60
    var totalseconds = seconds +totalminutes*60

    var output = totalseconds + " Sekunden";
    if(totalseconds<0)output="Freiheit."
    if(totalseconds<-1000)output="Morgen."
    if(dayOfWeek==0||dayOfWeek==6) output = "Du bist frei."
    if(dayOfWeek==5&&besttime!="9.05")output = "Du bist frei."
    document.getElementById("countdown_numbers").innerHTML = output;
}

function getPauseTime(now){
    var currentTimeInMin = now.getHours()*60+now.getMinutes();
    var shortestMinuteDistance = Infinity;
    besttime = "00.00";

    possibleTimes.forEach(time => {
        var timeArr = time.split(".");
        var timeInMin = parseInt(timeArr[0]) * 60 + parseInt(timeArr[1]);
        var minuteDistance = (timeInMin - currentTimeInMin + 1440) % 1440; //1440 because midnight
        if(minuteDistance<shortestMinuteDistance){
            shortestMinuteDistance=minuteDistance;
            besttime=time;
        }
    });
    
    bestTimeArr = besttime.split(".");

    var pauseTime = new Date(now);
    pauseTime.setHours(parseInt(bestTimeArr[0]), parseInt(bestTimeArr[1]), 0, 0);
    return pauseTime;
}


var now = new Date();
//dienstag anders wegen mathe:
var dayOfWeek = now.getDay();
if(dayOfWeek==2)possibleTimes[3]="15.50" //"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"; (deswegen ist 2 dienstag)
var pauseTime = getPauseTime(now);

// Aktualisieren (alle 1 s (1000ms))
setInterval(updateCountdown,1000);
//first call:
updateCountdown();
