import { devServer } from 'https://renoirb.com/esm-modules/monorepo-maintenance-utils/dev-server.ts'

await devServer({
  port: 8000,
  defaultPackage: 'inline-note-element'
})