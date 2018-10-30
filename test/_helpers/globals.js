// mock fs so no tests accidently write to disk
jest.mock('fs', () => require('jest-plugin-fs/mock'))
process.on('unhandledRejection', console.error)
delete process.env['PGB_API_URL']
