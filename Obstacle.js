class Obstacle {
    constructor(position, radius) {
        this.position = position;
        this.radius = radius;
    }

    show() {
        push();
        translate(this.position.x, this.position.y, this.position.z);
        noStroke();
        fill(255, 0, 0, 100); // red translucent
        sphere(this.radius);
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