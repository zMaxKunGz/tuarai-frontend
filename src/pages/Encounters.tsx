import { useMemo, useState } from 'react'
import { useWildlife } from '../hooks/useWildlife'
import { IUCNBadge } from '../components/IUCNBadge'
import type { Wildlife } from '../types'

const MOCK_LOCATIONS = [
  'อุทยานแห่งชาติเขาใหญ่',
  'อุทยานแห่งชาติดอยอินทนนท์',
  'อุทยานแห่งชาติแก่งกระจาน',
  'เขตรักษาพันธุ์สัตว์ป่าห้วยขาแข้ง',
  'อุทยานแห่งชาติภูกระดึง',
  'อุทยานแห่งชาติปางสีดา',
]

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

interface Encounter {
  animal: Wildlife
  location: string
  encounteredAt: Date
}

function buildEncounters(wildlife: Wildlife[]): Encounter[] {
  if (!wildlife.length) return []
  const rand = seededRandom(20250502)
  const shuffled = [...wildlife].sort(() => rand() - 0.5)
  const picked = shuffled.slice(0, Math.min(12, shuffled.length))

  const now = Date.now()
  return picked.map((animal, i) => ({
    animal,
    location: MOCK_LOCATIONS[Math.floor(rand() * MOCK_LOCATIONS.length)],
    encounteredAt: new Date(now - Math.floor(rand() * 30 + i) * 24 * 60 * 60 * 1000),
  })).sort((a, b) => b.encounteredAt.getTime() - a.encounteredAt.getTime())
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'วันนี้'
  if (diffDays === 1) return 'เมื่อวาน'
  return `${diffDays} วันที่แล้ว`
}

export function Encounters() {
  const { wildlife, loading } = useWildlife()
  const [selected, setSelected] = useState<Encounter | null>(null)

  const encounters = useMemo(() => buildEncounters(wildlife), [wildlife])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold text-gray-900">🐾 สัตว์ที่พบแล้ว</h1>
        {!loading && (
          <p className="text-xs text-gray-400 mt-0.5">พบทั้งหมด {encounters.length} ชนิด (ข้อมูลจำลอง)</p>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl h-28 animate-pulse bg-gray-100" />
          ))
        ) : encounters.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p>ยังไม่มีข้อมูลการพบเห็น</p>
          </div>
        ) : (
          encounters.map((enc, i) => (
            <button
              key={enc.animal.id}
              onClick={() => setSelected(enc)}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex gap-0 active:scale-[0.98] transition-transform text-left"
            >
              <div className="w-24 h-28 flex-shrink-0 bg-gray-100 relative">
                {enc.animal.imageUrl ? (
                  <img src={enc.animal.imageUrl} alt={enc.animal.enName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🦎</div>
                )}
                <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 p-3 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{enc.animal.thName}</p>
                <p className="text-xs text-gray-500 truncate">{enc.animal.enName}</p>
                <p className="text-xs text-gray-400 italic truncate">{enc.animal.scientificName}</p>
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <IUCNBadge status={enc.animal.iucnStatus} />
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                  <span>📍</span>
                  <span className="truncate">{enc.location}</span>
                </div>
                <p className="text-xs text-green-600 font-medium mt-0.5">{formatRelative(enc.encounteredAt)}</p>
              </div>
            </button>
          ))
        )}
      </div>

      {selected && (
        <EncounterPopup encounter={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function EncounterPopup({ encounter, onClose }: { encounter: Encounter; onClose: () => void }) {
  const { animal, location, encounteredAt } = encounter
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        </div>

        <div className="overflow-y-auto px-6 pb-6 space-y-3">
          {animal.imageUrl && (
            <div className="w-full h-48 rounded-2xl overflow-hidden bg-gray-100">
              <img src={animal.imageUrl} alt={animal.enName} className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-gray-900">{animal.thName}</h2>
            <p className="text-base text-gray-600">{animal.enName}</p>
            <p className="text-sm text-gray-400 italic">{animal.scientificName}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <IUCNBadge status={animal.iucnStatus} showLabel />
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span className="text-gray-700">{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🗓</span>
              <span className="text-gray-700">
                {encounteredAt.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          {animal.food && (
            <div className="bg-green-50 rounded-2xl p-4 space-y-1">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">🍃 อาหาร</p>
              <p className="text-sm text-gray-700">{animal.food}</p>
            </div>
          )}

          {animal.behavior && (
            <div className="bg-blue-50 rounded-2xl p-4 space-y-1">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">🐾 นิสัย</p>
              <p className="text-sm text-gray-700">{animal.behavior}</p>
            </div>
          )}

          {animal.storyTeen && (
            <div className="bg-amber-50 rounded-2xl p-4 space-y-1">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">✨ เรื่องราว</p>
              <p className="text-sm text-gray-700 leading-relaxed">{animal.storyTeen}</p>
            </div>
          )}

          <button onClick={onClose} className="w-full btn-primary mt-1">
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}
