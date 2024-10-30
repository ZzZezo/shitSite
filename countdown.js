var secondsLeft = 1337;
var now = new Date();
var endTime = new Date();
endTime.setFullYear(now.getFullYear() + 1);
endTime.setMonth(0);
endTime.setDate(1);
endTime.setHours(0);
endTime.setMinutes(0);
endTime.setSeconds(0);


function updateCountdown() {
    secondsLeft = calculateTimeSeconds();
    var output = secondsLeft + " Sekunden";
    document.getElementById("countdown_numbers").innerHTML = output;
    
    if(secondsLeft<=-1){
        alert("Happy New Year lol");
    }
}


function calculateTimeSeconds(){
    now = new Date();
    var timeDifference = endTime - now;
    var timeDifferenceInSeconds = Math.floor(timeDifference / 1000);
    return timeDifferenceInSeconds;
}


//initiate that thing
secondsLeft = calculateTimeSeconds() + 1;
// Aktualisieren (alle 1 s (1000ms))
setInterval(updateCountdown, 1000);
//first call:
updateCountdown();
