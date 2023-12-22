class GUICore {
	constructor(session) {
		this.session = session
		this.menu = document.querySelector('.menu-wrapper')
	}

	menuController(event) {
		const choice = event.target.innerHTML.slice(0, 4).toLowerCase()
		switch (choice) {
			case 'next':
				this.nextLevel()
				break
			case 'prev':
				this.prevLevel()
				break
			case 'rest':
				this.restartLevel()
				break
			case 'exit':
				this.exit()
				break
		}
	}

	nextLevel() {
		if (
			this.session.game.difficulty + 1 <
			this.session.game.params.levels.length
		) {
			this.session.game.difficulty += 1

			// Clear canvas and hide the menu
			this.session.game.clearCanvas()
			this.hideMenu()

			// Update a timer
			this.session.game.remainingTime =
				this.session.game.params.timers[this.session.game.difficulty]
			this.session.game.startTimer()

			// Add a background
			let img = PIXI.Sprite.from(BASE_URL + 'assets/img/background.png')
			this.session.game.app.stage.addChild(img)

			// Draw the new level
			this.session.game.level.getLevel(
				this.session.game.difficulty,
				elements => {
					this.session.game.app.stage.addChild(...elements.flat())
					console.log(this.session.game.level.elements)
				}
			)
		}
	}

	prevLevel() {
		if (this.session.game.difficulty - 1 >= 0) {
			this.session.game.difficulty -= 1

			// Clear canvas and hide the menu
			this.session.game.clearCanvas()
			this.hideMenu()

			// Update a timer
			this.session.game.remainingTime =
				this.session.game.params.timers[this.session.game.difficulty]
			this.session.game.startTimer()

			// Add a background
			let img = PIXI.Sprite.from(BASE_URL + 'assets/img/background.png')
			this.session.game.app.stage.addChild(img)

			// Draw the new level
			this.session.game.level.getLevel(
				this.session.game.difficulty,
				elements => {
					this.session.game.app.stage.addChild(...elements.flat())
				}
			)
		}
	}

	restartLevel() {
		if (this.session.game.difficulty === 0) {
			// Clear canvas and hide the menu
			this.session.game.clearCanvas()
			this.hideMenu()

			// Update a timer
			this.session.game.remainingTime =
				this.session.game.params.timers[this.session.game.difficulty]
			this.session.game.startTimer()

			// Add a background
			let img = PIXI.Sprite.from(BASE_URL + 'assets/img/background.png')
			this.session.game.app.stage.addChild(img)

			// Draw the new level
			this.session.game.level.getLevel(
				this.session.game.difficulty,
				elements => {
					this.session.game.app.stage.addChild(...elements.flat())
				}
			)
		}
	}

	exit() {
		this.session.game.clearCanvas()
		this.session.game.difficulty = 0
		this.hideMenu()
		document.querySelector('.greeting-banner').style.display = 'flex'
	}

	showMenu(isCompleted = true) {
		const next = document.querySelector('#next')
		const prev = document.querySelector('#prev')
		const restart = document.querySelector('#restart')
		if (
			this.session.game.difficulty + 1 ===
			this.session.game.params.levels.length
		) {
			this.showGameOver()
			next.disabled = true
			prev.disabled = false
		} else if (this.session.game.difficulty === 0) {
			next.disabled = !isCompleted ? true : false
			prev.disabled = true
			restart.disabled = false
		} else {
			next.disabled = !isCompleted ? true : false
			prev.disabled = false
			restart.disabled = true
		}
		this.menu.style.display = 'flex'
	}

	hideMenu() {
		this.menu.style.display = 'none'
		document.querySelector('.menu-close').style.display = 'none'
	}

	showGameOver() {
		document.querySelector('.game-over').style.display = 'flex'
	}

	hideGameOver() {
		document.querySelector('.game-over').style.display = 'none'
	}

	openMenu() {
		this.showMenu(false)
		document.querySelector('.menu-close').style.display = 'block'
		this.session.game.stopTimer()
	}

	closeMenu() {
		this.hideMenu()
		this.session.game.startTimer()
	}
}
