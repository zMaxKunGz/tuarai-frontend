import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProtectedAreaById } from '../hooks/useProtectedAreas'
import { useWildlifeByIds } from '../hooks/useWildlife'
import { DangerBadge } from '../components/DangerBadge'
import { AnimalPopup } from '../components/AnimalPopup'
import { IUCNBadge } from '../components/IUCNBadge'
import type { Wildlife } from '../types'

export function ParkDetail() {
  const { parkId } = useParams<{ parkId: string }>()
  const navigate = useNavigate()

  const { park, loading: parkLoading } = useProtectedAreaById(parkId ?? null)
  const { wildlife, loading: wildlifeLoading } = useWildlifeByIds(park?.wildlifeIds ?? [])
  const [selectedAnimal, setSelectedAnimal] = useState<Wildlife | null>(null)

  const loading = parkLoading || wildlifeLoading

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-xl">‹</button>
        {park ? (
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 truncate">{park.thName}</h1>
            <p className="text-xs text-gray-400 truncate">{park.enName}</p>
          </div>
        ) : (
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
        )}
      </div>

      {loading ? (
        <div className="p-4 space-y-3">
          <div className="card h-40 animate-pulse bg-gray-100" />
          <div className="card h-20 animate-pulse bg-gray-100" />
        </div>
      ) : !park ? (
        <div className="text-center py-16 text-gray-400">ไม่พบข้อมูลอุทยาน</div>
      ) : (
        <>
          {/* Park info card */}
          <div className="mx-4 mt-4 card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{park.thName}</h2>
                <p className="text-sm text-gray-500">{park.enName}</p>
              </div>
              <DangerBadge level={park.dangerLevel} />
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-base">📍</span>
                <span className="text-gray-700">{park.province}</span>
              </div>

              {park.googleMapUrl && (
                <a
                  href={park.googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 font-medium"
                >
                  <span>🗺</span>
                  <span>เปิดใน Google Maps</span>
                </a>
              )}

              {park.openCloseInfo && (
                <div className="flex items-start gap-2">
                  <span className="text-base">🕐</span>
                  <span className="text-gray-700">{park.openCloseInfo}</span>
                </div>
              )}

              {park.warningData && (
                <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                  <span className="text-base">⚠️</span>
                  <span className="text-yellow-800 text-xs">{park.warningData}</span>
                </div>
              )}
            </div>
          </div>

          {/* Animal list */}
          <div className="px-4 mt-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              🦎 สัตว์ที่พบในอุทยาน ({wildlife.length} ชนิด)
            </h3>
            <div className="card divide-y divide-gray-50">
              {wildlife.length === 0 ? (
                <p className="p-4 text-sm text-gray-400">ยังไม่มีข้อมูลสัตว์</p>
              ) : (
                wildlife.map(animal => (
                  <button
                    key={animal.id}
                    onClick={() => setSelectedAnimal(animal)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900">{animal.thName}</span>
                      <span className="text-xs text-gray-400 ml-2">{animal.enName}</span>
                    </div>
                    <IUCNBadge status={animal.iucnStatus} />
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="h-8" />
        </>
      )}

      <AnimalPopup animal={selectedAnimal} onClose={() => setSelectedAnimal(null)} />
    </div>
  )
}
