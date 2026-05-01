import liff from '@line/liff'
import { useEffect, useRef, useState } from 'react'

interface GpsLocation {
  latitude: number
  longitude: number
  label: string
}

const MOCK_LOCATION: GpsLocation = {
  latitude: 14.4284,
  longitude: 101.3782,
  label: 'อุทยานแห่งชาติเขาใหญ่ (จำลอง)',
}

export function ReportSighting() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [hasImage, setHasImage] = useState(false)
  const [gps, setGps] = useState<GpsLocation>(MOCK_LOCATION)
  const [gpsSource, setGpsSource] = useState<'real' | 'mock'>('mock')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setGps({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: 'ตำแหน่งปัจจุบัน',
        })
        setGpsSource('real')
      },
      () => { /* keep mock */ },
      { timeout: 6000 },
    )
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    setHasImage(true)
    setError(null)
  }

  async function handleSubmit() {
    if (!hasImage) {
      setError('กรุณาเลือกภาพก่อน')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const coordText = `${gps.latitude.toFixed(5)}, ${gps.longitude.toFixed(5)}`
      const mapsUrl = `https://maps.google.com/?q=${gps.latitude},${gps.longitude}`

      await liff.sendMessages([
        {
          type: 'location',
          title: `พิกัดที่พบสัตว์ (${gpsSource === 'real' ? 'GPS จริง' : 'จำลอง'})`,
          address: `${coordText} — ${gps.label}`,
          latitude: gps.latitude,
          longitude: gps.longitude,
        },
        {
          type: 'text',
          text:
            `🐾 พบสัตว์ที่ไม่รู้จัก!\n` +
            `📍 พิกัด: ${coordText}\n` +
            `🗺 ดูแผนที่: ${mapsUrl}\n\n` +
            `แนบภาพมาด้วยครับ/ค่ะ กรุณาช่วยระบุชนิดสัตว์ในภาพด้วย 🙏`,
        },
      ])

      liff.closeWindow()
    } catch (err) {
      console.error(err)
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold text-gray-900">📸 แจ้งพบสัตว์</h1>
        <p className="text-xs text-gray-500 mt-0.5">ถ่ายภาพสัตว์พร้อมพิกัด เพื่อให้เจ้าหน้าที่ระบุชนิด</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Image picker */}
        <div
          className="w-full aspect-video rounded-2xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-transform overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center space-y-2 p-6">
              <div className="text-5xl">📷</div>
              <p className="text-sm font-medium text-gray-700">แตะเพื่อถ่ายภาพหรือเลือกจากคลัง</p>
              <p className="text-xs text-gray-400">รองรับ JPG, PNG, HEIC</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {previewUrl && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white"
          >
            เปลี่ยนภาพ
          </button>
        )}

        {/* GPS card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">📍</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{gps.label}</p>
              <p className="text-xs text-gray-400 font-mono">
                {gps.latitude.toFixed(5)}, {gps.longitude.toFixed(5)}
              </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${gpsSource === 'real' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {gpsSource === 'real' ? 'GPS จริง' : 'จำลอง'}
            </span>
          </div>
          {gpsSource === 'mock' && (
            <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2">
              ไม่สามารถรับ GPS ได้ ใช้พิกัดจำลอง (เขาใหญ่) แทน
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !hasImage}
          className="w-full py-4 rounded-2xl bg-green-600 text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              กำลังส่ง...
            </span>
          ) : (
            '📤 ส่งรายงานไปยังแชท'
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          หลังส่งแล้วหน้าต่างจะปิดอัตโนมัติ
        </p>
      </div>
    </div>
  )
}
