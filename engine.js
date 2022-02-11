/* global window, document, setInterval, Math */

function Entity(props) {
  this.id = props.id;
  this.speed = {x: props.runningSpeed, y: 0};
  this.velocity = {x: props.runningSpeed, y: 0};
  this.size = props.size;
  this.position = {x: 0, y: 250};
  this.usesGravity = true;
  this.game = null;

  this.CreateEl();
}


Entity.leftScale = "scaleX(-1) scaleY(1)";
Entity.rightScale = "scaleX(1) scaleY(1)";

Entity.prototype.MoveX = function(x) {
  this.position.x += x;

  if (this.position.x > this.game.bounds.width - this.size.width) {
    this.position.x = this.game.bounds.width - this.size.width;
    this.FaceLeft();
  }

  if (this.position.x < 0) {
    this.position.x = 0;
    this.FaceRight();
  }

  this.el.style.left = this.position.x + "px";
};

Entity.prototype.MoveY = function(y) {
  this.position.y += y;

  if (this.position.y < this.game.floor) {
    this.position.y = this.game.floor;
  }

  this.el.style.top = (this.game.bounds.height - this.position.y - this.size.height) + "px";
};

Entity.prototype.FaceLeft = function() {
  this.velocity.x = -this.speed.x;
  this.sprite.style.transform = Entity.leftScale;
};

Entity.prototype.FaceRight = function() {
  this.velocity.x = this.speed.x;
  this.sprite.style.transform = Entity.rightScale;
};

Entity.prototype.IsGrounded = function() {
  return this.position.y <= this.game.floor;
};

Entity.prototype.AddGravity = function(delta) {
  this.velocity.y += this.game.gravity * delta;
};

Entity.prototype.Update = function() {

};

Entity.prototype.CollidesWith = function(other) {
  return (
     this.position.x < other.position.x + other.size.width &&
     this.position.x + this.size.width > other.position.x &&
     this.position.y < other.position.y + other.size.height &&
     this.position.y + this.size.height > other.position.y
   );
};

Entity.prototype.Top = function() {
  return this.position.y + this.size.height;
};

Entity.prototype.CreateEl = function() {
  this.el = document.createElement('div');
  this.el.className = "bounding-box";
  this.el.style.width = this.size.width;
  this.el.style.height = this.size.height;

  this.sprite = document.getElementById(this.id);
  this.sprite.parentNode.removeChild(this.sprite);
  this.el.appendChild(this.sprite);
  this.sprite.className = "sprite";

  var spriteOffsetX = parseInt(this.sprite.getAttribute('data-sprite-offset-x')) || 0;
  var spriteOffsetY = parseInt(this.sprite.getAttribute('data-sprite-offset-y')) || 0;

  var offsetX = (-(this.sprite.width - this.size.width) / 2) + spriteOffsetX;
  var offsetY = (-(this.sprite.height - this.size.height) / 2) + spriteOffsetY;

  this.sprite.style.left = offsetX + "px";
  this.sprite.style.top = offsetY + "px";

  return this.el;
};





function SubGame(props) {
  var game = this;

  this.bounds = props.bounds;
  this.floor = props.floor;
  this.gravity = props.gravity;
  this.el = document.getElementById(props.id);

  this.Entities = [ ];
  this.now = new Date().getTime();
  var delta = 0;

  this.Update = function() {
    var then = this.now;
    this.now = new Date().getTime();

    delta = (this.now - then) / 1000;

    if (delta > 0.2) delta = 0.2;

    var n = this.Entities.length - 1;
    while (n > -1) {
      var ent = this.Entities[n];

      ent.MoveX(ent.velocity.x * delta);
      ent.MoveY(ent.velocity.y * delta);

      if (ent.usesGravity) {
        if (ent.IsGrounded()) {
          ent.velocity.y = 0;
        } else {
          ent.AddGravity(delta);
        }
      }

      ent.Update();

      n--;
    }
  };

  this.AddEntity = function(entity) {
    this.Entities.push(entity);
    entity.game = this;

    this.el.appendChild(entity.el);
  };

  function Animate() {
    game.Update();
    window.requestAnimationFrame(Animate);
  }

  Animate();
}

window.SubGame = SubGame;
window.SubGame.Entity = Entity;

window.SubGame.OnReady = function(fn) {
  var self = this;
  if (document.readyState !== 'loading') {
    fn.call(self);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      fn.call(self);
    });
  }
};
