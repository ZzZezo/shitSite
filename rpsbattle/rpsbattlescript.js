const battlefield = document.getElementById('battlefield');
let entities = [];
let tickAmnt = 0; //how many ticks the game run
let paused = true;
let stopwatchInterval;
let elapsedTime = 0;
let EntitiesTakingPart = []
let AllEntitiesExisting = [] //all entities created by player + default ones (contains entity templates)

//modifyable for dev:
const puffer = 5; // how far away from edge the object will bounce
// const collisionMode = "Deletion" //"Deletion" or "Replacement" (uncomment the one you want)
const collisionMode = "Replacement" //"Deletion" or "Replacement" (uncomment the one you want)

//modifyable for user (and therefore not for dev, sorry... Just become a user for a sec lol):
//yeah i know those have default values, but you could basically put whatever there (for most of them)
let numEntities = 15; // Number of entities
let entitySize = 35;
let entitySpeed = 1.5;


class Entity {
    constructor(battlefield, puffer, entities, entityName = "No name", startX, startY, speed = 2, color, size = 35,imgpath,dangerousEntities,victimEntities) {
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

        // Initialize position and velocity
        this.x = startX;
        this.y = startY;
        this.vx = speed * Math.random() * 2.5 - 1;
        this.vy = speed * Math.random() * 2.5 - 1;

        
        //SET UP OF GAME MECHANIC!
        this.dangerousEntities = dangerousEntities;
        this.victimEntities = victimEntities;
        if(!EntitiesTakingPart.includes(this.name)){
            EntitiesTakingPart.push(this.name);
        }


        this.collisionHandled = false; // Flag to track whether collision has been handled for this entity in this frame
        this.destroyed = false; // Flag to indicate if the entity is destroyed
    }


    //Moving the Entity
    updatePosition() {
        this.x += this.vx;
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
                if (this.dangerousEntities.includes(otherEntity.name)) this.copyProperties(otherEntity);
                else if (this.victimEntities.includes(otherEntity.name)) otherEntity.copyProperties(this);

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
            container_of_ecounters.children[nthChildIndex].textContent = element +": " + countEntities(element);
            nthChildIndex ++;
        });
    }

    bounce_off(otherEntity){
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
    }

}

class EntityTemplate{
    constructor(name,image,dangerousEntities,victimEntities){
        this.name = name;
        this.imgpath = image;
        this.dangerousEntities = dangerousEntities;
        this.victimEntities = victimEntities;
        this.enabled = true;
        this.createToggleBox();
    }

    createToggleBox(){
        var elementbox = document.getElementById("elementbox");
        //create square around:
        var div = document.createElement("div");
        div.classList.add("elementToggle");
        //create img inside:
        var img = document.createElement("img");
        img.src = this.imgpath;
        //append img element to the square
        div.appendChild(img);
        //append div to elementbox
        elementbox.appendChild(div);

        div.connectedEntity = this;

        div.addEventListener("click", function() {
            if(!paused)return;
            this.elementimg = this.children[0];
            //what happens when the square is clicked:
            if(this.enabled==null)this.enabled=true;
            if(this.enabled){
                this.enabled = false;
                this.style.borderColor = "gray";
                this.elementimg.style.filter = 'grayscale(100%)';
            }
            else{
                this.enabled = true;
                this.style.borderColor = "teal";
                this.elementimg.style.filter = 'none';
            }
            this.connectedEntity.toggleStatus();
        });
    }

    toggleStatus(){
        this.enabled = !this.enabled;
    }
}

//deletes all entities
function DeleteAllEntities(){
    if(entities!=[]){
        entities.forEach(entity => {
            entity.element.remove();
        });
    }
}

//count how many entities
function countEntities(ename){
    let counter = 0;
    entities.forEach(entity => {
        if(entity.name==ename)counter++;
    });
    return counter;
}

// Create multiple entities
function CreateMultipleEntities() {
    entities = [];
    for (let i = 0; i < numEntities; i++) {
        const battlefieldRect = battlefield.getBoundingClientRect();
        //schere, stein, papier:
        // if(EntitiesTakingPart.includes("Schere"))entities.push(new Entity(battlefield, puffer, entities, entityName = "Schere", startX = Math.random() * (battlefieldRect.width - 50), startY = Math.random() * (battlefieldRect.height - 50), speed = entitySpeed, color = 'red', size = entitySize, imgpath = "assets/images/scissors.png",dangerousEntities=["Stein"],victimEntities=["Papier"]));
        // if(EntitiesTakingPart.includes("Stein"))entities.push(new Entity(battlefield, puffer, entities, entityName = "Stein", startX = Math.random() * (battlefieldRect.width - 50), startY = Math.random() * (battlefieldRect.height - 50), speed = entitySpeed, color = 'gray', size = entitySize, imgpath = "assets/images/rock.png",dangerousEntities=["Papier"],victimEntities=["Schere"]));
        // if(EntitiesTakingPart.includes("Papier"))entities.push(new Entity(battlefield, puffer, entities, entityName = "Papier", startX = Math.random() * (battlefieldRect.width - 50), startY = Math.random() * (battlefieldRect.height - 50), speed = entitySpeed, color = 'white', size = entitySize, imgpath = "assets/images/paper.png",dangerousEntities=["Schere"],victimEntities=["Stein"]));
    }
    //pushCustomEntity("SCHIZO",emojiToImage(prompt("What Emoji do you wanna convert?")),[],["Schere","Stein","Papier"])
    AllEntitiesExisting.forEach(template => {
        if(template.enabled){
            pushCustomEntity(template.name,template.imgpath,template.dangerousEntities,template.victimEntities);
        }
    });
}

function emojiToImage(emoji) {
    var codePoint = emoji.codePointAt(0).toString(16);
    var emojiImageUrl = 'https://twemoji.maxcdn.com/v/latest/72x72/' + codePoint + '.png';
    return emojiImageUrl;
}

function pushCustomEntity(name,image,dangerousEntities,victimEntities){

    entities.forEach(entity => {
        if(dangerousEntities.includes(entity.name)){
            //true if the current entity is dangerous to the one new to created
            entity.victimEntities.push(name);
        }
        if(victimEntities.includes(entity.name)){
            //true if the new entity to create is dangerous to the current entity
            entity.dangerousEntities.push(name);
        }
    });

    for (let i = 0; i < numEntities; i++) {
        const battlefieldRect = battlefield.getBoundingClientRect();
        entities.push(new Entity(battlefield, puffer, entities, entityName = name, startX = Math.random() * (battlefieldRect.width - 50), startY = Math.random() * (battlefieldRect.height - 50), speed = entitySpeed, color = 'white', size = entitySize, imgpath = image,dangerousEntities=dangerousEntities,victimEntities=victimEntities));
    }
}

function stopSimulation(){
    DeleteAllEntities();
    paused = true;
    document.getElementById("EntityNumberInput").disabled = false;
    document.getElementById("EntitySizeInput").disabled = false;
    document.getElementById("EntitySpeedInput").disabled = false;

    document.getElementById("startbutton").style.display = "inline";
    document.getElementById("stopButton").style.display="none";
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
    if(!paused){
        tickAmnt += 1;

        entities.forEach(entity => {
            entity.updatePosition();
        });
        requestAnimationFrame(animate);
    }
    else{
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
    paused=false;
    animate();
}



//BUTTONS etc.
document.getElementById("startbutton").addEventListener("click", function () {
    //everthing start button shoudl do

    document.getElementById("stopButton").style.display="block";

    numEntities = document.getElementById("EntityNumberInput").value;
    document.getElementById("EntityNumberInput").disabled = true;
    
    entitySize = document.getElementById("EntitySizeInput").value;
    document.getElementById("EntitySizeInput").disabled = true;

    entitySpeed = document.getElementById("EntitySpeedInput").value;
    document.getElementById("EntitySpeedInput").disabled = true;


    // console.log(entitySpeed);

    //blend in objects
    startAnimationLoop();
    this.style.display = "none";
    document.getElementById("stopButton").style.display="block";
    document.getElementById("stopwatch").style.display = "inline-block";

    //set value to counters (bc only happebs at collision normally):
    var container_of_ecounters = document.getElementById("entitycounterContainer");
    EntitiesTakingPart.forEach(element => {
        //console.log(element);
        var paragraph = document.createElement('p');
        paragraph.textContent = element +": " + countEntities(element);
        paragraph.classList.add('entitycounter');
        container_of_ecounters.appendChild(paragraph);
    });

    Array.from(document.getElementsByClassName("entitycounter")).forEach(elem => elem.style.display = "block");
    

    //start timer
    stopwatchInterval = setInterval(updateStopwatch, 1000);
});


//code to run itself yykyk (not a function etc)
//DEFAULT ENTITIES
AllEntitiesExisting.push(new EntityTemplate("Schere","assets/images/scissors.png",["Stein"],["Papier"]));
AllEntitiesExisting.push(new EntityTemplate("Stein","assets/images/rock.png",["Papier"],["Schere"]));
AllEntitiesExisting.push(new EntityTemplate("Papier","assets/images/paper.png",["Schere"],["Stein"]));
AllEntitiesExisting.push(new EntityTemplate("Herz",emojiToImage("♥️"),[],[]));
