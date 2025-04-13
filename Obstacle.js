class Obstacle {
    constructor(position, radius) {
        this.position = position;
        this.radius = radius;
    }

    show() {
        push();
        translate(this.position.x, this.position.y, this.position.z);
        noFill();
        stroke(255, 0, 0);
        strokeWeight(1);
    
        let latDiv = 6;  // latitude divisions
        let lonDiv = 12;  // longitude divisions
    
        // latitude rings (horizontal "slices")
        for (let i = 0; i <= latDiv; i++) {
            let theta = map(i, 0, latDiv, -HALF_PI, HALF_PI);
            beginShape();
            for (let j = 0; j <= lonDiv; j++) {
                let phi = map(j, 0, lonDiv, 0, TWO_PI);
                let x = this.radius * cos(theta) * cos(phi);
                let y = this.radius * sin(theta);
                let z = this.radius * cos(theta) * sin(phi);
                vertex(x, y, z);
            }
            endShape(CLOSE);
        }
    
        // longitude rings (vertical "slices")
        for (let j = 0; j <= lonDiv; j++) {
            let phi = map(j, 0, lonDiv, 0, TWO_PI);
            beginShape();
            for (let i = 0; i <= latDiv; i++) {
                let theta = map(i, 0, latDiv, -HALF_PI, HALF_PI);
                let x = this.radius * cos(theta) * cos(phi);
                let y = this.radius * sin(theta);
                let z = this.radius * cos(theta) * sin(phi);
                vertex(x, y, z);
            }
            endShape(CLOSE);
        }
    
        pop();
    }

    // Returns true if a point is inside the obstacle
    contains(point) {
        return p5.Vector.dist(this.position, point) < this.radius;
    }

    // Returns the vector away from the obstacle's center (used for avoidance)
    avoidanceVector(boidPosition) {
        let away = p5.Vector.sub(boidPosition, this.position);
        let distance = away.mag();
        if (distance < this.radius) {
            away.setMag(this.radius - distance); // stronger when deeper inside
            return away;
        } else {
            return createVector(0, 0, 0); // no avoidance needed
        }
    }
}