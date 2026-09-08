import { useEffect, useRef, useState } from 'react'

export function useCountUp(target, { duration = 600, start = 0 } = {}) {
  const [value, setValue] = useState(start)
  const frameRef = useRef(null)

  useEffect(() => {
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + (target - start) * eased))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration, start])

  return value
}