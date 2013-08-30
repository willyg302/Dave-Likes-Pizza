Crafty.c('Actor', {
	init: function() {
		this.requires('2D, DOM');
		this.attr({w: 64, h: 64})
	},
	size: function(w, h) {
		if (w === undefined && h === undefined) {
			return {w: 64, h: 64};
		} else {
			this.attr({w: w, h: h});
			return this;
		}
	},
	at: function(x, y) {
		if (x === undefined && y === undefined) {
			return {x: 0, y: 0};
		} else {
			this.attr({x: x, y: y});
			return this;
		}
	}
});

Crafty.c('Solid', {
	init: function() {
		this.requires('Actor');
	}
});

Crafty.c('Ground', {
	init: function() {
		this.requires('Actor, Gravity')
		.size(640, 80).at(0, 400);
	}
});

Crafty.c('Player', {
	init: function() {
		this.requires('Actor, Twoway, SpriteAnimation, daveNorm, Gravity, Collision, Delay')
		.twoway(4, 8)
		.onHit('Pizza', this.handlePizza).onHit('Powerup', this.handlePowerup).onHit('Solid', this.stopMovement)
		.animate('Still', 0, 0, 0).animate('MovingRight', 0, 1, 4).animate('MovingLeft', 0, 2, 4)
		.animate('Chomping', 0, 3, 4).animate('PoweredUp', 0, 4, 4).animate('Burping', 1, 0, 0);

		// Done here since pizzas are destroyed immediately
		this.bind('PizzaEaten', function() {
			Crafty.audio.play('chomp');
			// We need the bind, otherwise the anim gets frozen on the last frame
			this.animate('Chomping', 30, 0).bind('AnimationEnd', function() {
				this.trigger('NewDirection', this._movement);
			});
			if (Math.random() < 0.2) {
				this.delay(function() {
					Crafty.audio.play('burp');
					// We need the bind, otherwise the anim gets frozen on the last frame
					this.animate('Burping', 30, 0).bind('AnimationEnd', function() {
						this.trigger('NewDirection', this._movement);
					});
				}, 500, 0);
			}
		});

		this.bind('PowerupEaten', function() {
			Crafty.audio.play('powerup');
			// We need the bind, otherwise the anim gets frozen on the last frame
			this.animate('PoweredUp', 30, 0).bind('AnimationEnd', function() {
				this.trigger('NewDirection', this._movement);
			});
		});

		this.bind('PowerupDone', function() {
			Crafty.audio.play('powerdown');
		});

		var animation_speed = 5;
		this.bind('NewDirection', function(data) {
			if (data.x > 0) {
				this.animate('MovingRight', animation_speed, -1);
			} else if (data.x < 0) {
				this.animate('MovingLeft', animation_speed, -1);
			} else {
				this.animate('Still', animation_speed, -1);
			}
		});

		// We need this instead of resetting twoway() because doing that screws jumping up (Crafty bug)
		this.bind('EnterFrame', function() {
			if (this.disableControls) {
				return;
			}
			if (this._movement.x !== 0 && window.hasBacon) {
				this.x += this._movement.x;
			}
		});
	},

	handlePizza: function(data) {
		pizzaToEat = data[0].obj;
		pizzaToEat.destroy();
		Crafty.trigger('PizzaEaten', pizzaToEat.type);
	},

	handlePowerup: function(data) {
		powerupToEat = data[0].obj;
		powerupToEat.destroy();

		Crafty.trigger('PowerupEaten', powerupToEat.type);

		var toastText = "";
		switch (powerupToEat.type) {
			case "bacon": window.hasBacon = true; toastText = "Blitz Bacon!"; break;
			case "muffin": window.hasMuffin = true; toastText = "Multiplier Muffin!"; break;
			case "fries": window.hasFries = true; toastText = "Freeze Fries!"; break;
			case "melon": window.hasMelon = true; toastText = "Magnet Melon!"; break;
			case "donut": window.hasDonut = true; toastText = "Double-Point Donut!"; break;
			default: break;
		}
		Crafty.e('Toast').size(200, 50).at(220, 200).text(toastText);

		this.delay(function() {
			Crafty.trigger('PowerupDone', powerupToEat.type);
			switch (powerupToEat.type) {
				case "bacon": window.hasBacon = false; break;
				case "muffin": window.hasMuffin = false; break;
				case "fries": window.hasFries = false; break;
				case "melon": window.hasMelon = false; break;
				case "donut": window.hasDonut = false; break;
				default: break;
			}
			window.hasPowerup = false;
		}, 10000, 0);
	},

	stopMovement: function () {
		if (this._movement) {
			this.x -= this._movement.x;
			if (this.hit('Solid') != false) {
				this.x += this._movement.x;
				this.y -= this._movement.y;
				if (this.hit('Solid') != false) {
					this.x -= this._movement.x;
					this.y -= this._movement.y;
				}
			}
		} else {
			this._speed = 0;
		}
	}
});

Crafty.c('FallingObject', {
	init: function() {
		this.requires('Actor, Gravity, Collision')
		.gravity().gravityConst(0.3)
		.onHit('Ground', this.hitGround);
	},
	hitGround: function() {
		Crafty.e("2D, DOM, SpriteAnimation, " + this.type).attr({
			x: this._x,
			y: 360 + Crafty.math.randomInt(-3, 3)
		}).animate('Splat', 1, this.__coord[1] / 64, 2)
		.animate('Splat', 1, 0);
		Crafty.audio.play('splat');
		if (this.isPowerup) {
			window.hasPowerup = false;
		}
		this.destroy();
	},
	settype: function(type) {
		this.isPowerup = (["bacon", "muffin", "fries", "melon", "donut"].indexOf(type) != -1);
		this.type = type;
		this.addComponent(type);
	}
});

Crafty.c('Pizza', {
	init: function() {
		this.requires('FallingObject');
	}
})

Crafty.c('Powerup', {
	init: function() {
		this.requires('FallingObject');
	}
});

Crafty.c('PizzaManager', {
	init: function() {
		this.requires('Delay');
	},

	start: function() {
		// Basically just calls next() to start the pizzas falling!
		this.next();
	},

	next: function() {
		this.delay(function() {
			var chance = Crafty.math.randomInt(0, 99);
			var type = "cheese";
			var isPowerup = false;
			if (chance < 5 && !window.hasPowerup) {
				isPowerup = true;
				type = ["bacon", "muffin", "fries", "melon", "donut"][Crafty.math.randomInt(0, 4)];
			} else if (chance < 10 || window.hasMuffin) {
				type = "supreme";
			} else if (chance < 25) {
				type = "veggie";
			} else if (chance < 50) {
				type = "pepperoni";
			}
			var buffer = window.hasMelon ? 250 : 0;
			var xPos = Crafty.math.randomInt(0 + buffer, 576 - buffer);
			if (isPowerup) {
				window.hasPowerup = true;
				Crafty.e('Powerup').at(xPos, -64).settype(type);
			} else {
				Crafty.e('Pizza').at(xPos, -64).settype(type);
			}
			this.next();
		}, 500, 0);
	}
});

Crafty.c('Button', {
	init: function() {
		this.requires('Actor, SpriteAnimation, Mouse');
	},
	setup: function(sx, sy, sw) {
		this.animate('norm', sx + sw, sy, sx)
		.animate('over', sx, sy, sx + sw)
		.animate('clik', sx + sw, sy, sx + 2 * sw)
		.animate('unclik', sx + 2 * sw, sy, sx + sw)
		.bind('MouseOver', function() {
			this.animate('over', 1, 0);
		})
		.bind('MouseOut', function() {
			this.animate('norm', 1, 0);
		})
		.bind('MouseDown', function() {
			this.animate('clik', 1, 0);
		})
		.bind('MouseUp', function() {
			this.animate('unclik', 1, 0);
		});
		return this;
	}
});

Crafty.c('Txt', {
	init: function() {
		this.requires('Actor, Text').textFont({size: '24px', family: 'Acme'}).unselectable();
		this.z = 100;
	}
});

Crafty.c('TxtLink', {
	init: function() {
		this.requires('Txt').css({'color': 'white'});
	},
	setup: function(linkID, linkText) {
		this.text("<span id=\"" + linkID + "\"><a href=\"#\" onclick=\"return false;\">" + linkText + "</a></span>");
		return this;
	}
});

Crafty.c('Toast', {
	init: function() {
		this.requires('Txt, Tween').css({'color': 'white'});
		this.tween({alpha: 0.0, y: this.y - 50}, 60);
	}
});

Crafty.c('Countdown', {
	init: function() {
		this.requires('Txt, Delay');
		this.timeLeft = 1200; // 1200 = 120 seconds, in 100 millisecond intervals
	},
	start: function() {
		this.delay(function() {
			if (!window.hasFries) {
				this.timeLeft--;
			}
			var min = Math.floor(this.timeLeft / 600);
			var sec = Math.floor((this.timeLeft / 10) % 60);
			var dec = Math.floor(this.timeLeft % 10);
			var pad = (sec < 10) ? "0" : "";
			this.text(min + ":" + pad + sec + "." + dec + "0");
			if (this.timeLeft == 0) {
				Crafty.trigger('TimesUp', this);
			}
		}, 100, -1);
	}
});

Crafty.c('DaveLogo', {
	init: function() {
		this.requires('Actor, Image, Tween').image("assets/dave-logo.png").at(100, 60);
	},
	bob: function() {
		this.tween({y: (this.y == 80 ? 60 : 80)}, 60).bind('TweenEnd', function() {
			this.unbind('TweenEnd'); // Otherwise we'll end up binding 50 bajillion times and crash
			this.bob();
		});
	}
});