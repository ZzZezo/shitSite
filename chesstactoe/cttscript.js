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

function createLibrary(size,color){ //was cooked, look what i got meanwhile https://i.imgur.com/iQFudu9.png
    const libraryBoard = document.getElementById(color+"Library");

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

            tr.appendChild(td);
        }

        libraryBoard.appendChild(tr);
    }
}

createBoard(3);
createLibrary(8,"white");
createLibrary(8,"black");