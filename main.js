// import './style.css'
import RAPIER from '@dimforge/rapier2d'
import { Application, Assets, Graphics, Color } from 'pixi.js'

import * as Helpers from './helpers'

document.querySelector('#app').innerHTML = /*html*/ `
    <div id="game"></div>
`

const SCALE = 100
const border = 10

const windowSizeX = 800
const windowSizeY = 600

let world, app

let leftWall = new Graphics()
const gameEl = document.querySelector('#game')

let GRAPHICS = []

let WALLS_GRAPHICS = []

// function update() {}
function animate(t = 0) {
  // console.log(t.elapsedMS)
  world.step()

  GRAPHICS.forEach((graphic) => {
    let position = graphic.body.translation()

    // console.log('graphic position', position)

    graphic.x = position.x
    graphic.y = -position.y
  })

  // window.requestAnimationFrame(animate)
}

async function init() {
  // Create a new application
  app = new Application()
  // Initialize the application
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
  console.log(app.canvas.width, app.canvas.height)
  //PHYSICS CREATION
  let gravity = { x: 0.0, y: -9.81 }
  // let gravity = { x: 0.0, y: -2 }
  world = new RAPIER.World(gravity)

  //Create Ball
  const firstBall = new Graphics()
  firstBall.circle(50, 50, 50)
  firstBall.fill(0xde3249)
  firstBall.stroke({ width: 0, color: 0xffbd01, alpha: 0 })
  app.stage.addChild(firstBall)
  createPhysics(firstBall, 'circle')
  // Create Ground
  const ground = new Graphics()
  ground.rect(0, 0, windowSizeX, border)
  ground.fill(0xde3249)
  ground.stroke({ width: 0, color: 0xffbd01, alpha: 0 })
  ground.position.set(0, 300)
  app.stage.addChild(ground)
  createPhysics(ground, 'rectangle', false)
  // Create walls
  // await initWalls()
  app.ticker.add(animate)
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
      rigidBodyDesc.setTranslation(graphic.x, -graphic.y)
      colliderDesc = RAPIER.ColliderDesc.ball(graphic.width)
      break
    case 'rectangle':
      console.log('creating cuboid physics', graphic.x, graphic.y)
      rigidBodyDesc.setTranslation(graphic.x, -graphic.y)
      colliderDesc = RAPIER.ColliderDesc.cuboid(
        graphic.width / 2,
        graphic.height / 2
      )
      break
    default:
      rigidBodyDesc.setTranslation(
        graphic.x + graphic.width / 2,
        -graphic.y + graphic.height / 2
      )
      colliderDesc = RAPIER.ColliderDesc.cuboid(
        graphic.width / 2,
        graphic.height / 2
      )
      break
  }

  let rigidBody = world.createRigidBody(rigidBodyDesc)
  let collider = world.createCollider(colliderDesc, rigidBody)

  graphic.body = collider
  GRAPHICS.push(graphic)
}

await init()
// resize()
// animate(0)

// import './style.css'
// import * as PIXI from 'pixi.js'

// const gameEl = document.querySelector('#game')

// const app = new PIXI.Application()
// await app.init({
//   backgroundColor: 0x1099bb,
//   resizeTo: gameEl,
// })

// gameEl.appendChild(app?.canvas)

// const graphics = new PIXI.Graphics()
// graphics.rect(0, 0, 100, 100)
// graphics.fill(0x000000)

// app.stage.addChild(graphics)

// const btnEl = document.querySelector('#btn')

// btnEl?.addEventListener('click', () => {
//   graphics.x = gameEl.clientWidth / 2 - graphics.width / 2
//   graphics.y = gameEl.clientHeight / 2 - graphics.height / 2
// })
