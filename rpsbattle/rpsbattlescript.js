const battlefield = document.getElementById('battlefield');
const puffer = 5; // how far away from edge the object will bounce
const numEntities = 6; // Number of entities

class Entity{
    constructor(battlefield, puffer, entities, entityName ,startX, startY, speed) {
        this.name = entityName;
        this.battlefield = battlefield;
        this.puffer = puffer;
        this.entities = entities; // Array of all entities
        this.element = document.createElement('div');
        this.element.classList.add('Entity');
        this.element.style.width = '50px'; // Initial width
        this.element.style.height = '50px'; // Initial height
        this.element.style.backgroundColor = 'red'; // Initial color
        this.battlefield.appendChild(this.element);

        // Initialize position and velocity
        this.x = startX;
        this.y = startY;
        this.vx = speed;
        this.vy = -speed;

        // Flag to track whether collision has been handled for this entity in this frame
        this.collisionHandled = false;
    }


    //Moving the Entity
    updatePosition() {
        this.x += this.vx;
        this.y += this.vy;

        // Check for collisions with edges
        const battlefieldRect = this.battlefield.getBoundingClientRect();
        if (this.x <= 0 + this.puffer || this.x + this.element.offsetWidth >= battlefieldRect.width - this.puffer) {
            this.vx *= -1; // Reverse direction in x axis
        }
        if (this.y <= 0 + this.puffer || this.y + this.element.offsetHeight >= battlefieldRect.height - this.puffer) {
            this.vy *= -1; // Reverse direction in y axis
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

// Create multiple entities
const entities = [];
for (let i = 0; i < numEntities; i++) {
    entities.push(new Entity(battlefield, puffer,entities, entityName = "Default", startX = 10+i*70, startY = 10+i*100, speed = 0.75*i+1));
}

// Function to continuously update the positions of all entities (animation loop)
function animate() {
    entities.forEach(entity => {
        entity.updatePosition();
    });
    requestAnimationFrame(animate);
}

// Start the animation loop 
animate();