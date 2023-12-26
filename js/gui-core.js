class GUICore {
	constructor(session) {
		this.session = session;
		this.menu = null;
	}

	/* PUBLIC */

	init() {
		this.menu = document.querySelector('.menu-wrapper');

		// Menu button click listener
		const menuBtn = document.querySelector('.menu-btn');
		menuBtn && menuBtn.addEventListener('click', () => this.openMenu());

		const menuClose = document.querySelector('.menu-close');
		menuClose && menuClose.addEventListener('click', () => this.closeMenu());

		// Menu listener
		const menuElements = document.querySelector('#menu-elements');
		menuElements &&
			menuElements.addEventListener('click', e => this.menuController(e));

		// Game over listener
		const gameOver = document.querySelector('.game-over');
		gameOver && gameOver.addEventListener('click', () => this.hideGameOver());
	}

	showMenu(isCompleted = true) {
		const next = document.querySelector('#next');
		const prev = document.querySelector('#prev');
		const restart = document.querySelector('#restart');
		if (
			this.session.game.difficulty + 1 ===
			this.session.game.params.levels.length
		) {
			this._showGameOver();
			next.disabled = true;
			prev.disabled = false;
		} else if (this.session.game.difficulty === 0) {
			next.disabled = !isCompleted ? true : false;
			prev.disabled = true;
			restart.disabled = false;
		} else {
			next.disabled = !isCompleted ? true : false;
			prev.disabled = false;
			restart.disabled = true;
		}
		this.menu.style.display = 'flex';
	}

	_nextLevel() {
		const game = this.session.game;

		if (game.difficulty + 1 < game.params.levels.length) {
			game.difficulty += 1;

			// Clear canvas and hide the menu
			console.log(game.level.elements);
			game.clearCanvas();
			this._hideMenu();

			// Add a background
			let img = PIXI.Sprite.from(BASE_URL + 'assets/img/background.png');
			game.app.stage.addChild(img);

			// Draw the new level
			game.level.getLevel(game.difficulty, elements => {
				game.app.stage.addChild(...elements.flat());
				console.table(game.level.elements.map(el => el.map(el2 => el2.type)));
				console.log(game.level.elements);
			});

			// Update a timer
			game.remainingTime = game.params.timers[game.difficulty];
			game.startTimer();
		}
	}

	_prevLevel() {
		const game = this.session.game;

		if (game.difficulty - 1 >= 0) {
			game.difficulty -= 1;

			// Clear canvas and hide the menu
			game.clearCanvas();
			this._hideMenu();

			// Update a timer
			game.remainingTime = game.params.timers[game.difficulty];
			game.startTimer();

			// Add a background
			let img = PIXI.Sprite.from(BASE_URL + 'assets/img/background.png');
			game.app.stage.addChild(img);

			// Draw the new level
			game.level.getLevel(game.difficulty, elements => {
				game.app.stage.addChild(...elements.flat());
			});
		}
	}

	_restartLevel() {
		const game = this.session.game;

		if (game.difficulty === 0) {
			// Clear canvas and hide the menu
			game.clearCanvas();
			this._hideMenu();

			// Update a timer
			game.remainingTime = game.params.timers[game.difficulty];
			game.startTimer();

			// Add a background
			let img = PIXI.Sprite.from(BASE_URL + 'assets/img/background.png');
			game.app.stage.addChild(img);

			// Draw the new level
			game.level.getLevel(game.difficulty, elements => {
				game.app.stage.addChild(...elements.flat());
			});
		}
	}

	_exit() {
		this.session.game.clearCanvas();
		this.session.game.difficulty = 0;
		this._hideMenu();
		document.querySelector('.greeting-banner').style.display = 'flex';
	}

	_hideMenu() {
		this.menu.style.display = 'none';
		document.querySelector('.menu-close').style.display = 'none';
	}

	_showGameOver() {
		document.querySelector('.game-over').style.display = 'flex';
	}

	openMenu() {
		this.showMenu(false);
		document.querySelector('.menu-close').style.display = 'block';
		this.session.game.stopTimer();
	}

	/* LISTENERS METHODS */

	menuController(event) {
		const choice = event.target.innerHTML.slice(0, 4).toLowerCase();
		switch (choice) {
			case 'next':
				this._nextLevel();
				break;
			case 'prev':
				this._prevLevel();
				break;
			case 'rest':
				this._restartLevel();
				break;
			case 'exit':
				this._exit();
				break;
		}
	}

	hideGameOver() {
		document.querySelector('.game-over').style.display = 'none';
	}

	closeMenu() {
		this._hideMenu();
		this.session.game.startTimer();
	}
}
