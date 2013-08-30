Game = {
	start: function() {
		window.sag = new Sagittarius('sagittarius-test', 'password');
		Crafty.init(640, 480);
		Crafty.scene('Loading');
	}
}