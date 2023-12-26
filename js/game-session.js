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

	onGUIShowMenu(isCompleted = false) {
		const next = document.querySelector('#next');
		const prev = document.querySelector('#prev');
		const restart = document.querySelector('#restart');
		if (this.game.difficulty + 1 === this.game.params.levels.length) {
			this.gui.showGameOver();
			next.disabled = true;
			prev.disabled = false;
		} else if (this.game.difficulty === 0) {
			next.disabled = !isCompleted ? true : false;
			prev.disabled = true;
			restart.disabled = false;
		} else {
			next.disabled = !isCompleted ? true : false;
			prev.disabled = false;
			restart.disabled = true;
		}
		document.querySelector('.menu-wrapper').style.display = 'flex';
	}

	onGUIOpenMenu(isCompleted) {
		this.onGUIShowMenu(isCompleted);
		document.querySelector('.menu-close').style.display = 'block';
		this.game.stopTimer();
	}

	onGUICloseMenu() {
		this.game.startTimer();
	}

	onGUIExitMenu(callback) {
		this.game.clearCanvas();
		this.game.difficulty = 0;
		callback();
		document.querySelector('.greeting-banner').style.display = 'flex';
	}

	onGUINextLevel(callback) {
		if (this.game.difficulty + 1 < this.game.params.levels.length) {
			this.game.difficulty += 1;

			// Clear canvas and hide the menu
			this.game.clearCanvas();
			callback();

			// Add a background
			let img = PIXI.Sprite.from(BASE_URL + 'assets/img/background.png');
			this.game.app.stage.addChild(img);

			// Draw the new level
			this.game.level.getLevel(this.game.difficulty, elements => {
				this.game.app.stage.addChild(...elements.flat());
				console.table(
					this.game.level.elements.map(el => el.map(el2 => el2.type))
				);
			});

			// Update a timer
			this.game.remainingTime = this.game.params.timers[this.game.difficulty];
			this.game.startTimer();
		}
	}

	onGUIPrevLevel(callback) {
		if (this.game.difficulty - 1 >= 0) {
			this.game.difficulty -= 1;

			// Clear canvas and hide the menu
			this.game.clearCanvas();
			callback();

			// Update a timer
			this.game.remainingTime = this.game.params.timers[this.game.difficulty];
			this.game.startTimer();

			// Add a background
			let img = PIXI.Sprite.from(BASE_URL + 'assets/img/background.png');
			this.game.app.stage.addChild(img);

			// Draw the new level
			this.game.level.getLevel(this.game.difficulty, elements => {
				this.game.app.stage.addChild(...elements.flat());
			});
		}
	}

	onGUIRestartLevel(callback) {
		if (this.game.difficulty === 0) {
			// Clear canvas and hide the menu
			this.game.clearCanvas();
			callback();

			// Update a timer
			this.game.remainingTime = this.game.params.timers[this.game.difficulty];
			this.game.startTimer();

			// Add a background
			let img = PIXI.Sprite.from(BASE_URL + 'assets/img/background.png');
			this.game.app.stage.addChild(img);

			// Draw the new level
			this.game.level.getLevel(this.game.difficulty, elements => {
				this.game.app.stage.addChild(...elements.flat());
			});
		}
	}

	_initGame() {
		this.game = new Game();
		if (this.game) {
			this.game.init();
			this.game.setListener(this);
		}
	}

	_initGUI() {
		this.gui = new GUICore();

		if (this.gui) {
			this.gui.init();
			this.gui.setListener(this);
		}
	}
}
