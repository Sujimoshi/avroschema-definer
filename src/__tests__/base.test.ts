import BaseSchema from '../base'

describe('BaseSchema', () => {
  const create = () => new BaseSchema<null>({ type: 'null' })

  it('BaseSchema.prototype.raw()', () => {
    expect(create().raw({ some: 'any' }).valueOf()).toEqual({ type: 'null', some: 'any' })
  })

  it('BaseSchema.prototype.logicalType()', () => {
    expect(create().logicalType('decimal', { precision: 10, scale: 2 }).valueOf())
      .toEqual({ type: 'null', logicalType: 'decimal', precision: 10, scale: 2 })
  })

  it('BaseSchema.prototype.name()', () => {
    expect(create().name('some').context).toEqual({ name: 'some' })
  })

  it('BaseSchema.prototype.namespace()', () => {
    expect(create().namespace('some.any').context).toEqual({ namespace: 'some.any' })
  })

  it('BaseSchema.prototype.aliases()', () => {
    expect(create().aliases('some', 'any').context).toEqual({ aliases: ['some', 'any'] })
  })

  it('BaseSchema.prototype.doc()', () => {
    expect(create().doc('some').context).toEqual({ doc: 'some' })
  })

  it('BaseSchema.prototype.default()', () => {
    expect(create().default(null).context).toEqual({ default: null })
  })

  it('BaseSchema.prototype.order()', () => {
    expect(create().order('ascending').context).toEqual({ order: 'ascending' })
  })
})
