import type { ProtectedArea } from '../types'
import { DangerBadge } from './DangerBadge'

interface Props {
  park: ProtectedArea
  onClick: (park: ProtectedArea) => void
}

export function ParkCard({ park, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(park)}
      className="card p-4 w-full text-left active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">{park.thName}</p>
          <p className="text-sm text-gray-500">{park.enName}</p>
          <p className="text-xs text-gray-400 mt-0.5">📍 {park.province}</p>
        </div>
        <DangerBadge level={park.dangerLevel} />
      </div>
      {park.openCloseInfo && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">🕐 {park.openCloseInfo}</p>
      )}
    </button>
  )
}
