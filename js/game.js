class Game {
	constructor() {
		// Init the Pixi canvas
		this.app = new PIXI.Application({
			width: 1024,
			height: 768,
			backgroundAlpha: 0,
		})

		let img = PIXI.Sprite.from(BASE_URL + 'assets/img/background.png')

		this.app.stage.addChild(img)

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

		this.leftStart = 127
		this.topStart = 34

		this.distance = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		}

		this.neighbors = {
			left: null,
			right: null,
			top: null,
			bottom: null,
		}

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

		let img = PIXI.Sprite.from(BASE_URL + 'assets/img/background.png')

		this.app.stage.addChild(img)

		// Generate and add the level elements to the scene
		this.difficulty = 2
		this.level.getLevel(this.difficulty, elements => {
			this.app.stage.addChild(...elements.flat())
		})

		this.remainingTime = this.params.timers[this.difficulty]
		this.startTimer() // Start the timer when the game starts
	}

	// Find dragged element
	findSelectedElement(event) {
		const cursorX = event.clientX - this.gameField.offsetLeft
		const cursorY = event.clientY - this.gameField.offsetTop

		const element =
			this.level.elements[Math.floor((cursorY - this.topStart) / 70)][
				Math.floor((cursorX - this.leftStart) / 70)
			]

		return element.alpha !== 0.7 && element
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

			if (!element.initCol && !element.initRow) {
				console.log('f')
				element.initCol = element.col
				element.initRow = element.row
			}
			this.activeElement.alpha = 0.75
			this.findNeighbors()
		}
	}

	swapElements() {
		const row = Math.round((this.activeElement.y - this.topStart) / 70)
		const col = Math.round((this.activeElement.x - this.leftStart) / 70)

		const elementToSwap = this.level.elements[row][col]

		if (
			(row === this.activeElement.initRow &&
				col === this.activeElement.initCol) ||
			elementToSwap.type === this.activeElement.type
		) {
			return
		}

		this.activeElement.col = col
		this.activeElement.row = row

		elementToSwap.col = this.activeElement.initCol
		elementToSwap.row = this.activeElement.initRow

		console.log(
			row,
			col,
			this.activeElement.initRow,
			this.activeElement.initCol,
			'type: ',
			this.activeElement.type
		)
		this.level.elements[this.activeElement.initRow][
			this.activeElement.initCol
		] = elementToSwap
		this.level.elements[row][col] = this.activeElement
		console.log(
			this.level.elements[this.activeElement.initRow][
				this.activeElement.initCol
			].type,
			this.level.elements[row][col].type
		)

		this.activeElement.initCol = col
		this.activeElement.initRow = row
	}

	// On mouse up reset the active element
	handleMouseUp() {
		this.stopFollowing()
		if (this.activeElement) {
			let diffX = Math.abs(this.activeElement.x - this.leftStart) % TILE_SIZE
			let diffY = Math.abs(this.activeElement.y - this.topStart) % TILE_SIZE
			// Transfer the element to the nearest cell
			if (diffX !== 0) {
				const sign = diffX >= TILE_SIZE / 2 ? 1 : -1
				diffX = sign > 0 ? TILE_SIZE - diffX : diffX

				this.activeElement.x += diffX * sign
				this.swapElements()
			} else if (diffY !== 0) {
				const sign = diffY >= TILE_SIZE / 2 ? 1 : -1
				diffY = sign > 0 ? TILE_SIZE - diffY : diffY

				this.activeElement.y += diffY * sign
				this.swapElements()
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
			const multiplier = 0.1

			const formattedX = Math.ceil(
				game.game.cursorX - ((game.game.cursorX - this.leftStart) % TILE_SIZE)
			)
			const formattedY = Math.ceil(
				game.game.cursorY - ((game.game.cursorY - this.topStart) % TILE_SIZE)
			)
			if (
				elemX !== formattedX &&
				!game.game.checkCollision(elemX + multiplier * dirX, elemY) &&
				(game.game.activeElement.y - 35) % TILE_SIZE === 0
			) {
				let temp = elemX + multiplier * dirX
				game.game.activeElement.x = Number(Number(temp).toFixed(3))
			} else if (
				elemY !== formattedY &&
				!game.game.checkCollision(elemX, elemY + multiplier * dirY) &&
				(elemX - this.leftStart) % TILE_SIZE === 0 &&
				Math.abs(game.game.cursorY - (elemY + 35)) > 35
			) {
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

	findNeighbors() {
		const row = Math.round((this.activeElement.y - this.topStart) / 70)
		const col = Math.round((this.activeElement.x - this.leftStart) / 70)

		const elements = this.level.elements
		const targetElement = elements[row][col]
		const currentElType = this.activeElement.type

		const elementsArray = [0, 2, 3, 4, 5, 6, 7]
		currentElType !== 3 &&
			elementsArray.splice(elementsArray.indexOf(currentElType), 1)

		// Check whether element was placed to the source cell
		if (currentElType === targetElement.type && targetElement.alpha === 0.7) {
			this.completedElements[currentElType] = true

			// Check whether all elements are completed
			this.checkIsLevelCompleted()
		} else {
			this.swapElements()
		}

		this.neighbors.left =
			elements[row][col - 1] &&
			elementsArray.includes(elements[row][col - 1].type)
				? elements[row][col - 1]
				: null

		this.neighbors.right =
			elements[row][col + 1] &&
			elementsArray.includes(elements[row][col + 1].type)
				? elements[row][col + 1]
				: null
		this.neighbors.top =
			elements[row - 1][col] &&
			elementsArray.includes(elements[row - 1][col].type)
				? elements[row - 1][col]
				: null
		this.neighbors.bottom =
			elements[row + 1][col] &&
			elementsArray.includes(elements[row + 1][col].type)
				? elements[row + 1][col]
				: null

		this.distance = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		}
		console.log(elements)
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

			const dx = cursorX - TILE_SIZE / 2 - x
			const dy = cursorY - TILE_SIZE / 2 - y

			const row = Math.floor((this.activeElement.y - this.topStart) / 70)
			const col = Math.floor((this.activeElement.x - this.leftStart) / 70)

			const perpendX = Math.abs(x - this.leftStart) % TILE_SIZE
			const perpendY = Math.abs(y - this.topStart) % TILE_SIZE

			if (
				!isCursorOutside &&
				Math.abs(dx) > Math.abs(dy) + 2 &&
				perpendY === 0
			) {
				// Horizontal movement
				if (
					dx < 0 &&
					(!this.neighbors.left ||
						(this.neighbors.left && this.distance.right !== 0))
				) {
					this.distance.left += Math.abs(dx)
					this.distance.right = TILE_SIZE - this.distance.left

					element.x +=
						this.distance.left > 70
							? this.distance.left - Math.abs(dx) - TILE_SIZE
							: dx
					if (this.distance.left >= 70) {
						this.distance.left = 0
						this.distance.right = 0
						this.findNeighbors()
						this.activeElement.col = col
					}
				} else if (
					dx > 0 &&
					(!this.neighbors.right ||
						(this.neighbors.right && this.distance.left !== 0))
				) {
					this.distance.right += Math.abs(dx)
					this.distance.left = TILE_SIZE - this.distance.right

					element.x +=
						this.distance.right > 70
							? TILE_SIZE - (this.distance.right - Math.abs(dx))
							: dx
					if (this.distance.right >= 70) {
						this.distance.right = 0
						this.distance.left = 0
						this.findNeighbors()
						this.activeElement.col = col
					}
				}
			} else if (
				!isCursorOutside &&
				Math.abs(dy) > Math.abs(dx) + 2 &&
				perpendX === 0
			) {
				// Vertical movement
				if (
					dy < 0 &&
					(!this.neighbors.top ||
						(this.neighbors.top && this.distance.bottom !== 0))
				) {
					this.distance.top += Math.abs(dy)
					this.distance.bottom = TILE_SIZE - this.distance.top

					element.y +=
						this.distance.top > 70
							? this.distance.top - Math.abs(dy) - TILE_SIZE
							: dy
					if (this.distance.top >= 70) {
						this.distance.top = 0
						this.distance.bottom = 0

						this.findNeighbors()
						this.activeElement.row = row
					}
				} else if (
					dy > 0 &&
					(!this.neighbors.bottom ||
						(this.neighbors.bottom && this.distance.top !== 0))
				) {
					this.distance.bottom += Math.abs(dy)
					this.distance.top = TILE_SIZE - this.distance.bottom

					element.y +=
						this.distance.bottom > 70
							? TILE_SIZE - (this.distance.bottom - Math.abs(dy))
							: dy
					if (this.distance.bottom >= 70) {
						this.distance.bottom = 0
						this.distance.top = 0
						this.findNeighbors()
						this.activeElement.row = row
					}
				}
			}
		}
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
