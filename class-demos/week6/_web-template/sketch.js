function setup() {
    let cnv = createCanvas(400, 400);
    cnv.parent('sketch-holder');
}

function draw() {
    background(0);
    fill(255);
    circle(200, 200+200*sin(frameCount/40+PI/2), 100);
    circle(200-200*sin(frameCount/40), 200, 100);
}