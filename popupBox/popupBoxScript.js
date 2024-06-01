
// Function to create and display the popup
function createPopup(titleText, mainText, options, buttonText) {
    // Create the popup container
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.style.display = 'none'; // Initially hidden
    popup.id = 'popup';

    // Create the title bar
    const titleBar = document.createElement('div');
    titleBar.className = 'popup-title-bar';

    // Create the title
    const title = document.createElement('div');
    title.className = 'popup-title';
    title.innerText = titleText;

    // Create the close button
    const closeButton = document.createElement('button');
    closeButton.className = 'popup-close';
    closeButton.innerText = 'X';
    closeButton.onclick = closePopup;

    // Append title and close button to the title bar
    titleBar.appendChild(title);
    titleBar.appendChild(closeButton);

    // Create the text
    const text = document.createElement('div');
    text.className = 'popup-text';
    text.innerText = mainText;

    // Append all elements to the popup
    popup.appendChild(titleBar);
    popup.appendChild(text);

    // Create the button container
    let buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    // Create the buttons
    for (let i = 0; i < options; i++) {
        if(i%2==0 && i!=0){
            popup.appendChild(buttonContainer);
            buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';
        }

        const newButton = document.createElement('button');
        newButton.className = 'popup-button';
        let buttonTxt = buttonText[i];
        if(buttonTxt!=null)buttonTxt = addNewLinesEverynChars(buttonTxt,10);
        newButton.innerText = buttonTxt;
        buttonContainer.appendChild(newButton);
    }

    // //old button logic (hardcoded)
    //     const button1 = document.createElement('button');
    //     button1.className = 'popup-button';
    //     button1.innerText = button1Text;

    //     const button2 = document.createElement('button');
    //     button2.className = 'popup-button';
    //     button2.innerText = button2Text;

    //     // Append buttons to the button container
    //     buttonContainer.appendChild(button1);
    //     buttonContainer.appendChild(button2);

    //append buttonContainer
    popup.appendChild(buttonContainer);

    // Append the popup to the body
    document.body.appendChild(popup);

    // Display the popup
    popup.style.display = 'block';
}

// Function to close the popup
function closePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.style.display = 'none';
    }
}




function addNewLinesEverynChars(str,n) {
    let result = '';
    let i = 0;

    // Loop through the string and add a newline every 15 characters
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