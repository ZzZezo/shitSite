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
    
    // Badge conditions with saving
    if (secondsLeft === 10000000) {
        const badgeElement = document.getElementById("10M");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("10M", "10 Million! 🩵","Received on 10 million seconds remaining in the countdown.");
            triggerBadgeAnimation(badgeElement);
        }
    }

    if (secondsLeft === 1000000) {
        const badgeElement = document.getElementById("1M");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("1M", "1 Million! 💛", "Received on 1 million seconds remaining in the countdown.");
            triggerBadgeAnimation(badgeElement);
        }
    }

    if (secondsLeft === 787787 || secondsLeft === 787) {
        const badgeElement = document.getElementById("BastiGHG");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("BastiGHG","GHG 💚", "787 🗿🗿🗿🗿🗿");
            triggerBadgeAnimation(badgeElement);
        }
    }

    if (secondsLeft <= -1) {
        alert("Happy New Year lol");
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
    if (now.getMonth() === 11 && now.getDate() === 24) {
        const badgeElement = document.getElementById("xMas");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("xMas", "The Celebration of Love 🎄🎅🏼", "Merry Christmas! <3");
            triggerBadgeAnimation(badgeElement);
        }
    }
    if (now.getMonth() === 3 && now.getDate() === 1) {
        const badgeElement = document.getElementById("april_fools");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("april_fools","april_fools.toString( )", "404_description_not_found");
            triggerBadgeAnimation(badgeElement);
        }
    }
    if (now.getMonth() === 9 && now.getDate() === 31) {
        const badgeElement = document.getElementById("halloween");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("halloween","Happy Halloween", "👻🎃");
            triggerBadgeAnimation(badgeElement);
        }
    }
    if (Intl.DateTimeFormat().resolvedOptions().timeZone.split("/")[1] === "Zagreb") {
        const badgeElement = document.getElementById("HR");
        if (badgeElement && badgeElement.style.display !== "block") {
            badgeElement.style.display = "block";
            saveBadge("HR","Boli me kurac 🇭🇷", "For opening the countdown while in Croatia.");
            triggerBadgeAnimation(badgeElement);
        }
    }
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
    updateDayBadges();
    loadBadges();
});

//initiate that thing
secondsLeft = calculateTimeSeconds() + 1;
// Aktualisieren (alle 1 s (1000ms))
setInterval(updateCountdown, 1000);
//first call:
updateCountdown();
