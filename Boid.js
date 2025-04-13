
class Boid {
    constructor() {
        this.position = createVector(
            random(width),
            random(height),
            random(depth)
        );
        // this.position = createVector(0, 0, 0);
        this.velocity = p5.Vector.random3D().mult(2);
        this.acceleration = createVector(0, 0, 0);
        this.steering = createVector(0, 0, 0);
        this.neighbors = []; // an array of boids in sight. [[neighbor, distance]...]
        this.debugSteer = {
            separationForce: createVector(0, 0, 0),
            alignmentForce: createVector(0, 0, 0),
            cohesionForce: createVector(0, 0, 0)
        };
    }

    // defines behaviour when getting to an edge
    edges() {
        let halfW = width / 2;
        let halfH = height / 2;
        let halfD = depth / 2;
    
        if (this.position.x >  halfW) this.position.x = -halfW;
        if (this.position.x < -halfW) this.position.x =  halfW;
    
        if (this.position.y >  halfH) this.position.y = -halfH;
        if (this.position.y < -halfH) this.position.y =  halfH;
    
        if (this.position.z >  halfD) this.position.z = -halfD;
        if (this.position.z < -halfD) this.position.z =  halfD;
    }

    // debug purposes: will use that to draw the different force vectors
    drawVector(vec, col) {
        push();
        stroke(col);
        strokeWeight(2);
        let scaled = vec.copy().mult(25); // scale up for visibility
        line(this.position.x, this.position.y,
            this.position.x + scaled.x, this.position.y + scaled.y);
        pop();
    }

    // draws the boid on the screen.
    // how is the boid represented? (currently a triangle)
    show() {
        // Setup
        push();
        translate(this.position.x, this.position.y, this.position.z);
        // translate(0, 0, 0);
        
        // align the boid with the velocity
        let dir = this.velocity.copy().normalize();
        let up = createVector(0, 1, 0);
        let angle = acos(up.dot(dir));
        let axis = up.cross(dir);
    
        if (axis.mag() > 0) {
            rotate(angle, axis);
        }

        // drawing the cone
        fill(220);
        stroke(100);
        strokeWeight(0.5);
        cone(5, 15); // radius, height

        pop();

        // Draw debug vectors
        // if (debug) {
        //     this.drawVector(this.debugSteer.separationForce, color(255, 0, 0));   // red
        //     this.drawVector(this.debugSteer.alignmentForce, color(0, 255, 0));    // green
        //     this.drawVector(this.debugSteer.cohesionForce, color(0, 100, 255));   // blue
        // }
    }

    update() {
        this.separate();
        this.align();
        this.cohere();
        this.acceleration.add(this.steering);

        let desiredVelocity = p5.Vector.add(this.velocity, this.acceleration);
        this.velocity.lerp(desiredVelocity, 0.1); // lower = smoother
        this.velocity.add(this.acceleration);

        this.velocity.limit(Boid.MAX_SPEED);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.steering.mult(0);
    }

    // globals are now controlled through the sliders
    static updateGlobals(values) {
        Boid.MAX_SPEED = values.maxSpeed;
        Boid.MAX_FORCE = values.maxForce;

        Boid.SEPERATION_RADIUS = values.sepRadius;
        Boid.ALIGNMENT_RADIUS = values.alignRadius;
        Boid.COHESION_RADIUS = values.cohRadius;

        Boid.SEPERATION_WEIGHT = values.sepWeight;
        Boid.ALIGNMENT_WEIGHT = values.alignWeight;
        Boid.COHESION_WEIGHT = values.cohWeight;
    }


    // defining separation behaviour
    separate() {
        if (this.neighbors.length === 0) return;

        let separationForce = createVector(0, 0, 0);
        let total = 0;

        for (let [other, distance] of this.neighbors) {
            if (distance > 0 && distance < Boid.SEPERATION_RADIUS) {
                let diff = p5.Vector.sub(this.position, other.position);
                diff.div(distance * distance);
                separationForce.add(diff);
                total++;
            }
        }

        if (total > 0) {
            separationForce.div(total); // average the steer
            separationForce.setMag(Boid.MAX_SPEED);
            separationForce.sub(this.velocity);
            separationForce.limit(Boid.MAX_FORCE);
            this.debugSteer.separationForce = separationForce.copy(); // store for debug
            this.steering.add(separationForce.mult(Boid.SEPERATION_WEIGHT));
        }
    }

    align() {
        if (this.neighbors.length === 0) return;

        let alignmentForce = createVector(0, 0, 0);
        let total = 0;

        for (let [other, distance] of this.neighbors) {
            if (distance > 0 && distance < Boid.ALIGNMENT_RADIUS) {
                alignmentForce.add(other.velocity);
                total++;
            }
        }

        if (total > 0) {
            alignmentForce.div(total); // get average velocity of neighbors
            // alignmentForce.setMag(Boid.MAX_SPEED); // boid will want to go full speed in the average direction
            alignmentForce.sub(this.velocity); // the boid steers to crrect current velocity
            alignmentForce.limit(Boid.MAX_FORCE); // prevent wild steering
            this.debugSteer.alignmentForce = alignmentForce.copy();
            this.steering.add(alignmentForce.mult(Boid.ALIGNMENT_WEIGHT));
        }
    }

    // defining cohesion behaviour
    cohere() {
        if (this.neighbors.length === 0) return;

        let cohesionForce = createVector(0, 0, 0);
        let total = 0;

        for (let [other, distance] of this.neighbors) {
            if (distance > 0 && distance < Boid.COHESION_RADIUS) {
                cohesionForce.add(other.position);
                total++;
            }
        }

        if (total > 0) {
            cohesionForce.div(total); // get average position of neighbors (center of mass)
            cohesionForce.sub(this.position);
            cohesionForce.setMag(Boid.MAX_SPEED); // where we want to go
            cohesionForce.sub(this.velocity);
            cohesionForce.limit(Boid.MAX_FORCE);
            this.debugSteer.cohesionForce = cohesionForce.copy();
            this.steering.add(cohesionForce.mult(Boid.COHESION_WEIGHT));
        }
    }
}