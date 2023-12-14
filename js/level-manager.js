import { TILE_SIZE } from '../variables/tile-size.js'
import levels from '/matrices/levels.json' assert { type: 'json' }

export class LevelManager {
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
}
