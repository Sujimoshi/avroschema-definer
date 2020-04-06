import A from '../index'

describe('SchemaFactory', () => {
  it('A.null()', () => {
    expect(A.null().valueOf()).toEqual({ type: 'null' })
  })

  it('A.boolean()', () => {
    expect(A.boolean().valueOf()).toEqual({ type: 'boolean' })
  })

  it('A.int()', () => {
    expect(A.int().valueOf()).toEqual({ type: 'int' })
  })

  it('A.long()', () => {
    expect(A.long().valueOf()).toEqual({ type: 'long' })
  })

  it('A.float()', () => {
    expect(A.float().valueOf()).toEqual({ type: 'float' })
  })

  it('A.double()', () => {
    expect(A.double().valueOf()).toEqual({ type: 'double' })
  })

  it('A.bytes()', () => {
    expect(A.bytes().valueOf()).toEqual({ type: 'bytes' })
  })

  it('A.string()', () => {
    expect(A.string().valueOf()).toEqual({ type: 'string' })
  })

  it('A.record()', () => {
    expect(A.record({ some: A.enum('some', 'any') }).valueOf())
      .toEqual({ type: 'record', fields: [{ name: 'some', type: { name: 'some_value', type: 'enum', symbols: ['some', 'any'] } }] })
  })

  it('A.record() with predefined field name', () => {
    expect(A.record({ some: A.enum('some', 'any').name('any') }).valueOf())
      .toEqual({ type: 'record', fields: [{ name: 'some', type: { name: 'any', type: 'enum', symbols: ['some', 'any'] } }] })
  })

  it('A.enum()', () => {
    expect(A.enum('some', 'any').valueOf()).toEqual({ type: 'enum', symbols: ['some', 'any'] })
  })

  it('A.array()', () => {
    expect(A.array(A.string()).valueOf()).toEqual({ type: 'array', items: { type: 'string' } })
  })

  it('A.map()', () => {
    expect(A.map(A.string()).valueOf()).toEqual({ type: 'map', values: { type: 'string' } })
  })

  it('A.fixed()', () => {
    expect(A.fixed(16).valueOf()).toEqual({ type: 'fixed', size: 16 })
  })

  it('A.union()', () => {
    expect(A.union(A.null(), A.string()).valueOf()).toEqual([{ type: 'null' }, { type: 'string' }])
  })
})
