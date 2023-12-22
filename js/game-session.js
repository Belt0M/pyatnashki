class GameSession {
	constructor() {
		this.game = new Game();
		this.gui = new GUICore(this);

		this._init();
	}

	/* PRIVATE */

	_init() {
		// Start game listener
		document
			.querySelector('.greeting-banner span')
			.addEventListener('click', () => this.game.startGame());

		// Menu button click listener
		document
			.querySelector('.menu-btn')
			.addEventListener('click', this.gui.openMenu.bind(this.gui));

		document
			.querySelector('.menu-close')
			.addEventListener('click', this.gui.closeMenu.bind(this.gui));

		// Mouse listeners
		this.game.app.view.addEventListener(
			'mousedown',
			this.game.onMouseDown.bind(this.game)
		);
		this.game.app.view.addEventListener(
			'mouseup',
			this.game.onMouseUp.bind(this.game)
		);
		this.game.app.view.addEventListener(
			'mousemove',
			this.game.onMouseMove.bind(this.game)
		);

		// Menu listener
		document
			.querySelector('#menu-elements')
			.addEventListener('click', this.gui.menuController.bind(this.gui));

		// Game over listener
		document
			.querySelector('.game-over')
			.addEventListener('click', () => this.gui.hideGameOver());
	}
}
