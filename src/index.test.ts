import test from 'node:test'
import assert from 'node:assert'
import BrowserInstance from './main.js'

test('BrowserInstance can be successfully evaluated', () => {
  assert.notStrictEqual(BrowserInstance, null)
})
