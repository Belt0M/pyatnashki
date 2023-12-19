class GameSession {
	constructor() {
		this.game = new Game()
		this.gui = new GUICore(this)

		// Start game listener
		document
			.querySelector('.greeting-banner span')
			.addEventListener('click', () => this.game.startGame())

		// Mouse listeners
		this.game.app.view.addEventListener(
			'mousedown',
			this.game.handleMouseDown.bind(this.game)
		)
		this.game.app.view.addEventListener(
			'mouseup',
			this.game.handleMouseUp.bind(this.game)
		)
		this.game.app.view.addEventListener(
			'mousemove',
			this.game.handleMouseMove.bind(this.game)
		)

		// Menu listener
		document
			.querySelector('#menu-elements')
			.addEventListener('click', this.gui.menuController.bind(this.gui))

		// Game over listener
		document
			.querySelector('.game-over')
			.addEventListener('click', () => this.gui.hideGameOver())
	}
}
