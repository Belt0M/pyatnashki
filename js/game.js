class Game {
	constructor() {
		// Init the Pixi canvas
		this.app = new PIXI.Application({
			width: 1024,
			height: 768,
			backgroundAlpha: 0,
		})

		this.gameField = document.querySelector('.game-field')
		this.menu = document.querySelector('.menu-wrapper')

		this.gameField.appendChild(this.app.view)

		this.completedElements = {
			water: false,
			fire: false,
			earth: false,
			air: false,
		}
		this.activeElement = null
	}

	async startGame() {
		// Generate and add to the scene the board elements
		console.log(`${/(.*)\//.exec(window.document.location.href)[0]}`)
		this.board = new Board()
		await this.board.doGET(
			`${/(.*)\//.exec(window.document.location.href)[0]}/matrices/board.json`
		)

		this.level = new LevelManager()
		await this.level.doGET(
			`${/(.*)\//.exec(window.document.location.href)[0]}/matrices/levels.json`
		)

		console.log(this.board.elements)
		this.board.generateBoard()
		this.app.stage.addChild(...this.board.elements)

		// Generate and add the level elements to the scene
		this.difficulty = 0
		this.level.generateLevelElements(this.level.getLevel(this.difficulty))
		this.app.stage.addChild(...this.level.elements)
	}

	// Find dragged element
	findSelectedElement(event) {
		return this.level.elements.find(
			element =>
				element.x <= event.clientX - this.gameField.offsetLeft &&
				element.getBounds().x + TILE_SIZE >=
					event.clientX - this.gameField.offsetLeft &&
				element.y <= event.clientY - this.gameField.offsetTop &&
				element.getBounds().y + TILE_SIZE >=
					event.clientY - this.gameField.offsetTop
		)
	}

	// Om mouse down select element for future movements
	handleMouseDown(event) {
		const element = this.findSelectedElement(event)

		if (element && element.type !== 'block') {
			this.activeElement = element
			this.activeElement.alpha = 0.75
		}
	}

	// On mouse up reset the active element
	handleMouseUp() {
		if (this.activeElement) {
			this.activeElement.alpha = 1
			this.activeElement = null
		}
	}

	// Element movements handling on mouse move
	handleMouseMove(event) {
		// Checking if an active element exists and not yet completed
		if (
			this.activeElement &&
			!this.completedElements[this.activeElement.type]
		) {
			// Calculate the mouse and the delta of the current element
			const deltaX =
				event.clientX -
				this.gameField.offsetLeft -
				this.activeElement.position.x
			const deltaY =
				event.clientY - this.gameField.offsetTop - this.activeElement.position.y

			// Check if the movement is horizontal or vertical
			const isHorizontalMovement = Math.abs(deltaX) > Math.abs(deltaY)
			const isVerticalMovement = Math.abs(deltaY) > Math.abs(deltaX)

			// Update the element's position based on the movement direction
			const activeElPosition = this.activeElement.position
			if (isHorizontalMovement) {
				const sign = Math.sign(deltaX)
				if (deltaX > sign * TILE_SIZE) {
					// Check collision
					if (
						this.checkCollision(
							activeElPosition.x + sign * TILE_SIZE,
							activeElPosition.y
						)
					) {
						return
					}

					activeElPosition.x += sign * TILE_SIZE
				}
			} else if (isVerticalMovement) {
				const sign = Math.sign(deltaY)
				if (deltaY > sign * TILE_SIZE) {
					// Check collision
					if (
						this.checkCollision(
							activeElPosition.x,
							activeElPosition.y + sign * TILE_SIZE
						)
					) {
						return
					}

					activeElPosition.y += sign * TILE_SIZE
				}
			}
		}
	}

	// Check for collisions with prohibited items for passage
	checkCollision(x, y) {
		// Create array with all level elements except active one
		const elementsArray = ['block', 'wood', 'water', 'fire', 'earth', 'air']
		this.activeElement.type !== 'wood' &&
			elementsArray.splice(elementsArray.indexOf(this.activeElement.type), 1)

		// Check for collisions with board elements and is the element completed
		for (const element of this.board.elements) {
			if (element.type === 0 && element.x === x && element.y === y) {
				return true
			} else if (
				element.x === x &&
				element.y === y &&
				element.type === this.activeElement.type
			) {
				this.completedElements[element.type] = true
				// Check whether all elements are completed
				this.checkIsLevelCompleted()
			}
		}

		// Check for collisions with level elements
		for (const element of this.level.elements) {
			if (
				elementsArray.includes(element.type) &&
				element.x === x &&
				element.y === y
			) {
				return true
			}
		}
		return false
	}

	checkIsLevelCompleted() {
		const allElementsCompleted = Object.values(this.completedElements).every(
			element => element === true
		)
		if (allElementsCompleted) {
			this.showMenu()
		}
	}

	showGameOver() {
		document.querySelector('.game-over').style.display = 'flex'
	}

	showMenu() {
		if (this.difficulty + 1 >= this.level.levels.length) {
			this.showGameOver()
			document.querySelector('#next').disabled = true
			document.querySelector('#prev').disabled = false
		} else if (this.difficulty === 0) {
			document.querySelector('#next').disabled = false
			document.querySelector('#prev').disabled = true
		} else {
			document.querySelector('#next').disabled = false
			document.querySelector('#prev').disabled = false
		}
		this.menu.style.display = 'flex'
	}

	hideMenu() {
		this.menu.style.display = 'none'
	}

	clearCanvas() {
		this.app.stage.children = []
		this.board.elements = []
		this.level.elements = []
		this.completedElements = {
			air: false,
			earth: false,
			fire: false,
			water: false,
		}
	}

	nextLevel() {
		if (this.difficulty + 1 <= this.level.levels.length) {
			this.difficulty += 1
			this.clearCanvas()
			this.hideMenu()

			this.board.generateBoard()
			this.level.generateLevelElements(this.level.getLevel(this.difficulty))

			this.app.stage.addChild(...this.board.elements)
			this.app.stage.addChild(...this.level.elements)
		}
	}

	prevLevel() {
		if (this.difficulty - 1 >= 0) {
			this.difficulty -= 1
			this.clearCanvas()
			this.hideMenu()

			this.board.generateBoard()
			this.level.generateLevelElements(this.level.getLevel(this.difficulty))

			this.app.stage.addChild(...this.board.elements)
			this.app.stage.addChild(...this.level.elements)
		}
	}

	exit() {
		this.clearCanvas()
		this.difficulty = 0
		this.hideMenu()
		document.querySelector('.greeting-banner').style.display = 'flex'
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
			case 'exit':
				this.exit()
				break
		}
	}

	update() {}

	start() {
		this.app.ticker.add(() => {
			this.update()
		})
	}
}
