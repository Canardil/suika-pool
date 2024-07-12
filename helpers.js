const PIXELS_PER_METER = 100

function radiansToDegrees(radians) {
  return radians * (180 / Math.PI)
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180)
}

function updatePosition(body, graphics) {
  const position = body.translation()
  graphics.position.set(
    position.x * PIXELS_PER_METER + offsetx,
    position.y * PIXELS_PER_METER + offsety
  )
}

export { radiansToDegrees, degreesToRadians, updatePosition, PIXELS_PER_METER }
