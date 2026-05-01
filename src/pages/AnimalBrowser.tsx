import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWildlife } from '../hooks/useWildlife'
import { AnimalCard } from '../components/AnimalCard'
import { FilterBar } from '../components/FilterBar'

import type { Wildlife, VertebateType, IUCNStatus } from '../types'

export function AnimalBrowser() {
  const { wildlife, loading } = useWildlife()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [vertebrateType, setVertebrateType] = useState<VertebateType | ''>('')
  const [iucnStatus, setIUCNStatus] = useState<IUCNStatus | ''>('')
  const [selectedAnimal, setSelectedAnimal] = useState<Wildlife | null>(null)
  const PAGE_SIZE = 10
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return wildlife.filter(a => {
      const matchesSearch = !q || a.thName.includes(q) || a.enName.toLowerCase().includes(q) || a.scientificName.toLowerCase().includes(q)
      const matchesType = !vertebrateType || a.vertebrateType === vertebrateType
      const matchesIUCN = !iucnStatus || a.iucnStatus === iucnStatus
      return matchesSearch && matchesType && matchesIUCN
    })
  }, [wildlife, search, vertebrateType, iucnStatus])

  // Reset pagination whenever filters change
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [search, vertebrateType, iucnStatus])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  function handleAnimalClick(animal: Wildlife) {
    // Show popup for quick view; navigate to parks if user wants to find the animal
    setSelectedAnimal(animal)
  }

  function handleFindParks() {
    if (selectedAnimal) {
      navigate(`/animal/${selectedAnimal.id}/parks`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 pt-4 pb-3 space-y-3">
        <h1 className="text-lg font-bold text-gray-900">🦁 ค้นหาสัตว์</h1>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          vertebrateType={vertebrateType}
          onVertebrateTypeChange={setVertebrateType}
          iucnStatus={iucnStatus}
          onIUCNStatusChange={setIUCNStatus}
        />
        {!loading && (
          <p className="text-xs text-gray-400">พบ {filtered.length} ชนิด</p>
        )}

      </div>

      {/* List */}
      <div className="px-4 py-3 space-y-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-gray-100" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p>ไม่พบสัตว์ที่ตรงกับการค้นหา</p>
          </div>
        ) : (
          visible.map(animal => (
            <AnimalCard key={animal.id} animal={animal} onClick={handleAnimalClick} />
          ))
        )}
      </div>

      {!loading && hasMore && (
        <div className="px-4 pb-6">
          <button
            onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            className="w-full py-3 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-600 active:scale-[0.98] transition-transform"
          >
            โหลดเพิ่ม ({filtered.length - visibleCount} ชนิดที่เหลือ)
          </button>
        </div>
      )}

      {/* Animal detail popup with "Find parks" CTA */}
      {selectedAnimal && (
        <AnimalBrowserPopup
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
          onFindParks={handleFindParks}
        />
      )}
    </div>
  )
}

// Extended popup with "Find Parks" button for the browser context
function AnimalBrowserPopup({ animal, onClose, onFindParks }: { animal: Wildlife; onClose: () => void; onFindParks: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {animal.imageUrl && (
          <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-gray-100">
            <img src={animal.imageUrl} alt={animal.enName} className="w-full h-full object-cover" />
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900">{animal.thName}</h2>
        <p className="text-base text-gray-600">{animal.enName}</p>
        <p className="text-sm text-gray-400 italic">{animal.scientificName}</p>

        <p className="mt-2 text-sm text-gray-500">
          พบได้ใน <strong className="text-gray-800">{animal.parkIds?.length ?? 0} อุทยาน</strong>
        </p>

        <div className="mt-4 flex gap-2">
          <button onClick={onFindParks} className="flex-1 btn-primary text-center">
            🗺 ค้นหาอุทยาน
          </button>
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600">
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}
