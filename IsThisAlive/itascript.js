const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const amountOfPointsTotal = 40;

let points = [];
let targetColor = 'red'; // pretend red would be alive things ig

var correctaudio = new Audio('IsThisAlive/correct.mp3');
var incorrectaudio = new Audio('IsThisAlive/incorrect.mp3');

let speed = 1.4;

let totalRedDots = 0;
let bluedotscollected = 0;

function getRandomColor() {
    const colors = ['red', 'blue'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function generatePoints(numPoints) {
    points = [];
    totalRedDots = 0; // Reset the counter every time points are generated
    
    for (let i = 0; i < numPoints; i++) {
        const color = getRandomColor();
        if (color === 'red') {
            totalRedDots++; // Increment the counter if the point is red
        }

        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            color: color,
            dx: (Math.random() - 0.5) * speed, // x direction + speed
            dy: (Math.random() - 0.5) * speed  // y direction + speed
        });
    }
}

function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = point.color;
        ctx.fill();
        ctx.closePath();
    });

}

function updatePoints() {
    points.forEach(point => {
        point.x += point.dx;
        point.y += point.dy;

        // Check for collisions with canvas edges and reverse direction if necessary
        if (point.x <= 10 || point.x >= canvas.width - 10) {
            point.dx *= -1;
        }
        if (point.y <= 10 || point.y >= canvas.height - 10) {
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

    let id = 0;
    points.forEach(point => {
        const distance = Math.sqrt(Math.pow(point.x - clickX, 2) + Math.pow(point.y - clickY, 2));
        if (distance <= 10) {
            //runs if point clicked
            clickedPoint = point;
            points[id].x = 100000000;
            points.slice(id, 1);
        }
        id++;
    });

    if (clickedPoint) {
        if (clickedPoint.color == targetColor) {
            correctaudio.pause();
            correctaudio.currentTime = 0;
            correctaudio.play();
            totalRedDots--;
            if (totalRedDots == 0) {
                createPopup("Spiel Vorbei.", "Du hast alle roten Punkte gefunden.\nDabei hattest du nur " + bluedotscollected + " Fehler gemacht.", 1, ["OK!"],[closePopup]);
            }

        } else {
            incorrectaudio.pause();
            incorrectaudio.currentTime = 0;
            incorrectaudio.play();
            bluedotscollected++;
        }
    }
}

canvas.addEventListener('click', checkClickedPoint);

generatePoints(amountOfPointsTotal);
drawPoints();
animate();
