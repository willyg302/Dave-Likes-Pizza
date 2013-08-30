Game = {
	start: function() {
		window.sag = new Sagittarius('sagittarius-test', 'password');
		Crafty.init(640, 480);
		Crafty.background("url('assets/bg.png') no-repeat");
		Crafty.scene('Loading');
	}
}