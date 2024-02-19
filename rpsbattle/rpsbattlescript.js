const battlefield = document.getElementById('battlefield');
const puffer = 5; // how far away from edge the object will bounce
const numEntities = 15; // Number of entities
const collisionMode = "Deletion" //"Deletion" or "Replacement"

let tickAmnt = 0; //how many ticks the game run

class Entity{
    constructor(battlefield, puffer, entities, entityName ,startX, startY, speed, color) {
        this.name = entityName;
        this.battlefield = battlefield;
        this.puffer = puffer;
        this.entities = entities; // Array of all entities
        this.element = document.createElement('div');
        this.element.classList.add('Entity');
        this.element.style.width = '30px'; // Initial width
        this.element.style.height = '30px'; // Initial height
        this.element.style.backgroundColor = color; // Initial color
        this.battlefield.appendChild(this.element);

        // Initialize position and velocity
        this.x = startX;
        this.y = startY;
        this.vx = speed;
        this.vy = speed;


        this.collisionHandled = false; // Flag to track whether collision has been handled for this entity in this frame
        this.destroyed = false; // Flag to indicate if the entity is destroyed
    }


    //Moving the Entity
    updatePosition() {
        this.x += this.vx;
        this.y += this.vy;

        // Check for collisions with edges
        const battlefieldRect = this.battlefield.getBoundingClientRect();
        if (this.x <= 0 + this.puffer || this.x + this.element.offsetWidth >= battlefieldRect.width - this.puffer) {
            this.vx *= -1; // Reverse direction in x axis
            this.x += this.vx;
        }
        if (this.y <= 0 + this.puffer || this.y + this.element.offsetHeight >= battlefieldRect.height - this.puffer) {
            this.vy *= -1; // Reverse direction in y axis
            this.y += this.vy;
        }


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

    collidesWith(otherEntity){
        if(tickAmnt <= 5) return false;
        const rect1 = this.element.getBoundingClientRect();
        const rect2 = otherEntity.element.getBoundingClientRect();
        return (
            rect1.left < rect2.left + rect2.width &&
            rect1.left + rect1.width > rect2.left &&
            rect1.top < rect2.top + rect2.height &&
            rect1.top + rect1.height > rect2.top
        );
    }

    handleCollision(otherEntity) {
        if(this.name == otherEntity.name){
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
        else{
            if(collisionMode == "Deletion"){
                if(this.name == "Rock" && otherEntity.name == "Paper") this.destroy();
                if(this.name == "Paper" && otherEntity.name == "Scissors") this.destroy();
                if(this.name == "Scissors" && otherEntity.name == "Rock") this.destroy();

                if(this.name == "Rock" && otherEntity.name == "Scissors") otherEntity.destroy();
                if(this.name == "Paper" && otherEntity.name == "Rock") otherEntity.destroy();
                if(this.name == "Scissors" && otherEntity.name == "Paper") otherEntity.destroy();
            }
            else if(collisionMode == "Replacement"){
                let exitCH = false;
                if(this.name == "Rock" && otherEntity.name == "Paper" &! exitCH){
                    this.name = otherEntity.name;
                    this.color = otherEntity.color;
                    exitCH = true;
                }
                    
                if(this.name == "Paper" && otherEntity.name == "Scissors" &! exitCH){
                    this.name = otherEntity.name;
                    this.color = otherEntity.color;
                    exitCH = true;
                }
                    
                if(this.name == "Scissors" && otherEntity.name == "Rock" &! exitCH){
                    this.name = otherEntity.name;
                    this.color = otherEntity.color;
                    exitCH = true;
                }
                    

                if(this.name == "Rock" && otherEntity.name == "Scissors" &! exitCH){
                    otherEntity.name = this.name;
                    otherEntity.color = this.color;
                    exitCH = true;
                }
                    
                if(this.name == "Paper" && otherEntity.name == "Rock" &! exitCH){
                    otherEntity.name = this.name;
                    otherEntity.color = this.color;
                    exitCH = true;
                }
                    
                if(this.name == "Scissors" && otherEntity.name == "Paper" &! exitCH){
                    otherEntity.name = this.name;
                    otherEntity.color = this.color;
                    exitCH = true;
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

}

// Create multiple entities
const entities = [];
for (let i = 0; i < numEntities; i++) {
    const battlefieldRect = battlefield.getBoundingClientRect();
    entities.push(new Entity(battlefield, puffer,entities, entityName = "Rock", startX = Math.random()*(battlefieldRect.width-50), startY = Math.random()*(battlefieldRect.height-50), speed = 0.75*(i/5)+1, color = 'gray'));
    entities.push(new Entity(battlefield, puffer,entities, entityName = "Paper", startX = Math.random()*(battlefieldRect.width-50), startY = Math.random()*(battlefieldRect.height-50), speed = 0.75*(i/5)+1, color = 'white'));
    entities.push(new Entity(battlefield, puffer,entities, entityName = "Scissors", startX = Math.random()*(battlefieldRect.width-50), startY = Math.random()*(battlefieldRect.height-50), speed = 0.75*(i/5)+1, color = 'red'));
}

// Function to continuously update the positions of all entities (animation loop)
function animate() {
    tickAmnt +=1;

    entities.forEach(entity => {
        entity.updatePosition();
    });
    requestAnimationFrame(animate);
}

// Start the animation loop 
animate();