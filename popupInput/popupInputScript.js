//library script (better not change stuff here cuz its global for entire project and u have no idea what any of this means💀☠️)

function createPrompt(titleText, mainText,answerFunction){
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

    //text
    const textContainer = document.createElement('div');
    textContainer.className = 'text-container';

    const Input = document.createElement('input');
    Input.type = "text";
    Input.className = 'popup-input';
    Input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            closePopup(); 
            answerFunction(Input.value);
        }
    });

    const submitButton = document.createElement('button');
    submitButton.innerHTML = "Bestätigen"
    submitButton.onclick = function(){closePopup(); answerFunction(Input.value);};
    submitButton.className = 'popup-submit';

    textContainer.appendChild(Input);
    textContainer.appendChild(submitButton);
    
    //append textContainer
    popup.appendChild(textContainer);

    //append entire popup to document
    document.body.appendChild(popup);

    //show popup
    popup.style.display = 'block';
    Input.focus();
}

//close popup (currently always runs when pressed close button but will (maybe) be updated (probably not lol))
function closePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.remove();
    }
}