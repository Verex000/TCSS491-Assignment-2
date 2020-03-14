
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}


function Circle(game) {

    this.player = 1;
    this.radius = 20;
    this.visualRadius = 500;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.setNotInfected();
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};



Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.setInfected = function () {
    this.infected = true;
    this.incubationPeriodTicks = 25;
    this.immune = false;
    this.color = 0;
    this.infectionChance = 0.8;
    this.fatalityChance = 0.03;
    this.recoverTicks = 50;
    this.visualRadius = 800;

    this.speed = 10;
};


Circle.prototype.setNotInfected = function () {
    this.infected = false;
    this.immune = false;
    this.color = 3;
    this.visualRadius = 100;
}


Circle.prototype.setBit = function () {
    this.bit = true;
    this.color = 1;
    this.incubationPeriodTicks = 300;
}


Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
    // if(this.incubationPeriodTicks <= 0) {
    //     this.setInfected();
    // }
 //  console.log(this.velocity);
    //Check if infected will die or become immune
    // if(this.infected && !this.immune) {
    //     if(this.recoverTicks <= 0) {
    //         this.setImmune();
    //     }
    //     else {
    //         if(this.incubationPeriodTicks > 0) {
    //             this.incubationPeriodTicks--;
    //         }
    //         else {
    //             this.recoverTicks--;
    //             var fatal = Math.random();
    //             if(this.infected) {
    //                 console.log("Recover Ticks: " +this.recoverTicks);
    //                 console.log("Fatal Chance: " + fatal);
    //             }
    //             if(fatal <= this.fatalityChance) {
    //                 this.removeFromWorld = true;
    //             }
    //         }
    //     }
    // }
    // if(this.recoverTicks <= 0 && this.infected && !this.immune) {
    //     this.setImmune();
    // }
    // else if(this.infected && !this.immune) {
    //     this.recoverTicks--;

    //     var fatal = Math.random();
    //     if(this.infected) {
    //         console.log("Recover Ticks: " +this.recoverTicks);
    //         console.log("Fatal Chance: " + fatal);
    //     }
    //     if(fatal <= this.fatalityChance) {
    //         this.removeFromWorld = true;
    //     }
    // }
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;



    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;

            //Infects based on infection chance
            if (this.infected && !ent.infected && !ent.bit) {
                ent.setInfected();
            }
            else if(ent.infected && !this.infected && !this.bit) {
                this.setInfected();
            }
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.infected && dist > this.radius + ent.radius + 10 && !ent.infected) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y) * 1.5;
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.infected && dist > this.radius + ent.radius && !this.infected) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};




// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();
    var circle = new Circle(gameEngine);
    circle.setInfected();
    // circle.setIt();
    // var circle2 = new Circle(gameEngine);
    // circle2.setInfected();
    gameEngine.addEntity(circle);
    for (var i = 0; i < 50; i++) {
        circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    }
    gameEngine.init(ctx);
    gameEngine.start();
});
