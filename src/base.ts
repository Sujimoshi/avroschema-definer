import { BaseAvroSchema } from './types'

export interface Common {
  name: string
  namespace: string
  aliases: string[]
  doc: string
  default: any
  order: 'ascending' | 'descending' | 'ignore'
}

export const pick = <T extends {}>(obj: T) => (...fields: (keyof T)[]) =>
  fields.reduce((tmp, k) => ({ ...tmp, ...(obj[k] !== undefined && { [k]: obj[k] }) }), {})

export default class BaseSchema<T = any, S = BaseAvroSchema> {
  type: T
  plain: S
  context = <Common>{}
  extract: (keyof Common)[]

  constructor (plain?: Partial<S>, extract: Extract<keyof S, keyof Common>[] = []) {
    if (plain) this.plain = plain as S
    this.extract = extract
  }

  /**
   * Add custom fields to the schema
   */
  raw (plain: {}) {
    return this.copyWith({ plain })
  }

  /**
   * Set logical type for the schema
   *
   * @reference http://avro.apache.org/docs/1.9.2/spec.html#Logical+Types
   */
  logicalType (logicalType: Required<BaseAvroSchema>['logicalType'], raw?: { precision: number, scale?: number }): this;
  logicalType (logicalType: string, raw?: object): this;
  logicalType <N> (logicalType: Required<BaseAvroSchema>['logicalType'], raw?: { precision: number, scale?: number }): BaseSchema<N, S>;
  logicalType <N> (logicalType: string, raw?: object): BaseSchema<N, S>;
  logicalType <N> (logicalType: string, raw?: object): BaseSchema<N, S> {
    return this.copyWith({ plain: { logicalType, ...raw } }) as any
  }

  /**
   * Set name field for the schema
   *
   * @reference http://avro.apache.org/docs/1.9.2/spec.html#names
   */
  name (name: string) {
    return this.copyWith({ context: { name } })
  }

  /**
   * Set namespace field for the schema
   *
   * @reference http://avro.apache.org/docs/1.9.2/spec.html#names
   */
  namespace (namespace: string) {
    return this.copyWith({ context: { namespace } })
  }

  /**
   * Set aliases field for the schema
   *
   * @reference http://avro.apache.org/docs/1.9.2/spec.html#Aliases
   */
  aliases (...aliases: string[]) {
    return this.copyWith({ context: { aliases } })
  }

  /**
   * Set doc field for the schema
   *
   * @reference http://avro.apache.org/docs/1.9.2/spec.html#schema_complex
   */
  doc (doc: string) {
    return this.copyWith({ context: { doc } })
  }

  /**
   * Set default field for the schema
   *
   * @reference http://avro.apache.org/docs/1.9.2/spec.html#schema_complex
   */
  default (def: T) {
    return this.copyWith({ context: { default: def } })
  }

  /**
   * Set order field for the record field schema
   *
   * @reference http://avro.apache.org/docs/1.9.2/spec.html#schema_complex
   */
  order (order: 'ascending' | 'descending' | 'ignore') {
    return this.copyWith({ context: { order } })
  }

  /**
   * Make copy of current schema with modified values
   *
   * @param modifyObject
   */
  copyWith (modifyObject: any): this {
    return Object.assign(Object.create(this.constructor.prototype), {
      ...this,
      ...modifyObject,
      extract: modifyObject.extract ? [...this.extract, ...modifyObject.extract] : this.extract,
      plain: Array.isArray(this.plain) ? this.plain : { ...this.plain, ...modifyObject.plain },
      context: { ...this.context, ...modifyObject.context }
    })
  }

  /**
   * It returns the plain schema
   */
  valueOf (): S {
    return Array.isArray(this.plain)
      ? this.plain
      : { ...pick(this.context)(...this.extract), ...this.plain }
  }
}
