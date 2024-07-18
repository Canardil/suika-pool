// import './style.css'
import RAPIER from '@dimforge/rapier2d'
import { Application, Assets, Graphics, Color } from 'pixi.js'

import * as Helpers from './helpers'

document.querySelector('#app').innerHTML = /*html*/ `
    <div id="game"></div>
`

const border = 33

const windowSizeX = 800
const windowSizeY = 600

let world, app

let leftWall = new Graphics()
const gameEl = document.querySelector('#game')

let GRAPHICS = []

let WALLS_GRAPHICS = []

const SCALE = 100

// function update() {}
function animate(t = 0) {
  // console.log(t.elapsedMS)
  world.step()

  GRAPHICS.forEach((graphic) => {
    let position = graphic.body.translation()

    graphic.x = position.x * SCALE
    graphic.y = -position.y * SCALE
  })

  // window.requestAnimationFrame(animate)
}

async function init() {
  // Create a new application
  app = new Application()

  // PIXI init
  await app.init({
    width: 800,
    height: 600,
    // transparent: true,
    backgroundColor: 0xd0d2d6,
    // resolution: 2, // Increase this value for higher resolution
    autoDensity: true,
    antialias: true,
  })

  gameEl.appendChild(app.canvas)

  //PHYSICS CREATION
  let gravity = { x: 0.0, y: -9.81 }
  world = new RAPIER.World(gravity)

  const BALL_RADIUS = 5
  const BALL_TOTAL = 2500

  for (let i = 0; i < BALL_TOTAL; i++) {
    //Create Ball
    const firstBall = new Graphics()
    firstBall.pivot.set(0, 0)
    firstBall.circle(0, 0, BALL_RADIUS)
    firstBall.position.set(Math.random() * windowSizeX, Math.random() * 100)
    firstBall.fill(0xde3249)
    firstBall.stroke({ width: 0, color: 0xffbd01, alpha: 0 })
    app.stage.addChild(firstBall)
    createPhysics(firstBall, 'circle')
  }

  const RECT_WIDTH = 300
  const RECT_HEIGHT = 20

  // rotated platforms
  addRectangle(260, 300, RECT_WIDTH, RECT_HEIGHT, 10, 0x332299, false)
  addRectangle(500, 500, RECT_WIDTH, RECT_HEIGHT, -15, 0x332299, false)

  const WALL_DEPTH = 20

  // left wall
  addRectangle(
    WALL_DEPTH / 2,
    windowSizeY / 2,
    WALL_DEPTH,
    windowSizeY,
    0,
    0x332299,
    false
  )
  // right wall
  addRectangle(
    windowSizeX - WALL_DEPTH / 2,
    windowSizeY / 2,
    WALL_DEPTH,
    windowSizeY,
    0,
    0x332299,
    false
  )
  // bottom wall
  addRectangle(
    windowSizeX / 2,
    windowSizeY - WALL_DEPTH / 2,
    windowSizeX,
    WALL_DEPTH,
    0,
    0x332299,
    false
  )

  // Create walls
  // await initWalls()
  app.ticker.add(animate)
}

function createPhysics(graphic, shape, isDynamic = true) {
  // Create physics ball.
  // console.log(graphic)
  let rigidBodyDesc
  let colliderDesc
  if (isDynamic) {
    rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
  } else {
    rigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
  }

  switch (shape) {
    case 'circle':
      rigidBodyDesc.setTranslation(graphic.x / SCALE, -graphic.y / SCALE)
      colliderDesc = RAPIER.ColliderDesc.ball(
        graphic.width / 2 / SCALE
      ).setRotation(-graphic.rotation)
      break
    case 'rectangle':
    default:
      // console.log('creating cuboid physics', graphic.x, graphic.y)
      rigidBodyDesc.setTranslation(graphic.x / SCALE, -graphic.y / SCALE)
      colliderDesc = RAPIER.ColliderDesc.cuboid(
        graphic.width / 2 / SCALE,
        graphic.height / 2 / SCALE
      ).setRotation(-graphic.rotation)
      break
  }

  let rigidBody = world.createRigidBody(rigidBodyDesc)
  let collider = world.createCollider(colliderDesc, rigidBody)

  graphic.body = collider
  GRAPHICS.push(graphic)
}

function addRectangle(
  x,
  y,
  width,
  height,
  rotation,
  color = 0xde3249,
  dynamic = false
) {
  const rectangle = new Graphics()

  rectangle.pivot.set(width / 2, height / 2)
  rectangle.rect(0, 0, width, height)
  rectangle.fill(color)
  rectangle.stroke({ width: 0, color: 0xffbd01, alpha: 0 })
  rectangle.position.set(x, y)
  rectangle.rotation = (Math.PI / 180) * rotation

  app.stage.addChild(rectangle)
  createPhysics(rectangle, 'rectangle', dynamic)
}

function renderDebug(pixiViewport, physicsWorld) {
  const { vertices, colors } = physicsWorld.debugRender()

  GRAPHICS.forEach((g) => g.destroy())
  GRAPHICS = []

  for (let i = 0; i < vertices.length / 4; i += 1) {
    const g = new Graphics()
    const c = new Color({
      r: colors[i * 4] * 255,
      g: colors[i * 4 + 1] * 255,
      b: colors[i * 4 + 2] * 255,
      a: colors[i * 4 + 3] * 255,
    })

    g.stroke({ width: 0.5, color: c, alpha: 0.5 })
    g.moveTo(vertices[i * 4], vertices[i * 4 + 1])
    g.lineTo(vertices[i * 4 + 2], vertices[i * 4 + 3])
    g.closePath()

    GRAPHICS.push(g)
    pixiViewport.addChild(g)
  }
}

async function initWalls() {
  let groundGraphics = new Graphics()
  // curr.position.x = el.xLoc + 100;
  //             curr.position.y = -el.yLoc + 100;
  //             curr.rotation = el.rotation;
  //             curr.pivot.set(curr.width / 2, curr.height / 2);
  groundGraphics.rect(0, windowSizeY - 10, windowSizeX, 10)
  groundGraphics.fill(0xde3249)
  app.stage.addChild(groundGraphics)
  console.log(groundGraphics)

  //Rapier ground block (static)
  let groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
    groundGraphics.x,
    groundGraphics.y
  )
  let groundBody = world.createRigidBody(groundBodyDesc)

  let groundColliderDesc = RAPIER.ColliderDesc.cuboid(
    groundGraphics.width / 2,
    groundGraphics.height / 2
  )
  let groundCollider = world.createCollider(groundColliderDesc, groundBody)

  groundBody.setTranslation(
    0 + groundCollider.halfExtents().x,
    -windowSizeY + groundCollider.halfExtents().y
  )

  //Rapier left wall block (static)
  let leftWallBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(-border, 0)
  let leftWallBody = world.createRigidBody(leftWallBodyDesc)
  let leftWallColliderDesc = RAPIER.ColliderDesc.cuboid(10, windowSizeY)
  let leftWallCollider = world.createCollider(
    leftWallColliderDesc,
    leftWallBody
  )
  //Rapier right wall block (static)
  let rightWallBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
    windowSizeX - border,
    0
  )
  let rightWallBody = world.createRigidBody(rightWallBodyDesc)
  let rightWallColliderDesc = RAPIER.ColliderDesc.cuboid(10, windowSizeY)

  let rightWallCollider = world.createCollider(
    rightWallColliderDesc,
    rightWallBody
  )

  WALLS_GRAPHICS.push(groundCollider, leftWallCollider, rightWallCollider)

  // for (let i = 0; i < WALLS_GRAPHICS.length; i++) {
  //   let wallGraphics = new Graphics()
  //   let wallBody = WALLS_GRAPHICS[i]

  //   // let sizes = wallBody.half_extents()

  //   const he = wallBody.halfExtents()
  //   const pos = wallBody.translation()
  //   console.log(he, pos)
  //   // curr.position.x = el.xLoc + 100;
  //   //             curr.position.y = -el.yLoc + 100;
  //   //             curr.rotation = el.rotation;
  //   //             curr.pivot.set(curr.width / 2, curr.height / 2);
  //   wallGraphics.rect(pos.x, -pos.y, he.x * 2, he.y * 2)
  //   wallGraphics.pivot.set(wallGraphics.width / 2, wallGraphics.height / 2)
  //   wallGraphics.fill(0xde3249)

  //   console.log(wallGraphics)

  //   // Helpers.updatePosition(wallCollider, wallCollider)
  //   // // wallGraphics.pivot.set(wallGraphics.width / 2, wallGraphics.height / 2)
  //   // console.log(wallCollider.translation)
  //   // // wallGraphics.position = {
  //   // //   x: wallCollider.translation.x,
  //   // //   y: -wallCollider.translation.y,
  //   // // }
  //   // wallGraphics.stroke({ width: 0, color: 0xffbd01, alpha: 1 })
  //   // wallGraphics.fill(0xde3249)

  //   // wallGraphics.rotation = wallCollider.rotation * -1
  //   app.stage.addChild(wallGraphics)
  // }
  console.log(WALLS_GRAPHICS)
}

await init()
