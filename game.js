/* global window, document, setTimeout, clearTimeout */

var SubGame = window.SubGame;
var Entity = SubGame.Entity;

var vibers = [];

function Goat() {
  Entity.call(this, {
    id: "goat-empty",
    size: {
      width: 32,
      height: 24
    },
    runningSpeed: 192
  });

  this.spriteRun = document.getElementById("goat-run");
  this.spriteJumpUp = document.getElementById("goat-jump-up");
  this.spriteJumpMid = document.getElementById("goat-jump-mid");
  this.spriteJumpDown = document.getElementById("goat-jump-down");

  this.groundJumpUsed = false;
  this.airJumpUsed = false;
  this.autoJump = true;
}

Goat.prototype = Object.create(Entity.prototype);
Goat.prototype.constructor = Goat;

Goat.prototype.Update = function() {
  if (this.IsGrounded()) {
    this.groundJumpUsed = false;
    this.airJumpUsed = false;
  }

  this.CheckStomps();

  this.HandleSprite();

  if (this.autoJump && Math.random() < 0.01) {
    this.TryJump();
  }
};

Goat.prototype.CheckStomps = function() {
  var lastLastY = this.lastY;
  this.lastY = this.position.y;

  if (this.velocity.y >= 0) return;
  if (!this.groundJumpUsed) return;

  var n = this.game.Entities.length - 1;
  while (n > -1) {
    var ent = this.game.Entities[n];
    n--;

    if (ent === this) continue;
    if (ent.stunned) continue;
    if (lastLastY + 8 < ent.Top()) continue;

    if (this.CollidesWith(ent)) {
      this.ForceJump();
      this.AwardAirJump();
      ent.Stun();
      this.position.y = ent.Top();
      this.Vibe();
      return;
    }
  }
};

Goat.prototype.Vibe = function() {
  for (var i = 0; i < vibers.length; i++) {
    vibers[i].classList.remove("vibe");
    vibers[i].classList.add("vibe");
  }

  if (this.vibeTimeout) {
    clearTimeout(this.vibeTimeout);
  }

  var self = this;
  this.vibeTimeout = setTimeout(function() {
    self.Unvibe();
  }, 240);
};

Goat.prototype.Unvibe = function() {
  for (var i = 0; i < vibers.length; i++) {
    vibers[i].classList.remove("vibe");
  }
};

Goat.prototype.HandleSprite = function() {
  if (this.IsGrounded()) {
    this.SetSprite(this.spriteRun);
    return;
  }

  if (this.velocity.y > 50) {
    this.SetSprite(this.spriteJumpUp);
  } else if (this.velocity.y < -50) {
    this.SetSprite(this.spriteJumpDown);
  } else {
    this.SetSprite(this.spriteJumpMid);
  }
};

Goat.prototype.SetSprite = function(newSprite) {
  if (this.currentSprite === newSprite) return;
  this.sprite.src = newSprite.src;
  this.currentSprite = newSprite;
};

Goat.prototype.AwardAirJump = function() {
  this.airJumpUsed = false;
};

Goat.prototype.ForceJump = function() {
  this.velocity.y = 450;
};

Goat.prototype.TryJump = function() {
  if (this.IsGrounded()) {
    this.ForceJump();
    this.groundJumpUsed = true;
  } else if (!this.airJumpUsed) {
    this.ForceJump();
    this.airJumpUsed = true;
  }
};






function Enemy(props) {
  Entity.call(this, props);
}

Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.Stun = function() {
  this.stunned = true;
  this.velocity.x = 0;
  this.el.classList.add("stunned");

  var self = this;
  setTimeout(function() {
    self.Recover();
  }, 1000);
};


Enemy.prototype.Recover = function() {
  this.stunned = false;
  this.el.classList.remove("stunned");
  if (Math.random() > 0.5) {
    this.velocity.x = this.speed.x;
    this.FaceRight();
  } else {
    this.velocity.x = -this.speed.x;
    this.FaceLeft();
  }
};





function Pea(id) {
  Enemy.call(this, {
    id: id,
    size: {
      width: 48,
      height: 38
    },
    runningSpeed: 192
  });
}

Pea.prototype = Object.create(Enemy.prototype);
Pea.prototype.constructor = Pea;


function Potato(id) {
  Enemy.call(this, {
    id: id,
    size: {
      width: 56,
      height: 64
    },
    runningSpeed: 32
  });
}

Potato.prototype = Object.create(Enemy.prototype);
Potato.prototype.constructor = Potato;


function HotDog(id) {
  Enemy.call(this, {
    id: id,
    size: {
      width: 48,
      height: 24
    },
    runningSpeed: 64
  });

  this.usesGravity = false;
}

HotDog.prototype = Object.create(Enemy.prototype);
HotDog.prototype.constructor = HotDog;



SubGame.OnReady(function() {
  var game = new SubGame({
    id: "game",
    bounds: {
      width: 300,
      height: 250
    },
    floor: 42,
    gravity: -1800
  });

  vibers = document.getElementsByClassName("viber");

  var goat = new Goat();
  goat.position.y = 42;

  var enemy1 = new Pea("pea1");
  enemy1.position = {x: 128, y: 42};
  enemy1.FaceLeft();

  var enemy2 = new Potato("potato1");
  enemy2.position.y = 42;

  var enemy3 = new HotDog("hotdog1");
  enemy3.position.y = 136;

  game.AddEntity(enemy1);
  game.AddEntity(enemy2);
  game.AddEntity(enemy3);
  game.AddEntity(goat);

  document.addEventListener('keydown', function(event) {
    if (event.keyCode === 32) {
      goat.autoJump = false;
      goat.TryJump();
    }
  });
});
