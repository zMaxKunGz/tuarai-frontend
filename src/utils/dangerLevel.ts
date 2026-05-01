import type { DangerLevel } from '../types'

export const DANGER_LEVEL_MAP: Record<string, DangerLevel> = {
  'ต่ำ': 'low',
  'ต่ำ-กลาง': 'low-medium',
  'กลาง': 'medium',
  'กลาง-สูง': 'medium-high',
  'สูง': 'high',
  'สูงมาก': 'very-high',
}

export const DANGER_LEVEL_LABEL: Record<DangerLevel, string> = {
  'low': 'ต่ำ',
  'low-medium': 'ต่ำ-กลาง',
  'medium': 'กลาง',
  'medium-high': 'กลาง-สูง',
  'high': 'สูง',
  'very-high': 'สูงมาก',
}

export const DANGER_LEVEL_COLOR: Record<DangerLevel, { bg: string; text: string; border: string }> = {
  'low':        { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200' },
  'low-medium': { bg: 'bg-lime-100',   text: 'text-lime-800',   border: 'border-lime-200' },
  'medium':     { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  'medium-high':{ bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  'high':       { bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-200' },
  'very-high':  { bg: 'bg-red-200',    text: 'text-red-900',    border: 'border-red-300' },
}

export const IUCN_COLOR: Record<string, { bg: string; text: string }> = {
  CR: { bg: 'bg-red-600',    text: 'text-white' },
  EN: { bg: 'bg-orange-500', text: 'text-white' },
  VU: { bg: 'bg-yellow-500', text: 'text-white' },
  NT: { bg: 'bg-blue-400',   text: 'text-white' },
  LC: { bg: 'bg-green-500',  text: 'text-white' },
}

export const IUCN_LABEL: Record<string, string> = {
  CR: 'ใกล้สูญพันธุ์อย่างยิ่ง',
  EN: 'ใกล้สูญพันธุ์',
  VU: 'มีความเสี่ยง',
  NT: 'ใกล้ถูกคุกคาม',
  LC: 'ไม่น่าเป็นห่วง',
}

export const VERTEBRATE_LABEL: Record<string, string> = {
  mammal:    'สัตว์เลี้ยงลูกด้วยนม',
  bird:      'นก',
  reptile:   'สัตว์เลื้อยคลาน',
  amphibian: 'สัตว์สะเทินน้ำสะเทินบก',
}

export const VERTEBRATE_EN_LABEL: Record<string, string> = {
  mammal:    'Mammal',
  bird:      'Bird',
  reptile:   'Reptile',
  amphibian: 'Amphibian',
}
