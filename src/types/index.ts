export type VertebateType = 'mammal' | 'bird' | 'reptile' | 'amphibian'
export type IUCNStatus = 'CR' | 'EN' | 'VU' | 'NT' | 'LC'
export type DangerLevel = 'low' | 'low-medium' | 'medium' | 'medium-high' | 'high' | 'very-high'

export interface Wildlife {
  id: string
  thName: string
  enName: string
  scientificName: string
  vertebrateType: VertebateType
  vertebrateTypeTh: string
  iucnStatus: IUCNStatus
  imageUrl: string
  parkIds: string[]
}

export interface ProtectedArea {
  id: string
  thName: string
  enName: string
  province: string
  googleMapUrl: string
  openCloseInfo: string
  warningData: string
  dangerLevel: DangerLevel
  dangerLevelTh: string
  wildlifeIds: string[]
}

export interface WildlifeSighting {
  wildlifeId: string
  protectedAreaId: string
  siteCode: string
  localityTh?: string
  localityEn?: string
  province?: string
  xIndian75?: number
  yIndian75?: number
}
