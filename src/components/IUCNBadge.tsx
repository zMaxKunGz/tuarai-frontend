import { IUCN_COLOR, IUCN_LABEL } from '../utils/dangerLevel'

interface Props {
  status: string
  showLabel?: boolean
}

export function IUCNBadge({ status, showLabel = false }: Props) {
  const color = IUCN_COLOR[status] ?? { bg: 'bg-gray-400', text: 'text-white' }
  return (
    <span className={`badge ${color.bg} ${color.text}`}>
      {status}{showLabel && ` · ${IUCN_LABEL[status]}`}
    </span>
  )
}
