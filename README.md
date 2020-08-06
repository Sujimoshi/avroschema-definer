<h1 align="center">Welcome to avroschema-definer 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/avroschema-definer" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/avroschema-definer.svg">
  </a>
  <a href="https://www.isc.org/licenses/" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
  <img alt="Release" src="https://github.com/Sujimoshi/avroschema-definer/workflows/Release/badge.svg" />
  <a href="https://codecov.io/gh/Sujimoshi/avroschema-definer" target="_blank">
    <img alt="License: ISC" src="https://codecov.io/gh/Sujimoshi/avroschema-definer/branch/master/graph/badge.svg" />
  </a>
</p>

This package provides simple, well typed API for creating Avro Schemas.

### [Homepage](https://sujimoshi.github.io/avroschema-definer/) 

## 🔥 Install

```sh
npm install avroschema-definer
```

## 👌 Usage

This package is used to create Avro Schema definitions.  It was written in typescript and provide a lot of usefull info from typings, such as infering interface types from schema. 
> This package does not compile your schemas, it just provide simple API for creation of schemas (see [avsc](https://github.com/mtth/avsc) for compilation purposes).

Here is an example:

```ts
import A from 'avroschema-definer'

// Lets define a simple object schema
const UserSchema = A.name('user').namespace('com.mysite').record({
  name: A.string(),
  id: A.string().logicalType('uuid'),
  password: A.string(),
  role: A.enum('client', 'suplier'),
  birthday: A.union(A.null(), A.long()).default(null)
})

// Now lets get interface of User from schema
type User = typeof UserSchema.type;
/*
  type User = {
    name: string,
    email: string,
    password: string,
    role: 'client' | 'suplier',
    birthday: number | null
  }
*/

// Or get plain Avro Schema using .valueOf()
console.log(UserSchema.valueOf())
/*
{
  name: 'user',
  namespace: 'com.mysite',
  type: 'record',
  fields: [
    { name: 'name', type: { type: 'string' } },
    { name: 'id', type: { type: 'string', logicalType: 'uuid' } },
    { name: 'password', type: { type: 'string' } },
    {
      name: 'role',
      type: {
        name: 'role_value',
        type: 'enum',
        symbols: [ 'client', 'suplier' ]
      }
    },
    {
      default: null,
      name: 'birthday',
      type: [ { type: 'null' }, { type: 'long' } ]
    }
  ]
}
*/

```

## 🏃‍♂️ Migration from plain avro schemas
Working with plain .avsc schemas can be painfull. So I written small cli which can transpile your plain avro schemas into `avroschema-definer` code.

```bash
$ avroschema-definer template --help
avroschema-definer template <schema> [template] [out]

Allows you to transpile your .avsc files into js/ts code using ejs templates.

Options:
  --template, -t  Path to .ejs template file. If not provided default template
                  will be used. Options that can be used in the template:

                  comment.description? - Description parsed from comments

                  comment.tags?[tag].(tag | name | type | description) - Tags
                  in format (@tag {type} name description) parsed from comments

                  schema - Your plain avro schema parsed using `JSON.parse`

                  avscToDefinerCode(schema) - Function that transpile your
                  plain avro schema in avroschema-definer code
                                                              [By default: null]
  --out, -o       Output file path (relative to CWD)
                                               [By default: "./outputSchema.ts"]
  --schema, -s    Path to your .avsc file to parse (relative to CWD)
```

Example:

Lets say we have plain `schema.avsc`:

```avsc
/**
 * Some description
 *
 * @variableName NameFromCommentTag
 */
{
  "namespace": "namespace",
  "type": "record",
  "name": "someRecord",
  "fields": [
    { "name": "field", "aliases": ["first"], "type": { "type": "string", "logicalType": "uuid" }, "doc": "some field" },
    { "name": "arr", "order": "ascending", "type": { "type": "array", "items": "string" }, "doc": "some field" },
    { "name": "union", "type": ["string", "null"], "doc": "some union field" },
    { "name": "fixed", "type": { "type": "fixed", "size": 10, "logicalType": "decimal", "precision": 10, "scale": 10 }, "doc": "some union field" },
    { "name": "map", "type": { "type": "map", "values": "string" }, "doc": "some union field" },
    { "name": "enum", "type": { "type": "enum", "symbols": ["some", "any"], "default": "some" } }
  ]
}`
```

We can transpile it to `avroschema-definer` code with such command:

```bash
$ avroschema-definer template schema.avsc
```

After that `./outputSchema.ts` will be created with next output:

```typescript
import A from 'avroschema-definer'

/**
 * Some description // <--- This was parsed from schema.avsc top comment 
 */

// This name was also parsed from `@variableName NameFromCommentTag` tag from `schema.avsc`
//           |
//           |
const NameFromCommentTag = A.name('someRecord').namespace('namespace').record({
  field: A.string().logicalType('uuid').doc('some field').aliases('first'),
  arr: A.array(A.string()).doc('some field').order('ascending'),
  union: A.union(A.string(), A.null()).doc('some union field'),
  fixed: A.fixed(10).logicalType<number>('decimal', { precision: 10, scale: 10}).doc('some union field'),
  map: A.map(A.string()).doc('some union field'),
  enum: A.enum('some', 'any').default("some")
})
```

By default this script use next `.ejs` template:

```typescript
import A from 'avroschema-definer'
<% if (comment.description) { %>
/**
 * <%= comment.description %>
 */
<% } %>
const <%= comment.tags ? comment.tags.variableName.name : 'Schema' %> = <%- avscToDefinerCode(schema) %>

export default <%= comment.tags ? comment.tags.variableName.name : 'Schema' %>
```
You can pass custom `.ejs` template with `--template` option.

Full list of options available during rendering you can find in cli help:
```bash
$ avroschema-definer template --help
```

### Usage from code
Example of using transpiler from code:
```typescript
import { templater, avscToDefinerCode } from 'avroschema-definer'

const result = templater('Your <%= additionalData %> ejs template')(plainAvroSchemaString, { additionalData: 'awesome' })

console.log(result) // Your awesome ejs template

// Or you can use plain transpiler

console.log(avscToDefinerCode({ type: "string" })) // A.string()
```

## ⭐️ Show your support

Give a ⭐️ if this project helped you!

## 📚 API Documentation

Full documentation available [here](https://sujimoshi.github.io/avroschema-definer/)

### Main exported variable A: <a href="https://sujimoshi.github.io/avroschema-definer/classes/schemafactory.html">SchemaFactory</a> extends <a href="https://sujimoshi.github.io/avroschema-definer/classes/baseschema.html">BaseSchema</a>

<table>
    <tr>
        <th>Method</th>
        <th>Description</th>
        <th>Avro Schema</th>
    </tr>
    <tr>
        <td>A.null()</td>
        <td>No value</td>
        <td>{ "type": "null" }</td>
    </tr>
    <tr>
        <td>A.boolean()</td>
        <td>A binary value</td>
        <td>{ "type": "boolean" }</td>
    </tr>
    <tr>
        <td>A.int()</td>
        <td>32-bit signed integer</td>
        <td>{ "type": "int" }</td>
    </tr>
    <tr>
        <td>A.long()</td>
        <td>64-bit signed integer</td>
        <td>{ "type": "long" }</td>
    </tr>
    <tr>
        <td>A.float()</td>
        <td>Single precision (32-bit) IEEE 754 floating-point number</td>
        <td>{ "type": "float" }</td>
    </tr>
    <tr>
        <td>A.double()</td>
        <td>Double precision (64-bit) IEEE 754 floating-point number</td>
        <td>{ "type": "double" }</td>
    </tr>
    <tr>
        <td>A.bytes()</td>
        <td>Sequence of 8-bit unsigned bytes</td>
        <td>{ "type": "bytes" }</td>
    </tr>
    <tr>
        <td>A.string()</td>
        <td>Unicode character sequence</td>
        <td>{ "type": "string" }</td>
    </tr>
    <tr>
        <td>A.record(fields: { fieldName: Schema })</td>
        <td>Fully typed record</td>
        <td>{ "type": "record", fields: [] } }</td>
    </tr>
    <tr>
        <td>A.enum(...symbols: string[])</td>
        <td>Listing symbols, as JSON strings</td>
        <td>{ type: "enum", symbols: [] }</td>
    </tr>
    <tr>
        <td>A.array(items: Schema)</td>
        <td>Schema for the array of items</td>
        <td>{ "type": "array" items: {} }</td>
    </tr>
    <tr>
        <td>A.union(...schemas: Schema[])</td>
        <td>Declares a schema which may be one of given types</td>
        <td>[{ type: "" }, { type: "" }]</td>
    </tr>
    <tr>
        <td>A.fixed(size: number)</td>
        <td>Schema which specify the number of bytes per value</td>
        <td>{ "type": "fixed", "size": 16 }</td>
    </tr>
    <tr>
        <td>A.raw(plain: {})</td>
        <td>Set custom schema values</td>
        <td>{ ...plain }</td>
    </tr>
</table>

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Sujimoshi/avroschema-definer/issues).

### Run tests

```sh
npm run test
``` 

## Author

👤 **Igor Solomakha <fumo.sujimoshi@gmail.com>**

* Github: [@Sujimoshi](https://github.com/Sujimoshi)

## 📝 License

Copyright © 2020 [Igor Solomakha <fumo.sujimoshi@gmail.com>](https://github.com/Sujimoshi).<br />
This project is [ISC](https://www.isc.org/licenses/) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_