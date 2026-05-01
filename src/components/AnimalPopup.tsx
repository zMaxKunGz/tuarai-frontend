import { useEffect } from 'react'
import type { Wildlife } from '../types'
import { IUCNBadge } from './IUCNBadge'
import { IUCN_LABEL, VERTEBRATE_LABEL, VERTEBRATE_EN_LABEL } from '../utils/dangerLevel'

interface Props {
  animal: Wildlife | null
  onClose: () => void
}

export function AnimalPopup({ animal, onClose }: Props) {
  useEffect(() => {
    if (animal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [animal])

  if (!animal) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 pb-safe-8 shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {animal.imageUrl && (
          <div className="w-full h-52 rounded-2xl overflow-hidden mb-4 bg-gray-100">
            <img
              src={animal.imageUrl}
              alt={animal.enName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">{animal.thName}</h2>
          <p className="text-base text-gray-600">{animal.enName}</p>
          <p className="text-sm text-gray-400 italic">{animal.scientificName}</p>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <IUCNBadge status={animal.iucnStatus} showLabel />
          <span className="badge bg-gray-100 text-gray-600">
            {VERTEBRATE_LABEL[animal.vertebrateType]} · {VERTEBRATE_EN_LABEL[animal.vertebrateType]}
          </span>
        </div>

        <p className="mt-3 text-sm text-gray-500">
          สถานะ IUCN: <strong className="text-gray-800">{IUCN_LABEL[animal.iucnStatus]}</strong>
        </p>

        <button
          onClick={onClose}
          className="mt-5 w-full btn-primary"
        >
          ปิด
        </button>
      </div>
    </div>
  )
}
