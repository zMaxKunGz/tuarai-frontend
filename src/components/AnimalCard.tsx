import type { Wildlife } from '../types'
import { IUCNBadge } from './IUCNBadge'
import { VERTEBRATE_LABEL } from '../utils/dangerLevel'

interface Props {
  animal: Wildlife
  onClick: (animal: Wildlife) => void
  compact?: boolean
}

export function AnimalCard({ animal, onClick, compact = false }: Props) {
  return (
    <button
      onClick={() => onClick(animal)}
      className="card flex items-center gap-3 p-3 w-full text-left active:scale-[0.98] transition-transform"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {animal.imageUrl ? (
          <img
            src={animal.imageUrl}
            alt={animal.enName}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = '/placeholder-animal.png' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🦎</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{animal.thName}</p>
        <p className="text-xs text-gray-500 truncate">{animal.enName}</p>
        {!compact && (
          <p className="text-xs text-gray-400 italic truncate">{animal.scientificName}</p>
        )}
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          <IUCNBadge status={animal.iucnStatus} />
          <span className="badge bg-gray-100 text-gray-600">
            {VERTEBRATE_LABEL[animal.vertebrateType] ?? animal.vertebrateTypeTh}
          </span>
        </div>
      </div>
      <span className="text-gray-300 text-lg">›</span>
    </button>
  )
}
