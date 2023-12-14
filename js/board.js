const matrix = JSON.parse(`[
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, "fire", 0, 0, 0, 0, 0, "water", 0, 0],
	[0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0],
	[0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	[0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0],
	[0, 0, "earth", 0, 0, 0, 0, 0, "air", 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]
`)

class Board {
	constructor() {
		this.matrix = matrix
		this.elements = []
	}

	// Generate common board structure
	generateBoard() {
		const matrix = this.matrix
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
					newEl.position.set(125 + el * TILE_SIZE, 55 + row * TILE_SIZE)
					this.elements.push(newEl)
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
				this.matrix = JSON.parse(req.responseText)
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
