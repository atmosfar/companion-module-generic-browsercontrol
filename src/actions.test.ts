import test from 'node:test'
import assert from 'node:assert'
import { createActionDefinitions, type ActionContext } from './actions.js'

const config = {
	browserType: 'chrome',
	host: '127.0.0.1',
	port: 9222,
	tabKeyword: 'test',
} as any

/** Build an ActionContext around a mock page (or null to simulate "not found"). */
function makeContext(mockPage: any): ActionContext {
	const logs: string[] = []
	const variableValues: Record<string, unknown> = {}
	const ctx: ActionContext = {
		config,
		getConnector: () =>
			({
				findPageByKeyword: async () => mockPage,
				getBrowser: () => null,
			}) as any,
		setLastUsedPage: () => {},
		log: (_level, message) => {
			logs.push(message)
		},
		setVariableValues: (values) => {
			Object.assign(variableValues, values)
		},
	}
	return ctx
}

function actionEvent(options: Record<string, unknown>) {
	// Minimal CompanionActionEvent: only `options` is read by the callbacks.
	return { id: 'test', controlId: 'c', actionId: 'a', options } as any
}

test('every action definition opts into returning a result', () => {
	const defs = createActionDefinitions(makeContext(null))
	const entries = Object.entries(defs)

	assert.strictEqual(entries.length, 17)
	for (const [id, def] of entries) {
		assert.ok(def, `action "${id}" is defined`)
		assert.strictEqual((def as any).hasResult, true, `action "${id}" sets hasResult: true`)
		assert.strictEqual(typeof (def as any).callback, 'function', `action "${id}" has a callback`)
	}
})

test('click returns true on success and false on failure', async () => {
	const defs = createActionDefinitions(makeContext({ click: async () => {} }))
	const ok = await (defs.click as any).callback(actionEvent({ selector: 'a', keyword: '' }))
	assert.strictEqual(ok, true)

	const failing = createActionDefinitions(
		makeContext({
			click: async () => {
				throw new Error('boom')
			},
		})
	)
	const bad = await (failing.click as any).callback(actionEvent({ selector: 'a', keyword: '' }))
	assert.strictEqual(bad, false)

	const notFound = createActionDefinitions(makeContext(null))
	const missing = await (notFound.click as any).callback(actionEvent({ selector: 'a', keyword: '' }))
	assert.strictEqual(missing, false)
})

test('navigate returns a result object and sets the last* variables', async () => {
	const gotoResponse = { url: () => 'https://example.com', status: () => 200 }
	const page = {
		goto: async () => gotoResponse,
		title: async () => 'Example',
	}
	const variableValues: Record<string, unknown> = {}
	const ctx = makeContext(page)
	// re-bind setVariableValues to capture values
	const capturing: ActionContext = {
		...ctx,
		setVariableValues: (values) => Object.assign(variableValues, values),
	}
	const defs = createActionDefinitions(capturing)
	const result = await (defs.navigate as any).callback(actionEvent({ url: 'https://example.com', keyword: '' }))

	assert.deepStrictEqual(result, { success: true, url: 'https://example.com', title: 'Example', status: 200 })
	assert.strictEqual(variableValues.lastUrl, 'https://example.com')
	assert.strictEqual(variableValues.lastTitle, 'Example')
	assert.strictEqual(variableValues.lastStatus, 200)
})

test('navigate returns a failure object when the page is missing or goto throws', async () => {
	const missing = createActionDefinitions(makeContext(null))
	const r1 = await (missing.navigate as any).callback(actionEvent({ url: 'https://x', keyword: '' }))
	assert.deepStrictEqual(r1, { success: false, url: '', title: '', status: 0 })

	const throwing = createActionDefinitions(
		makeContext({
			goto: async () => {
				throw new Error('timeout')
			},
		})
	)
	const r2 = await (throwing.navigate as any).callback(actionEvent({ url: 'https://x', keyword: '' }))
	assert.strictEqual(r2.success, false)
})

test('waitForSelector returns the boolean outcome', async () => {
	const found = createActionDefinitions(makeContext({ waitForSelector: async () => ({}) }))
	const ok = await (found.waitForSelector as any).callback(actionEvent({ selector: 'a', timeout: '100', keyword: '' }))
	assert.strictEqual(ok, true)

	const timedOut = createActionDefinitions(
		makeContext({
			waitForSelector: async () => {
				throw new Error('timeout')
			},
		})
	)
	const bad = await (timedOut.waitForSelector as any).callback(
		actionEvent({ selector: 'a', timeout: '100', keyword: '' })
	)
	assert.strictEqual(bad, false)
})
