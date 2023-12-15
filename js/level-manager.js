const BASE_URL = `${/(.*)\//.exec(window.document.location.href)[0]}`

class LevelManager {
	constructor() {
		this.elements = []
	}

	// Get the exact level matrix
	getLevel(difficulty, callback) {
		const url = this.urls[difficulty]
		this.fetchLevel(`${BASE_URL}/matrices/${url}`, () => {
			this.generateLevelElements(this.matrix)

			// Call the callback with the generated elements
			callback && callback(this.elements)
		})
	}

	// Generate all level elements
	generateLevelElements(matrix) {
		for (let row = 0; row < matrix.length; row++) {
			for (let el = 0; el < matrix[row].length; el++) {
				const value = matrix[row][el]
				const url = this.findUrlById(value)

				let cellEl
				if (![0, 1].includes(value)) {
					cellEl = PIXI.Sprite.from(`${BASE_URL + this.enums.cell.url}`)
				}
				if (cellEl) {
					cellEl.type = this.enums.cell.id
					cellEl.zOrder = -5
					this.elements.push(cellEl)
					cellEl.position.set(125 + el * TILE_SIZE, 35 + row * TILE_SIZE)
				}

				let newEl = PIXI.Sprite.from(`${BASE_URL + url}`)
				newEl.type = value
				if (value === this.enums.border.id) {
					newEl.alpha = 0
					newEl.zIndex = 0
				} else if (value === this.enums.cell.id) {
					newEl.zIndex = 0
				} else {
					newEl.zIndex = 100
				}
				this.elements.push(newEl)
				newEl.position.set(125 + el * TILE_SIZE, 35 + row * TILE_SIZE)
			}
		}
		this.elements.sort((a, b) => {
			return a.type - b.type
		})
	}
	// Find the level element by its ID
	findUrlById(id) {
		for (const spriteType in this.enums) {
			const sprite = this.enums[spriteType]

			if (sprite.id === id) {
				return sprite.url
			}
		}
		console.error(
			`Incorrect the element ID - ${id}. Failed to find it in enums array`
		)
		return null
	}
	fetchLevel(path, callback) {
		var req = new XMLHttpRequest()
		req.overrideMimeType('application/json')
		req.open('GET', path, true)
		req.onload = () => {
			if (req.status === 200) {
				this.matrix = JSON.parse(req.responseText)
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
