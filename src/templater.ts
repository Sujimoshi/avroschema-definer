import { compile } from 'ejs'
import json5 from 'json5'
import commentParser, { Tag } from 'comment-parser'
import { BaseAvroSchema, RecordAvroSchema, ArrayAvroSchema, FixedAvroSchema, MapAvroSchema, EnumAvroSchema, FieldAvroSchema } from './types'
import { Common } from './base'

export const defaultTemplate = `import A from 'avroschema-definer'

<% if (comment.description) { -%>
/**
 * <%= comment.description %>
 */
<% } -%>
const <%= comment.tags ? comment.tags.variableName.name : 'Schema' %> = <%- avscToDefinerCode(schema) %>

export default <%= comment.tags ? comment.tags.variableName.name : 'Schema' %>
`

export const parseSchema = (schema: string) => {
  const [comment] = commentParser(schema)
  const avro: BaseAvroSchema | BaseAvroSchema[] = json5.parse(schema)
  return {
    comment: {
      description: comment?.description,
      tags: comment?.tags.reduce<Record<string, Tag>>((temp, el) => ({ ...temp, [el.tag]: el }), {})
    },
    schema: avro,
    avscToDefinerCode
  }
}

export default (template: string = defaultTemplate) => {
  const render = compile(template)
  return (schema: string, data?: Record<string, string>) => render({ ...parseSchema(schema), ...data })
}

const defaultLogicalTypesMapping = {
  'timestamp-millis': '<Date>',
  date: '<Date>',
  decimal: '<number>'
}

function escapeJsComment (value: string) {
  return value
    .replace(/[/][*]/g, '\\/*')
    .replace(/[*][/]/g, '*\\/')
}

function composeJSDoc (field: FieldAvroSchema): string {
  const jsdocItems = ['/**']
  if (field.aliases) jsdocItems.push(` * @avro-aliases ${escapeJsComment(field.aliases.join(','))}`)
  if (field.order) jsdocItems.push(` * @avro-order ${escapeJsComment(field.order)}`)
  if (field.doc) jsdocItems.push(` * @avro-doc ${escapeJsComment(field.doc)}`)
  if (field.default) jsdocItems.push(` * @avro-default ${escapeJsComment(field.default)}`)
  jsdocItems.push(' */\n')

  if (jsdocItems.length === 2) return ''
  return jsdocItems.map(v => `  ${v}`).join('\n')
}

export const avscToDefinerCode = (avro: BaseAvroSchema | BaseAvroSchema[], logicalTypesMapping: Record<string, string> = defaultLogicalTypesMapping) => {
  const recursive = (avro: BaseAvroSchema | BaseAvroSchema[]): string => {
    const typeName = Array.isArray(avro) ? 'union' : typeof avro === 'string' ? avro : avro.type

    if (!typeName) { throw new Error(`${avro} not valid`) }

    const mapping: Record<string, any> = {
      record: (record: RecordAvroSchema) => {
        return `.record({\n${record.fields.map(field => {
            const jsdocSection = composeJSDoc(field)
            return `${jsdocSection}  ${field.name}: ${recursive(field.type)}${suffix(field as unknown as Common)}`
          }).join(',\n')}\n})`
      },
      array: (array: ArrayAvroSchema) => {
        return `.array(${recursive(array.items)})`
      },
      union: (union: BaseAvroSchema[]) => {
        return `.union(${union.map(recursive).join(', ')})`
      },
      fixed: (fixed: FixedAvroSchema) => {
        return `.fixed(${fixed.size})`
      },
      map: (map: MapAvroSchema) => {
        return `.map(${recursive(map.values)})`
      },
      enum: (enumerable: EnumAvroSchema) => {
        return `.enum('${enumerable.symbols.join('\', \'')}')`
      },
      default: (type: BaseAvroSchema, typeName: string) => {
        return `.${typeName}()`
      }
    }

    const prefix = (common: Common) => {
      if (typeof common !== 'object') { return '' }
      const name = common.name ? `.name('${common.name}')` : ''
      const namespace = common.namespace
        ? `.namespace('${common.namespace}')`
        : ''
      return name + namespace
    }

    const logicalType = (type: BaseAvroSchema) => {
      if (typeof type !== 'object' || !type.logicalType) { return '' }

      return `.logicalType${logicalTypesMapping[type.logicalType] || ''}('${type.logicalType}'${type.precision && type.scale
        ? `, { precision: ${type.precision}, scale: ${type.scale} }`
        : ''})`
    }

    const suffix = (common: Common) => {
      if (typeof common !== 'object') { return '' }
      const doc = common.doc ? `.doc('${common.doc.replace(/'/g, "\\'")}')` : ''
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
      prefix(avro as unknown as Common) +
      (mapping[typeName] || mapping.default)(avro, typeName) +
      logicalType(avro as BaseAvroSchema) +
      suffix(avro as unknown as Common)
    )
  }

  return recursive(avro)
}
