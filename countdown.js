var secondsLeft = 1337;
var now = new Date();
var endTime = new Date();
endTime.setFullYear(2024);
endTime.setMonth(9);
endTime.setDate(26);
endTime.setHours(12);
endTime.setMinutes(0);
endTime.setSeconds(0);

function updateCountdown() {
    var output = secondsLeft + " Sekunden";
    document.getElementById("countdown_numbers").innerHTML = output;
    secondsLeft--;
    
    if(secondsLeft<=-1){
        window.open("https://www.twitch.tv/stegi","_self")
    }
}

function calculateTime(){
    var timeDifference = endTime - now;
    var timeDifferenceInSeconds = Math.floor(timeDifference / 1000);
    return timeDifferenceInSeconds;
}

//initiate that thing
secondsLeft = calculateTime() + 1;
// Aktualisieren (alle 1 s (1000ms))
setInterval(updateCountdown, 1000);
//first call:
updateCountdown();
