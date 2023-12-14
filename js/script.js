import board from '/matrices/board.json' assert { type: 'json' }
import levels from '/matrices/levels.json' assert { type: 'json' }

const TILE_SIZE = 70

class LevelManager {
	constructor() {
		this.levels = levels
	}

	getLevel(difficulty) {
		return this.levels[difficulty].matrix
	}
}

class Game {
	constructor() {
		this.gameField = document.querySelector('.game-field')
		this.menu = document.querySelector('.menu-wrapper')

		this.board = board
		// Init the Pixi canvas
		this.app = new PIXI.Application({
			width: 1024,
			height: 768,
			backgroundAlpha: 0,
		})

		this.gameField.appendChild(this.app.view)

		this.levelManager = new LevelManager()
		this.level = this.levelManager.getLevel(0)

		this.boardElements = []
		this.levelElements = []
		this.completedElements = {
			water: false,
			fire: false,
			earth: false,
			air: false,
		}
		this.activeElement = null

		this.generateBoard()
		this.generateLevelElements()
	}

	// Generate common board structure
	generateBoard() {
		const matrix = this.board
		for (let row = 0; row < matrix.length; row++) {
			for (let el = 0; el < matrix[row].length; el++) {
				const value = matrix[row][el]
				let newEl

				if (typeof value === 'string') {
					newEl = PIXI.Sprite.from(`/assets/sprites/${value}.png`)
					newEl.alpha = 0.5
				} else {
					switch (value) {
						case 1:
							newEl = PIXI.Sprite.from(`/assets/sprites/cell.png`)
							break
						case 0:
							newEl = PIXI.Sprite.from(`/assets/sprites/main.png`)
							newEl.alpha = 0
							break
					}
				}

				if (newEl) {
					newEl.type = value
					this.boardElements.push(newEl)
					newEl.position.set(125 + el * TILE_SIZE, 55 + row * TILE_SIZE)
					this.app.stage.addChild(newEl)
				}
			}
		}
	}

	// Generate 4 level elements, stones and wood blocks
	generateLevelElements() {
		const matrix = this.level
		for (let row = 0; row < matrix.length; row++) {
			for (let el = 0; el < matrix[row].length; el++) {
				const value = matrix[row][el]
				let newEl
				if (typeof value === 'string') {
					newEl = PIXI.Sprite.from(`/assets/sprites/${value}.png`)
				}

				if (newEl) {
					newEl.type = value
					this.levelElements.push(newEl)
					newEl.position.set(125 + el * TILE_SIZE, 55 + row * TILE_SIZE)
					this.app.stage.addChild(newEl)
				}
			}
		}
	}

	// Find dragged element
	findSelectedElement(event) {
		return this.levelElements.find(
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
		const elementsArray = ['block', 'water', 'fire', 'earth', 'air']
		elementsArray.splice(elementsArray.indexOf(this.activeElement.type), 1)

		// Check for collisions with board elements and is the element completed
		for (const element of this.boardElements) {
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
		for (const element of this.levelElements) {
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

	showMenu() {
		this.menu.style.display = 'flex'
	}

	update() {}

	start() {
		this.app.ticker.add(() => {
			game.update()
		})
	}
}

// Init the game start
const game = new Game()
game.start()

// Mouse listeners
game.app.view.addEventListener('mousedown', game.handleMouseDown.bind(game))
game.app.view.addEventListener('mouseup', game.handleMouseUp.bind(game))
game.app.view.addEventListener('mousemove', game.handleMouseMove.bind(game))
