import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { toolCategories } from '../../content/reference/tools'
import { visualizers } from '../../content/reference/visualizers'

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
  name: string
  href: string
}

interface Packet {
  fromIndex: number
  toIndex: number
  progress: number
  speed: number
  protocol: string
}

const STAR_COUNT = 55
const NODE_COUNT = 7
const PACKET_COUNT = 9
const POINTER_RADIUS = 150
const PROTOCOLS = ['TCP', 'UDP', 'ICMP']
const IDLE_MS = 7000
const SHOWCASE_MS = 2600

// Every live tool and visualizer, flattened into one pool of real
// destinations -- computed once at module load, not per-render. Each
// starfield node names one of these instead of being pure decoration, so
// the "network graph" is a light discovery affordance, not just eye candy.
const DESTINATIONS: { name: string; href: string }[] = [
  ...toolCategories.flatMap((category) =>
    category.tools
      .filter((tool) => tool.slug)
      .map((tool) => ({ name: tool.name, href: `/tools/${tool.slug}` })),
  ),
  ...visualizers
    .filter((visualizer) => visualizer.slug)
    .map((visualizer) => ({ name: visualizer.name, href: `/visualizers/${visualizer.slug}` })),
]

function pickRandomUnique<T>(pool: T[], count: number): T[] {
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy.slice(0, count)
}

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

function randomProtocol(): string {
  return PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)]!
}

// 1 right at the pointer, fading linearly to 0 at POINTER_RADIUS away.
function proximityBoost(x: number, y: number, pointer: { x: number; y: number; active: boolean }) {
  if (!pointer.active) return 0
  const distance = Math.hypot(x - pointer.x, y - pointer.y)
  return Math.max(0, 1 - distance / POINTER_RADIUS)
}

// "Nova" traffic animation for the homepage hero: a faint constellation of
// nodes with packets traveling between them over a subtle starfield.
// Simulated data only -- no real network access. Respects
// prefers-reduced-motion (renders one static frame instead of animating)
// and re-reads theme colors on light/dark toggle since the accent colors
// differ between themes.
//
// Each node names a real tool or visualizer (see DESTINATIONS above) and is
// backed by a real, keyboard-focusable <Link> in the DOM overlay below --
// the canvas itself stays aria-hidden and pointer-events-none throughout,
// exactly as before, so it can never intercept clicks meant for the hero's
// own buttons.
export function TrafficStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nodeLinks, setNodeLinks] = useState<Node[]>([])
  const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null)
  const activeNodeIndexRef = useRef<number | null>(null)
  const userHoverRef = useRef(false)

  function updateActiveNode(index: number | null) {
    activeNodeIndexRef.current = index
    setActiveNodeIndex(index)
  }

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
    let idleTimer = 0
    let showcaseTimer = 0

    function armIdleTimer() {
      window.clearTimeout(idleTimer)
      if (reducedMotionQuery.matches) return
      idleTimer = window.setTimeout(() => {
        if (userHoverRef.current || nodes.length === 0) return
        const index = Math.floor(Math.random() * nodes.length)
        updateActiveNode(index)
        showcaseTimer = window.setTimeout(() => {
          if (!userHoverRef.current) updateActiveNode(null)
          armIdleTimer()
        }, SHOWCASE_MS)
      }, IDLE_MS)
    }

    function seed() {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.1 + 0.3,
        baseOpacity: Math.random() * 0.35 + 0.15,
        twinkleSpeed: Math.random() * 0.0012 + 0.0004,
        twinklePhase: Math.random() * Math.PI * 2,
      }))
      const destinations = pickRandomUnique(DESTINATIONS, NODE_COUNT)
      nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
        x: Math.random() * width * 0.8 + width * 0.1,
        y: Math.random() * height * 0.7 + height * 0.15,
        name: destinations[i]?.name ?? 'PacketNova',
        href: destinations[i]?.href ?? '/tools',
      }))
      setNodeLinks(nodes)
      packets = Array.from({ length: PACKET_COUNT }, () => {
        const fromIndex = Math.floor(Math.random() * nodes.length)
        return {
          fromIndex,
          toIndex: randomNextNode(fromIndex, nodes.length),
          progress: Math.random(),
          speed: Math.random() * 0.0003 + 0.0002,
          protocol: randomProtocol(),
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

      nodes.forEach((node, index) => {
        const boost = animate ? proximityBoost(node.x, node.y, pointer) : 0
        const showcased = activeNodeIndexRef.current === index
        ctx!.beginPath()
        ctx!.arc(node.x, node.y, 2.5 + boost * 2 + (showcased ? 1.5 : 0), 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${accentAlt}, ${Math.min(1, 0.55 + boost * 0.4 + (showcased ? 0.4 : 0))})`
        ctx!.fill()
      })

      for (const packet of packets) {
        if (animate) {
          packet.progress += packet.speed * dt
          if (packet.progress >= 1) {
            packet.progress = 0
            packet.fromIndex = packet.toIndex
            packet.toIndex = randomNextNode(packet.fromIndex, nodes.length)
            packet.protocol = randomProtocol()
          }
        }
        const from = nodes[packet.fromIndex]!
        const to = nodes[packet.toIndex]!
        const x = from.x + (to.x - from.x) * packet.progress
        const y = from.y + (to.y - from.y) * packet.progress
        const boost = animate ? proximityBoost(x, y, pointer) : 0
        ctx!.beginPath()
        ctx!.arc(x, y, 2, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${accent}, 0.9)`
        ctx!.fill()

        // Close up, a packet reveals what it actually is -- otherwise it's
        // just a moving dot. Kept off by default (only within
        // POINTER_RADIUS) so the ambient view stays quiet at rest.
        if (animate && boost > 0.45) {
          ctx!.font = '9px ui-monospace, SFMono-Regular, Menlo, monospace'
          ctx!.textAlign = 'center'
          ctx!.textBaseline = 'middle'
          ctx!.fillStyle = `rgba(${accent}, ${Math.min(1, boost)})`
          ctx!.fillText(packet.protocol, x, y - 9)
        }
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
      armIdleTimer()
    }

    function handlePointerLeaveWindow() {
      pointer.active = false
    }

    function handleReducedMotionChange() {
      start()
      window.clearTimeout(idleTimer)
      window.clearTimeout(showcaseTimer)
      if (reducedMotionQuery.matches) updateActiveNode(null)
      else armIdleTimer()
    }

    start()
    armIdleTimer()
    document.addEventListener('visibilitychange', handleVisibility)
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
    window.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerleave', handlePointerLeaveWindow)
    const themeObserver = new MutationObserver(handleThemeChange)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      stop()
      window.clearTimeout(idleTimer)
      window.clearTimeout(showcaseTimer)
      resizeObserver.disconnect()
      themeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerleave', handlePointerLeaveWindow)
    }
  }, [])

  function handleNodeEnter(index: number) {
    userHoverRef.current = true
    updateActiveNode(index)
  }

  function handleNodeLeave() {
    userHoverRef.current = false
    updateActiveNode(null)
  }

  return (
    // pointer-events-none on the wrapper (not just the canvas) matters here:
    // an absolutely-positioned element paints above normal-flow siblings
    // regardless of DOM order, so without this the wrapper would sit above
    // -- and block clicks to -- the hero's own buttons rendered after it.
    // Each node <Link> below opts back into pointer-events-auto explicitly,
    // the standard way to punch a few real interactive hotspots through an
    // otherwise fully click-through decorative layer.
    <div className="pointer-events-none absolute inset-0 h-full w-full">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      {nodeLinks.map((node, index) => (
        <Link
          key={`${node.href}-${index}`}
          to={node.href}
          onMouseEnter={() => handleNodeEnter(index)}
          onMouseLeave={handleNodeLeave}
          onFocus={() => handleNodeEnter(index)}
          onBlur={handleNodeLeave}
          aria-label={`Discover: ${node.name}`}
          className="pointer-events-auto absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          style={{ left: node.x, top: node.y }}
        >
          {activeNodeIndex === index && (
            <span
              role="tooltip"
              className="animate-pn-fade-in pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-[11px] text-fg shadow-[0_0_16px_-4px_var(--color-accent)]"
            >
              {node.name}
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
