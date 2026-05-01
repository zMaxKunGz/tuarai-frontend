import { DANGER_LEVEL_COLOR, DANGER_LEVEL_LABEL } from '../utils/dangerLevel'
import type { DangerLevel } from '../types'

interface Props {
  level: DangerLevel
}

export function DangerBadge({ level }: Props) {
  const c = DANGER_LEVEL_COLOR[level]
  return (
    <span className={`badge border ${c.bg} ${c.text} ${c.border}`}>
      ⚠ {DANGER_LEVEL_LABEL[level]}
    </span>
  )
}
