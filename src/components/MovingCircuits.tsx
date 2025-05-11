"use client"

import { useEffect, useRef } from 'react'

export default function MovingCircuits() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const DEFAULT_SIZE = 1000
    const WIDTH = window.innerWidth
    const HEIGHT = window.innerHeight
    const DIM = Math.min(WIDTH, HEIGHT)
    const M = DIM / DEFAULT_SIZE

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = WIDTH
    canvas.height = HEIGHT

    const getRandomInt = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    // Increase size for slower movement
    const size = Math.floor(getRandomInt(10, 25))
    const colors = [
      "#660000", "#990000", "#CC0000", "#FF0000", "#FF3333",
      "#FF6666", "#FF9999", "#FFCCCC", "#CC3333", "#CC6666",
      "#CC9999", "#993333", "#996666", "#663333"
    ]

    const cols = Math.floor(WIDTH/size)
    const rows = Math.floor(HEIGHT/size)
    const w = WIDTH/cols
    const h = HEIGHT/rows

    const numnodes = Math.floor(getRandomInt(6, 10)) // Reduced number of nodes
    const nodes = []
    const lines = []
    const dots = []
    // Reduce movement options for slower changes
    const changeoptions = [0,0,0,0,0,0,0,0,1,-1]

    for (let i = 0; i < numnodes; i++) {
      const randy = Math.floor(getRandomInt(rows-10,rows))
      nodes.push({x:cols-2, y:randy})
      lines.push([{x:cols-2, y:randy}])
    }

    let frameCount = 0
    let animationFrameId: number

    function draw() {
      frameCount++
      
      // Only update every 3 frames for slower movement
      if (frameCount % 3 === 0) {
        ctx.clearRect(0, 0, WIDTH, HEIGHT)
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, WIDTH, HEIGHT)

        let topnode = 0

        // Draw nodes and update positions
        for (let i = 0; i < nodes.length; i++) {
          ctx.fillStyle = colors[i]
          ctx.beginPath()
          ctx.arc(nodes[i].x*w + w/2, nodes[i].y*h + h/2, size*0.7, 0, Math.PI * 2)
          ctx.fill()
          lines[i].push({x:nodes[i].x, y:nodes[i].y})

          // Slower movement by reducing frequency of position updates
          if (frameCount % 6 === 0) {
            nodes[i].y = nodes[i].y + changeoptions[Math.floor(Math.random() * changeoptions.length)]

            if (nodes[i].y < i) nodes[i].y = i
            if (nodes[i].y > rows-3) nodes[i].y = rows-3

            if (i < nodes.length-2 && nodes[i].y >= nodes[i+1].y) nodes[i].y--
            if (i > 0 && nodes[i].y <= nodes[i-1].y) nodes[i].y++
          }

          if (nodes[i].y < nodes[topnode].y) topnode = i
        }

        // Draw lines with slower movement
        for (let i = 0; i < lines.length; i++) {
          for (let j = 0; j < lines[i].length-1; j++) {
            ctx.strokeStyle = colors[i]
            ctx.lineWidth = 2 // Increased line width for better visibility
            ctx.beginPath()
            ctx.moveTo(lines[i][j].x*w + w/2, lines[i][j].y * h + h/2)
            ctx.lineTo(lines[i][j+1].x*w + w/2, lines[i][j+1].y * h + h/2)
            ctx.stroke()
            // Slower horizontal movement
            if (frameCount % 4 === 0) {
              lines[i][j].x = lines[i][j].x - 0.5 // Reduced from 1 to 0.5
            }
          }
        }

        // Clean up old lines
        for (let i = 0; i < lines.length; i++) {
          for (let j = lines[i].length-1; j > 0; j--) {
            if (lines[i][j].x < 0) {
              lines[i].splice(j, 1)
            }
          }
        }

        // Add dots less frequently
        if (Math.random() > 0.98) { // Reduced probability
          const randy = Math.floor(getRandomInt(0, nodes[topnode].y))
          dots.push({x:cols-2, y:randy})
        }

        // Update and draw dots
        for (let i = dots.length - 1; i >= 0; i--) {
          ctx.fillStyle = colors[7]
          ctx.beginPath()
          ctx.arc(dots[i].x*w + w/2, dots[i].y*h + h/2, size*0.4, 0, Math.PI * 2)
          ctx.fill()
          // Slower dot movement
          if (frameCount % 4 === 0) {
            dots[i].x -= 0.5 // Reduced from 1 to 0.5
          }
          if (dots[i].x < 0) {
            dots.splice(i, 1)
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="moving-circuits">
      <canvas ref={canvasRef} />
    </div>
  )
}