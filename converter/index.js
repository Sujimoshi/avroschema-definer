const fromPlain = (avro) => {
  const typeName = Array.isArray(avro)
    ? 'union'
    : typeof avro === 'string'
      ? avro
      : avro.type
  if (!typeName) { throw new Error(`${avro} not valid`) }
  const mapping = {
    record: (record) => {
      return `.record({\n${record.fields.map(field => {
          return `  ${field.name}: ${fromPlain(field.type)}${suffix(field)}`
        }).join(',\n')}\n})`
    },
    array: (array) => {
      return `.array(${fromPlain(array.items)})`
    },
    union: (union) => {
      return `.union(${union.map(fromPlain).join(', ')})`
    },
    default: (type, typeName) => {
      return `.${typeName}()`
    }
  }
  const prefix = (common) => {
    if (typeof common !== 'object') { return '' }
    const name = common.name ? `.name('${common.name}')` : ''
    const namespace = common.namespace
      ? `.namespace('${common.namespace}')`
      : ''
    return name + namespace
  }
  const logicalType = (type) => {
    if (typeof type !== 'object' || !type.logicalType) { return '' }
    const typeMapping = {
      'timestamp-millis': '<Date>',
      date: '<Date>',
      decimal: '<number>'
    }
    return `.logicalType${typeMapping[type.logicalType] || ''}('${type.logicalType}'${type.precision && type.scale
      ? `, { precision: ${type.precision}, scale: ${type.scale}}`
      : ''})`
  }
  const suffix = (common) => {
    if (typeof common !== 'object') { return '' }
    const doc = common.doc ? `.doc('${common.doc}')` : ''
    const def = common.default
      ? `.default(${JSON.stringify(common.default)})`
      : ''
    const order = common.order ? `.order('${common.order}')` : ''
    const aliases = common.aliases
      ? `.aliases('${common.aliases.join("', '")}')`
      : ''
    return def + doc + order + aliases
  }
  return ('A' +
      prefix(avro) +
      (mapping[typeName] || mapping.default)(avro, typeName) +
      logicalType(avro) +
      suffix(avro))
}

const input = document.querySelector('.input')
const output = document.querySelector('.output')
if (input && output) {
  input.addEventListener('keyup', () => {
    try {
      output.value = fromPlain(JSON.parse(input.value.replace(/(\/\*[\S\s]*?\*\/)|(\/\/[^\n]*)/gm, '')))
    } catch (e) {
      output.value = e.message
    }
  })
}
