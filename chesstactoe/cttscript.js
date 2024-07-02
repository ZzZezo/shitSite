function createBoard(size) {
    const mainBoard = document.getElementById("mainboard");

    for (let row = 0; row < size; row++) {
        const tr = document.createElement('tr');

        for (let col = 0; col < size; col++) {
            const td = document.createElement('td');

            //check color
            if ((row + col) % 2 === 0) {
                td.className = 'white';
            } else {
                td.className = 'black';
            }

            td.onclick = function () { console.log(getContent(td)) };

            tr.appendChild(td);
        }

        mainBoard.appendChild(tr);
    }
}

function createLibrary(size, color, figures) { //was cooked, look what i got meanwhile https://i.imgur.com/iQFudu9.png
    const libraryBoard = document.getElementById(color + "Library");
    let slot = 0;

    for (let row = 0; row < size; row++) {
        const tr = document.createElement('tr');

        for (let col = 0; col < 1; col++) {
            const td = document.createElement('td');

            //check color
            if ((row + col) % 2 === 0) {
                td.className = 'white';
            } else {
                td.className = 'black';
            }

            td.onclick = function () { clickedOnLibrary(this, row, col) };

            td.innerHTML = figures[slot];
            slot++;

            tr.appendChild(td);
        }

        libraryBoard.appendChild(tr);
    }
}


function drawTextures(board) {
    const mainBoard = document.getElementById(board);
    const rows = mainBoard.querySelectorAll("tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        cells.forEach(cell => {
            const cellText = cell.textContent.trim();
            const img = document.createElement("img");

            if (cellText.includes("bishop")) img.src = "assets/images/ctt/bishop.png";
            if (cellText.includes("king")) img.src = "assets/images/ctt/king.png";
            if (cellText.includes("knight")) img.src = "assets/images/ctt/knight.png";
            if (cellText.includes("pawn")) img.src = "assets/images/ctt/pawn.png";
            if (cellText.includes("queen")) img.src = "assets/images/ctt/queen.png";
            if (cellText.includes("rook")) img.src = "assets/images/ctt/rook.png";

            if (cellText.includes("_B")) img.style.filter = "brightness(0.2)"; //i have to find a better way to distinguish the colors later

            img.style.width = "60px";
            img.style.height = img.style.width;

            cell.appendChild(img);
        })
    })
}

function getContent(cell) {
    return cell.textContent.trim();
}

function getPath(figureType,team) {
    if(team=="white"){
        if (figureType.includes("bishop")) return "assets/images/ctt/bishop.png";
        if (figureType.includes("king")) return "assets/images/ctt/king.png";
        if (figureType.includes("knight")) return "assets/images/ctt/knight.png";
        if (figureType.includes("pawn")) return "assets/images/ctt/pawn.png";
        if (figureType.includes("queen")) return "assets/images/ctt/queen.png";
        if (figureType.includes("rook")) return "assets/images/ctt/rook.png";
    }
    else{
        if (figureType.includes("bishop")) return "assets/images/ctt/bishop_B.png";
        if (figureType.includes("king")) return "assets/images/ctt/king_B.png";
        if (figureType.includes("knight")) return "assets/images/ctt/knight_B.png";
        if (figureType.includes("pawn")) return "assets/images/ctt/pawn_B.png";
        if (figureType.includes("queen")) return "assets/images/ctt/queen_B.png";
        if (figureType.includes("rook")) return "assets/images/ctt/rook_B.png";
    }
}

function clickedOnLibrary(cell, row, col) {
    const content = cell.textContent.trim();
    if (content == ""){
        //player clicked on empty field
        document.getElementsByTagName("body")[0].style.cursor = "url('assets/images/old_pointer.png'), auto";
        return; 
    }

    let team = "white";
    if (content.includes("_B")) team = "black";

    const figureType = content.replace("_B", "");


    var elementToChange = document.getElementsByTagName("body")[0];
    elementToChange.style.cursor = "url('"+getPath(figureType,team)+"') 32 32, not-allowed";
    console.log(team + " " + figureType)
}


//code that actually runs
createBoard(3);
createLibrary(8, "white", ["rook", "knight", "bishop", "bishop", "", "", "pawn", "pawn"]);
createLibrary(8, "black", ["rook_B", "knight_B", "", "bishop_B", "knight_B", "rook_B", "pawn_B", "pawn_B"]);

drawTextures("mainboard");
drawTextures("whiteLibrary");
drawTextures("blackLibrary");