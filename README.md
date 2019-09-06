# Nets KAR Web Service API

This is a nodejs library that requests the Nets KAR Web Service API.

Contains both AMD and ESM modules and uses `request` for HTTP requests.

## Requirements

You'll need a PKCS12 (`.p12`) certificate and a passphrase for the embedded private key.

## Usage

Example:

```
import { createKar } from 'nets-kar'

createKar({ certificate: 'cert.p12', passphrase: '' })
  .verifyOwner('00000000000', '11111111111')
  .then(({ code, success, message }) => console.log(code, success, message))
  .catch(error => console.error('Request error', error))
```

Set the `mode` option to `"production"` when putting this into production. The default is `"development"`.

## Development

Uses Parcel for building the final AMD module.

Run `npm run build` to run build and `npm run test` for unit tests.

## Documentation

* https://www.nets.eu/no-nb/losninger/konto-og-adresseringsregister/Pages/dokumentasjon.aspx
