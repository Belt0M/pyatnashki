class LevelManager {
	constructor() {
		this.elements = []
	}

	// Get the exact level matrix
	getLevel(difficulty) {
		return this.levels[difficulty].matrix
	}

	// Generate 4 level elements, stones and wood blocks
	generateLevelElements(matrix) {
		for (let row = 0; row < matrix.length; row++) {
			for (let el = 0; el < matrix[row].length; el++) {
				const value = matrix[row][el]
				let newEl
				if (typeof value === 'string') {
					newEl = PIXI.Sprite.from(`/assets/sprites/${value}.png`)
				}

				if (newEl) {
					newEl.type = value
					this.elements.push(newEl)
					newEl.position.set(125 + el * TILE_SIZE, 55 + row * TILE_SIZE)
				}
			}
		}
	}
	doGET(path) {
		return new Promise((resolve, reject) => {
			var req = new XMLHttpRequest()
			req.overrideMimeType('application/json')
			req.open('GET', path, true)
			req.onload = () => {
				if (req.status === 200) {
					this.levels = JSON.parse(req.responseText)
					resolve()
				} else {
					reject(`Failed to fetch data from ${path}. Status: ${req.status}`)
				}
			}
			req.onerror = () => {
				reject(`Network error while trying to fetch data from ${path}`)
			}
			req.send(null)
		})
	}
}
