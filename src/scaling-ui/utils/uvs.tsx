// Fetches the right UVs cords to get a number from the icon atlas

import { Vector2 } from "@dcl/sdk/math"


// Note only 0-9 are supported, 
export function getUVsForAtlasNumber(number: number | string): number[] {
	const gridSize = 4
	const horizontalInset = 0.15 // most numbers don't occupyt the full width of the uv square, so we have a small horizontal inset to prevent excess whitepace between them
	if (typeof number === 'string') {
		switch (number) {
			case '/':
				return getUVCell(0, 3, gridSize, gridSize) // see assets/images/ui/atlas-numbers.png
			case '+':
				return getUVCell(1, 3, gridSize, gridSize) // see assets/images/ui/atlas-numbers.png
			case '-':
				return getUVCell(2, 3, gridSize, gridSize) // see assets/images/ui/atlas-numbers.png
			case '*':
			case 'x':
				return getUVCell(3, 3, gridSize, gridSize) // see assets/images/ui/atlas-numbers.png
				case '=':
				return getUVCell(2, 2, gridSize, gridSize) // see assets/images/ui/atlas-numbers.png
			case '.':
				return getUVCell(3, 2, gridSize, gridSize) // see assets/images/ui/atlas-numbers.png
		}
		number = parseInt(number)
		if (isNaN(number)) {
			console.error('getUVsForAtlasNumber: invalid number', number)
			return []
		}
	}
	if (number < 0 || number > 9) {
		console.error('getUVsForAtlasNumber: invalid number', number)
		return []
	}
	const row = Math.floor(number / gridSize) // 4 cols in the atlas
	const col = number % gridSize
	return getUVCell(col, row, gridSize, gridSize, horizontalInset) 

}


export enum AtlasLabelsRowIndex {
	FUEL             = 7,
	POINT            = 6,
	COMBO            = 5,
	START_GAME       = 4,
	ZOOM             = 3,
	GAME_STARTING    = 2,
	GAME_IN_PROGRESS = 1,
	UNKNOWN          = 0,
}

export function getUVRow(
	index : number, 
	maxRows: number = 8
): number[] {
	return getUVCell(0, index, 1, maxRows)
}

export function getUVColumn(
	index     : number, 
	maxColumns: number = 8
): number[] {
	return getUVCell(index, 0, maxColumns, 1)
}

export function getUVCell(
	x              : number, 
	y              : number, 
	width          : number, 
	height         : number,
	horizontalInset: number = 0
): number[] {
	const sizeX = 1 / width
	const sizeY = 1 / height
	return [
		x*sizeX+(horizontalInset*sizeX), y*sizeY	,
		x*sizeX+(horizontalInset*sizeX), (y + 1)*sizeY,
		(x + 1)*sizeX-(horizontalInset*sizeX), (y + 1)*sizeY,
		(x + 1)*sizeX-(horizontalInset*sizeX), y*sizeY,
	]
}


export function getRotatedUVs(
	uvs     : number[],
	rotation: number,
	origin? : Vector2
  ): number[] {
	if (uvs.length !== 8) {
		throw new Error("UV array must contain exactly 8 values.")
	}

	// Find the centre of the quad
	if (!origin) {
		const centerX = (uvs[0] + uvs[2] + uvs[4] + uvs[6]) / 4
		const centerY = (uvs[1] + uvs[3] + uvs[5] + uvs[7]) / 4
		origin = Vector2.create(centerX, centerY)
	}


	const radians = rotation * Math.PI / 180
	const cos = Math.cos(radians)
	const sin = Math.sin(radians)

	const rotated: number[] = []

	for (let i = 0; i < 8; i += 2) {
		const x = uvs[i] - origin.x
		const y = uvs[i + 1] - origin.y

		rotated.push(
			x * cos - y * sin + origin.x,
			x * sin + y * cos + origin.y
		)
	}

	return rotated
}