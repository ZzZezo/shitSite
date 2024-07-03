let piecesize = 60;

let BoardSize;

let pieceSelected = false; //tracks if user has selected a piece rn
let pieceOriginCell; //tracks where the currently selcted piece was
let SelectedPieceTeam; //tracks the team of currently selected piece
let SelectedPieceType; //tracks the type of currently selected piece

function createBoard(size) {
    BoardSize = size;
    const mainBoard = document.getElementById("mainboard");

    for (let row = 0; row < size; row++) {
        const tr = document.createElement('tr');

        for (let col = 0; col < size; col++) {
            const td = document.createElement('td');
            td.availableForSelection = false;

            //check color
            if ((row + col) % 2 === 0) {
                td.className = 'white';
            } else {
                td.className = 'black';
            }

            td.onclick = function () { clickedOnBoard(this, row, col) };

            if(window.screen.width <= 560){
                td.style.width = window.screen.width/6+"px";
                td.style.height = td.style.width;
                piecesize = Math.floor((window.screen.width / 6) - 10) + "px";

            };

            tr.appendChild(td);
        }

        mainBoard.appendChild(tr);
    }
}

function createLibrary(size, color, figures) { //was cooked, look what i got meanwhile https://i.imgur.com/iQFudu9.png
    const libraryBoard = document.getElementById(color + "Library");
    let slot = 0;

    if(window.screen.height <= 560) columamnt = 2;
    else columamnt = 1;

    for (let row = 0; row < size; row++) {
        const tr = document.createElement('tr');

        for (let col = 0; col < columamnt; col++) {
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
            //remove any old images, so it doesnt stack
            try {
                let oldImage = cell.querySelector('img')
                oldImage.remove();
            } catch (error) { }


            const cellText = cell.textContent.trim();
            const img = document.createElement("img");

            if (cellText.includes("bishop")) img.src = "assets/images/ctt/bishop.png";
            if (cellText.includes("king")) img.src = "assets/images/ctt/king.png";
            if (cellText.includes("knight")) img.src = "assets/images/ctt/knight.png";
            if (cellText.includes("pawn")) img.src = "assets/images/ctt/pawn.png";
            if (cellText.includes("queen")) img.src = "assets/images/ctt/queen.png";
            if (cellText.includes("rook")) img.src = "assets/images/ctt/rook.png";

            if (cellText.includes("_B")) img.style.filter = "brightness(0.2)"; //i have to find a better way to distinguish the colors later

            img.style.width = piecesize+"px";
            img.style.height = img.style.width;

            cell.appendChild(img);
        })
    })
}

function getContent(cell) {
    return cell.textContent.trim();
}

function getContentByPos(row, col) {
    try {
        const mainBoard = document.getElementById("mainboard");
        var cell = mainBoard.rows[row].cells[col];
        return cell.textContent.trim();
    }
    catch (error) {
        return "";
    }
}

function getTeamByPos(row,col){
    try {
        const mainBoard = document.getElementById("mainboard");
        var cell = mainBoard.rows[row].cells[col];
        let content = cell.textContent.trim();
        if(content.includes("_B")) return "black";
        else if(content != "")return "white";
        else return "";
    }
    catch (error) {
        return "";
    }
}

function getPath(figureType, team) {
    if (team == "white") {
        if (figureType.includes("bishop")) return "assets/images/ctt/bishop.png";
        if (figureType.includes("king")) return "assets/images/ctt/king.png";
        if (figureType.includes("knight")) return "assets/images/ctt/knight.png";
        if (figureType.includes("pawn")) return "assets/images/ctt/pawn.png";
        if (figureType.includes("queen")) return "assets/images/ctt/queen.png";
        if (figureType.includes("rook")) return "assets/images/ctt/rook.png";
    }
    else {
        if (figureType.includes("bishop")) return "assets/images/ctt/bishop_B.png";
        if (figureType.includes("king")) return "assets/images/ctt/king_B.png";
        if (figureType.includes("knight")) return "assets/images/ctt/knight_B.png";
        if (figureType.includes("pawn")) return "assets/images/ctt/pawn_B.png";
        if (figureType.includes("queen")) return "assets/images/ctt/queen_B.png";
        if (figureType.includes("rook")) return "assets/images/ctt/rook_B.png";
    }
}

function clickedOnLibrary(cell, row, col) {
    //resetting old selection
    try {
        pieceOriginCell.querySelector('img').style.width = piecesize+"px";
        pieceOriginCell.querySelector('img').style.height = piecesize+"px";
    } catch (error) { }


    const content = cell.textContent.trim();
    if (content == "") {
        //player clicked on empty field
        resetBorders();

        document.getElementsByTagName("body")[0].style.cursor = "url('assets/images/old_pointer.png'), auto";
        pieceSelected = false;
        SelectedPieceTeam = "";
        SelectedPieceType = "";
        return;
    }

    //player clicked on field with piece
    makeAllEmptyCellsAvailable();

    let team = "white";
    if (content.includes("_B")) team = "black";
    SelectedPieceTeam = team;

    const figureType = content.replace("_B", "");
    SelectedPieceType = figureType;

    //cursor
    var elementToChange = document.getElementsByTagName("body")[0];
    elementToChange.style.cursor = "url('" + getPath(figureType, team) + "') 32 32, not-allowed";

    var imgElement = cell.querySelector('img');
    imgElement.style.width = piecesize/2+"px";
    imgElement.style.height = imgElement.style.width;
    console.log(team + " " + figureType)

    //updating global variables
    pieceSelected = true;
    pieceOriginCell = cell;
}

function clickedOnBoard(cell, row, col) {
    //resetting old selection
    try {
        pieceOriginCell.querySelector('img').style.width = piecesize+"px";
        pieceOriginCell.querySelector('img').style.height = piecesize+"px";
    } catch (error) { }

    if (pieceSelected && !cell.availableForSelection) { //clicked on unavailable cell
        resetBorders();

        document.getElementsByTagName("body")[0].style.cursor = "url('assets/images/old_pointer.png'), auto";
        pieceSelected = false;
        SelectedPieceTeam = "";
        SelectedPieceType = "";
        pieceOriginCell = null;

        drawTextures("mainboard");
        drawTextures("whiteLibrary");
        drawTextures("blackLibrary");
        return;
    }

    const content = cell.textContent.trim();
    if (content == "") {
        //player clicked on empty field
        if (pieceSelected) {
            cell.innerHTML = SelectedPieceType;
            if (SelectedPieceTeam == "black") cell.innerHTML += "_B";
            pieceOriginCell.innerHTML = "";
        }

        resetBorders();

        document.getElementsByTagName("body")[0].style.cursor = "url('assets/images/old_pointer.png'), auto";
        pieceSelected = false;
        SelectedPieceTeam = "";
        SelectedPieceType = "";
        pieceOriginCell = null;

        drawTextures("mainboard");
        drawTextures("whiteLibrary");
        drawTextures("blackLibrary");
        return;
    }

    let team = "white";
    if (content.includes("_B")) team = "black";

    if (team != SelectedPieceTeam && SelectedPieceTeam != "") {
        //player clicked on field with piece that has DIFFERENT color (takes)
        if (pieceSelected) {
            cell.innerHTML = SelectedPieceType;
            if (SelectedPieceTeam == "black") cell.innerHTML += "_B";
            pieceOriginCell.innerHTML = "";
        }

        resetBorders();

        document.getElementsByTagName("body")[0].style.cursor = "url('assets/images/old_pointer.png'), auto";
        pieceSelected = false;
        SelectedPieceTeam = "";
        SelectedPieceType = "";
        pieceOriginCell = null;

        drawTextures("mainboard");
        drawTextures("whiteLibrary");
        drawTextures("blackLibrary");
        return;
    }

    //player clicked on field with piece that has same color or has no piece selcted (choses that piece)
    SelectedPieceTeam = team;

    const figureType = content.replace("_B", "");
    SelectedPieceType = figureType;

    //cursor
    var elementToChange = document.getElementsByTagName("body")[0];
    elementToChange.style.cursor = "url('" + getPath(figureType, team) + "') 32 32, not-allowed";

    var imgElement = cell.querySelector('img');
    imgElement.style.width = piecesize/2+"px";
    imgElement.style.height = imgElement.style.width;
    console.log(team + " " + figureType)

    resetBorders();
    calculateMoves(figureType, row, col);

    //updating global variables
    pieceSelected = true;
    pieceOriginCell = cell;
}

function resetBorders() {
    const mainBoard = document.getElementById("mainboard");
    const rows = mainBoard.querySelectorAll("tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        cells.forEach(cell => {
            cell.style.border = "none";
            cell.availableForSelection = false;
        })
    })
}

function makeAllEmptyCellsAvailable() {
    const mainBoard = document.getElementById("mainboard");
    const rows = mainBoard.querySelectorAll("tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        cells.forEach(cell => {
            if (getContent(cell) == "") {
                cell.style.border = "4px dashed #00E0E0";
                cell.availableForSelection = true;
            }
        })
    })
}

function makeAvailable(row, col) {
    const mainBoard = document.getElementById("mainboard");
    try {
        if (row <= mainBoard.rows.length && col <= mainBoard.rows[row].cells.length && row >= 0 && col >= 0) {
            // console.log("Next up: " + row + ", " + col);
            var cell = mainBoard.rows[row].cells[col];
            cell.style.border = "4px dashed #00E0E0"
            cell.availableForSelection = true;
        }
        else {
            //if cell doesnt exist
            // console.log("Game tried to call cell that isnt available")
        }
    }
    catch (error) {
        // console.log("Game tried to call cell " + row + ", " + col + " but crashed")
    }
}

function makeAttackable(row, col) {
    if(SelectedPieceTeam==getTeamByPos(row,col))return;

    const mainBoard = document.getElementById("mainboard");
    try {
        if (row <= mainBoard.rows.length && col <= mainBoard.rows[row].cells.length && row >= 0 && col >= 0) {
            // console.log("Next up: " + row + ", " + col);
            var cell = mainBoard.rows[row].cells[col];
            cell.style.border = "4px dashed #FF8080"
            cell.availableForSelection = true;
        }
        else {
            //if cell doesnt exist
            // console.log("Game tried to call cell that isnt available")
        }
    }
    catch (error) {
        // console.log("Game tried to call cell " + row + ", " + col + " but crashed")
    }
}

function isWithinBounds(row, col) {
    return row >= 0 && row < BoardSize && col >= 0 && col < BoardSize;
}

function testThisMove(row, col) {
    if (!isWithinBounds(row, col)) return false;

    if (getContentByPos(row, col) == "") {
        makeAvailable(row, col);
        return true;
    } else {
        if(SelectedPieceType!="pawn")makeAttackable(row, col);
        return false;
    }
}

function calculateMoves(figureType, currentRow, currentCol) {
    const directions = {
        rook: [
            [1, 0], [-1, 0], [0, 1], [0, -1]
        ],
        bishop: [
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ],
        knight: [
            [2, 1], [2, -1], [-2, 1], [-2, -1],
            [1, 2], [1, -2], [-1, 2], [-1, -2]
        ],
        pawn: [
            [1, 0], [-1, 0], [0, 1], [0, -1]
        ],
        pawnAttack: [
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ]
    };

    resetBorders();

    const moves = directions[figureType];

    if (figureType == "knight" || figureType == "pawn") {
        //knight and pawn (cuz their movement isnt infinite)
        for (let [rowIncrement, colIncrement] of moves) {
            const newPosRow = currentRow + rowIncrement;
            const newPosCol = currentCol + colIncrement;
            testThisMove(newPosRow, newPosCol);
        }

        if (figureType == "pawn") {
            // Additional logic for pawn attacks
            for (let [rowIncrement, colIncrement] of directions.pawnAttack) {
                const newPosRow = currentRow + rowIncrement;
                const newPosCol = currentCol + colIncrement;
                if (isWithinBounds(newPosRow, newPosCol) && getContentByPos(newPosRow, newPosCol) !== "") {
                    makeAttackable(newPosRow, newPosCol);
                }
            }
        }
        
    } else {
        //rooks + bishops (infinite movement)
        for (let [rowIncrement, colIncrement] of moves) {
            for (let i = 1; i < BoardSize; i++) {
                const newPosRow = currentRow + i * rowIncrement;
                const newPosCol = currentCol + i * colIncrement;
                if (!testThisMove(newPosRow, newPosCol)) break;
            }
        }
    }
}




//code that actually runs
createBoard(3);
if(window.screen.height <= 560) rowamnt = 4;
else rowamnt = 8;
createLibrary(rowamnt, "white", ["rook", "rook", "knight", "knight", "bishop", "bishop", "pawn", "pawn"]);
createLibrary(rowamnt, "black", ["rook_B", "rook_B", "knight_B", "knight_B", "bishop_B", "bishop_B", "pawn_B", "pawn_B"]);

drawTextures("mainboard");
drawTextures("whiteLibrary");
drawTextures("blackLibrary");