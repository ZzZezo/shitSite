const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const amountOfPointsTotal = 17;
const emojiSize = 80;
const timeMultiplier = 3;

let points = [];
let targetColor = 'red'; // pretend red would be alive things ig

var correctaudio = new Audio('IsThisAlive/correct.mp3');
var incorrectaudio = new Audio('IsThisAlive/incorrect.mp3');

let speed = 6;

let totalRedDots = 0;
let bluedotscollected = 0;

let timeLeft;

function getRandomColor() {
    const colors = ['red', 'blue'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function generatePoints(numPoints) {
    points = [];
    totalRedDots = 0; // Reset the counter every time points are generated

    for (let i = 0; i < numPoints; i++) {
        const color = getRandomColor();
        let emoji;

        if (color === 'red') {
            totalRedDots++; // Increment the counter if the point is red
            const redEmojis = ['🐎', '🐔', '🌳', '🐅', '🐫', '🌹', '🌻', '🦁', '🐼', '🌿', '🌺', '🌴', '🦒', '🦋', '🐝', '🍃', '🐨', '🌱', '🌷', '🐠', '🌲', '🐍', '🦊', '🐑', '🌾', '🐧', '🦓', '🌸', '🌵', '🦠', '🦜', '🌼', '🍂', '🦨', '🌰', '🐻', '🦥', '🦦', '🐺', '🦈', '🌾', '🦜', '🌲', '🐝', '🌹', '🌼', '🐇', '🌼', '🦋', '🌻', '🍄', '🌵', '🌴', '🐢', '🌷', '🐓', '🦁', '🦌', '🌲', '🦦', '🍃', '🐦', '🦄', '🐸', '📎']; // Array of red emojis
            emoji = redEmojis[Math.floor(Math.random() * redEmojis.length)];
        } else {
            const blueEmojis = ['🏠', '🦴', '🛹', '🛰️', '🧶', '🩴', '⚽', '🎮', '🚗', '📱', '🖥️', '🛳️', '📚', '🕰️', '🛋️', '🪑', '🛏️', '🔑', '🧳', '🔒', '🛠️', '🚪', '🪒', '💻', '🎲', '📷', '🧩', '🔋', '🗺️', '🎨', '🧼', '🧺', '🎸', '📦', '🎤', '🔦', '🪟', '🎰', '📻', '🛎️', '🏅', '🧢', '🕶️', '📏', '🧳', '📅', '🔧', '🧪', '💡', '🚪', '🖼️', '🗜️', '🧺', '🛠️', '🏢', '🎯', '🔬', '🧩', '📊', '💼', '🎁', '🔧', '🗄️', '🔌', '🔑', '🛍️', '🎉', '📅', '🛒', '🔒', '🛡️', '🎮', '🧵', '📏', '🧲', '💻', '🗃️', '🪑', '📏', '🔑', '🧭', '📓', '🧬']; // Array of blue emojis
            emoji = blueEmojis[Math.floor(Math.random() * blueEmojis.length)];
        }

        points.push({
            x: Math.random() * (canvas.width-emojiSize)+emojiSize/2,
            y: Math.random() * (canvas.height-emojiSize)+emojiSize/2,
            color: color,
            emoji: emoji, // Store the selected emoji in the point object
            dx: (Math.random() - 0.5) * speed, // x direction + speed
            dy: (Math.random() - 0.5) * speed  // y direction + speed
        });
    }
}

function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    points.forEach(point => {
        ctx.font = emojiSize+'px Arial'; // Set font size and style
        ctx.textAlign = 'center'; // Center the emoji on the point
        ctx.textBaseline = 'middle'; // Center the emoji on the point

        ctx.fillText(point.emoji, point.x, point.y); // Draw the emoji stored in the point object
    });
}

function updatePoints() {
    points.forEach(point => {
        point.x += point.dx;
        point.y += point.dy;

        // Check for collisions with canvas edges and reverse direction if necessary
        if (point.x <= emojiSize/2 || point.x >= canvas.width - emojiSize/2) {
            point.dx *= -1;
        }
        if (point.y <= emojiSize/2 || point.y >= canvas.height - emojiSize/2) {
            point.dy *= -1;
        }
    });
}

function animate() {
    updatePoints();
    drawPoints();
    animationFrameId = requestAnimationFrame(animate); // Continue the animation loop
}

function checkClickedPoint(event) {
    const clickX = event.clientX;
    const clickY = event.clientY;

    let clickedPoint = null;
    for (let id = 0; id < points.length; id++) {
        const distance = Math.sqrt(Math.pow(points[id].x - clickX, 2) + Math.pow(points[id].y - clickY, 2));
        if (distance <= emojiSize) {
            //runs if point clicked
            clickedPoint = points[id];
            points[id].x = 100000000;
            points.splice(id, 1);
            console.log("ein punkt clikt");
            break;
        }
    }

    if (clickedPoint) {
        if (clickedPoint.color == targetColor) {
            correctaudio.pause();
            correctaudio.currentTime = 0;
            correctaudio.play();
            totalRedDots--;
            if (totalRedDots == 0) {
                clearInterval(stopwatchInterval);
                createPopup("Spiel Vorbei.", "Du hast alle Lebewesen gefunden.\nDabei hast du nur " + bluedotscollected + " Fehler gemacht.", 1, ["Nochmal!"], [location.reload.bind(location)]);
            }

        } else {
            incorrectaudio.pause();
            incorrectaudio.currentTime = 0;
            incorrectaudio.play();
            bluedotscollected++;
        }
    }
    console.log(totalRedDots);
}

function dotsToTime(dots) {
    //every dot adds 1 second to the timer.
    //returns it in this format mm:ss
    var seconds = dots*timeMultiplier;
    timeLeft = seconds;
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function updateStopwatch() {
    if (timeLeft <= 0 && totalRedDots > 0) {
        clearInterval(stopwatchInterval);
        createPopup("Spiel Vorbei.", "Die Zeit ist abgelaufen.\nDir haben nur " + totalRedDots + " Lebewesen gefehlt!\nDabei hast du nur " + bluedotscollected + " Fehler gemacht.", 1, ["Nochmal!"], [location.reload.bind(location)]);
        return;
    }
    timeLeft--;
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    document.getElementById('stopwatch').innerText = formatTime(minutes) + ':' + formatTime(seconds);
}

function formatTime(time) {
    return time < 10 ? '0' + time : time;
}

canvas.addEventListener('click', checkClickedPoint);

generatePoints(amountOfPointsTotal);
document.getElementById("stopwatch").innerHTML = dotsToTime(amountOfPointsTotal);
stopwatchInterval = setInterval(updateStopwatch, 1000);
drawPoints();
animate();
