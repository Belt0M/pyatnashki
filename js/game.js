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

			this.session.game.clearCanvas()
			this.hideMenu()

			// Update timer
			this.session.game.remainingTime =
				this.session.game.params.timers[this.session.game.difficulty]
			this.session.game.startTimer()

			this.session.game.level.getLevel(
				this.session.game.difficulty,
				elements => {
					this.session.game.app.stage.addChild(...elements)
				}
			)
		}
	}

	prevLevel() {
		if (this.session.game.difficulty - 1 >= 0) {
			this.session.game.difficulty -= 1

			this.session.game.clearCanvas()
			this.hideMenu()

			// Update timer
			this.session.game.remainingTime =
				this.session.game.params.timers[this.session.game.difficulty]
			this.session.game.startTimer()

			this.session.game.level.getLevel(
				this.session.game.difficulty,
				elements => {
					this.session.game.app.stage.addChild(...elements)
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

	showMenu() {
		if (
			this.session.game.difficulty + 1 ===
			this.session.game.params.levels.length
		) {
			this.showGameOver()
			document.querySelector('#next').disabled = true
			document.querySelector('#prev').disabled = false
		} else if (this.session.game.difficulty === 0) {
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

	showGameOver() {
		document.querySelector('.game-over').style.display = 'flex'
	}

	hideGameOver() {
		document.querySelector('.game-over').style.display = 'none'
	}
}

class Game {
	constructor() {
		// Init the Pixi canvas
		this.app = new PIXI.Application({
			width: 1024,
			height: 768,
			backgroundAlpha: 0,
		})

		this.gameField = document.querySelector('.game-field')

		this.gameField.appendChild(this.app.view)

		this.fetchParams(`${BASE_URL}/matrices/game.json`, () => {
			this.completedElements = {
				4: false,
				5: false,
				6: false,
				7: false,
			}

			this.activeElement = null
		})

		this.sprites = {}

		this.timer = null
		this.timerBody = document.querySelector('.game-timer')
	}

	// Start - stop timer functionality
	startTimer() {
		this.timer = setInterval(() => {
			this.remainingTime--

			const min = Math.floor(this.remainingTime / 60)
			const sec = this.remainingTime - 60 * min
			this.timerBody.innerHTML = `${min < 10 ? '0' + min : min}:${
				sec < 10 ? '0' + sec : sec
			}`

			if (this.remainingTime <= 0) {
				this.stopTimer()
				game.gui.showMenu()
			}
		}, 1000)
	}

	stopTimer() {
		clearInterval(this.timer)
	}

	// Start the game method
	startGame() {
		document.querySelector('.greeting-banner').style.display = 'none'
		this.level = new LevelManager()
		this.level.urls = this.params.levels
		this.level.enums = this.params.elements

		// Generate and add the level elements to the scene
		this.difficulty = 0
		this.level.getLevel(this.difficulty, elements => {
			this.app.stage.addChild(...elements)
		})

		this.remainingTime = this.params.timers[this.difficulty]
		this.startTimer() // Start the timer when the game starts
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
					event.clientY - this.gameField.offsetTop &&
				element.zOrder !== -5 &&
				element.alpha === 1 &&
				element.type !== 1
		)
	}

	// Om mouse down select element for future movements
	handleMouseDown(event) {
		const element = this.findSelectedElement(event)
		const enums = this.params.elements
		const allowedElements = [
			enums.wood.id,
			enums.air.id,
			enums.water.id,
			enums.fire.id,
			enums.earth.id,
		]

		if (element && allowedElements.includes(element.type)) {
			this.activeElement = element
			this.activeElement.alpha = 0.75
		}
	}

	// On mouse up reset the active element
	handleMouseUp() {
		this.stopFollowing()
		if (this.activeElement) {
			let diffX = Math.abs(this.activeElement.x - 55) % TILE_SIZE
			let diffY = Math.abs(this.activeElement.y - 35) % TILE_SIZE
			// Transfer the element to the nearest cell
			if (diffX !== 0) {
				const sign = diffX >= TILE_SIZE / 2 ? 1 : -1
				diffX = sign > 0 ? TILE_SIZE - diffX : diffX
				if (
					!this.checkCollision(
						this.activeElement.x + diffX * sign,
						this.activeElement.y
					)
				) {
					this.activeElement.x += diffX * sign
				}
			} else if (diffY !== 0) {
				const sign = diffY >= TILE_SIZE / 2 ? 1 : -1
				diffY = sign > 0 ? TILE_SIZE - diffY : diffY

				if (
					!this.checkCollision(
						this.activeElement.x,
						this.activeElement.y + diffY * sign
					)
				) {
					this.activeElement.y += diffY * sign
				}
			}
			this.activeElement.alpha = 1
			this.activeElement = null
		}
	}

	followCursor() {
		if (game.game.activeElement) {
			const elemX = Number(game.game.activeElement.x.toFixed(3))
			const elemY = Number(game.game.activeElement.y.toFixed(3))
			const dirX = Math.sign(game.game.cursorX - elemX)
			const dirY = Math.sign(game.game.cursorY - elemY)
			const multiplier = 0.05

			const formattedX = Math.ceil(
				game.game.cursorX - ((game.game.cursorX - 55) % TILE_SIZE)
			)
			const formattedY = Math.ceil(
				game.game.cursorY - ((game.game.cursorY - 35) % TILE_SIZE)
			)
			if (
				elemX !== formattedX &&
				!game.game.checkCollision(elemX + multiplier * dirX, elemY) &&
				(game.game.activeElement.y - 35) % TILE_SIZE === 0
			) {
				console.log('x')
				let temp = elemX + multiplier * dirX
				game.game.activeElement.x = Number(Number(temp).toFixed(3))
			} else if (
				elemY !== formattedY &&
				!game.game.checkCollision(elemX, elemY + multiplier * dirY) &&
				(elemX - 55) % TILE_SIZE === 0 &&
				Math.abs(game.game.cursorY - (elemY + 35)) > 35
			) {
				console.log('y')
				let temp =
					Math.abs(formattedY - (elemY + multiplier * dirY)) < 10
						? formattedY
						: elemY + multiplier * dirY
				game.game.activeElement.y = Number(Number(temp).toFixed(3))
			}
		}
	}

	startFollowing() {
		this.app.ticker.add(this.followCursor)
	}

	stopFollowing() {
		this.app.ticker.remove(this.followCursor)
	}

	// Element movements handling on mouse move
	handleMouseMove(event) {
		// Cursor Coordinates
		const cursorX = event.clientX - this.gameField.offsetLeft
		const cursorY = event.clientY - this.gameField.offsetTop

		if (
			this.activeElement &&
			!this.completedElements[this.activeElement.type]
		) {
			const element = this.activeElement

			// Element coordinates
			const x = element.x
			const y = element.y
			this.cursorX = cursorX
			this.cursorY = cursorY

			const isCursorOutside =
				cursorX < this.activeElement.x - 10 ||
				cursorX > this.activeElement.x + TILE_SIZE + 10 ||
				cursorY < this.activeElement.y - 10 ||
				cursorY > this.activeElement.y + TILE_SIZE + 10

			if (isCursorOutside) {
				this.startFollowing()
			} else {
				this.stopFollowing()
			}

			const dx = event.clientX - this.gameField.offsetLeft - TILE_SIZE / 2 - x
			const dy = event.clientY - this.gameField.offsetTop - TILE_SIZE / 2 - y

			if (Math.abs(dx) > 5 && !isCursorOutside && Math.abs(dx) > Math.abs(dy)) {
				// Horizontal movement
				const sign = Math.sign(dx)
				const perpend = Math.abs(y - 35) % TILE_SIZE
				if (perpend === 0 && !this.checkCollision(x + dx - 2.5 * sign, y)) {
					element.x += Math.floor(dx)
				} else if (Math.abs(dx) > 20) {
					// Edges cutting functionality
					console.log(perpend, dy)
					if (perpend <= TILE_SIZE / 2 && dy < 1) {
						element.y -= perpend
					} else if (perpend > TILE_SIZE / 2 && dy > 1) {
						element.y += TILE_SIZE - perpend
					}
				}
			} else if (
				Math.abs(dy) > 5 &&
				!isCursorOutside &&
				Math.abs(dy) > Math.abs(dx)
			) {
				// Vertical movement
				const sign = Math.sign(dy)
				const perpend = Math.abs(x - 55) % TILE_SIZE
				if (perpend === 0 && !this.checkCollision(x, y + dy - sign * 2.5)) {
					element.y += Math.floor(dy)
				} else if (Math.abs(dy) > 20) {
					// Edges cutting functionality
					console.log(perpend, dx)
					if (perpend <= TILE_SIZE / 2 && dx < -1) {
						element.x -= perpend
					} else if (perpend > TILE_SIZE / 2 && dx > 1) {
						element.x += TILE_SIZE - perpend
					}
				}
			}
		}
	}

	// Check for collisions with prohibited items for passage
	checkCollision(x, y) {
		// Create array with all level elements except active one
		const elementsArray = [0, 2, 3, 4, 5, 6, 7]
		elementsArray.splice(elementsArray.indexOf(this.activeElement.type), 1)
		// Check for collisions with level elements
		for (const element of this.level.elements) {
			if (
				element.type === this.activeElement.type &&
				element.alpha === 0.7 &&
				x === element.x &&
				y === element.y
			) {
				this.completedElements[element.type] = true
				// Check whether all elements are completed
				this.checkIsLevelCompleted()
			} else if (
				x + TILE_SIZE > element.x &&
				x < element.x + TILE_SIZE &&
				y + TILE_SIZE > element.y &&
				y < element.y + TILE_SIZE &&
				elementsArray.includes(element.type)
			) {
				return true
			} else if (
				this.activeElement.type === 3 &&
				[3, 4, 5, 6, 7].includes(element.type) &&
				(element.alpha === 0.7 || element.alpha !== 0.75) &&
				x + TILE_SIZE > element.x &&
				x < element.x + TILE_SIZE &&
				y + TILE_SIZE > element.y &&
				y < element.y + TILE_SIZE
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
			this.stopTimer()
			game.gui.showMenu()
		}
	}

	clearCanvas() {
		this.app.stage.children = []
		this.level.elements = []
		this.completedElements = {
			4: false,
			5: false,
			6: false,
			7: false,
		}
	}

	fetchParams(path, callback) {
		var req = new XMLHttpRequest()
		req.overrideMimeType('application/json')
		req.open('GET', path, true)
		req.onload = () => {
			if (req.status === 200) {
				this.params = JSON.parse(req.responseText)
				Object.keys(this.params.elements).forEach(key => {
					this.sprites[key] = PIXI.Assets.load(this.params.elements[key].url)
				})
				console.log(this.sprites)
				this.isLoading = false
				callback && callback()
			} else {
				console.error(
					`Failed to fetch data from ${path}. Status: ${req.status}`
				)
			}
		}
		req.onerror = () => {
			console.error(`Network error while trying to fetch data from ${path}`)
		}
		req.send(null)
	}
}
