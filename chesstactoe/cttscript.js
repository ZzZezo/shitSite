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
            tr.appendChild(td);
        }

        mainBoard.appendChild(tr);
    }
}

function createLibrary(size,color,figures){ //was cooked, look what i got meanwhile https://i.imgur.com/iQFudu9.png
    const libraryBoard = document.getElementById(color+"Library");
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

            td.innerHTML =figures[slot];
            slot++;

            tr.appendChild(td);
        }

        libraryBoard.appendChild(tr);
    }
}


function drawTextures(board){
    const mainBoard = document.getElementById(board);
    const rows = mainBoard.querySelectorAll("tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        cells.forEach(cell => {
            const cellText = cell.textContent.trim();
            const img = document.createElement("img");

            if(cellText == "bishop") img.src = "assets/images/ctt/bishop.png";
            if(cellText == "king") img.src = "assets/images/ctt/king.png";
            if(cellText == "knight") img.src = "assets/images/ctt/knight.png";
            if(cellText == "pawn") img.src = "assets/images/ctt/pawn.png";
            if(cellText == "queen") img.src = "assets/images/ctt/queen.png";
            if(cellText == "rook") img.src = "assets/images/ctt/rook.png";
            
            img.style.width = "60px";
            img.style.height = img.style.width;

            cell.appendChild(img);
            console.log("???")
        })
    })
}


//code that actually runs
createBoard(3);
createLibrary(8,"white",["rook","knight","bishop","bishop","knight","rook","pawn","pawn"]);
createLibrary(8,"black",["rook","knight","bishop","bishop","knight","rook","pawn","pawn"]);

drawTextures("mainboard");
drawTextures("whiteLibrary");
drawTextures("blackLibrary");