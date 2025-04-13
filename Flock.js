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
        this.layers = Math.ceil(depth / this.cellSize);

        this.grid = [];
    }

    // Clears and repopulates the grid
    buildSpatialGrid() {
        this.grid = Array.from({ length: this.cols }, () =>
            Array.from({ length: this.rows }, () =>
                Array.from({ length: this.layers }, () => [])
            )
        );

        for (let boid of this.boids) {
            const cellX = Math.floor((boid.position.x + (width / 2)) / this.cellSize);
            const cellY = Math.floor((boid.position.y + (height / 2)) / this.cellSize);
            const cellZ = Math.floor((boid.position.z + (depth / 2)) / this.cellSize);


            if (this.grid[cellX] && this.grid[cellX][cellY] && this.grid[cellX][cellY][cellZ]) {
                this.grid[cellX][cellY][cellZ].push(boid);
            }
        }
    }

    // Gets boids in a cell and adjacent cells
    getNearbyBoids(boid) {
        const cellX = Math.floor((boid.position.x + (width / 2)) / this.cellSize);
        const cellY = Math.floor((boid.position.y + (height / 2)) / this.cellSize);
        const cellZ = Math.floor((boid.position.z + (depth / 2)) / this.cellSize);
        let nearby = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++){
                    const x = cellX + dx;
                    const y = cellY + dy;
                    const z = cellZ + dz;
                    if (x >= 0 && y >= 0 && z >= 0 &&
                        x < this.cols && y < this.rows && z < this.layers) {
                        nearby.push(...this.grid[x][y][z]);
                    }
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
                    let d = toroidalDistance(boid.position, other.position);
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


// HELPER FUNCTIONS
function toroidalDistance(a, b) {
    let dx = abs(a.x - b.x);
    dx = min(dx, width - dx);

    let dy = abs(a.y - b.y);
    dy = min(dy, height - dy);

    let dz = abs(a.z - b.z);
    dz = min(dz, depth - dz);

    return sqrt(dx * dx + dy * dy + dz * dz);
}
