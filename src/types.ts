export interface BaseAvroSchema {
  type: 'null' | 'boolean' | 'int' | 'long' | 'float' | 'double' | 'bytes' | 'string' | 'record' | 'enum' | 'array' | 'map' | 'fixed'
  logicalType?: 'decimal' | 'uuid' | 'date' | 'time-millis' | 'time-micros' | 'timestamp-millis' | 'timestamp-micros' | 'duration',
  precision?: number,
  scale?: number
}

export interface ArrayAvroSchema extends BaseAvroSchema {
  type: 'array'
  items: BaseAvroSchema
}

export interface MapAvroSchema extends BaseAvroSchema {
  type: 'map'
  values: BaseAvroSchema
}

export interface FieldAvroSchema {
  type: BaseAvroSchema | BaseAvroSchema[]
  name: string
  aliases?: string[]
  doc?: string
  default?: any
  order?: 'ascending' | 'descending' | 'ignore'
}

export interface RecordAvroSchema extends BaseAvroSchema {
  type: 'record'
  fields: FieldAvroSchema[]
  name: string
  namespace?: string
  aliases?: string[]
  doc?: string
}

export interface EnumAvroSchema extends BaseAvroSchema {
  type: 'enum'
  symbols: string[]
  default?: this['symbols'][number]
  name: string
  namespace?: string
  aliases?: string[]
  doc?: string
}

export interface FixedAvroSchema extends BaseAvroSchema {
  type: 'fixed'
  size: number
  name: string
  namespace?: string
  aliases?: string[]
}
