import { useParams, useNavigate } from 'react-router-dom'
import { useWildlifeById } from '../hooks/useWildlife'
import { useProtectedAreasByIds } from '../hooks/useProtectedAreas'
import { ParkCard } from '../components/ParkCard'
import { IUCNBadge } from '../components/IUCNBadge'
import type { ProtectedArea } from '../types'

export function AnimalParks() {
  const { animalId } = useParams<{ animalId: string }>()
  const navigate = useNavigate()

  const { animal, loading: animalLoading } = useWildlifeById(animalId ?? null)
  const { parks, loading: parksLoading } = useProtectedAreasByIds(animal?.parkIds ?? [])

  const loading = animalLoading || parksLoading

  function handleParkClick(park: ProtectedArea) {
    navigate(`/park/${park.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-xl">‹</button>
        {animal ? (
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 truncate">{animal.thName}</h1>
            <p className="text-xs text-gray-400 truncate">{animal.enName}</p>
          </div>
        ) : (
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
        )}
        {animal && <IUCNBadge status={animal.iucnStatus} />}
      </div>

      {/* Animal summary */}
      {animal && (
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            {animal.imageUrl && (
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={animal.imageUrl} alt={animal.enName} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">อุทยานที่พบสัตว์นี้</p>
              <p className="text-2xl font-bold text-green-600">{parks.length} <span className="text-base font-normal text-gray-600">แห่ง</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Park list */}
      <div className="px-4 py-3 space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-gray-100" />
          ))
        ) : parks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🏕</p>
            <p>ยังไม่มีข้อมูลอุทยานสำหรับสัตว์นี้</p>
          </div>
        ) : (
          parks.map(park => (
            <ParkCard key={park.id} park={park} onClick={handleParkClick} />
          ))
        )}
      </div>
    </div>
  )
}
