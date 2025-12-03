const CANVAS_PREFIX = 'paint_';

var canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth / 1.5;
canvas.height = window.innerHeight / 1.5;

var toolsizeinput = document.getElementById("brushsizeinput");

var sliderValueR = 0,
  sliderValueG = 0,
  sliderValueB = 0;
var sliderElements = document.getElementsByClassName("slider");
var slideR = document.getElementById('slideR');
var slideG = document.getElementById('slideG');
var slideB = document.getElementById('slideB');

var colorBox = document.getElementById("currentcolorbox");

var hexInput = document.getElementById("hexinput");

var clicked = false;

var brush_size = 50;
var tool = "brush"; //"pen","brush","line","eraser","fill","pick","none"

slideR.value = Math.floor(Math.random() * 256);
slideG.value = Math.floor(Math.random() * 256);
slideB.value = Math.floor(Math.random() * 256);
var brush_color = 'rgb(' + slideR.value + ',' + slideG.value + ',' + slideB.value + ')';
update_color(brush_color);

colorBox.style.fill = brush_color;
var penLastX, penLastY;
var lineLastX, lineLastY;
var lineCornerNr = 0;
var lineMaxCorners = 2;

var oldCanvases = [];
var changes = 0;

//saving
var savedCanvases = []
var idToLoad = "nahhhbro"

//ctrl z
let undone = false;

function mouseDown(event) { //called when mouse is currently clicked
  clicked = true;

  penLastX = event.clientX - event.target.offsetLeft;
  penLastY = event.clientY - event.target.offsetTop;

  saveCanvasUndo(); // Save canvas state before any changes

  if (tool === "pick") {
    var pick = canvas.getContext("2d");
    var pickedcolor = "rgb(";
    pickedcolor += String(pick.getImageData(penLastX, penLastY, 1, 1).data);

    //removing the transparency from rgba
    let lastCommaIndex = pickedcolor.lastIndexOf(",");
    transparency = pickedcolor.substring(lastCommaIndex + 1, pickedcolor.length)
    pickedcolor = pickedcolor.substring(0, lastCommaIndex);

    pickedcolor += ")"

    if (transparency == "0") pickedcolor = "rgb(255,255,255)";

    update_color(pickedcolor);
  }

  moveC(event);

}

function mouseUp(event) { //called when letting go of mouse and when leaving canvas
  if (clicked) {
    clicked = false;
  }
}

function updateActiveTool(activeButton) {
  var buttons = document.querySelectorAll(".toolbutton");

  buttons.forEach(button => {
    button.style.backgroundColor = "#c0c0c0";
  });

  activeButton.style.backgroundColor = "lime"
}

function toolSwitch(switchTool) {
  tool = switchTool;
}

function update_color(color) {
  brush_color = color;

  const values = color
    .replace("rgb(", "") // Remove "rgb("
    .replace(")", "") // Remove ")"
    .split(","); // Split at commas

  cred = parseInt(values[0]);
  cgreen = parseInt(values[1]);
  cblue = parseInt(values[2]);

  slideR.value = cred;
  slideG.value = cgreen;
  slideB.value = cblue;

  var hexValues = [cred.toString(16), cgreen.toString(16), cblue.toString(16)];
  hexInput.value = "#"
  for (var i = 0; i < hexValues.length; i++) {
    var hexValue = hexValues[i];
    if (hexValue.length < 2) {
      hexValue = "0" + hexValue;
    }
    hexInput.value += hexValue.toUpperCase();
  }
  colorBox.style.fill = brush_color;
}

function toolSizeChanged(value) {
  value = parseInt(value, 10);

  if (isNaN(value)) {
    value = 0;
    return;
  }

  //limitations
  if (value < 0) {
    value = 0;
  }

  brush_size = value;
  toolsizeinput.value = value;
}

function hexInputChanged() {
  hexCode = hexInput.value;
  if (hexCode != "" && hexCode[0] !== "#") {
    hexCode = "#" + hexCode;
    hexInput.value = hexCode;
  }

  if (hexCode.length >= 7) {
    hexCodeArray = [hexCode[1] + hexCode[2], hexCode[3] + hexCode[4], hexCode[5] + hexCode[6]];
    var rgbCode = "rgb(";
    for (var i = 0; i < hexCodeArray.length; i++) {
      rgbCode += parseInt(hexCodeArray[i], 16) + ", ";
    }
    rgbCode = rgbCode.substring(0, rgbCode.length - 2);
    rgbCode += ")";

    if (rgbCode.includes("NaN")) {
      pass;
    } else {
      update_color(rgbCode);
    }
  }
}

function getColorFromValue() {
  update_color('rgb(' + sliderValueR + ', ' + sliderValueG + ', ' + sliderValueB + ')')
}

for (var i = 0; i < sliderElements.length; i++) {
  var sliderElement = sliderElements[i];
  sliderElement.addEventListener('input', function () {
    sliderValueR = slideR.value;
    sliderValueG = slideG.value;
    sliderValueB = slideB.value;
    getColorFromValue();
  });
}

function floodFill(startX, startY, targetColor, newColorString) {
  var ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const fillColor = getRGBAFromString(newColorString);

  if (colorsMatch(targetColor, fillColor)) return;
  const stack = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    
    let pixelPos = (y * width + x) * 4;

    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    //check if current pixel matches targetColor
    if (
      data[pixelPos] === targetColor[0] &&
      data[pixelPos + 1] === targetColor[1] &&
      data[pixelPos + 2] === targetColor[2] &&
      data[pixelPos + 3] === targetColor[3]
    ) {
      //change the color in buffer
      data[pixelPos] = fillColor[0];
      data[pixelPos + 1] = fillColor[1];
      data[pixelPos + 2] = fillColor[2];
      data[pixelPos + 3] = 255; // Alpha

      //push neighbors (up, down, left, right)
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }
  }

  //load image to canvas
  ctx.putImageData(imgData, 0, 0);
}

function colorsMatch(color1, color2) { //check if 2 colors are the same
  return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2] && color1[3] === color2[3];
}

function getRGBAFromString(colorString) {
  // Extracts numbers from "rgb(x, y, z)"
  const values = colorString
    .replace("rgb(", "")
    .replace(")", "")
    .split(",")
    .map(Number);
    
  // Returns [r, g, b, alpha] (assuming full opacity for brush)
  return [values[0], values[1], values[2], 255]; 
}

function moveC(event) { //move canvas to center
  var x = event.clientX - event.target.offsetLeft;
  var y = event.clientY - event.target.offsetTop;

  if (clicked) {
    if (tool === "pen") {
      var pen = canvas.getContext("2d");
      pen.beginPath();
      pen.moveTo(penLastX, penLastY);
      pen.lineTo(x, y);
      pen.strokeStyle = brush_color;
      pen.lineWidth = 1;
      pen.stroke();
      penLastX = x;
      penLastY = y;
    }
    if (tool === "brush") {
      var brush = canvas.getContext("2d");
      brush.beginPath();
      brush.arc(x, y, brush_size, 0, 2 * Math.PI);
      brush.fillStyle = brush_color;
      brush.fill();
    }
    if (tool === "eraser") {
      var brush = canvas.getContext("2d");
      brush.beginPath();
      brush.arc(x, y, brush_size, 0, 2 * Math.PI);
      brush.fillStyle = "white";
      brush.fill();
    }
    if (tool === "line") {
      if (lineCornerNr >= lineMaxCorners) {
        lineCornerNr = 1;
        lineLastX = x;
        lineLastY = y;
        return;
      }
      lineCornerNr += 1;
      var line = canvas.getContext("2d");
      line.beginPath();
      line.moveTo(lineLastX, lineLastY);
      line.lineTo(x, y);
      line.strokeStyle = brush_color;
      line.lineWidth = brush_size;
      line.stroke();
      lineLastX = x;
      lineLastY = y;
    }
    if (tool === "fill") {
      visited = [];
      for (let i = 0; i < canvas.width; i++) {
        visited[i] = [];
        for (let j = 0; j < canvas.height; j++) {
          visited[i][j] = false;
        }
      }

      var fill = canvas.getContext("2d");
      const pixelData = fill.getImageData(x, y, 1, 1).data; //check color of pixel u clicked
      const targetColor = pixelData;
      const newColor = brush_color;
      floodFill(x, y, targetColor, newColor);
    }
  }
}

function saveCanvasUndo() { //save canvas in array after every action
  oldCanvases[changes] = canvas.toDataURL();
  changes += 1;
}

function undoCanvas() { //load the picture that was before last click
  if (changes <= 0) return;

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  var loader = canvas.getContext("2d");
  var dataURL = oldCanvases[changes - 1];
  var img = new Image();
  img.src = dataURL;
  img.onload = function () {
    loader.drawImage(img, 0, 0);
  };
  oldCanvases.splice(changes)
  changes -= 1;
}

function canvassaveinputupdated() {
  idToLoad = document.getElementById("canvassaveinput").value;
  const onlyNumbersRegex = /^[0-9]+$/;
  const containsOnlyNumbers = onlyNumbersRegex.test(idToLoad);

  if (containsOnlyNumbers) {
    idToLoad = parseInt(idToLoad);
  }
  else {
    idToLoad = null;
    document.getElementById("canvassaveinput").value = "";
  }
}

function saveCanvas(nr) {
  if (!Number.isInteger(nr)) {
    createPopup("Error", "Bitte gib eine richtige ID ein.", 1, ["OK"], [closePopup]);
    return;
  }

  var imageName, author;
  createPrompt("Speichern", "Wie möchtest du das Bild nennen?", function (answer) {
    imageName = answer;
    createPrompt("Speichern", "Und wer bist du?", function (answer) {
      author = answer;

      savedCanvases[nr] = canvas.toDataURL();
      const key = CANVAS_PREFIX + nr;
      localStorage.setItem(key, savedCanvases[nr] + "/z/z/z/name/z/z/z/" + imageName + "/z/z/z/author/z/z/z/" + author);

      updateArtlist();
      createPopup("Gespeichert!", "Dein Kunstwerk wurde gespeichert. (ID: " + nr + ")", 1, ["OK"], [closePopup]);
    })
  });
}


function loadCanvas(nr) { //load a saved canvas
  if (!Number.isInteger(nr)) {
    createPopup("Error", "Bitte gib eine richtige ID ein.", 1, ["OK"], [closePopup]);
    return;
  }

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  var loader = canvas.getContext("2d");
  var dataURL = savedCanvases[nr];
  var img = new Image;
  img.src = dataURL;
  img.onload = function () {
    loader.drawImage(img, 0, 0);
  };
}

function editItem(nr) {
  if (!Number.isInteger(nr)) {
    createPopup("Error", "Bitte gib eine richtige ID ein.", 1, ["OK"], [closePopup]);
    return;
  }

  var newimageName, newauthor;
  createPrompt("Bearbeiten", "Wie möchtest du das Bild WIRKLICH nennen?", function (answer) {
    newimageName = answer;
    createPrompt("Bearbeiten", "Und wer bist du WIRKLICH?", function (answer) {
      newauthor = answer;
      const key = CANVAS_PREFIX + nr;
      localStorage.setItem(key, savedCanvases[nr] + "/z/z/z/name/z/z/z/" + newimageName + "/z/z/z/author/z/z/z/" + newauthor);
      updateArtlist();
    });
  });
}

function deleteItem(nr) {
  if (!Number.isInteger(nr)) {
    createPopup("Error", "Bitte gib eine richtige ID ein.", 1, ["OK"], [closePopup]);
    return;
  }

  createPopup("Kunstwerk Löschen", "Bild " + nr + " vernichten? \nDies ist permanent..", 2, ["Abbrechen", "Ja"], [closePopup, function () { return confirmDeleteItem(nr); }]);
}

function confirmDeleteItem(nr) {
  savedCanvases = [];
  savedNames = [];
  savedAuthores = [];
  
  for (let i = 0; i < 1000; i++) {
    const key = CANVAS_PREFIX + i;
    if (localStorage.getItem(key) != null) {
      let myItem = localStorage.getItem(key);
      let parts = myItem.split("/z/z/z/");
      savedCanvases[i] = parts[0];
      savedNames[i] = parts[2];
      savedAuthores[i] = parts[4];
    }
  }

  savedCanvases.splice(nr, 1);
  savedNames.splice(nr, 1);
  savedAuthores.splice(nr, 1);

  clearProjectItems();

  for (let i = 0; i < 1000; i++) {
    if (savedCanvases[i] != null) {
      const key = CANVAS_PREFIX + i;
      localStorage.setItem(key, savedCanvases[i] + "/z/z/z/name/z/z/z/" + savedNames[i] + "/z/z/z/author/z/z/z/" + savedAuthores[i]);
    }
  }

  updateArtlist();
  closePopup();
}

function exportImage() {
  navigator.clipboard.writeText(canvas.toDataURL());
  createPopup("Exportieren erfolgreich", "Der Code wurde in deine Zwischenablage kopiert.", 1, ["OK"], [closePopup]);
}

function importImage() {
  var loader = canvas.getContext("2d");
  createPrompt("Importieren", "Füge hier den Code ein:", function (answer) {
    //the user input will be saved in the variable "answer"

    var dataURL = answer;
    var img = new Image;
    img.src = dataURL;
    img.onload = function () {
      loader.drawImage(img, 0, 0);
    };
  });
}

function updateArtlist() {
  document.getElementById("Artlist").innerHTML = "";
  
  for (let i = 0; i < 1000; i++) {
    const key = CANVAS_PREFIX + i;
    if (localStorage.getItem(key) != null) {
      let myItem = localStorage.getItem(key);
      let parts = myItem.split("/z/z/z/");
      let URL = parts[0];
      let imageName = parts[2];
      let author = parts[4];

      var boldNr = document.createElement("span");
      boldNr.style.fontWeight = "bold";
      boldNr.appendChild(document.createTextNode(i));

      var textNode = document.createTextNode(": " + imageName + ", " + author);
      var lineBreak = document.createElement("br");

      document.getElementById("Artlist").appendChild(boldNr);
      document.getElementById("Artlist").appendChild(textNode);
      document.getElementById("Artlist").appendChild(lineBreak);

      savedCanvases[i] = URL;
    }
  }
}

function clearProjectItems() {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key.startsWith(CANVAS_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
}

function alertCustom(message){
  createPopup("Error", message, 1, ["OK"], [closePopup]);
}


document.addEventListener('wheel', function (event) {
  var scroll_mult = 2; //declares by how many units the size is changed
  if (event.deltaY < 0) {
    toolSizeChanged(brush_size - scroll_mult);
  } else {
    toolSizeChanged(brush_size + scroll_mult);
  }
});

document.addEventListener('keydown', function (event) {
  // Check if the 'Control' key is pressed
  if (event.ctrlKey) {
    // Check if the 'Z' key is pressed
    if (event.key === 'z' || event.key === 'Z') {
      //check if undo was already completed
      if(!undone){
        undone = true;
        undoCanvas();
      }
    }
  }
});

document.addEventListener('keyup', function(event) {
  // Example: Detecting when the 'Z' key is released
  if (event.key === 'z' || event.key === 'Z') {
      undone = false;
  }
});

window.onload = function () {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  toolSwitch("brush");
  updateActiveTool(document.getElementById("test"));

  updateArtlist();
}

window.onbeforeunload = function (event) {
  // if(savedCanvases.length>=1)return confirm("PENIS")
}
