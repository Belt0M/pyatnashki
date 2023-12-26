class GUICore {
	constructor() {
		this.menu = null;
		this.listener = null;
	}

	/* PUBLIC */

	init() {
		this.menu = document.querySelector('.menu-wrapper');

		// Menu button click listener
		const menuBtn = document.querySelector('.menu-btn');
		menuBtn && menuBtn.addEventListener('click', () => this._openMenu());

		const menuClose = document.querySelector('.menu-close');
		menuClose && menuClose.addEventListener('click', () => this._closeMenu());

		// Menu listener
		const menuElements = document.querySelector('#menu-elements');
		menuElements &&
			menuElements.addEventListener('click', e => this.menuController(e));

		// Game over listener
		const gameOver = document.querySelector('.game-over');
		gameOver && gameOver.addEventListener('click', () => this._hideGameOver());
	}

	setListener(lst) {
		if (lst) {
			this.listener = lst;
		}
	}

	showMenu(isCompleted = true) {
		if (this.listener) {
			this.listener.onGUIShowMenu(isCompleted);
		}
	}

	_nextLevel() {
		if (this.listener) {
			this.listener.onGUINextLevel(() => this._hideMenu());
		}
	}

	_prevLevel() {
		if (this.listener) {
			this.listener.onGUIPrevLevel(() => this._hideMenu());
		}
	}

	_restartLevel() {
		if (this.listener) {
			this.listener.onGUIRestartLevel(() => this._hideMenu());
		}
	}

	_exit() {
		if (this.listener) {
			this.listener.onGUIExitMenu(() => this._hideMenu());
		}
	}

	_hideMenu() {
		this.menu.style.display = 'none';
		document.querySelector('.menu-close').style.display = 'none';
	}

	showGameOver() {
		document.querySelector('.game-over').style.display = 'flex';
	}

	_openMenu() {
		if (this.listener) {
			this.listener.onGUIOpenMenu(false);
		}
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

	_hideGameOver() {
		document.querySelector('.game-over').style.display = 'none';
	}

	_closeMenu() {
		this._hideMenu();
		if (this.listener) {
			this.listener.onGUICloseMenu();
		}
	}
}
