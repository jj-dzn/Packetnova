import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  baseOpacity: number
  twinkleSpeed: number
  twinklePhase: number
}

interface Node {
  x: number
  y: number
}

interface Packet {
  fromIndex: number
  toIndex: number
  progress: number
  speed: number
}

const STAR_COUNT = 55
const NODE_COUNT = 7
const PACKET_COUNT = 9
const POINTER_RADIUS = 150

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const value = parseInt(clean, 16)
  if (clean.length !== 6 || Number.isNaN(value)) return '124, 58, 237'
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`
}

function readThemeColors() {
  const styles = getComputedStyle(document.documentElement)
  return {
    accent: hexToRgb(styles.getPropertyValue('--pn-accent').trim() || '#7c3aed'),
    accentAlt: hexToRgb(styles.getPropertyValue('--pn-accent-alt').trim() || '#0d9488'),
  }
}

function randomNextNode(current: number, count: number): number {
  let next = Math.floor(Math.random() * count)
  if (next === current) next = (next + 1) % count
  return next
}

// 1 right at the pointer, fading linearly to 0 at POINTER_RADIUS away.
function proximityBoost(x: number, y: number, pointer: { x: number; y: number; active: boolean }) {
  if (!pointer.active) return 0
  const distance = Math.hypot(x - pointer.x, y - pointer.y)
  return Math.max(0, 1 - distance / POINTER_RADIUS)
}

// Purely decorative "nova" traffic animation for the homepage hero: a faint
// constellation of nodes with packets traveling between them over a subtle
// starfield. Simulated data only -- no real network access. Respects
// prefers-reduced-motion (renders one static frame instead of animating)
// and re-reads theme colors on light/dark toggle since the accent colors
// differ between themes.
export function TrafficStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const colors = { current: readThemeColors() }
    const pointer = { x: 0, y: 0, active: false }

    let width = 0
    let height = 0
    let stars: Star[] = []
    let nodes: Node[] = []
    let packets: Packet[] = []

    function seed() {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.1 + 0.3,
        baseOpacity: Math.random() * 0.35 + 0.15,
        twinkleSpeed: Math.random() * 0.0012 + 0.0004,
        twinklePhase: Math.random() * Math.PI * 2,
      }))
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * width * 0.8 + width * 0.1,
        y: Math.random() * height * 0.7 + height * 0.15,
      }))
      packets = Array.from({ length: PACKET_COUNT }, () => {
        const fromIndex = Math.floor(Math.random() * nodes.length)
        return {
          fromIndex,
          toIndex: randomNextNode(fromIndex, nodes.length),
          progress: Math.random(),
          speed: Math.random() * 0.0003 + 0.0002,
        }
      })
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.max(1, Math.round(width * dpr))
      canvas!.height = Math.max(1, Math.round(height * dpr))
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    // Setting canvas.width/height (even via ResizeObserver's own initial,
    // spurious callback right after observe() is called) clears the canvas,
    // so every resize must be followed by a redraw -- otherwise the
    // reduced-motion static frame would go blank with nothing left to
    // repaint it.
    function handleResize() {
      resize()
      start()
    }

    resize()
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvas)

    function drawFrame(dt: number, animate: boolean) {
      ctx!.clearRect(0, 0, width, height)
      const { accent, accentAlt } = colors.current

      for (const star of stars) {
        if (animate) star.twinklePhase += star.twinkleSpeed * dt
        const boost = animate ? proximityBoost(star.x, star.y, pointer) : 0
        const opacity = animate
          ? Math.max(0, star.baseOpacity + Math.sin(star.twinklePhase) * 0.15) + boost * 0.4
          : star.baseOpacity
        ctx!.beginPath()
        ctx!.arc(star.x, star.y, star.radius + boost * 0.6, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${accent}, ${Math.min(1, opacity)})`
        ctx!.fill()
      }

      ctx!.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]!
          const b = nodes[j]!
          if (Math.hypot(a.x - b.x, a.y - b.y) < width * 0.32) {
            const midBoost = animate ? proximityBoost((a.x + b.x) / 2, (a.y + b.y) / 2, pointer) : 0
            ctx!.strokeStyle = `rgba(${accentAlt}, ${0.08 + midBoost * 0.22})`
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }

      for (const node of nodes) {
        const boost = animate ? proximityBoost(node.x, node.y, pointer) : 0
        ctx!.beginPath()
        ctx!.arc(node.x, node.y, 2.5 + boost * 2, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${accentAlt}, ${Math.min(1, 0.55 + boost * 0.4)})`
        ctx!.fill()
      }

      for (const packet of packets) {
        if (animate) {
          packet.progress += packet.speed * dt
          if (packet.progress >= 1) {
            packet.progress = 0
            packet.fromIndex = packet.toIndex
            packet.toIndex = randomNextNode(packet.fromIndex, nodes.length)
          }
        }
        const from = nodes[packet.fromIndex]!
        const to = nodes[packet.toIndex]!
        const x = from.x + (to.x - from.x) * packet.progress
        const y = from.y + (to.y - from.y) * packet.progress
        ctx!.beginPath()
        ctx!.arc(x, y, 2, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${accent}, 0.9)`
        ctx!.fill()
      }
    }

    let rafId = 0
    let lastTime = performance.now()

    function loop(time: number) {
      const dt = Math.min(time - lastTime, 50)
      lastTime = time
      drawFrame(dt, true)
      rafId = requestAnimationFrame(loop)
    }

    function start() {
      cancelAnimationFrame(rafId)
      if (reducedMotionQuery.matches) {
        drawFrame(0, false)
      } else {
        lastTime = performance.now()
        rafId = requestAnimationFrame(loop)
      }
    }

    function stop() {
      cancelAnimationFrame(rafId)
    }

    function handleVisibility() {
      if (document.hidden) stop()
      else start()
    }

    function handleThemeChange() {
      colors.current = readThemeColors()
      if (reducedMotionQuery.matches) drawFrame(0, false)
    }

    // Tracked on window rather than the canvas itself -- the canvas stays
    // pointer-events-none so it can never intercept clicks meant for the
    // hero's buttons, which sit visually on top of it.
    function handlePointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.active =
        pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height
    }

    function handlePointerLeaveWindow() {
      pointer.active = false
    }

    start()
    document.addEventListener('visibilitychange', handleVisibility)
    reducedMotionQuery.addEventListener('change', start)
    window.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerleave', handlePointerLeaveWindow)
    const themeObserver = new MutationObserver(handleThemeChange)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      stop()
      resizeObserver.disconnect()
      themeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      reducedMotionQuery.removeEventListener('change', start)
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerleave', handlePointerLeaveWindow)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
