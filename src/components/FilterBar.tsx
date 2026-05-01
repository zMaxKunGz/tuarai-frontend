import type { VertebateType, IUCNStatus } from '../types'

const VERTEBRATE_OPTIONS: { value: VertebateType | ''; label: string }[] = [
  { value: '', label: 'ทุกประเภท' },
  { value: 'mammal', label: 'สัตว์เลี้ยงลูกด้วยนม' },
  { value: 'bird', label: 'นก' },
  { value: 'reptile', label: 'สัตว์เลื้อยคลาน' },
  { value: 'amphibian', label: 'สัตว์สะเทินน้ำสะเทินบก' },
]

const IUCN_OPTIONS: { value: IUCNStatus | ''; label: string }[] = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'CR', label: 'CR - ใกล้สูญพันธุ์อย่างยิ่ง' },
  { value: 'EN', label: 'EN - ใกล้สูญพันธุ์' },
  { value: 'VU', label: 'VU - มีความเสี่ยง' },
  { value: 'NT', label: 'NT - ใกล้ถูกคุกคาม' },
  { value: 'LC', label: 'LC - ไม่น่าเป็นห่วง' },
]

interface Props {
  search: string
  onSearchChange: (v: string) => void
  vertebrateType: VertebateType | ''
  onVertebrateTypeChange: (v: VertebateType | '') => void
  iucnStatus: IUCNStatus | ''
  onIUCNStatusChange: (v: IUCNStatus | '') => void
}

export function FilterBar({ search, onSearchChange, vertebrateType, onVertebrateTypeChange, iucnStatus, onIUCNStatusChange }: Props) {
  return (
    <div className="space-y-2">
      <input
        type="search"
        placeholder="ค้นหาชื่อสัตว์ (ไทย / อังกฤษ)..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        <div className="flex-shrink-0">
          <select
            value={vertebrateType}
            onChange={e => onVertebrateTypeChange(e.target.value as VertebateType | '')}
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {VERTEBRATE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-shrink-0">
          <select
            value={iucnStatus}
            onChange={e => onIUCNStatusChange(e.target.value as IUCNStatus | '')}
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {IUCN_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
