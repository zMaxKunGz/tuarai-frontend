import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { initLiff } from './liff'
import { AnimalBrowser } from './pages/AnimalBrowser'
import { AnimalParks } from './pages/AnimalParks'
import { ParkDetail } from './pages/ParkDetail'

export default function App() {
  const [liffReady, setLiffReady] = useState(false)
  const [liffError, setLiffError] = useState<string | null>(null)

  useEffect(() => {
    initLiff()
      .then(() => setLiffReady(true))
      .catch(err => {
        console.error('LIFF init failed:', err)
        // In non-LINE browser (dev), allow app to still render
        setLiffReady(true)
        setLiffError('ไม่ได้เปิดผ่าน LINE — บางฟีเจอร์อาจไม่ทำงาน')
      })
  }, [])

  if (!liffReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      {liffError && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-xs text-yellow-700 text-center">
          {liffError}
        </div>
      )}
      <Routes>
        <Route path="/" element={<AnimalBrowser />} />
        <Route path="/animal/:animalId/parks" element={<AnimalParks />} />
        <Route path="/park/:parkId" element={<ParkDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
