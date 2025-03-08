//library script (better not change stuff here cuz its global for entire project and u have no idea what any of this means💀☠️)

function createPopup(titleText, mainText, options, buttonText,functionsToRun, elements = []) {
    // Create the popup container
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.style.display = 'none'; // Initially hidden
    popup.id = 'popup';

    //title bar
    const titleBar = document.createElement('div');
    titleBar.className = 'popup-title-bar';

    //title text
    const title = document.createElement('div');
    title.className = 'popup-title';
    title.innerText = titleText;

    //close button (always runs close function (can be updated in future, shouldnt even be hard))
    const closeButton = document.createElement('button');
    closeButton.className = 'popup-close';
    closeButton.innerText = 'X';
    closeButton.onclick = closePopup;

    //append to titlebar
    titleBar.appendChild(title);
    titleBar.appendChild(closeButton);

    //main text
    const text = document.createElement('div');
    text.className = 'popup-text';
    text.innerText = mainText;

    //append to container
    popup.appendChild(titleBar);
    popup.appendChild(text);

    //append elements
    elements.forEach(element => {
        popup.appendChild(element);
    });

    //buttons
    let buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    //for loop for each button (nah no shit, not like u could just read that)
    for (let i = 0; i < options; i++) {
        if(i%2==0 && i!=0){
            popup.appendChild(buttonContainer);
            buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';
        }

        const newButton = document.createElement('button');
        newButton.className = 'popup-button';
        let buttonTxt = buttonText[i];
        if(buttonTxt!=null)buttonTxt = addNewLinesEverynChars(buttonTxt,15);
        newButton.innerText = buttonTxt;

        newButton.onclick = functionsToRun[i];

        buttonContainer.appendChild(newButton);
    }

    //append buttonContainer
    popup.appendChild(buttonContainer);

    //append entire popup to document
    document.body.appendChild(popup);

    //show popup
    popup.style.display = 'block';
}

//close popup (currently always runs when pressed close button but will (maybe) be updated (probably not lol))
function closePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.remove();
    }
}




function addNewLinesEverynChars(str,n) {
    let result = '';
    let i = 0;

    //loop through string and add a newline every n characters (n is hardcoded in the forloop and i think should be set at 15 imo)
    while (i < str.length) {
        if (i + n < str.length) {
            result += str.slice(i, i + n) + '\n';
        } else {
            result += str.slice(i);
        }
        i += n;
    }

    return result;
}