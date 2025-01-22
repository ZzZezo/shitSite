const STORAGE_PREFIX = 'rpsbattle_'; // Replace with your project's unique identifier


const battlefield = document.getElementById('battlefield');
let entities = [];
let tickAmnt = 0; //how many ticks the game run
let paused = true;
let inpopup = false;
let stopwatchInterval;
let elapsedTime = 0;
let EntitiesTakingPart = []
let AllEntitiesExisting = [] //all entities created by player + default ones (contains entity templates)

let newElementName, newElementImg;

//modifyable for dev:
const puffer = 5; // how far away from edge the object will bounce
// const collisionMode = "Deletion" //"Deletion" or "Replacement" (uncomment the one you want)
const collisionMode = "Replacement" //"Deletion" or "Replacement" (uncomment the one you want)

//modifyable for user (and therefore not for dev, sorry... Just become a user for a sec lol):
//yeah i know those have default values, but you could basically put whatever there (for most of them)
let numEntities = 15; // Number of entities
let entitySize = 35;
let entitySpeed = 1;

let dropdown_chosenEntity = -1;
let dropdown_chosenID = -1;

class Entity {
    constructor(battlefield, puffer, entities, entityName = "No name", startX, startY, speed = 2, color, size = 35, imgpath, dangerousEntities, victimEntities) {
        this.name = entityName;
        this.battlefield = battlefield;
        this.puffer = puffer;
        this.entities = entities; // Array of all entities
        this.element = document.createElement('div');
        this.element.classList.add('Entity');
        this.element.style.width = size + 'px'; // Initial width
        this.element.style.height = size + 'px'; // Initial height
        this.element.style.backgroundColor = 'transparent'; // Set background color to transparent
        this.element.style.border = '1px solid ' + "transparent"; // Add 1px border with specified color

        //icon:
        // Create and style the icon
        let icon = document.createElement('img');
        icon.src = imgpath;
        icon.style.width = '95%';
        icon.style.height = '95%';
        icon.style.position = 'absolute';
        icon.style.top = '50%';
        icon.style.left = '50%';
        icon.style.transform = 'translate(-50%, -50%)';
        // Append the icon to the square container
        this.element.appendChild(icon);

        this.battlefield.appendChild(this.element);

        // Initialize position
        this.x = startX;
        this.y = startY;
        	
        //initialize velocity
        //distribute the speed randomly between vx and vy
        let ratio = Math.random();
        this.vx = speed * ratio;
        this.vy = speed * (1-ratio);

        //give vx and vy 50/50 chance to move "backwards"
        if (Math.random() > 0.5) {
            this.vx = -this.vx;
        }
        if (Math.random() > 0.5) {
            this.vy = -this.vy;
        }


        //SET UP OF GAME MECHANIC!
        this.dangerousEntities = dangerousEntities;
        this.victimEntities = victimEntities;
        if (!EntitiesTakingPart.includes(this.name)) {
            EntitiesTakingPart.push(this.name);
        }


        this.collisionHandled = false; // Flag to track whether collision has been handled for this entity in this frame
        this.destroyed = false; // Flag to indicate if the entity is destroyed
    }


    //Moving the Entity
    updatePosition() {
        this.x += this.vx;
        // console.log("something moved to " + this.x);
        this.y += this.vy;

        // Get the dimensions of the battlefield
        const battlefieldRect = this.battlefield.getBoundingClientRect();

        // this part is stolen from chatGPT in its entirety. i am far from being ashamed of stealing AI Code, but i have enough honor to flag it as such, when i do use it. (also idk if this code is even needed, normally it shouldnt be cuz i already implemented that but also im kinda too lazy to check what the code does and if its actually needed. chatgpt said that could be cool if i did that thats the only reason why i have this in here idfk)
        // Check if entity is going out of bounds and correct its position
        if (this.x < 0) {
            this.x = 0; // Set x coordinate to the left boundary
            this.vx *= -1; // Reverse x velocity to bounce off the boundary
        }
        if (this.x + this.element.offsetWidth > battlefieldRect.width) {
            this.x = battlefieldRect.width - this.element.offsetWidth; // Set x coordinate to the right boundary
            this.vx *= -1; // Reverse x velocity to bounce off the boundary
        }
        if (this.y < 0) {
            this.y = 0; // Set y coordinate to the top boundary
            this.vy *= -1; // Reverse y velocity to bounce off the boundary
        }
        if (this.y + this.element.offsetHeight > battlefieldRect.height) {
            this.y = battlefieldRect.height - this.element.offsetHeight; // Set y coordinate to the bottom boundary
            this.vy *= -1; // Reverse y velocity to bounce off the boundary
        }
        // this part is stolen from chatGPT in its entirety. i am far from being ashamed of stealing AI Code, but i have enough honor to flag it as such, when i do use it. (also idk if this code is even needed, normally it shouldnt be cuz i already implemented that but also im kinda too lazy to check what the code does and if its actually needed. chatgpt said that could be cool if i did that thats the only reason why i have this in here idfk)

        // Reset collision handling flag for this frame
        this.collisionHandled = false;

        // Check for collisions with other entities
        this.entities.forEach(entity => {
            if (entity !== this && !this.collisionHandled && !entity.collisionHandled && this.collidesWith(entity)) {
                this.handleCollision(entity);
                // Set collision handling flag for both entities
                this.collisionHandled = true;
                entity.collisionHandled = true;
            }
        });

        // Update the position of the entity
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }

    collidesWith(otherEntity) {
        if (tickAmnt <= 5) return false;
        const rect1 = this.element.getBoundingClientRect();
        const rect2 = otherEntity.element.getBoundingClientRect();
        return (
            rect1.left < rect2.left + rect2.width &&
            rect1.left + rect1.width > rect2.left &&
            rect1.top < rect2.top + rect2.height &&
            rect1.top + rect1.height > rect2.top
        );
    }

    //lol hi future erik if u ever wanna rework something in ur code, please rework the collision thing its so bugged
    //like genuinely. i have no idea what i was cooking up here rn but its the biggest shit so pls fix this
    //thank you <3
    handleCollision(otherEntity) {
        if (this.name == otherEntity.name) {
            // Swap velocities to simulate bouncing off each other
            const tempVx = this.vx;
            const tempVy = this.vy;
            this.vx = otherEntity.vx;
            this.vy = otherEntity.vy;
            otherEntity.vx = tempVx;
            otherEntity.vy = tempVy;

            // Move entities slightly so they are no longer overlapping
            this.x += this.vx;
            this.y += this.vy;
            otherEntity.x += otherEntity.vx;
            otherEntity.y += otherEntity.vy;
        }
        else {
            // console.log("Recorded collisison between "+this.name+" and "+otherEntity.name+" at Gametick "+tickAmnt);
            if (collisionMode == "Deletion") {
                if (this.dangerousEntities.includes(otherEntity.name)) this.destroy();
                else if (this.victimEntities.includes(otherEntity.name)) otherEntity.destroy();
            }

            else if (collisionMode == "Replacement") { //so fuckin buggy nahhh
                if (this.name == "Herz" || otherEntity.name == "Herz") {
                    if (this.name == "Herz") otherEntity.copyProperties(this);
                    else if (otherEntity.name == "Herz") this.copyProperties(otherEntity);
                }
                else {
                    if (this.dangerousEntities.includes(otherEntity.name))
                    { 
                        this.copyProperties(otherEntity);
                    }
                    else if (this.victimEntities.includes(otherEntity.name)) 
                    {
                        otherEntity.copyProperties(this);
                    }
                }

                // Swap velocities to simulate bouncing off each other
                const tempVx = this.vx;
                const tempVy = this.vy;
                this.vx = otherEntity.vx;
                this.vy = otherEntity.vy;
                otherEntity.vx = tempVx;
                otherEntity.vy = tempVy;

                // Move entities slightly so they are no longer overlapping
                this.x += this.vx;
                this.y += this.vy;
                otherEntity.x += otherEntity.vx;
                otherEntity.y += otherEntity.vy;
            }
        }

        var container_of_ecounters = document.getElementById("entitycounterContainer");
        let nthChildIndex = 0;
        EntitiesTakingPart.forEach(element => {
            container_of_ecounters.children[nthChildIndex].textContent = element + ": " + countEntities(element);
            nthChildIndex++;
        });
    }

    bounce_off(otherEntity) {
        // Swap velocities to simulate bouncing off each other
        const tempVx = this.vx;
        const tempVy = this.vy;
        this.vx = otherEntity.vx;
        this.vy = otherEntity.vy;
        otherEntity.vx = tempVx;
        otherEntity.vy = tempVy;

        // Move entities slightly so they are no longer overlapping
        this.x += this.vx;
        this.y += this.vy;
        otherEntity.x += otherEntity.vx;
        otherEntity.y += otherEntity.vy;
    }

    destroy() {
        // Remove the entity's HTML element from the DOM
        this.element.remove();

        // Remove the entity from the entities array
        const index = this.entities.indexOf(this);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }

        // Set the destroyed flag to true
        this.destroyed = true;
    }

    copyProperties(otherEntity) {
        this.element.style.backgroundColor = otherEntity.element.style.backgroundColor;
        this.name = otherEntity.name;
        this.element.querySelector('img').src = otherEntity.element.querySelector('img').src
        this.dangerousEntities = otherEntity.dangerousEntities;
        this.victimEntities = otherEntity.victimEntities;
        this.element.style.width = otherEntity.element.style.width;
        this.element.style.height = otherEntity.element.style.height;
        this.vx = otherEntity.vx;
        this.vy = otherEntity.vy;
    }

}

class EntityTemplate {
    constructor(nameOrObj, image, dangerousEntities, victimEntities) {
        if (typeof nameOrObj === 'object'){
            // If the first argument is an object, we assume it's an object with properties
            const obj = nameOrObj;
            this.name = obj.name;
            this.imgpath = obj.imgpath;
            this.dangerousEntities = obj.dangerousEntities;
            this.victimEntities = obj.victimEntities;
            this.enabled = true;
            this.numEntities = numEntities;
            this.entitySize = entitySize;
            this.entitySpeed = entitySpeed;
        }
        else{
            // Otherwise, we assume individual arguments are provided
            this.name = nameOrObj;
            this.imgpath = image;
            this.dangerousEntities = dangerousEntities;
            this.victimEntities = victimEntities;
            this.enabled = true;
            this.numEntities = numEntities;
            this.entitySize = entitySize;
            this.entitySpeed = entitySpeed;
        }
        this.createToggleBox();
    }

    createToggleBox() {
        var elementbox = document.getElementById("elementbox");
        //create square around:
        var div = document.createElement("div");
        div.classList.add("elementToggle");
        //create img inside:
        var img = document.createElement("img");
        img.src = this.imgpath;
        //append img element to the square
        div.appendChild(img);
        //Get amount of existing squares
        var count = elementbox.getElementsByClassName("elementToggle").length;
        //append div to elementbox (before the last (the + ))
        elementbox.insertBefore(div, elementbox.children[count - 1]);
        
        div.connectedEntity = this;

        div.addEventListener("click", function () {
            if (!paused) return;
            if (inpopup) return;
            this.elementimg = this.children[0];
            //what happens when the square is clicked:
            if (this.enabled == null) this.enabled = true;
            if (this.enabled) {
                this.enabled = false;
                this.style.borderColor = "gray";
                this.elementimg.style.filter = 'grayscale(100%)';
            }
            else {
                this.enabled = true;
                this.style.borderColor = "teal";
                this.elementimg.style.filter = 'none';
            }
            this.connectedEntity.toggleStatus();
        });
    }

    toggleStatus() {
        this.enabled = !this.enabled;
    }

    updateName(newName) {
        this.name = newName;
    }

    updateImgpath(newImgpath) {
        this.imgpath = newImgpath;
    }

    updateAmount(newAmount) {
        this.numEntities = newAmount;
        // this.debugStatUpdates();
    }

    updateSize(newSize) {
        this.entitySize = newSize;
        // this.debugStatUpdates();
    }

    updateSpeed(newSpeed) {
        this.entitySpeed = newSpeed;
        // this.debugStatUpdates();
    }

    updateStats(newAmount, newSize, newSpeed) {
        this.updateAmount(newAmount);
        this.updateSize(newSize);
        this.updateSpeed(newSpeed);
        // this.debugStatUpdates();
    }

    debugStatUpdates() {
        console.log("Entity: " + this.name);
        console.log("Amount: " + this.numEntities);
        console.log("Size: " + this.entitySize);
        console.log("Speed: " + this.entitySpeed);
        console.log("\n\n");
    }
}

//deletes all entities
function DeleteAllEntities() {
    if (entities != []) {
        entities.forEach(entity => {
            entity.element.remove();
        });
    }
}

//count how many entities
function countEntities(ename) {
    let counter = 0;
    entities.forEach(entity => {
        if (entity.name == ename) counter++;
    });
    return counter;
}

// Create multiple entities
function CreateMultipleEntities() {
    entities = [];
    AllEntitiesExisting.forEach(template => {
        if (template.enabled) {
            pushCustomEntity(template.name, template.imgpath, template.dangerousEntities, template.victimEntities,template.numEntities,template.entitySize,template.entitySpeed);
        }
    });
}

function emojiToImage(emoji) {
    var emojiArray = Array.from(emoji)
    var codePoints = emojiArray.map(char => char.codePointAt(0).toString(16)).join('-');
    var variationSelector = emojiArray.length === 4 ? '-fe0f' : '';
    var emojiImageUrl = 'https://emoji.aranja.com/static/emoji-data/img-apple-160/' + codePoints + variationSelector + '.png';
    return emojiImageUrl;
}

function pushCustomEntity(name, image, dangerousEntities, victimEntities, amnt, siz, spd) {

    entities.forEach(entity => {
        if (dangerousEntities.includes(entity.name)) {
            //true if the current entity is dangerous to the one new to created
            entity.victimEntities.push(name);
        }
        if (victimEntities.includes(entity.name)) {
            //true if the new entity to create is dangerous to the current entity
            entity.dangerousEntities.push(name);
        }
    });

    for (let i = 0; i < amnt; i++) {
        const battlefieldRect = battlefield.getBoundingClientRect();
        entities.push(new Entity(battlefield, puffer, entities, entityName = name, startX = Math.random() * (battlefieldRect.width - 50), startY = Math.random() * (battlefieldRect.height - 50), speed = spd, color = 'white', size = siz, imgpath = image, dangerousEntities = dangerousEntities, victimEntities = victimEntities));
    }
}

function stopSimulation() {
    DeleteAllEntities();
    paused = true;
    document.getElementById("EntityNumberInput").disabled = false;
    document.getElementById("EntitySizeInput").disabled = false;
    document.getElementById("EntitySpeedInput").disabled = false;

    document.getElementById("startbutton").style.display = "inline";
    document.getElementById("stopButton").style.display = "none";
    document.getElementById("stopwatch").style.display = "none";
    Array.from(document.getElementsByClassName("entitycounter")).forEach(elem => elem.style.display = "none ");

    tickAmnt = 0;

    clearEntityCounterContainer();
    EntitiesTakingPart = []


    //stop timer
    clearInterval(stopwatchInterval);
    elapsedTime = 0;
    updateStopwatch();
}

function clearEntityCounterContainer() {
    var container = document.getElementById("entitycounterContainer");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

//update the positions of all entities each tick (animation loop)
function animate() {
    if (!paused) {
        tickAmnt += 1;

        entities.forEach(entity => {
            entity.updatePosition();
        });
        requestAnimationFrame(animate);
    }
    else {
        //animate();
    }
}

//update timer
function updateStopwatch() {
    elapsedTime++;
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    document.getElementById('stopwatch').innerText = formatTime(hours) + ':' + formatTime(minutes) + ':' + formatTime(seconds);
}

function formatTime(time) {
    return time < 10 ? '0' + time : time;
}

// Start the animation loop 
function startAnimationLoop() {
    DeleteAllEntities();
    CreateMultipleEntities();
    paused = false;
    animate();
}

function chosenOption(option) {
    alert(option);

    document.getElementById("RPSBcontainer").style.display = "none";
    popup = document.getElementById("popup");
    popup.style.display = "block";
}

//individual settings
function updateDropdownOptions(){
    const dropdown = document.getElementById('dropdown');
    dropdown.innerHTML = "";

    // Add a placeholder option
    const placeholderOption = document.createElement('option');
    placeholderOption.text = "Select Element"; // Placeholder text
    placeholderOption.value = ""; // Empty value
    placeholderOption.disabled = true; // Disable this option
    placeholderOption.selected = true; // Make it selected by default
    dropdown.appendChild(placeholderOption);

    let id = 0;
    AllEntitiesExisting.forEach(element => {
        ename = element.name;
        const option = document.createElement('option');
        option.value = id;
        option.text = ename;
        dropdown.appendChild(option);
        id++;
    })
}
function dropdownSelected(selectedOption){
    dropdown_chosenEntity = AllEntitiesExisting[selectedOption];
    dropdown_chosenID = selectedOption;
    
    document.getElementById("IndividualEntityNumberInput").value = dropdown_chosenEntity.numEntities;
    document.getElementById("IndividualEntitySizeInput").value = dropdown_chosenEntity.entitySize;
    document.getElementById("IndividualSpeedInput").value = dropdown_chosenEntity.entitySpeed;

    document.getElementById("elementSettings").style.display = "block";

    console.log(jsonfyTemplate(dropdown_chosenEntity));
}

function changeIndividualName(){
    createPrompt("Element Bearbeiten", "Wie lautet der neue Name?", function (answer) {
        dropdown_chosenEntity.updateName(answer);
        updateDropdownOptions();
    });

}
function changeIndividualEmoji(){
    createPrompt("Element Bearbeiten", "Was ist der neue Emoji?", function (answer) {
        dropdown_chosenEntity.updateImgpath(emojiToImage(answer));
        document.getElementById("elementbox").children[dropdown_chosenID].children[0].src=emojiToImage(answer);
    });
}

function deleteIndividualElement(){
    createPopup("Element Löschen", "Bist du sicher, dass du "+dropdown_chosenEntity.name+" löschen willst?", 2, ["Ja, sicher","Nein, Abbrechen"],[deleteIndividualElementConfirm,closePopup]);  // Call the function to create the popup
}

function changeIndividualStats(){ //when someone changes the stats of a individual element
    indiAmount = Number(document.getElementById("IndividualEntityNumberInput").value);
    indiSize = Number(document.getElementById("IndividualEntitySizeInput").value);
    indiSpeed = Number(document.getElementById("IndividualSpeedInput").value);
    
    dropdown_chosenEntity.updateStats(indiAmount, indiSize, indiSpeed);
}

function adjustIndividualInputs(stat2Upgrade){ //when someone changes main stats, hereby overwriting individual stats
    AllEntitiesExisting.forEach(ent => {
        if(stat2Upgrade == 'amt')ent.updateAmount(Number(document.getElementById("EntityNumberInput").value));
        if(stat2Upgrade == 'siz')ent.updateSize(Number(document.getElementById("EntitySizeInput").value));
        if(stat2Upgrade == 'spd')ent.updateSpeed(Number(document.getElementById("EntitySpeedInput").value));

        // console.log(ent.entitySpeed);
    })

    updateDropdownOptions();
    document.getElementById("elementSettings").style.display = "none";
}

function deleteIndividualElementConfirm(){
    AllEntitiesExisting.splice(dropdown_chosenID, 1);
    document.getElementById("elementbox").children[dropdown_chosenID].remove();
    updateDropdownOptions();
    document.getElementById("elementSettings").style.display = "none";
    closePopup();
}


function jsonfyTemplate(template){
    return JSON.stringify(template);
}

function saveToStorage() {
    clearProjectStorage();
    AllEntitiesExisting.forEach(template => {
        console.log("Saving " + template.name);
        const prefixedKey = STORAGE_PREFIX + template.name;
        localStorage.setItem(prefixedKey, jsonfyTemplate(template));
    });
}

function loadFromStorage() {
    let elementBox = document.getElementById("elementbox");
    while (elementBox.children.length > 1) {
        elementBox.removeChild(elementBox.firstChild);
    }

    // Get only keys for this project
    const projectKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(STORAGE_PREFIX)) {
            projectKeys.push(key);
        }
    }

    // Load entities
    projectKeys.forEach((prefixedKey, index) => {
        const value = localStorage.getItem(prefixedKey);
        const template = JSON.parse(value);
        AllEntitiesExisting[index] = new EntityTemplate(template);
        console.log("Loaded " + template.name);
    });

    updateDropdownOptions();
    document.getElementById("elementSettings").style.display = "none";
}

// Helper function to clear only this project's data
function clearProjectStorage() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key.startsWith(STORAGE_PREFIX)) {
            localStorage.removeItem(key);
        }
    }
}

//BUTTONS etc.
document.getElementById("startbutton").addEventListener("click", function () {
    //everthing start button shoudl do
    if (inpopup) return;

    document.getElementById("stopButton").style.display = "block";
    document.getElementById("EntityNumberInput").disabled = true;
    document.getElementById("EntitySizeInput").disabled = true;
    document.getElementById("EntitySpeedInput").disabled = true;

    // plusButton = document.getElementById
    // console.log(entitySpeed);
    // AllEntitiesExisting[1].updateSize(60);
    //blend in objects
    startAnimationLoop();
    this.style.display = "none";
    document.getElementById("stopButton").style.display = "block";
    document.getElementById("stopwatch").style.display = "inline-block";

    //set value to counters (bc only happebs at collision normally):
    var container_of_ecounters = document.getElementById("entitycounterContainer");
    EntitiesTakingPart.forEach(element => {
        //console.log(element);
        var paragraph = document.createElement('p');
        paragraph.textContent = element + ": " + countEntities(element);
        paragraph.classList.add('entitycounter');
        container_of_ecounters.appendChild(paragraph);
    });

    Array.from(document.getElementsByClassName("entitycounter")).forEach(elem => elem.style.display = "block");


    //start timer
    stopwatchInterval = setInterval(updateStopwatch, 1000);
});

document.getElementById("PLUS_icon_elementbox").addEventListener("click", function () {
    if (!paused) return;
    if (inpopup) return;


    createPrompt("Schere, Stein, Papier", "Wie möchtest du das neue Element nennen?", function (answer) {
        newElementName = answer;
        if (!newElementName) return; // Handle cancellation
        // closePopup();
        createPrompt("Schere, Stein, Papier", "Welchen Emoji möchtest du nutzen?", async function (answer) {
            newElementImg = emojiToImage(answer);
            if (!newElementImg) return; // Handle cancellation

            // closePopup();


            document.getElementById("startbutton").disabled = true;
            document.getElementById("EntityNumberInput").disabled = true;
            document.getElementById("EntitySizeInput").disabled = true;
            document.getElementById("EntitySpeedInput").disabled = true;
            inpopup = true;

            let newElementDangerous = [];
            let newElementVictims = [];

            // Define a recursive function to process each element
            async function processElement(index) {
                if (index >= AllEntitiesExisting.length) {

                    // Base case: all elements processed, add the new entity and exit
                    AllEntitiesExisting.push(new EntityTemplate(newElementName, newElementImg, newElementDangerous, newElementVictims));
                    updateDropdownOptions();
                    document.getElementById("elementSettings").style.display = "none";
                    

                    document.getElementById("startbutton").disabled = false;
                    document.getElementById("EntityNumberInput").disabled = false;
                    document.getElementById("EntitySizeInput").disabled = false;
                    document.getElementById("EntitySpeedInput").disabled = false;
                    inpopup = false;

                    return;
                }

                let element = AllEntitiesExisting[index];
                let COMPAREpopup = document.getElementById("COMPAREpopup");
                COMPAREpopup.style.display = "block";

                COMPAREpopup.children[2].children[0].innerText = newElementName;
                COMPAREpopup.children[2].children[0].onclick = function () {
                    if (element.name != "Herz") newElementVictims.push(element.name);
                    document.getElementById("RPSBcontainer").style.display = "flex";
                    COMPAREpopup.style.display = "none";
                    // After handling current element, process the next one recursively
                    processElement(index + 1);
                }
                COMPAREpopup.children[2].children[1].innerText = element.name;
                COMPAREpopup.children[2].children[1].onclick = function () {
                    if (element.name != "Herz") newElementDangerous.push(element.name);
                    document.getElementById("RPSBcontainer").style.display = "flex";
                    COMPAREpopup.style.display = "none";
                    // After handling current element, process the next one recursively
                    processElement(index + 1);
                }

                COMPAREpopup.children[0].children[1].onclick = function () {
                    document.getElementById("RPSBcontainer").style.display = "flex";
                    COMPAREpopup.style.display = "none";
                    // After handling current element, process the next one recursively
                    processElement(index + 1);
                }

                // Wait for user input before processing the next element
                await new Promise(resolve => {
                    // This promise resolves when the user clicks a button in the COMPAREpopup
                    // It ensures the loop waits for user input before continuing
                });
            }

            // Start processing from the first element (index 0)
            await processElement(0);
        });
    });
});

async function compare() {

}

const dropdown = document.getElementById('dropdown');
dropdown.addEventListener('change', function() {
    const selectedOption = dropdown.options[dropdown.selectedIndex].value;
    dropdownSelected(selectedOption);
});


//code to run itself yykyk (not a function etc)
//DEFAULT ENTITIES
AllEntitiesExisting.push(new EntityTemplate("Schere", "assets/images/scissors.png", ["Stein"], ["Papier"]));
AllEntitiesExisting.push(new EntityTemplate("Stein", "assets/images/rock.png", ["Papier"], ["Schere"]));
AllEntitiesExisting.push(new EntityTemplate("Papier", "assets/images/paper.png", ["Schere"], ["Stein"]));
AllEntitiesExisting.push(new EntityTemplate("Herz", emojiToImage("♥️"), [], []));
updateDropdownOptions();
