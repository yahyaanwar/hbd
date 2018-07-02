/*
Everybody say Happy Birthday! This gift is a compound of various pens plus some other things I added
- gift 
https://codepen.io/ElaineXu/pen/EWvGWX
- neon 
https://codepen.io/markheggan/pen/LjrVYN
- fireworks 
https://codepen.io/chuongdang/pen/yzpDG
- moon 
https://codepen.io/agelber/pen/sjIKp
*/

// get name value

var $_GET = [];
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(a, name, value) {
    $_GET[name] = value;
});

var ondate = false;
var nameDOM = document.querySelector('#name');
var bornDOM = document.querySelector('#born');
var getName = $_GET.name || '';
var names = getName.includes('[') ? JSON.parse(decodeURI(getName.toUpperCase())) : [decodeURI(getName.toUpperCase())];

names.forEach(char => {
    let x = char.replace(/./g, function(x) {
        return "<span>" + x + "</span>"
    });
    nameDOM.innerHTML += '<div class="row">'+x+'</div>'
});

if ($_GET.born && $_GET.date) {
    let txt = "yang ke- "+ ($_GET.date.replace(/%20/g, ' ').match(/\b\d{4}\b/)[0] - $_GET.born)

    txt.split('').forEach(char => {
        let x = char.replace(/./g, function(x) {
            return "<span>" + x + "</span>"
        });
        bornDOM.innerHTML += x
    });

}

// confetti settings
var confetti_colors = ['#E68F17', '#FAB005', '#FA5252', '#E64980', '#BE4BDB', '#0B7285', '#15AABF', '#EE1233', '#40C057'];
var confetti_configs1 = {
    angle: 0,
    spread: 50,
    startVelocity: 200,
    elementCount: 50,
    decay: 0.2,
    colors: confetti_colors
};
var confetti_configs2 = {
    angle: 180,
    spread: 50,
    startVelocity: 200,
    elementCount: 50,
    decay: 0.2,
    colors: confetti_colors
};


window.requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
}();

// now we will setup our basic variables for the demo
var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),

    // full screen dimensions
    cw = window.innerWidth,
    ch = window.innerHeight,

    // firework collection
    fireworks = [],

    // particle collection
    particles = [],

    // starting hue
    hue = 120,

    // when launching fireworks with a click, too many get launched at once without a limiter, one launch per 5 loop ticks
    limiterTotal = 5,
    limiterTick = 0,

    // this will time the auto launches of fireworks, one launch per 80 loop ticks
    timerTotal = 20,
    timerTick = 0,
    mousedown = false,

    // mouse x coordinate,
    mx,

    // mouse y coordinate
    my;

// set canvas dimensions
canvas.width = cw;
canvas.height = ch;

// now we are going to setup our function placeholders for the entire demo

// get a random number within a range
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// calculate the distance between two points
function calculateDistance(p1x, p1y, p2x, p2y) {
    var xDistance = p1x - p2x,
        yDistance = p1y - p2y;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// create firework
function Firework(sx, sy, tx, ty) {
    // actual coordinates
    this.x = sx;
    this.y = sy;
    // starting coordinates
    this.sx = sx;
    this.sy = sy;
    // target coordinates
    this.tx = tx;
    this.ty = ty;
    // distance from starting point to target
    this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
    this.distanceTraveled = 0;
    // track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
    this.coordinates = [];
    this.coordinateCount = 3;
    // populate initial coordinate collection with the current coordinates
    while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
    }
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2;
    this.acceleration = 1.05;
    this.brightness = random(50, 70);
    // circle target indicator radius
    this.targetRadius = 1;
}

// update firework
Firework.prototype.update = function(index) {
    // remove last item in coordinates array
    this.coordinates.pop();
    // add current coordinates to the start of the array
    this.coordinates.unshift([this.x, this.y]);

    // cycle the circle target indicator radius
    if (this.targetRadius < 8) {
        this.targetRadius += 0.3;
    } else {
        this.targetRadius = 1;
    }

    // speed up the firework
    this.speed *= this.acceleration;

    // get the current velocities based on angle and speed
    var vx = Math.cos(this.angle) * this.speed,
        vy = Math.sin(this.angle) * this.speed;
    // how far will the firework have traveled with velocities applied?
    this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

    // if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
    if (this.distanceTraveled >= this.distanceToTarget) {
        createParticles(this.tx, this.ty);
        // remove the firework, use the index passed into the update function to determine which to remove
        fireworks.splice(index, 1);
    } else {
        // target not reached, keep traveling
        this.x += vx;
        this.y += vy;
    }
};

// draw firework
Firework.prototype.draw = function() {
    ctx.beginPath();
    // move to the last tracked coordinate in the set, then draw a line to the current x and y
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
    ctx.stroke();

    ctx.beginPath();
    // draw the target for this firework with a pulsing circle
    ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
    ctx.stroke();
};

// create particle
function Particle(x, y) {
    this.x = x;
    this.y = y;
    // track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
    this.coordinates = [];
    this.coordinateCount = 5;
    while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
    }
    // set a random angle in all possible directions, in radians
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1, 10);
    // friction will slow the particle down
    this.friction = 0.95;
    // gravity will be applied and pull the particle down
    this.gravity = 1;
    // set the hue to a random number +-20 of the overall hue variable
    this.hue = random(hue - 20, hue + 20);
    this.brightness = random(50, 80);
    this.alpha = 1;
    // set how fast the particle fades out
    this.decay = random(0.015, 0.03);
}

// update particle
Particle.prototype.update = function(index) {
    // remove last item in coordinates array
    this.coordinates.pop();
    // add current coordinates to the start of the array
    this.coordinates.unshift([this.x, this.y]);
    // slow down the particle
    this.speed *= this.friction;
    // apply velocity
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    // fade out the particle
    this.alpha -= this.decay;

    // remove the particle once the alpha is low enough, based on the passed in index
    if (this.alpha <= this.decay) {
        particles.splice(index, 1);
    }
};

// draw particle
Particle.prototype.draw = function() {
    ctx.beginPath();
    // move to the last tracked coordinates in the set, then draw a line to the current x and y
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
    ctx.stroke();
};

// create particle group/explosion
function createParticles(x, y) {
    // increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
    var particleCount = 50;
    while (particleCount--) {
        particles.push(new Particle(x, y));
    }
}

// main demo loop
function loop() {
    // this function will run endlessly with requestAnimationFrame
    requestAnimFrame(loop);

    // increase the hue to get different colored fireworks over time
    hue += 1.5;

    // normally, clearRect() would be used to clear the canvas
    // we want to create a trailing effect though
    // setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
    ctx.globalCompositeOperation = 'destination-out';
    // decrease the alpha property to create more prominent trails
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, cw, ch);
    // change the composite operation back to our main mode
    // lighter creates bright highlight points as the fireworks and particles overlap each other
    ctx.globalCompositeOperation = 'lighter';

    // loop over each firework, draw it, update it
    var i = fireworks.length;
    while (i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }

    // loop over each particle, draw it, update it
    var i = particles.length;
    while (i--) {
        particles[i].draw();
        particles[i].update(i);
    }

    // launch fireworks automatically to random coordinates, when the mouse isn't down
    if (timerTick >= timerTotal) {
        if (!mousedown) {
            // start the firework at the bottom middle of the screen, then set the random target coordinates, the random y coordinates will be set within the range of the top half of the screen
            fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
            timerTick = 0;
        }
    } else {
        timerTick++;
    }

    // limit the rate at which fireworks get launched when mouse is down
    if (limiterTick >= limiterTotal) {
        if (mousedown) {
            // start the firework at the bottom middle of the screen, then set the current mouse coordinates as the target
            fireworks.push(new Firework(cw / 2, ch, mx, my));
            limiterTick = 0;
        }
    } else {
        limiterTick++;
    }
}

window.onload = function() {
    var merrywrap = document.getElementById("merrywrap");
    var box = merrywrap.getElementsByClassName("giftbox")[0];
    var point1 = document.getElementById('point1');
    var point2 = document.getElementById('point2');
    var step = 0;
    var stepMinutes = [2000, 2000, 1000, 1000];

    function init() {
        box.addEventListener("click", openBox, false);
    }

    function stepClass(step) {
        merrywrap.className = 'merrywrap';
        merrywrap.className = 'merrywrap step-' + step;
    }

    function openBox() {
        if (ondate) {
            if (step === 1) {
                box.removeEventListener("click", openBox, false);
                window.confetti(point1, confetti_configs1);
                window.confetti(point2, confetti_configs2);
                document.getElementById('countdown').style.display = 'none'
            }
            stepClass(step);
            if (step === 3) {}
            if (step === 4) {
                reveal();
                return;
            }
            setTimeout(openBox, stepMinutes[step - 1]);
            step++;
        }
    }
    init();
};

function reveal() {
    document.querySelector('.merrywrap').style.backgroundColor = 'transparent';

    loop();

    var w, h;
    if (window.innerWidth >= 1000) {
        w = 295;
        h = 185;
    } else {
        w = 255;
        h = 155;
    }

    // var ifrm = document.createElement("iframe");
    // ifrm.setAttribute("src", "https://www.youtube.com/embed/KDxJlW6cxRk?controls=0&loop=1&autoplay=1");
    //ifrm.style.width = `${w}px`;
    //ifrm.style.height = `${h}px`;
    // ifrm.style.border = 'none';
    // document.querySelector('#video').appendChild(ifrm);
}