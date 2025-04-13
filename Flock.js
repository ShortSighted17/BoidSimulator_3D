class Flock {
    constructor(n) {
        this.boids = [];
        for (let i = 0; i < n; i++) {
            this.boids.push(new Boid());
        }

        // Grid config
        this.cellSize = 50;
        this.cols = Math.ceil(width / this.cellSize);
        this.rows = Math.ceil(height / this.cellSize);
        this.grid = [];
    }

    // Clears and repopulates the grid
    buildSpatialGrid() {
        this.grid = Array.from({ length: this.cols }, () =>
            Array.from({ length: this.rows }, () => [])
        );

        for (let boid of this.boids) {
            const cellX = Math.floor(boid.position.x / this.cellSize);
            const cellY = Math.floor(boid.position.y / this.cellSize);

            if (this.grid[cellX] && this.grid[cellX][cellY]) {
                this.grid[cellX][cellY].push(boid);
            }
        }
    }

    // Gets boids in a cell and adjacent cells
    getNearbyBoids(boid) {
        const cellX = Math.floor(boid.position.x / this.cellSize);
        const cellY = Math.floor(boid.position.y / this.cellSize);
        let nearby = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const x = cellX + dx;
                const y = cellY + dy;
                if (x >= 0 && y >= 0 && x < this.cols && y < this.rows) {
                    nearby.push(...this.grid[x][y]);
                }
            }
        }
        return nearby;
    }


    updateNeighbors() {
        this.buildSpatialGrid();

        for (let boid of this.boids) {
            boid.neighbors = [];

            for (let other of this.getNearbyBoids(boid)) {
                if (boid !== other) {
                    let d = dist(
                        boid.position.x, boid.position.y,
                        other.position.x, other.position.y
                    );
                    if (d <= Boid.SEPERATION_RADIUS || d <= Boid.ALIGNMENT_RADIUS || d <= Boid.COHESION_RADIUS) {
                        boid.neighbors.push([other, d]);
                    }
                }
            }
        }
    }

    [Symbol.iterator]() {
        return this.boids.values();
    }
}
