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

class Element {
	constructor(x, y, type) {
		this.x = x
		this.y = y
		this.type = type
	}

	getPosition() {
		return {
			x: this.x * this.size,
			y: this.y * this.size,
		}
	}

	getType() {
		return this.type
	}

	moveTo(x, y) {
		this.x = x
		this.y = y
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
		let img = PIXI.Sprite.from('/assets/img/background.png')
		img.width = 1024
		img.height = 768
		this.app.stage.addChild(img)

		this.levelManager = new LevelManager()
		this.level = this.levelManager.getLevel(0)

		this.boardElements = []
		this.generateBoard()
		// this.app.stage.addChild(...this.boardElements)

		// this.app.stage.on('click', event => this.handleClick(event))
	}

	generateBoard() {
		const matrix = this.board
		for (let row = 0; row < matrix.length; row++) {
			for (let el = 0; el < matrix[row].length; el++) {
				let newEl
				switch (matrix[row][el]) {
					case 0:
						newEl = PIXI.Sprite.from('/assets/sprites/main.png')
						break
					case 1:
						newEl = PIXI.Sprite.from('/assets/sprites/cell.png')
						break
					case 'fire':
						newEl = PIXI.Sprite.from('/assets/sprites/cell1.png')
						break
					case 'water':
						newEl = PIXI.Sprite.from('/assets/sprites/cell2.png')
						break
					case 'earth':
						newEl = PIXI.Sprite.from('/assets/sprites/cell3.png')
						break
					case 'air':
						newEl = PIXI.Sprite.from('/assets/sprites/cell4.png')
						break
				}

				if (newEl) {
					newEl.position.set(200 + el * TILE_SIZE, 100 + row * TILE_SIZE)
					this.app.stage.addChild(newEl)
				}
			}
		}
		console.log(this.boardElements)
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

	update() {}

	start() {
		this.app.ticker.add(() => {
			game.update()
		})
	}
}

const game = new Game()
game.start()
