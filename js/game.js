class Game {
	constructor() {
		this.LEFT_START = 127;
		this.TOP_START = 34;

		this.app = null;

		this.sprites = {};
		this.incr = 0;

		this.counter = 0;

		this.isFollowing = false;

		this.distance = null;
		this.neighbors = null;

		this.timer = null;

		this.gameField = null;
		this.timerBody = null;

		this.init();
	}

	// Start - stop timer functionality
	startTimer() {
		this.timer = setInterval(() => {
			this.remainingTime--;

			const min = Math.floor(this.remainingTime / 60);
			const sec = this.remainingTime - 60 * min;
			this.timerBody.innerHTML = `${min < 10 ? '0' + min : min}:${
				sec < 10 ? '0' + sec : sec
			}`;

			if (this.remainingTime <= 0) {
				this.stopTimer();
				game.gui.showMenu();
			}
		}, 1000);
	}

	stopTimer() {
		clearInterval(this.timer);
	}

	// Start the game method
	startGame() {
		document.querySelector('.greeting-banner').style.display = 'none';
		this.level = new LevelManager();
		this.level.urls = this.params.levels;
		this.level.enums = this.params.elements;

		let img = PIXI.Sprite.from(BASE_URL + 'assets/img/background.png');

		this.app.stage.addChild(img);

		// Generate and add the level elements to the scene
		this.difficulty = 0;
		this.level.getLevel(this.difficulty, elements => {
			this.app.stage.addChild(...elements.flat());
		});

		this.remainingTime = this.params.timers[this.difficulty];
		this.startTimer(); // Start the timer when the game starts
	}

	// Find dragged element
	findSelectedElement(event) {
		const cursorX = event.clientX - this.gameField.offsetLeft;
		const cursorY = event.clientY - this.gameField.offsetTop;

		const element =
			this.level.elements[Math.floor((cursorY - this.TOP_START) / 70)][
				Math.floor((cursorX - this.LEFT_START) / 70)
			];

		return element.alpha !== 0.7 && element;
	}

	// Om mouse down select element for future movements
	handleMouseDown(event) {
		const element = this.findSelectedElement(event);
		const enums = this.params.elements;

		const allowedElements = [
			enums.wood.id,
			enums.air.id,
			enums.water.id,
			enums.fire.id,
			enums.earth.id,
		];

		if (element && allowedElements.includes(element.type)) {
			this.activeElement = element;
			if (!element.initCol && !element.initRow) {
				element.initCol = element.col;
				element.initRow = element.row;
			}
			this.activeElement.alpha = 0.75;
			this.findNeighbors();
		}
	}

	swapElements() {
		const row = Math.round((this.activeElement.y - this.TOP_START) / 70);
		const col = Math.round((this.activeElement.x - this.LEFT_START) / 70);

		if (this.completedElements[this.activeElement.type]) {
			console.log(this.level.elements);
			const cellEl = this.level.elements.flat().find(el => el.type === 1);
			this.level.elements[this.activeElement.initRow][
				this.activeElement.initCol
			] = cellEl;
			return;
		}

		const elementToSwap = this.level.elements[row][col];

		if (
			(row === this.activeElement.initRow &&
				col === this.activeElement.initCol) ||
			elementToSwap.type === this.activeElement.type
		) {
			this.activeElement.col = col;
			this.activeElement.row = row;
			return;
		}

		this.activeElement.col = col;
		this.activeElement.row = row;

		elementToSwap.col = this.activeElement.initCol;
		elementToSwap.row = this.activeElement.initRow;

		this.level.elements[this.activeElement.initRow][
			this.activeElement.initCol
		] = elementToSwap;
		this.level.elements[row][col] = this.activeElement;

		this.activeElement.initCol = col;
		this.activeElement.initRow = row;
	}

	// On mouse up reset the active element
	handleMouseUp() {
		this.isFollowing = false;

		if (this.activeElement) {
			let diffX = Math.abs(this.activeElement.x - this.LEFT_START) % TILE_SIZE;
			let diffY = Math.abs(this.activeElement.y - this.TOP_START) % TILE_SIZE;
			// Transfer the element to the nearest cell
			if (diffX !== 0) {
				const sign = diffX >= TILE_SIZE / 2 ? 1 : -1;
				diffX = sign > 0 ? TILE_SIZE - diffX : diffX;

				this.activeElement.x += diffX * sign;
				this.swapElements();
			} else if (diffY !== 0) {
				const sign = diffY >= TILE_SIZE / 2 ? 1 : -1;
				diffY = sign > 0 ? TILE_SIZE - diffY : diffY;

				this.activeElement.y += diffY * sign;

				const row = Math.round(
					(this.activeElement.y - this.TOP_START) / TILE_SIZE
				);
				const col = Math.round(
					(this.activeElement.x - this.LEFT_START) / TILE_SIZE
				);
				const targetElement = this.level.elements[row][col];
				const currentElType = this.activeElement.type;

				if (
					currentElType === targetElement.type &&
					targetElement.alpha === 0.7
				) {
					this.completedElements[currentElType] = true;
					// Check whether all elements are completed
					this.swapElements();
					this.checkIsLevelCompleted();
				} else {
					this.swapElements();
				}
			}

			this.activeElement.alpha = 1;
			this.activeElement = null;
		}
	}

	translateX(dirX, multiplier, col) {
		if (
			dirX === -1 &&
			(!this.neighbors.left ||
				(this.neighbors.left && this.distance.right !== 0))
		) {
			if (this.distance.left + multiplier > 65) {
				this.activeElement.x += this.distance.left - TILE_SIZE;
				this.distance.left = 0;
				this.distance.right = 0;
				this.findNeighbors();
				this.activeElement.col = col;
			} else {
				this.distance.left += multiplier;
				this.distance.right = TILE_SIZE - this.distance.left;

				this.activeElement.x -= multiplier;
			}
		} else if (
			dirX === 1 &&
			(!this.neighbors.right ||
				(this.neighbors.right && this.distance.left !== 0))
		) {
			if (this.distance.right + multiplier > 65) {
				this.activeElement.x -= this.distance.right - TILE_SIZE;
				this.distance.right = 0;
				this.distance.left = 0;
				this.findNeighbors();
				this.activeElement.col = col;
			} else {
				this.distance.right += multiplier;
				this.distance.left = TILE_SIZE - this.distance.right;

				this.activeElement.x += multiplier;
			}
		}
	}

	translateY(dirY, multiplier, row) {
		if (
			dirY === -1 &&
			(!this.neighbors.top ||
				(this.neighbors.top && this.distance.bottom !== 0))
		) {
			if (this.distance.top + multiplier > 65) {
				this.activeElement.y += this.distance.top - TILE_SIZE;
				this.distance.top = 0;
				this.distance.bottom = 0;

				this.findNeighbors();
				this.activeElement.row = row;
			} else {
				this.distance.top += multiplier;
				this.distance.bottom = TILE_SIZE - this.distance.top;

				this.activeElement.y -= multiplier;
			}
		} else if (
			dirY === 1 &&
			(!this.neighbors.bottom ||
				(this.neighbors.bottom && this.distance.top !== 0))
		) {
			if (this.distance.bottom + multiplier > 65) {
				this.activeElement.y -= this.distance.bottom - TILE_SIZE;
				this.distance.bottom = 0;
				this.distance.top = 0;
				this.findNeighbors();
				this.activeElement.row = row;
			} else {
				this.distance.bottom += multiplier;
				this.distance.top = TILE_SIZE - this.distance.bottom;

				this.activeElement.y += multiplier;
			}
		}
	}

	followCursor() {
		if (this.activeElement) {
			const elemX = this.activeElement.x;
			const elemY = this.activeElement.y;

			const row = Math.floor((this.activeElement.y - this.TOP_START) / 70);
			const col = Math.floor((this.activeElement.x - this.LEFT_START) / 70);

			const perpendX = Math.abs(elemX - this.LEFT_START) % TILE_SIZE;
			const perpendY = Math.abs(elemY - this.TOP_START) % TILE_SIZE;

			let dx = this.cursorX - TILE_SIZE / 2 - elemX;
			let dy = this.cursorY - TILE_SIZE / 2 - elemY;

			const dirX = Math.abs(dx) > 0 ? Math.sign(dx) : 0;
			const dirY = Math.abs(dy) > 0 ? Math.sign(dy) : 0;

			const multiplier = 8.75;
			if (Math.abs(dx) > Math.abs(dy)) {
				if (
					perpendY === 0 &&
					(!this.neighbors[dirX === -1 ? 'left' : 'right'] ||
						(this.neighbors[dirX === -1 ? 'left' : 'right'] &&
							this.distance[dirX === -1 ? 'left' : 'right'] !== 0))
				) {
					this.translateX(dirX, multiplier, col);
				} else if (
					perpendX === 0 &&
					Math.abs(dy) > 5 &&
					(!this.neighbors[dirY === -1 ? 'top' : 'bottom'] ||
						(this.neighbors[dirY === -1 ? 'top' : 'bottom'] &&
							this.distance[dirY === -1 ? 'top' : 'bottom'] !== 0))
				) {
					this.translateY(dirY, multiplier, row);
				}
			} else if (Math.abs(dy) >= Math.abs(dx)) {
				if (
					perpendX === 0 &&
					(!this.neighbors[dirY === -1 ? 'top' : 'bottom'] ||
						(this.neighbors[dirY === -1 ? 'top' : 'bottom'] &&
							this.distance[dirY === -1 ? 'top' : 'bottom'] !== 0))
				) {
					this.translateY(dirY, multiplier, row);
				} else if (
					perpendY === 0 &&
					Math.abs(dx) > 5 &&
					(!this.neighbors[dirX === -1 ? 'left' : 'right'] ||
						(this.neighbors[dirX === -1 ? 'left' : 'right'] &&
							this.distance[dirX === -1 ? 'left' : 'right'] !== 0))
				) {
					this.translateX(dirX, multiplier, col);
				}
			}
		}
	}

	update() {
		if (this.isFollowing) {
			this.followCursor();
		}
	}

	checkElement(element) {
		const currentElType = this.activeElement.type;
		const elementsArray = [0, 2, 3, 4, 5, 6, 7];
		currentElType !== 3 &&
			elementsArray.splice(elementsArray.indexOf(currentElType), 1);
		return element && elementsArray.includes(element.type) ? element : null;
	}

	findNeighbors() {
		const row = Math.round((this.activeElement.y - this.TOP_START) / TILE_SIZE);
		const col = Math.round(
			(this.activeElement.x - this.LEFT_START) / TILE_SIZE
		);

		const elements = this.level.elements;
		const targetElement = elements[row][col];
		const currentElType = this.activeElement.type;

		// Check whether element was placed to the source cell
		if (currentElType === targetElement.type && targetElement.alpha === 0.7) {
			this.completedElements[currentElType] = true;
			// Check whether all elements are completed
			this.swapElements();
			this.checkIsLevelCompleted();
		} else {
			this.swapElements();
		}

		this.neighbors = {
			left: this.checkElement(elements[row][col - 1]),
			right: this.checkElement(elements[row][col + 1]),
			top: this.checkElement(elements[row - 1][col]),
			bottom: this.checkElement(elements[row + 1][col]),
		};

		this.distance = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		};
	}

	// Element movements handling on mouse move
	handleMouseMove(event) {
		// Cursor Coordinates
		const cursorX = event.clientX - this.gameField.offsetLeft;
		const cursorY = event.clientY - this.gameField.offsetTop;

		if (
			this.activeElement &&
			!this.completedElements[this.activeElement.type]
		) {
			const element = this.activeElement;

			// Element coordinates
			const x = element.x;
			const y = element.y;

			this.cursorX = cursorX;
			this.cursorY = cursorY;

			let dx = cursorX - TILE_SIZE / 2 - x;
			let dy = cursorY - TILE_SIZE / 2 - y;

			const isCursorOutside =
				Math.abs(dx) > TILE_SIZE / 2 || Math.abs(dy) > TILE_SIZE / 2;

			if (isCursorOutside) {
				this.isFollowing = true;
			} else {
				this.isFollowing = false;

				const row = Math.floor((this.activeElement.y - this.TOP_START) / 70);
				const col = Math.floor((this.activeElement.x - this.LEFT_START) / 70);

				const perpendX = Math.abs(x - this.LEFT_START) % TILE_SIZE;
				const perpendY = Math.abs(y - this.TOP_START) % TILE_SIZE;

				if (Math.abs(dx) > Math.abs(dy) + 2 && perpendY === 0) {
					// Horizontal movement
					dx -= 2 * Math.sign(dx);
					this.translateX(Math.sign(dx), Math.abs(dx), col);
				} else if (Math.abs(dy) > Math.abs(dx) + 2 && perpendX === 0) {
					// Vertical movement
					dy -= 2 * Math.sign(dy);
					this.translateY(Math.sign(dy), Math.abs(dy), row);
				}
			}
		}
	}

	checkIsLevelCompleted() {
		const allElementsCompleted = Object.values(this.completedElements).every(
			element => element === true
		);
		if (allElementsCompleted) {
			this.stopTimer();
			game.gui.showMenu();
			console.log(this.level.elements);
		}
	}

	clearCanvas() {
		this.app.stage.children = [];
		this.level.elements = [];
		this.completedElements = {
			4: false,
			5: false,
			6: false,
			7: false,
		};
	}

	fetchParams(path, callback) {
		var req = new XMLHttpRequest();
		req.overrideMimeType('application/json');
		req.open('GET', path, true);
		req.onload = () => {
			if (req.status === 200) {
				this.params = JSON.parse(req.responseText);
				Object.keys(this.params.elements).forEach(key => {
					this.sprites[key] = PIXI.Assets.load(this.params.elements[key].url);
				});
				this.isLoading = false;
				callback && callback();
			} else {
				console.error(
					`Failed to fetch data from ${path}. Status: ${req.status}`
				);
			}
		};
		req.onerror = () => {
			console.error(`Network error while trying to fetch data from ${path}`);
		};
		req.send(null);
	}

	init() {
		this.app = new PIXI.Application({
			width: 1024,
			height: 768,
			backgroundAlpha: 0,
		});

		let img = PIXI.Sprite.from(BASE_URL + 'assets/img/background.png');

		this.app.stage.addChild(img);
		this.app.ticker.add(this.update, this);

		this.gameField = document.querySelector('.game-field');

		this.gameField.appendChild(this.app.view);

		this.fetchParams(`${BASE_URL}/matrices/game.json`, () => {
			this.completedElements = {
				4: false,
				5: false,
				6: false,
				7: false,
			};

			this.activeElement = null;
		});

		this.distance = {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		};

		this.neighbors = {
			left: null,
			right: null,
			top: null,
			bottom: null,
		};

		this.timerBody = document.querySelector('.game-timer');
	}
}
