Crafty.scene('Menu', function() {
	// Just to be sure we've got a clean slate
	Crafty.audio.stop();
	Crafty.audio.play('menumusic', -1);

	Crafty.e('DaveLogo').bob();

	var playTxt = Crafty.e('TxtLink').textFont({size: '36px'}).size(210, 50).at(5, 320).setup("playtxt", "Play");
	var leaderTxt = Crafty.e('TxtLink').textFont({size: '36px'}).size(210, 50).at(215, 320).setup("leadertxt", "Leaderboards");
	var creditsTxt = Crafty.e('TxtLink').textFont({size: '36px'}).size(210, 50).at(425, 320).setup("creditstxt", "Credits");

	Crafty.DrawManager.draw();
	document.getElementById('playtxt').onclick = function() {
		Crafty.scene('Game');
	};
	document.getElementById('leadertxt').onclick = function() {
		Crafty.scene('Leaderboards');
	};
	document.getElementById('creditstxt').onclick = function() {
		Crafty.scene('Credits');
	};
});

Crafty.scene('Leaderboards', function() {
	Crafty.e('Txt').textFont({size: '36px'}).size(600, 40).at(20, 20).css({'color': 'white', 'text-align': 'left'})
	.text("Leaderboards");
	var lb = Crafty.e('Txt').textFont({size: '18px'}).size(560, 260).at(40, 80).css({'color': 'white', 'text-align': 'left'}).text("Loading...");
	window.sag.GetLeaderboard({name: 'davelb1', callback: function(response) {
		var data = JSON.parse(response.replace("<resp>", "").replace("</resp>", "")).data;
		var table = '';
		// We only want the top 10 (to look nice)
		for (var i = 0; i < Math.min(data.length, 10); i++) {
			table += ("<tr><td>" + data[i].sid + "</td><td>" + data[i].score + "</td></tr>");
		}
		lb.text("<table width=\"560\">" + table + "</table>");
	}});
	var backTxt = Crafty.e('TxtLink').textFont({size: '36px'}).size(150, 50).at(0, 420).setup("backtxt", "&larr; Back");
	Crafty.DrawManager.draw();
	document.getElementById('backtxt').onclick = function() {
		Crafty.scene('Menu');
	};
});

Crafty.scene('Credits', function() {
	Crafty.e('Txt').textFont({size: '36px'}).size(600, 40).at(20, 20).css({'color': 'white', 'text-align': 'left'})
	.text("Credits");
	Crafty.e('Txt').textFont({size: '18px'}).size(560, 260).at(40, 80).css({'color': 'white', 'text-align': 'left'})
	.text("An HTML5 game written in JavaScript over the course of one week."
		+ "<br>"
		+ "<br>&ldquo;Wah Game Loop&rdquo; &amp; &ldquo;Funk Game Loop&rdquo; by Kevin MacLeod (<a href=\"http://incompetech.com/\">incompetech.com</a>)"
		+ "<br>Various sound effects from <a href=\"http://www.freesound.org/\">freesound.org</a>"
		+ "<br>"
		+ "<br>Powered by:"
		+ "<br>"
		+ "<br><a href=\"http://craftyjs.com/\"><img src=\"assets/crafty-logo.png\" /></a>"
		+ "<a href=\"http://sagittarius-ogs.appspot.com/\"><img src=\"assets/sag-logo.png\" /></a>");
	var backTxt = Crafty.e('TxtLink').textFont({size: '36px'}).size(150, 50).at(0, 420).setup("backtxt", "&larr; Back");
	Crafty.DrawManager.draw();
	document.getElementById('backtxt').onclick = function() {
		Crafty.scene('Menu');
	};
});

Crafty.scene('Game', function() {
	// Just to be sure we've got a clean slate
	Crafty.audio.stop();
	Crafty.audio.play('gamemusic', -1);

	// Initialize global variables (is there a better way to do it...?)
	window.hasPowerup = false;
	window.hasBacon = false;
	window.hasMuffin = false;
	window.hasFries = false;
	window.hasMelon = false;
	window.hasDonut = false;

	var scoreTxt = Crafty.e('Txt').size(320, 50).at(8, 5).text("Score: 0").css({'color': 'white', 'text-align': 'left'});
	var timerTxt = Crafty.e('Countdown').size(190, 50).at(400, 5).text("2:00.00").css({'color': 'white', 'text-align': 'right'});

	var score = 0;

	var pauseButton = Crafty.e('Button, pauseNorm').at(600, 8).setup(0, 0, 1).bind('Click', function() {
		if (Crafty.isPaused()) {
			return;
		}
		var resumeTxt = Crafty.e('TxtLink').size(320, 50).at(160, 200).setup("resumetxt", "Resume");
		var menuTxt = Crafty.e('TxtLink').size(320, 50).at(160, 240).setup("menutxt", "Back to Menu");

		// This is necessary, otherwise the game is paused before the next screen update
		Crafty.DrawManager.draw();
		document.getElementById('resumetxt').onclick = function() {
			resumeTxt.destroy();
			menuTxt.destroy();
			Crafty.pause();
			Crafty.audio.togglePause('gamemusic');
		};
		document.getElementById('menutxt').onclick = function() {
			Crafty.scene('Menu');
		};
		Crafty.pause();
		Crafty.audio.togglePause('gamemusic');
	});
	pauseButton.z = 100;

	Crafty.e('Ground, ground');
	Crafty.e('Solid').size(20, 400).at(-20, 0);
	Crafty.e('Solid').size(20, 400).at(640, 0);
	Crafty.e('Solid').size(640, 20).at(0, -20);
	var player = Crafty.e('Player').at(0, 336).gravity('ground').gravityConst(0.5);
	var pizzaManager = Crafty.e('PizzaManager');

	this.bind('PizzaEaten', function(data) {
		var add = 1;
		if (data == 'supreme') {
			add = 5;
		} else if (data == 'veggie') {
			add = 3;
		} else if (data == 'pepperoni') {
			add = 2;
		}
		if (window.hasDonut) {
			add *= 2;
		}
		score += add;
		scoreTxt.text("Score: " + score);
	});

	this.bind('TimesUp', function() {
		timerTxt.destroy();
		pauseButton.destroy();
		pizzaManager.destroy();
		Crafty.e('Toast').textFont({size: '48px'}).size(200, 50).at(220, 200).text("Time's Up!")
		.bind('TweenEnd', function(prop) {
			// Needed because we are tweening on two properties, so this will be triggered twice!
			if (prop == "alpha") {
				return;
			}
			// Disable player input, as it interferes with typing to submit score (and stop player)
			player.disableControl();
			player.trigger('NewDirection', {x: 0, y: 0});
			player._speed = 0;

			scoreTxt.destroy();
			Crafty.e('Txt').textFont({size: '72px'}).size(600, 80).at(20, 20).css({'color': 'white'}).text("Score: " + score);

			var submitTxt = Crafty.e('TxtLink').textFont({size: '36px'}).size(210, 50).at(5, 220).setup("submittxt", "Submit Score");
			var againTxt = Crafty.e('TxtLink').textFont({size: '36px'}).size(210, 50).at(215, 220).setup("againtxt", "Play Again");
			var backFromTxt = Crafty.e('TxtLink').textFont({size: '36px'}).size(210, 50).at(425, 220).setup("backfromtxt", "Back to Menu");

			var inputTxt = Crafty.e('Txt').textFont({size: '18px'}).size(210, 50).at(5, 160).css({'color': 'white'})
			.text("Name: <input class=\"lineinput\" id=\"playername\" type=\"text\" maxlength=\"20\"></input>");

			Crafty.DrawManager.draw();
			document.getElementById('submittxt').onclick = function() {
				// We null out submitting again immediately to prevent multiple clicks
				document.getElementById('playername').disabled = true;
				document.getElementById('submittxt').onclick = function() {
					return false;
				}
				submitTxt.text("Submitting...");
				window.sag.PostToLeaderboard({
					name: 'davelb1',
					score: score,
					scoreid: document.getElementById('playername').value,
					callback: function(response) {
					submitTxt.text("Success!");
				}});
			};
			document.getElementById('againtxt').onclick = function() {
				Crafty.scene('Game');
			};
			document.getElementById('backfromtxt').onclick = function() {
				Crafty.scene('Menu');
			};
		});
	});

	// Ready to start everything (countdown)!
	var count = 3;
	Crafty.e('Delay').delay(function() {
		var countText = count;
		if (count == 0) {
			countText = "Go!";
			timerTxt.start();
			pizzaManager.start();
		}
		Crafty.e('Toast').textFont({size: '48px'}).size(200, 50).at(220, 200).text(countText);
		count--;
	}, 1000, 3);

}, function() {
	// REALLY important. Otherwise if the game is run twice, the bind happens twice and we get double fn() calls
	this.unbind('PizzaEaten');
	this.unbind('TimesUp');
});

Crafty.scene('Loading', function() {
	Crafty.e('Txt').size(320, 50).at(160, 200).text("Loading...");
	Crafty.load([
		'assets/bg.png',
		'assets/sprite.png',
		'assets/dave-sprite.png',
		'assets/dave-logo.png',
		'assets/funk_game_loop.mp3', 'assets/funk_game_loop.ogg',
		'assets/wah_game_loop.mp3', 'assets/wah_game_loop.ogg',
		'assets/chomp.mp3', 'assets/chomp.ogg',
		'assets/burp.mp3', 'assets/burp.ogg',
		'assets/splat.mp3', 'assets/splat.ogg',
		'assets/powerup.mp3', 'assets/powerup.ogg',
		'assets/powerdown.mp3', 'assets/powerdown.ogg'], function() {
		Crafty.background("url('assets/bg.png') no-repeat");
		Crafty.sprite(32, 'assets/sprite.png', {
			pauseNorm: [0, 0, 1, 1],
			pauseOver: [1, 0, 1, 1],
			pauseClik: [2, 0, 1, 1]
		});
		Crafty.sprite(64, 'assets/sprite.png', {
			cheese: [0, 1, 1, 1],
			pepperoni: [0, 2, 1, 1],
			veggie: [0, 3, 1, 1],
			supreme: [0, 4, 1, 1],
			bacon: [0, 5, 1, 1],
			muffin: [0, 6, 1, 1],
			fries: [0, 7, 1, 1],
			melon: [0, 8, 1, 1],
			donut: [0, 9, 1, 1]
		});
		Crafty.sprite(64, 'assets/dave-sprite.png', {
			daveNorm: [0, 0, 1, 1]
		});
		Crafty.audio.add({
			gamemusic: ['assets/funk_game_loop.mp3', 'assets/funk_game_loop.ogg'],
			menumusic: ['assets/wah_game_loop.mp3', 'assets/wah_game_loop.ogg'],
			chomp: ['assets/chomp.mp3', 'assets/chomp.ogg'],
			burp: ['assets/burp.mp3', 'assets/burp.ogg'],
			splat: ['assets/splat.mp3', 'assets/splat.ogg'],
			powerup: ['assets/powerup.mp3', 'assets/powerup.ogg'],
			powerdown: ['assets/powerdown.mp3', 'assets/powerdown.ogg']
		});
		Crafty.scene('Menu');
	});
});