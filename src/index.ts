import { ArrayAvroSchema, MapAvroSchema, EnumAvroSchema, FixedAvroSchema, RecordAvroSchema, FieldAvroSchema, BaseAvroSchema } from './types'
import BaseSchema, { pick } from './base'

export { BaseSchema }
export * from './types'

export { default as templater, avscToDefinerCode, parseSchema } from './templater'

export class SchemaFactory extends BaseSchema {
  /**
   * Primitive type. Corresponds to no value
   *
   * @example { "type": "null" }
   *
   * @reference https://avro.apache.org/docs/1.9.2/spec.html#schema_primitive
   */
  null () {
    return new BaseSchema<null>({ type: 'null' }).copyWith(this)
  }

  /**
   * Primitive type. Corresponds to a binary value
   *
   * @example { "type": "boolean" }
   *
   * @reference https://avro.apache.org/docs/1.9.2/spec.html#schema_primitive
   */
  boolean () {
    return new BaseSchema<boolean>({ type: 'boolean' }).copyWith(this)
  }

  /**
   * Primitive type. Corresponds to 32-bit signed integer
   *
   * @example { "type": "int" }
   *
   * @reference https://avro.apache.org/docs/1.9.2/spec.html#schema_primitive
   */
  int () {
    return new BaseSchema<number>({ type: 'int' }).copyWith(this)
  }

  /**
   * Primitive type. Corresponds to 64-bit signed integer
   *
   * @example { "type": "long" }
   *
   * @reference https://avro.apache.org/docs/1.9.2/spec.html#schema_primitive
   */
  long () {
    return new BaseSchema<number>({ type: 'long' }).copyWith(this)
  }

  /**
   * Primitive type. Corresponds to single precision (32-bit) IEEE 754 floating-point number
   *
   * @example { "type": "float" }
   *
   * @reference https://avro.apache.org/docs/1.9.2/spec.html#schema_primitive
   */
  float () {
    return new BaseSchema<number>({ type: 'float' }).copyWith(this)
  }

  /**
   * Primitive type. Corresponds to double precision (64-bit) IEEE 754 floating-point number
   *
   * @example { "type": "double" }
   *
   * @reference https://avro.apache.org/docs/1.9.2/spec.html#schema_primitive
   */
  double () {
    return new BaseSchema<number>({ type: 'double' }).copyWith(this)
  }

  /**
   * Primitive type. Corresponds to sequence of 8-bit unsigned bytes
   *
   * @example { "type": "bytes" }
   *
   * @reference https://avro.apache.org/docs/1.9.2/spec.html#schema_primitive
   */
  bytes () {
    return new BaseSchema<Buffer>({ type: 'bytes' }).copyWith(this)
  }

  /**
   * Primitive type. Corresponds to unicode character sequence
   *
   * @example { "type": "string" }
   *
   * @reference https://avro.apache.org/docs/1.9.2/spec.html#schema_primitive
   */
  string () {
    return new BaseSchema<string>({ type: 'string' }).copyWith(this)
  }

  /**
   * Complex type. Correspond to record of values keyed by strings
   *
   * @example { "type": "record", "fields": [ { "name": "value", "type": "long" } ] }
   *
   * @reference http://avro.apache.org/docs/1.9.2/spec.html#schema_record
   */
  record <T extends Record<string, BaseSchema<any, any>>> (record: T) {
    const fields: FieldAvroSchema[] = []
    for (const name in record) {
      const schema = record[name]
      fields.push({ ...pick(schema.context)('doc', 'default', 'order', 'aliases'), name, type: schema.valueOf() })
    }
    return new BaseSchema<{ [K in keyof T]: T[K]['type'] }, RecordAvroSchema>(
      { type: 'record', fields },
      ['name', 'namespace', 'aliases', 'doc']
    ).copyWith(this)
  }

  /**
   * Complex type. Correspond to enumerated type of strings
   *
   * @example { "type": "enum", "symbols": [ "some", "any" ] }
   *
   * @reference http://avro.apache.org/docs/1.9.2/spec.html#Enums
   */
  enum <T extends string[]> (...symbols: T) {
    return new BaseSchema<T[number], EnumAvroSchema>(
      { type: 'enum', symbols },
      ['name', 'namespace', 'aliases', 'default', 'doc']
    ).copyWith(this)
  }

  /**
   * Complex type. Correspond to array of specified type
   *
   * @example { "type": "array", "items": { type: "string" } }
   *
   * @reference http://avro.apache.org/docs/1.9.2/spec.html#Arrays
   */
  array <T extends BaseSchema> (items: T) {
    return new BaseSchema<T['type'][], ArrayAvroSchema>(
      { type: 'array', items: items.valueOf() }
    ).copyWith(this)
  }

  /**
   * Complex type. Correspond to map of specified type
   *
   * @example { "type": "map", "values": { type: "string" } }
   *
   * @reference http://avro.apache.org/docs/1.9.2/spec.html#Maps
   */
  map <T extends BaseSchema> (values: T) {
    return new BaseSchema<Record<string, T['type']>, MapAvroSchema>(
      { type: 'map', values: values.valueOf() }
    ).copyWith(this)
  }

  /**
   * Complex type. Correspond to the given number of bytes per value
   *
   * @example { "type": "fixed", "size": 16 }
   *
   * @reference http://avro.apache.org/docs/1.9.2/spec.html#Fixed
   */
  fixed (size: number) {
    return new BaseSchema<Buffer, FixedAvroSchema>(
      { type: 'fixed', size },
      ['name', 'namespace', 'aliases']
    ).copyWith(this)
  }

  /**
   * Complex type. Correspond to the value which may be one of given types
   *
   * @example ["null", "string"]
   *
   * @reference http://avro.apache.org/docs/1.9.2/spec.html#Unions
   */
  union <T extends BaseSchema[]> (...args: T) {
    return new BaseSchema<T[number]['type'], BaseAvroSchema[]>(args.map(arg => arg.valueOf()))
  }
}

const A = new SchemaFactory()

export default A
