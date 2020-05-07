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

This package provides simple, well typed API for creating Avro Schemas

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

## ⭐️ Show your support

Give a ⭐️ if this project helped you!

## 📚 Documentation

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