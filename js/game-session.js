class GameSession {
	constructor() {
		this.game = null;
		this.gui = null;
	}

	/* PRIVATE */

	init() {
		this._initGame();
		this._initGUI();
	}

	_initGame() {
		this.game = new Game();
		this.game.init();
	}

	_initGUI() {
		this.gui = new GUICore(this);
		this.gui.init();
	}
}
