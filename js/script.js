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
		this.board = board
		// Init the Pixi canvas
		this.app = new PIXI.Application({
			width: 1024,
			height: 768,
			backgroundAlpha: 0,
		})

		this.gameField.appendChild(this.app.view)

		// Set canvas background image
		// let img = PIXI.Sprite.from('/assets/img/background.png')
		// img.width = 1024
		// img.height = 768
		// this.app.stage.addChild(img)

		this.levelManager = new LevelManager()
		this.level = this.levelManager.getLevel(0)

		this.boardElements = []
		this.levelElements = []
		this.activeElement = null

		this.generateBoard()
		this.generateLevelElements()
		console.log(this.levelElements)
	}

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
					newEl.position.set(200 + el * TILE_SIZE, 100 + row * TILE_SIZE)
					this.app.stage.addChild(newEl)
				}
			}
		}
	}

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
					newEl.position.set(200 + el * TILE_SIZE, 100 + row * TILE_SIZE)
					this.app.stage.addChild(newEl)
				}
			}
		}
	}

	handleClick(event) {
		const element = this.boardElements.find(element =>
			element.getPosition().contains(event.data.global)
		)

		if (element.type !== 'empty') {
			element.moveTo(
				event.data.global.x / this.size,
				event.data.global.y / this.size
			)

			if (this.isFinished()) {
				this.app.stop()
			}
		}
	}

	isFinished() {
		for (const element of this.boardElements) {
			if (element.type !== 'empty' && element.x !== element.type - 1) {
				return false
			}
		}

		return true
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

		if (element) {
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
		if (this.activeElement) {
			// Calculate mouse and current element delta
			const deltaX =
				event.clientX -
				this.gameField.offsetLeft -
				this.activeElement.position.x
			const deltaY =
				event.clientY - this.gameField.offsetTop - this.activeElement.position.y

			// Check if the movement is horizontal or vertical
			const isHorizontalMovement = Math.abs(deltaX) > Math.abs(deltaY)
			const isVerticalMovement = Math.abs(deltaY) > Math.abs(deltaX)

			// Check collisions
			if (this.checkCollision()) return

			// Update the element's position based on the movement direction
			if (isHorizontalMovement) {
				const sign = Math.sign(deltaX)
				if (deltaX > sign * TILE_SIZE)
					this.activeElement.position.x += sign * TILE_SIZE
			} else if (isVerticalMovement) {
				const sign = Math.sign(deltaY)
				if (deltaY > sign * TILE_SIZE) {
					this.activeElement.position.y += sign * TILE_SIZE
				}
			}
		}
	}

	checkCollision() {
		// Check for collisions with board elements
		for (const element of this.boardElements) {
			if (
				element.type === 0 &&
				element.getBounds().contains(this.activeElement.position)
			) {
				return true
			}
		}

		// Check for collisions with level elements
		for (const element of this.levelElements) {
			if (
				element.type === 'block' &&
				element.getBounds().contains(this.activeElement.position)
			) {
				return true
			}
		}
		return false
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
