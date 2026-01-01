var secondsLeft = 1337;
var secondsWatching = 0;
var country = "backrooms";
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
    secondsWatching+=1;
    var output = secondsLeft + " Sekunden";
    document.getElementById("countdown_numbers").innerHTML = output;
    
    // Badge conditions with saving
    //10M
    if (secondsLeft === 10000000) {
        const badgeElement = document.getElementById("10M");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("10M", "10 Million! 🩵","Received on 10 million seconds remaining in the countdown.");
            triggerBadgeAnimation(badgeElement);
        }
    }
    //1M
    if (secondsLeft === 1000000) {
        const badgeElement = document.getElementById("1M");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("1M", "1 Million! 💛", "Received on 1 million seconds remaining in the countdown.");
            triggerBadgeAnimation(badgeElement);
        }
    }
    //GHG
    if (secondsLeft === 787787 || secondsLeft === 787) {
        const badgeElement = document.getElementById("BastiGHG");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("BastiGHG","GHG 💚", "787 🗿🗿🗿🗿🗿");
            triggerBadgeAnimation(badgeElement);
        }
    }
    //FIBONACCI
    if (secondsLeft === 11235813) {
        const badgeElement = document.getElementById("fibonacci");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("fibonacci","Fibonacci Sequence 🌀🔢", "Received on exactly 11235813 seconds");
            triggerBadgeAnimation(badgeElement);
        }
    }
    //pi
    if (secondsLeft === 3141592) {
        const badgeElement = document.getElementById("pi");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("pi","π", "Received on exactly 3141592 seconds");
            triggerBadgeAnimation(badgeElement);
        }
    }
    //SATAN
    if (secondsLeft === 6666666) {
        const badgeElement = document.getElementById("satan");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("satan","Hail Satan...", "6666666");
            triggerBadgeAnimation(badgeElement);
        }
    }
    //among us king
    if (secondsLeft === 15062018) {
        const badgeElement = document.getElementById("amogus");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("amogus","Among Us King 💛👑", "Appears when Seconds match with the Among Us Release Date (15th of June 2018)");
            triggerBadgeAnimation(badgeElement);
        }
    }
    //einstein
    if (secondsLeft === 14031879) {
        const badgeElement = document.getElementById("einstein");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("einstein","Albert Einstein 🧠", "Appears when Seconds match with Einsteins Birthday (14th of March 1879)");
            triggerBadgeAnimation(badgeElement);
        }
    }
    //rickroll
    if (secondsLeft === 25102009) {
        const badgeElement = document.getElementById("rickroll");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("rickroll","Rickrolled!", "Appears when Seconds match with the Release Date of Never Gonna Give You Up (25th of October 2009)");
            triggerBadgeAnimation(badgeElement);
        }
    }


    if (secondsLeft <= -1) {
        alert("Happy New Year lol");
        createPopup("Happy New Year!", "happy new year lol", 1, ["Thanks! <3"], [closePopup]);
    }

    //TIMEWASTE
    if (secondsWatching === 10000) {
        const badgeElement = document.getElementById("timeWaste");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("timeWaste","Is this really what you wanna do with your life?", "Obtained after watching the Counter for 10k seconds straight...\nGo out... Read a book... Heck- Even scrolling Reels is better...\n Get help. Please.");
            triggerBadgeAnimation(badgeElement);
        }
    }

    //luck
    if (Math.floor(Math.random() * 7777) == 69) {
        const badgeElement = document.getElementById("lucker");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("lucker","🎲 CASINO 🎰", "Just be INSANELY lucky :)");
            triggerBadgeAnimation(badgeElement);
        }
    }
}


function calculateTimeSeconds(){
    now = new Date();
    var timeDifference = endTime - now;
    var timeDifferenceInSeconds = Math.floor(timeDifference / 1000);
    return timeDifferenceInSeconds;
}

// Helper function to save badge to localStorage
function saveBadge(badgeId, title, description) {
    const currentTime = new Date().toISOString(); // ISO format for date and time
    const badgeData = {
        id: badgeId,
        title: title,
        obtainedAt: currentTime,
        description: description
    };

    // Get existing badges from localStorage or initialize an empty array
    let badges = JSON.parse(localStorage.getItem('CD_obtainedBadges')) || [];
    
    // Check if badge already exists to avoid duplicates
    if (!badges.some(badge => badge.id === badgeId)) {
        badges.push(badgeData);
        localStorage.setItem('CD_obtainedBadges', JSON.stringify(badges));
        console.log(`Badge "${badgeId}" saved:`, badgeData); // Optional: for debugging
    }
}

function loadBadges() {
    const badges = JSON.parse(localStorage.getItem('CD_obtainedBadges')) || [];
    badges.forEach(badge => {
        const badgeElement = document.getElementById(badge.id);
        if (badgeElement) {
            badgeElement.style.display = "block"; // Show the badge if it’s in localStorage
        }
    });
}

function showBadgeDetails(badgeId) {
    const badges = JSON.parse(localStorage.getItem('CD_obtainedBadges')) || [];
    const badge = badges.find(b => b.id === badgeId);
    
    if (badge) {
        const title = badge.title;
        const text = `${badge.description}\n\nObtained: ${new Date(badge.obtainedAt).toLocaleString()}`;
        createPopup(title, text, 1, ["Back"], [closePopup]);
    } else {
        createPopup("Badge Info", "This badge has not been unlocked yet or has no details.", 1, ["Back"], [closePopup]);
    }
}

function updateDayBadges() {
    now = new Date();
    //christmas
    if (now.getMonth() === 11 && now.getDate() === 24) {
        const badgeElement = document.getElementById("xMas");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("xMas", "The Celebration of Love 🎄🎅🏼", "Merry Christmas! <3");
            triggerBadgeAnimation(badgeElement);
        }
    }
    //april fools
    if (now.getMonth() === 3 && now.getDate() === 1) {
        const badgeElement = document.getElementById("april_fools");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("april_fools","april_fools.toString( )", "404_description_not_found");
            triggerBadgeAnimation(badgeElement);
        }
    }
    //halloween
    if (now.getMonth() === 9 && now.getDate() === 31) {
        const badgeElement = document.getElementById("halloween");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("halloween","Happy Halloween", "👻🎃");
            triggerBadgeAnimation(badgeElement);
        }
    }
    //my birthday
    if (now.getMonth() === 2 && now.getDate() === 9) {
        const badgeElement = document.getElementById("birthday");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("birthday","Happy Birthday to me! 🤠", "Obtainable on March 9th :)");
            triggerBadgeAnimation(badgeElement);
        }
    }

    //420
    if(now.getHours()===4 && now.getMinutes()===20){
        const badgeElement = document.getElementById("420");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("420","04:20", "🚬🌿\nOpen the Countdown Page exactly at the right time...");
            triggerBadgeAnimation(badgeElement);
        }
    } 

    //craftattack13
    if(now.getMonth() === 9 && now.getDate() === 26 && now.getHours()===12 && now.getMinutes()===0){
        const badgeElement = document.getElementById("craftattack13");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("craftattack13","CRAFT ATTACK <3", "twitch.tv/stegi (haha)\nYou opened the Countdown exactly when Craft Attack 13 started!");
            triggerBadgeAnimation(badgeElement);
        }
    } 

    //newyear
    if(now.getMonth() === 0 && now.getDate() === 1){
        const badgeElement = document.getElementById("2026");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("2026","Happy new Year 2026 🗿🗿🗿", "I absolutely didn't mess up coding this.\nThis worked the entire time");
            triggerBadgeAnimation(badgeElement);
        }
    }

    //Croatia
    fetch('https://ipapi.co/json/').then(res => res.json()).then(data => {
        country = data.country_name;
        if (country=="Croatia") {
            const badgeElement = document.getElementById("HR");
            if (badgeElement && badgeElement.style.display !== "block") {
                badgeElement.style.display = "block";
                saveBadge("HR","Boli me kurac 🇭🇷", "For opening the countdown while in Croatia.");
                triggerBadgeAnimation(badgeElement);
            }
        }
    });
}

function triggerBadgeAnimation(badgeElement) {
    badgeElement.classList.add('badge-unlock');
    
    // Optional: Play sound if you added the audio element
    const badgeSound = document.getElementById('badgeSound');
    if (badgeSound) {
        badgeSound.currentTime = 0; // Reset to start
        badgeSound.play();
    }

    // Remove the animation class after it finishes (3s)
    setTimeout(() => {
        badgeElement.classList.remove('badge-unlock');
    }, 5500);
}

document.addEventListener("keydown", function(event) {
    if (event.key === "k" || event.key === "K") {
        const badgeElement = document.getElementById("press_k");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("press_k","You pressed K!", "Bro what did u expect would happen why did u do this 💀💀💀");
            triggerBadgeAnimation(badgeElement);
        }
    }
}); 

window.addEventListener('load', function() {
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        // Random angle between -15° and 15°
        const angle = Math.random() * 30 - 15;
        // Random scale between 0.9 and 1.1
        const scale = Math.random() * 0.4 + 0.8;
        // Set CSS custom properties instead of inline transform
        badge.style.setProperty('--angle', `${angle}deg`);
        badge.style.setProperty('--scale', scale);

        badge.addEventListener('click', function() {
            showBadgeDetails(badge.id);
        });
    });
    loadBadges();
    updateDayBadges();

    //times opened
    const timesOpened = parseInt(localStorage.getItem('CD_timesOpened')) || 0;
    localStorage.setItem('CD_timesOpened', timesOpened + 1);

    if(timesOpened >= 100){
        const badgeElement = document.getElementById("open100times");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("open100times","100th visit", "Thank you so much for opening the countdown 100 times! <3");
            triggerBadgeAnimation(badgeElement);
        }
    }
});

//initiate that thing
secondsLeft = calculateTimeSeconds() + 1;
// Aktualisieren (alle 1 s (1000ms))
setInterval(updateCountdown, 1000);
//first call:
updateCountdown();
