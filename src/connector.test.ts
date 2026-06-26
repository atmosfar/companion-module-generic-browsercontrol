import test from 'node:test'
import assert from 'node:assert'
import { PuppeteerConnector, puppeteerUtils } from './connector.js'

// Mock the utility object wrapper instead of the read-only package export
const originalConnect = puppeteerUtils.connect
puppeteerUtils.connect = async () => {
  return {
    disconnect: async () => {},
    pages: async () => [],
    on: () => {},
  } as any
}

test('PuppeteerConnector - initial state is disconnected', () => {
  const connector = new PuppeteerConnector('127.0.0.1', 9222)
  assert.strictEqual(connector.getStatus(), 'disconnected')
})

test('PuppeteerConnector - connect success', async () => {
  const connector = new PuppeteerConnector('127.0.0.1', 9222)
  await connector.connect()
  assert.strictEqual(connector.getStatus(), 'connected')
  assert.notStrictEqual(connector.getBrowser(), null)
})

test('PuppeteerConnector - disconnect success', async () => {
  const connector = new PuppeteerConnector('127.0.0.1', 9222)
  await connector.connect()
  await connector.disconnect()
  assert.strictEqual(connector.getStatus(), 'disconnected')
  assert.strictEqual(connector.getBrowser(), null)
})

test('PuppeteerConnector - connect failure', async () => {
  const mockConnect = puppeteerUtils.connect
  puppeteerUtils.connect = async () => {
    throw new Error('Connection failed')
  }

  const connector = new PuppeteerConnector('127.0.0.1', 9222)
  await assert.rejects(connector.connect(), /Connection failed/)
  assert.strictEqual(connector.getStatus(), 'disconnected')

  puppeteerUtils.connect = mockConnect
})

test('PuppeteerConnector - findPageByKeyword success', async () => {
  const connector = new PuppeteerConnector('127.0.0.1', 9222)
  const mockPages = [
    { title: async () => 'Google', url: () => 'https://google.com' },
    { title: async () => 'GitHub', url: () => 'https://github.com' },
    { title: async () => 'Companion', url: () => 'http://localhost:8000' },
  ]
  
  const mockConnect = puppeteerUtils.connect
  puppeteerUtils.connect = async () => {
    return {
      pages: async () => mockPages,
      disconnect: async () => {},
      on: () => {},
    } as any
  }

  await connector.connect()
  const page = await connector.findPageByKeyword('GitHub')
  assert.notStrictEqual(page, null)
  assert.strictEqual(await page?.title(), 'GitHub')

  const noPage = await connector.findPageByKeyword('NotFound')
  assert.strictEqual(noPage, null)

  puppeteerUtils.connect = mockConnect
})

test('PuppeteerConnector - findPageByKeyword when not connected', async () => {
  const connector = new PuppeteerConnector('127.0.0.1', 9222)
  const page = await connector.findPageByKeyword('test')
  assert.strictEqual(page, null)
})
