import liff from '@line/liff'
import { useEffect, useRef, useState } from 'react'

const DEMO_IMAGE_URL = 'https://scontent.fbkk5-7.fna.fbcdn.net/v/t1.6435-9/50512696_1210100585811121_3283193088347996160_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=13d280&_nc_eui2=AeGJVYklAPdKBfagDRNwx3yb0tYjdOocvbnS1iN06hy9uWYNJ0ZuRFy2Iozke7iOriPAd7AdSlyVZNJSoUHibBZY&_nc_ohc=E3aE9uNhamsQ7kNvwHo1bu3&_nc_oc=AdreqbVBahnlJJ7bHJYdjQGEiOCT8QV2JW-0e2TlG_fqLFtXfNzjoBZUMhitamIoa8k&_nc_zt=23&_nc_ht=scontent.fbkk5-7.fna&_nc_gid=8d3_Agc6T2VM8KjElXGU9Q&_nc_ss=7b2a8&oh=00_Af6GPpME-f23htfW23FHI-EGBAkF0jMHcUYgAh_A9WerrQ&oe=6A1C89AE'

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
    setError(null)
  }

  async function handleSubmit() {
    if (!previewUrl) {
      setError('กรุณาเลือกภาพก่อน')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const imageUrl = DEMO_IMAGE_URL

      const { latitude, longitude } = gps
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`
      const coordText = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`

      // 2. Send flex message (display card) + signal text for backend
      await liff.sendMessages([
        {
          type: 'flex',
          altText: `🐾 พบสัตว์ที่ไม่รู้จัก — ${coordText}`,
          contents: {
            type: 'bubble',
            hero: {
              type: 'image',
              url: imageUrl,
              size: 'full',
              aspectRatio: '20:13',
              aspectMode: 'cover',
            },
            body: {
              type: 'box',
              layout: 'vertical',
              spacing: 'md',
              contents: [
                {
                  type: 'text',
                  text: '🐾 พบสัตว์ที่ไม่รู้จัก',
                  weight: 'bold',
                  size: 'xl',
                  wrap: true,
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  spacing: 'sm',
                  contents: [
                    { type: 'text', text: '📍', flex: 0 },
                    {
                      type: 'text',
                      text: `${gps.label}\n${coordText}`,
                      size: 'sm',
                      color: '#666666',
                      flex: 1,
                      wrap: true,
                    },
                  ],
                },
                {
                  type: 'text',
                  text: `แหล่ง GPS: ${gpsSource === 'real' ? 'จริง' : 'จำลอง'}`,
                  size: 'xs',
                  color: gpsSource === 'real' ? '#16a34a' : '#d97706',
                },
              ],
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'button',
                  action: { type: 'uri', label: '🗺 ดูแผนที่', uri: mapsUrl },
                  style: 'primary',
                  color: '#16a34a',
                },
              ],
            },
          },
        },
      ])

      liff.closeWindow()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('sendMessages error:', msg)
      setError(`เกิดข้อผิดพลาด: ${msg}`)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold text-gray-900">📸 แจ้งพบสัตว์</h1>
        <p className="text-xs text-gray-500 mt-0.5">ถ่ายภาพสัตว์พร้อมพิกัด เพื่อให้ระบบระบุชนิด</p>
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
          disabled={submitting || !previewUrl}
          className="w-full py-4 rounded-2xl bg-green-600 text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              กำลังอัปโหลดและส่ง...
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
