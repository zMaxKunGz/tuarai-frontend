import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWildlife } from '../hooks/useWildlife'
import { AnimalCard } from '../components/AnimalCard'
import { FilterBar } from '../components/FilterBar'
import { IUCNBadge } from '../components/IUCNBadge'
import { VERTEBRATE_LABEL } from '../utils/dangerLevel'

import type { Wildlife, VertebateType, IUCNStatus } from '../types'

type SearchMode = 'normal' | 'ai'

interface AiSearchLocation {
  protected_area_th?: string
  protected_area_en?: string
  site_code?: string
  locality_th?: string
  locality_en?: string
  province?: string
  x_indian75?: number
  y_indian75?: number
}

interface AiSearchMatch {
  score: number
  matched_keywords: string[]
  name_th: string
  scientific_name: string
  common_name: string
  category: string
  iucn_status: IUCNStatus
  locations: AiSearchLocation[]
  location_names: string[]
  image_url?: string
}

interface AiSearchResponse {
  keywords: string[]
  matches: AiSearchMatch[]
}

const AI_SEARCH_ENDPOINT = import.meta.env.VITE_AI_SEARCH_ENDPOINT || '/ai-search/keywords'

export function AnimalBrowser() {
  const { wildlife, loading } = useWildlife()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [searchMode, setSearchMode] = useState<SearchMode>('normal')
  const [vertebrateType, setVertebrateType] = useState<VertebateType | ''>('')
  const [iucnStatus, setIUCNStatus] = useState<IUCNStatus | ''>('')
  const [selectedAnimal, setSelectedAnimal] = useState<Wildlife | null>(null)
  const [aiResults, setAiResults] = useState<AiSearchMatch[]>([])
  const [aiKeywords, setAiKeywords] = useState<string[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSubmittedQuery, setAiSubmittedQuery] = useState('')
  const [aiSubmitToken, setAiSubmitToken] = useState(0)
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

  const aiFilteredResults = useMemo(() => {
    return aiResults.filter(result => {
      const matchesType =
        !vertebrateType ||
        VERTEBRATE_LABEL[vertebrateType] === result.category
      const matchesIUCN = !iucnStatus || result.iucn_status === iucnStatus
      return matchesType && matchesIUCN
    })
  }, [aiResults, vertebrateType, iucnStatus])

  // Reset pagination whenever filters change
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [search, vertebrateType, iucnStatus])

  useEffect(() => {
    if (searchMode !== 'ai') {
      setAiResults([])
      setAiKeywords([])
      setAiError(null)
      setAiLoading(false)
      setAiSubmittedQuery('')
      return
    }

    const query = aiSubmittedQuery.trim()
    if (!query) {
      setAiResults([])
      setAiKeywords([])
      setAiError(null)
      setAiLoading(false)
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => {
      async function runAiSearch() {
        setAiLoading(true)
        setAiError(null)
        try {
          const response = await fetch(AI_SEARCH_ENDPOINT, {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              context: query,
              max_keywords: 5,
              match_limit: 10,
            }),
            signal: controller.signal,
          })

          if (!response.ok) {
            throw new Error(`AI search failed with status ${response.status}`)
          }

          const data = (await response.json()) as AiSearchResponse
          setAiKeywords(data.keywords ?? [])
          setAiResults(data.matches ?? [])
        } catch (err) {
          if (controller.signal.aborted) return
          console.error('AI search failed:', err)
          setAiResults([])
          setAiKeywords([])
          setAiError(err instanceof Error ? err.message : 'AI search failed')
        } finally {
          if (!controller.signal.aborted) {
            setAiLoading(false)
          }
        }
      }

      void runAiSearch()
    }, 350)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [searchMode, aiSubmitToken])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const aiVisible = aiFilteredResults

  function handleAnimalClick(animal: Wildlife) {
    // Show popup for quick view; navigate to parks if user wants to find the animal
    setSelectedAnimal(animal)
  }

  function handleFindParks() {
    if (selectedAnimal) {
      navigate(`/animal/${selectedAnimal.id}/parks`)
    }
  }

  function handleSearchModeChange(nextMode: SearchMode) {
    setSearch('')
    setSearchMode(nextMode)
    setAiSubmittedQuery('')
    setAiResults([])
    setAiKeywords([])
    setAiError(null)
    setAiLoading(false)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 pt-4 pb-3 space-y-3">
        <h1 className="text-lg font-bold text-gray-900">🦁 ค้นหาสัตว์</h1>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchMode={searchMode}
          onSearchModeChange={handleSearchModeChange}
          onSearchSubmit={() => {
            if (searchMode === 'ai') {
              setAiSubmittedQuery(search)
              setAiSubmitToken(token => token + 1)
            }
          }}
          vertebrateType={vertebrateType}
          onVertebrateTypeChange={setVertebrateType}
          iucnStatus={iucnStatus}
          onIUCNStatusChange={setIUCNStatus}
        />
        {!loading && searchMode === 'normal' && (
          <p className="text-xs text-gray-400">พบ {filtered.length} ชนิด</p>
        )}
        {!aiLoading && searchMode === 'ai' && aiKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {aiKeywords.map(keyword => (
              <span key={keyword} className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">
                {keyword}
              </span>
            ))}
          </div>
        )}
        {searchMode === 'ai' && aiError && (
          <p className="text-xs text-red-500">{aiError}</p>
        )}

      </div>

      {/* List */}
      <div className="px-4 py-3 space-y-2">
        {searchMode === 'normal' && loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-gray-100" />
          ))
        ) : searchMode === 'normal' && filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p>ไม่พบสัตว์ที่ตรงกับการค้นหา</p>
          </div>
        ) : searchMode === 'ai' && !aiSubmittedQuery.trim() ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🤖</p>
            <p>พิมพ์คำอธิบายแล้วกด Enter เพื่อค้นหาด้วย AI</p>
          </div>
        ) : searchMode === 'ai' && aiLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-28 animate-pulse bg-gray-100" />
          ))
        ) : searchMode === 'ai' && aiSubmittedQuery.trim() && aiVisible.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🤖</p>
            <p>ไม่พบผลลัพธ์จาก AI search</p>
          </div>
        ) : searchMode === 'ai' ? (
          aiVisible.map(result => (
            <AiMatchCard key={`${result.name_th}-${result.scientific_name}`} result={result} />
          ))
        ) : (
          visible.map(animal => (
            <AnimalCard key={animal.id} animal={animal} onClick={handleAnimalClick} />
          ))
        )}
      </div>

      {searchMode === 'normal' && !loading && hasMore && (
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

function AiMatchCard({ result }: { result: AiSearchMatch }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
          {result.image_url ? (
            <img src={result.image_url} alt={result.common_name || result.name_th} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🦎</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{result.name_th}</p>
              <p className="text-xs text-gray-500 truncate">{result.common_name}</p>
              <p className="text-xs text-gray-400 italic truncate">{result.scientific_name}</p>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700">{result.score}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <IUCNBadge status={result.iucn_status} />
            <span className="badge bg-gray-100 text-gray-600">{result.category}</span>
          </div>
        </div>
      </div>
      {result.matched_keywords.length > 0 && (
        <div className="px-3 pb-3 flex flex-wrap gap-2">
          {result.matched_keywords.map(keyword => (
            <span key={keyword} className="badge bg-blue-50 text-blue-700">
              {keyword}
            </span>
          ))}
        </div>
      )}
      {result.location_names.length > 0 && (
        <div className="border-t border-gray-50 px-3 py-2 text-xs text-gray-500">
          พบใน: {result.location_names.slice(0, 3).join(' · ')}
          {result.location_names.length > 3 ? ' ...' : ''}
        </div>
      )}
    </div>
  )
}

// Extended popup with "Find Parks" button for the browser context
function AnimalBrowserPopup({ animal, onClose, onFindParks }: { animal: Wildlife; onClose: () => void; onFindParks: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 pb-0">
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
            <p className="mt-1 text-sm text-gray-500">
              พบได้ใน <strong className="text-gray-800">{animal.parkIds?.length ?? 0} อุทยาน</strong>
            </p>
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

          <div className="flex gap-2 pt-1">
            <button onClick={onFindParks} className="flex-1 btn-primary text-center">
              🗺 ค้นหาอุทยาน
            </button>
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600">
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
