import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import type {
  RasterLayerSpecification,
  LineLayerSpecification,
  FillLayerSpecification,
  SymbolLayerSpecification,
} from '@maplibre/maplibre-gl-style-spec/types'
import type { StatusTypes } from './constants'

export interface Tree {
  tree: TreeNode
}

export interface TreeNode {
  label?: string
  children?: Array<TreeNode>
  path?: string
  prefix?: string
  url?: string
  isRaster?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LayerList extends Array<Layer> {}

export interface Layer {
  name: string
  definition: RasterLayerSpecification | LineLayerSpecification | FillLayerSpecification | SymbolLayerSpecification
  type?: string
  info?: LayerInfo
  visible?: boolean | true
  url?: string
  features?: []
}

export interface LayerInfo {
  band_descriptions?: string[]
  band_metadata?: string[]
  bounds?: []
  colorinterp?: []
  count?: number
  driver?: string
  dtype?: string
  height?: number
  maxzoom?: number
  minzoom?: number
  nodata_type?: string
  nodata_value?: number
  overviews?: []
  width?: number
}

export interface Error {
  code: string
}

export interface LayerIcon {
  id: string
  label: string
  icon: IconProp
  color: string
}

export interface spriteIcon {
  width: number
  height: number
  x: number
  y: number
  pixelRatio: number
}

export interface BannerMessage {
  type: StatusTypes
  title: string
  message: string
}
