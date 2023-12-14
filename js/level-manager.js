const levels = JSON.parse(`[
	{
		"matrix": [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, "earth", 0, 0, 0, 0, "fire", 0, 0, 0],
			[0, 0, 0, "block", 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, "block", 0, 0],
			[0, 0, 0, "air", 0, 0, 0, 0, 0, 0, 0],
			[0, "block", 0, 0, 0, 0, 0, "water", 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		]
	},
	{
		"matrix": [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, "wood", 0, 0, 0, 0, "fire", 0, 0, 0],
			[0, 0, 0, "earth", 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, "water", 0, 0],
			[0, 0, 0, "air", 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, "block", 0, 0, 0, "wood", 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		]
	},
	{
		"matrix": [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, "wood", 0, 0, 0, 0, 0, "wood", 0, 0],
			[0, 0, "wood", 0, 0, 0, 0, "earth", "wood", 0, 0],
			[0, 0, 0, "water", 0, 0, 0, 0, "block", 0, 0],
			[0, 0, "block", 0, 0, "block", 0, "block", "fire", 0, 0],
			[0, 0, 0, "air", 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, "block", 0, 0, 0, "wood", 0, 0, 0],
			[0, 0, "wood", 0, 0, 0, 0, 0, "wood", 0, 0],
			[0, 0, "wood", 0, 0, 0, 0, 0, "wood", 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		]
	}
]
`)

class LevelManager {
	constructor() {
		this.levels = levels
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
		var req = new XMLHttpRequest()
		req.overrideMimeType('application/json')
		req.open('GET', path, true)
		req.onload = () => {
			if (req.status === 200) {
				this.levels = JSON.parse(req.responseText)
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
