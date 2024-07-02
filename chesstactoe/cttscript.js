function createBoard(size) {
    const mainBoard = document.getElementById('mainboard');

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
createBoard(3);