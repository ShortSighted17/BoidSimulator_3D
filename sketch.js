// some global variables
let numberOfBoids = 300;
let depth = 400;
let flock;
let obstacles = [];


// sliders
let maxSpeedSlider, maxForceSlider;
let sepRadiusSlider, alignRadiusSlider, cohRadiusSlider;
let sepWeightSlider, alignWeightSlider, cohWeightSlider;
let zoomSlider, rotationSlider, elevationSlider;
;

let debugCheckbox;



function setup() {

    createCanvas(900, 600, WEBGL);
    // create the settings panel
    let settingsPanel = createDiv()
        .style('margin', '10px')
        .style('font-family', 'monospace')
        .style('font-size', '14px')
        .style('color', 'black');

    // row 1: max speed & force
    let row1 = createDiv().style('display', 'flex').style('gap', '24px').style('margin-bottom', '8px');
    let maxSpeed = makeLabeledSlider("Max Speed", 0, 10, 5, 0.1);
    maxSpeedSlider = maxSpeed.slider;
    enableScrollControl(maxSpeedSlider)
    row1.child(maxSpeed.wrapper);

    let maxForce = makeLabeledSlider("Max Force", 0, 2, 0.5, 0.05);
    maxForceSlider = maxForce.slider;
    enableScrollControl(maxForceSlider)
    row1.child(maxForce.wrapper);

    // row 2: radii
    let row2 = createDiv().style('display', 'flex').style('gap', '24px').style('margin-bottom', '8px');
    let sepRadius = makeLabeledSlider("Separation Radius", 0, 100, 25, 1);
    sepRadiusSlider = sepRadius.slider;
    enableScrollControl(sepRadiusSlider)
    row2.child(sepRadius.wrapper);

    let cohRadius = makeLabeledSlider("Cohesion Radius", 0, 100, 50, 1);
    cohRadiusSlider = cohRadius.slider;
    enableScrollControl(cohRadiusSlider)
    row2.child(cohRadius.wrapper);

    let alignRadius = makeLabeledSlider("Alignment Radius", 0, 100, 25, 1);
    alignRadiusSlider = alignRadius.slider;
    enableScrollControl(alignRadiusSlider)
    row2.child(alignRadius.wrapper);

    // row 3: weights
    let row3 = createDiv().style('display', 'flex').style('gap', '24px').style('margin-bottom', '8px');
    let sepWeight = makeLabeledSlider("Separation Weight", 0, 5, 2.0, 0.1);
    sepWeightSlider = sepWeight.slider;
    enableScrollControl(sepWeightSlider)
    row3.child(sepWeight.wrapper);

    let cohWeight = makeLabeledSlider("Cohesion Weight", 0, 5, 1.3, 0.1);
    cohWeightSlider = cohWeight.slider;
    enableScrollControl(cohWeightSlider)
    row3.child(cohWeight.wrapper);

    let alignWeight = makeLabeledSlider("Alignment Weight", 0, 5, 1.0, 0.1);
    alignWeightSlider = alignWeight.slider;
    enableScrollControl(alignWeightSlider)
    row3.child(alignWeight.wrapper);

    // row 4: camera controls
    let row4 = createDiv().style('display', 'flex').style('gap', '24px').style('margin-bottom', '8px');
    let zoom = makeLabeledSlider("Zoom", 100, 2000, 1700, 10);
    zoomSlider = zoom.slider;
    enableScrollControl(zoomSlider);
    row4.child(zoom.wrapper);

    let rotation = makeLabeledSlider("Rotation", 0, 360, 60, 1);
    rotationSlider = rotation.slider;
    enableScrollControl(rotationSlider);
    row4.child(rotation.wrapper);

    let elevation = makeLabeledSlider("Elevation", -500, 500, 200, 10);
    elevationSlider = elevation.slider;
    enableScrollControl(elevationSlider);
    row4.child(elevation.wrapper);

    // add all rows to the panel
    settingsPanel.child(row1);
    settingsPanel.child(row2);
    settingsPanel.child(row3);
    settingsPanel.child(row4);

    // initializing flock and obstacles
    flock = new Flock(numberOfBoids);

}

function draw() {
    background(0);

    // Allow the camera zoom to be controlled through a slider
    let zoomValue = 2000 - zoomSlider.value();
    let angle = radians(rotationSlider.value()); // convert degrees to radians
    let camX = zoomValue * sin(angle);
    let camZ = zoomValue * cos(angle);
    let camY = -elevationSlider.value();

    // camera(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
    camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0); // look at center
    orbitControl();

    // Update behavior constants from sliders
    Boid.updateGlobals({
        maxSpeed: maxSpeedSlider.value(),
        maxForce: maxForceSlider.value(),
        sepRadius: sepRadiusSlider.value(),
        alignRadius: alignRadiusSlider.value(),
        cohRadius: cohRadiusSlider.value(),
        sepWeight: sepWeightSlider.value(),
        alignWeight: alignWeightSlider.value(),
        cohWeight: cohWeightSlider.value()
    });

    flock.updateNeighbors();

    // drawing the box wireframe
    drawBoxGrid(width, height, depth, 10);

    // drawing boids
    for (let boid of flock) {
        boid.edges();
        boid.update();
        boid.show();
    }

}



// HELPER FUNCTIONS

function enableScrollControl(slider) {
    slider.elt.addEventListener("wheel", (e) => {
        e.preventDefault();

        const step = slider.elt.step ? parseFloat(slider.elt.step) : 1;
        const direction = e.deltaY < 0 ? 1 : -1;
        let newValue = slider.value() + direction * step;

        newValue = constrain(newValue, slider.elt.min, slider.elt.max);
        slider.value(newValue);
        slider.elt.dispatchEvent(new Event('input')); // trigger .input() update
    });
}


function makeLabeledSlider(label, min, max, start, step = 1) {
    let wrapper = createDiv().style('display', 'flex').style('align-items', 'center').style('gap', '8px');

    let labelSpan = createSpan(label);
    let slider = createSlider(min, max, start, step);
    let valueSpan = createSpan(start);

    // Update value on input
    slider.input(() => {
        valueSpan.html(slider.value());
    });

    wrapper.child(labelSpan);
    wrapper.child(slider);
    wrapper.child(valueSpan);

    return { wrapper, slider, valueSpan };
}

function drawBoxGrid(w, h, d, step = 50) {
    stroke(100, 100, 255, 120); // light bluish grid
    strokeWeight(1);
    noFill();

    // Front (+Z)
    push();
    translate(0, 0, d / 2);
    drawGrid(w, h, step);
    pop();

    // Back (-Z)
    push();
    translate(0, 0, -d / 2);
    rotateY(PI);
    drawGrid(w, h, step);
    pop();

    // Right (+X)
    push();
    translate(w / 2, 0, 0);
    rotateY(HALF_PI);
    drawGrid(d, h, step);
    pop();

    // Left (-X)
    push();
    translate(-w / 2, 0, 0);
    rotateY(HALF_PI);
    drawGrid(d, h, step);
    pop();

    // Top (-Y)
    push();
    translate(0, -h / 2, 0);
    rotateX(HALF_PI);
    drawGrid(w, d, step);
    pop();

    // Bottom (+Y)
    push();
    translate(0, h / 2, 0);
    rotateX(HALF_PI);
    drawGrid(w, d, step);
    pop();
}

function drawGrid(w, h, step, divisions = 4) {
    step = w / divisions;

    for (let i = 0; i <= divisions; i++) {
        let x = -w / 2 + i * step;
        line(x, -h / 2, 0, x, h / 2, 0);
    }

    step = h / divisions;
    for (let i = 0; i <= divisions; i++) {
        let y = -h / 2 + i * step;
        line(-w / 2, y, 0, w / 2, y, 0);
    }
}


