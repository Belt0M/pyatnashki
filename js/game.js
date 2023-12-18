class GameSession {
	constructor() {
		this.game = {}
		this.gui = {}
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
		this.menu = document.querySelector('.menu-wrapper')

		this.gameField.appendChild(this.app.view)

		this.interval = null

		this.fetchParams(`${BASE_URL}/matrices/game.json`, () => {
			this.completedElements = {
				4: false,
				5: false,
				6: false,
				7: false,
			}

			this.activeElement = null
		})
	}

	startGame() {
		this.level = new LevelManager()
		this.level.urls = this.params.levels
		this.level.enums = this.params.elements

		// Generate and add the level elements to the scene
		this.difficulty = 1
		this.level.getLevel(this.difficulty, elements => {
			this.app.stage.addChild(...elements)
		})

		this.app.ticker.add(() => {
			this.update()
		})
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
			console.log(this.activeElement.x, this.activeElement.y)
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
				this.activeElement.x += diffX * sign
			} else if (diffY !== 0) {
				const sign = diffY >= TILE_SIZE / 2 ? 1 : -1
				diffY = sign > 0 ? TILE_SIZE - diffY : diffY
				this.activeElement.y += diffY * sign
			}
			this.activeElement.alpha = 1
			this.activeElement = null
		}
	}

	followCursor() {
		const elemX = Math.ceil(game.activeElement.x)
		const elemY = Math.ceil(game.activeElement.y)
		const dirX = Math.sign(game.cursorX - elemX)
		const dirY = Math.sign(game.cursorY - elemY)
		const multiplier = 0.05
		//  -55 -35
		if (game.activeElement) {
			const formattedX = Math.ceil(
				game.cursorX - ((game.cursorX - 55) % TILE_SIZE)
			)
			const formattedY = Math.ceil(
				game.cursorY - ((game.cursorY - 35) % TILE_SIZE)
			)

			if (
				elemX !== formattedX &&
				!game.checkCollision(elemX + multiplier * dirX, elemY)
			) {
				game.activeElement.x += multiplier * dirX
			} else if (
				elemX === formattedX &&
				elemY !== formattedY &&
				!game.checkCollision(elemX, elemY + multiplier * dirY)
			) {
				game.activeElement.y += multiplier * dirY
				console.log(game.activeElement.y)
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
		if (
			this.activeElement &&
			!this.completedElements[this.activeElement.type]
		) {
			const cursorX = event.clientX - this.gameField.offsetLeft
			const cursorY = event.clientY - this.gameField.offsetTop

			this.cursorX = cursorX
			this.cursorY = cursorY

			const isCursorOutside =
				cursorX < this.activeElement.x - 100 ||
				cursorX > this.activeElement.x + TILE_SIZE + 100 ||
				cursorY < this.activeElement.y - 100 ||
				cursorY > this.activeElement.y + TILE_SIZE + 100
			if (isCursorOutside) {
				this.startFollowing()
			} else {
				this.stopFollowing()
			}

			const dx =
				event.clientX - this.gameField.offsetLeft - 35 - this.activeElement.x
			const dy =
				event.clientY - this.gameField.offsetTop - 35 - this.activeElement.y
			if (Math.abs(dx) > Math.abs(dy)) {
				// Horizontal movement
				let sign = Math.sign(dx)
				if (
					Math.abs(this.activeElement.y - 385) % TILE_SIZE === 0 &&
					Math.abs(dx) > 35
				) {
					if (
						!this.checkCollision(
							this.activeElement.x + 10 * sign,
							this.activeElement.y
						)
					) {
						this.activeElement.x += 10 * sign
					}
				} else if (Math.abs(dx) > 35) {
					const diffT = (this.activeElement.y - 35) % TILE_SIZE
					const diffB = TILE_SIZE - diffT

					if (diffT <= 35 && diffT > 0) {
						this.activeElement.y -= diffT
					} else if (diffB < 35 && diffB > 0) {
						this.activeElement.y += diffB
					}
				}
			} else if (Math.abs(dx) < Math.abs(dy)) {
				// Vertical movement
				const sign = Math.sign(dy)
				if (
					Math.abs(this.activeElement.x - 195) % TILE_SIZE === 0 &&
					Math.abs(dy) > 35
				) {
					if (
						!this.checkCollision(
							this.activeElement.x,
							this.activeElement.y + 10 * sign
						)
					) {
						this.activeElement.y += 10 * sign
					}
				} else if (Math.abs(dy) > 35) {
					const diffR = (this.activeElement.x - 55) % TILE_SIZE
					const diffL = TILE_SIZE - diffR

					if (diffR <= 35 && diffR > 0) {
						this.activeElement.x -= diffR
					} else if (diffL < 35 && diffL > 0) {
						this.activeElement.x += diffL
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
				elementsArray.includes(element.type) &&
				element.alpha !== 0.7
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
			this.showMenu()
		}
	}

	showGameOver() {
		document.querySelector('.game-over').style.display = 'flex'
	}

	showMenu() {
		if (this.difficulty + 1 === this.params.levels.length) {
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
		this.level.elements = []
		this.completedElements = {
			4: false,
			5: false,
			6: false,
			7: false,
		}
	}

	nextLevel() {
		if (this.difficulty + 1 < this.params.levels.length) {
			this.difficulty += 1
			this.clearCanvas()
			this.hideMenu()

			this.level.getLevel(this.difficulty, elements => {
				this.app.stage.addChild(...elements)
			})
		}
	}

	prevLevel() {
		if (this.difficulty - 1 >= 0) {
			this.difficulty -= 1
			this.clearCanvas()
			this.hideMenu()

			this.level.getLevel(this.difficulty, elements => {
				this.app.stage.addChild(...elements)
			})
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

	// start() {
	// 	this.app.ticker.add(() => {
	// 		this.update()
	// 	})
	// }

	fetchParams(path, callback) {
		var req = new XMLHttpRequest()
		req.overrideMimeType('application/json')
		req.open('GET', path, true)
		req.onload = () => {
			if (req.status === 200) {
				this.params = JSON.parse(req.responseText)
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
