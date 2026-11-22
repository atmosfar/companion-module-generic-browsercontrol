import { CompanionActionDefinitions } from '@companion-module/base'
import { ModuleConfig } from './config.js'
import { PuppeteerConnector } from './connector.js'
import { ActionSchemas, VariableSchemas } from './schemas.js'

export interface ActionContext {
	config: ModuleConfig
	getConnector: () => PuppeteerConnector | null
	setLastUsedPage: (page: any) => void
	log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void
	setVariableValues: (values: Partial<VariableSchemas>) => void
}

/**
 * Build the action definitions.
 *
 * Every action returns a result (`hasResult: true`) instead of writing a
 * per-action module variable. A `true`/`false` (or the richer `navigate`
 * object) tells the caller whether the promise resolved successfully, and a
 * Companion preset can store that result into a button-local variable so the
 * user can react to success vs. failure.
 *
 * NOTE (timeout): network actions can take a while, but the host caps each
 * action's promise at a default of ~5s. The base library will expose an
 * `executionTimeout` option on the action definition to raise this once it is
 * stable (see companion-module-base #3301). We intentionally do not set it here
 * until that lands in a stable release.
 */
export function createActionDefinitions(ctx: ActionContext): CompanionActionDefinitions<ActionSchemas> {
	const resolvePage = async (keyword: string) => {
		const page = await ctx.getConnector()?.findPageByKeyword(keyword)
		if (page) ctx.setLastUsedPage(page)
		return page
	}

	return {
		click: {
			name: 'Click Element',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'selector',
					label: 'CSS Selector',
					default: '',
				},
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				ctx.log(
					'info',
					`Action triggered: Click Element using selector "${action.options.selector}" on tab "${keyword}"`
				)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.click(action.options.selector)
					ctx.log('info', 'Click action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Click execution failed: ${error}`)
					return false
				}
			},
		},
		type: {
			name: 'Type Text',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'selector',
					label: 'CSS Selector',
					default: '',
				},
				{
					type: 'textinput',
					id: 'text',
					label: 'Text to Type',
					default: '',
				},
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				ctx.log('info', `Action triggered: Type Text into selector "${action.options.selector}" on tab "${keyword}"`)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.type(action.options.selector, action.options.text)
					ctx.log('info', 'Type action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Type execution failed: ${error}`)
					return false
				}
			},
		},
		navigate: {
			name: 'Navigate to URL',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'url',
					label: 'URL',
					default: '',
				},
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				ctx.log('info', `Action triggered: Navigate to "${action.options.url}" on tab "${keyword}"`)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return { success: false, url: '', title: '', status: 0 }
				}

				try {
					const response = await page.goto(action.options.url)
					const url = response?.url() || ''
					const title = await page.title()
					const status = response?.status() || 0
					ctx.setVariableValues({ lastUrl: url, lastTitle: title, lastStatus: status })
					ctx.log('info', `Navigate response: status=${status}, url=${url}, title=${title}`)
					return { success: true, url, title, status }
				} catch (error) {
					ctx.log('error', `Navigate execution failed: ${error}`)
					return { success: false, url: '', title: '', status: 0 }
				}
			},
		},
		goBack: {
			name: 'Go Back',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				ctx.log('info', `Action triggered: Go Back on tab "${keyword}"`)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.goBack()
					ctx.log('info', 'Go Back action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Go Back execution failed: ${error}`)
					return false
				}
			},
		},
		goForward: {
			name: 'Go Forward',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				ctx.log('info', `Action triggered: Go Forward on tab "${keyword}"`)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.goForward()
					ctx.log('info', 'Go Forward action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Go Forward execution failed: ${error}`)
					return false
				}
			},
		},
		reloadPage: {
			name: 'Reload Page',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				ctx.log('info', `Action triggered: Reload Page on tab "${keyword}"`)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.reload()
					ctx.log('info', 'Reload Page action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Reload Page execution failed: ${error}`)
					return false
				}
			},
		},
		pressKey: {
			name: 'Press Key',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'key',
					label: 'Key',
					default: '',
					tooltip: 'e.g. Enter, Tab, Escape, ArrowDown, Backspace',
				},
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				ctx.log('info', `Action triggered: Press Key "${action.options.key}" on tab "${keyword}"`)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.keyboard.press(action.options.key)
					ctx.log('info', 'Press Key action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Press Key execution failed: ${error}`)
					return false
				}
			},
		},
		scrollToElement: {
			name: 'Scroll to Element',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'selector',
					label: 'CSS Selector',
					default: '',
				},
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				ctx.log('info', `Action triggered: Scroll to Element "${action.options.selector}" on tab "${keyword}"`)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.evaluate((selector: string) => {
						const el = document.querySelector(selector)
						if (el) el.scrollIntoView()
					}, action.options.selector)
					ctx.log('info', 'Scroll to Element action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Scroll to Element execution failed: ${error}`)
					return false
				}
			},
		},
		selectDropdown: {
			name: 'Select Dropdown',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'selector',
					label: 'Selector',
					default: '',
					tooltip: 'Selector for the <select> element',
				},
				{
					type: 'textinput',
					id: 'value',
					label: 'Value',
					default: '',
					tooltip: 'The value attribute of the <option> to select',
				},
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				ctx.log(
					'info',
					`Action triggered: Select Dropdown "${action.options.selector}" value="${action.options.value}" on tab "${keyword}"`
				)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.select(action.options.selector, action.options.value)
					ctx.log('info', 'Select Dropdown action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Select Dropdown execution failed: ${error}`)
					return false
				}
			},
		},
		checkUncheck: {
			name: 'Check/Uncheck',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'selector',
					label: 'Selector',
					default: '',
					tooltip: 'Selector for the checkbox or radio input',
				},
				{
					type: 'dropdown',
					id: 'mode',
					label: 'Mode',
					default: 'check',
					choices: [
						{ id: 'check', label: 'Check' },
						{ id: 'uncheck', label: 'Uncheck' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				const mode = action.options.mode
				ctx.log(
					'info',
					`Action triggered: Check/Uncheck "${action.options.selector}" mode="${mode}" on tab "${keyword}"`
				)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.evaluate(
						(s: string, m: string) => {
							const el = document.querySelector(s) as HTMLInputElement
							if (!el) return
							if (m === 'check') el.checked = true
							else if (m === 'uncheck') el.checked = false
							else el.checked = !el.checked
							el.dispatchEvent(new Event('change', { bubbles: true }))
						},
						action.options.selector,
						mode
					)
					ctx.log('info', 'Check/Uncheck action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Check/Uncheck execution failed: ${error}`)
					return false
				}
			},
		},
		hoverElement: {
			name: 'Hover Element',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'selector',
					label: 'CSS Selector',
					default: '',
				},
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				ctx.log('info', `Action triggered: Hover Element "${action.options.selector}" on tab "${keyword}"`)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.hover(action.options.selector)
					ctx.log('info', 'Hover Element action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Hover Element execution failed: ${error}`)
					return false
				}
			},
		},
		closeTab: {
			name: 'Close Tab',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				ctx.log('info', `Action triggered: Close Tab "${keyword}"`)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.close()
					ctx.setLastUsedPage(null)
					ctx.log('info', 'Close Tab action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Close Tab execution failed: ${error}`)
					return false
				}
			},
		},
		newTab: {
			name: 'New Tab',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'url',
					label: 'URL',
					default: '',
					tooltip: 'Leave blank to open an empty tab (about:blank)',
				},
			],
			callback: async (action) => {
				const url = action.options.url
				ctx.log('info', `Action triggered: New Tab url="${url || 'about:blank'}"`)
				const connector = ctx.getConnector()
				const browser = connector?.getBrowser()

				if (!browser) {
					ctx.log('warn', 'Browser not connected')
					return false
				}

				try {
					const page = await browser.newPage()
					await page.setViewport(null)
					if (url) await page.goto(url)
					ctx.setLastUsedPage(page)
					ctx.log('info', 'New Tab action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `New Tab execution failed: ${error}`)
					return false
				}
			},
		},
		executeJs: {
			name: 'Execute JS',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'script',
					label: 'JavaScript',
					default: '',
					tooltip: 'JavaScript code to execute in the page context',
				},
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				const script = action.options.script
				ctx.log('info', `Action triggered: Execute JS on tab "${keyword}"`)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.evaluate((s: string) => {
						void eval(s)
					}, script)
					ctx.log('info', 'Execute JS action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Execute JS execution failed: ${error}`)
					return false
				}
			},
		},
		waitForSelector: {
			name: 'Wait for Selector',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'selector',
					label: 'CSS Selector',
					default: '',
				},
				{
					type: 'textinput',
					id: 'timeout',
					label: 'Timeout (ms)',
					default: '5000',
				},
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				const timeout = parseInt(action.options.timeout, 10) || 5000
				ctx.log(
					'info',
					`Action triggered: Wait for Selector "${action.options.selector}" timeout=${timeout}ms on tab "${keyword}"`
				)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					const el = await page.waitForSelector(action.options.selector, { timeout })
					const result = !!el
					ctx.log('info', result ? 'Wait for Selector: element found.' : 'Wait for Selector: element not found.')
					return result
				} catch (error) {
					ctx.log('error', `Wait for Selector execution failed: ${error}`)
					return false
				}
			},
		},
		clearInput: {
			name: 'Clear Input',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'selector',
					label: 'Selector',
					default: '',
					tooltip: 'Selector for the input element to clear',
				},
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				ctx.log('info', `Action triggered: Clear Input "${action.options.selector}" on tab "${keyword}"`)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.evaluate((s: string) => {
						const el = document.querySelector(s) as HTMLInputElement
						if (el) {
							el.value = ''
							el.dispatchEvent(new Event('input', { bubbles: true }))
							el.dispatchEvent(new Event('change', { bubbles: true }))
						}
					}, action.options.selector)
					ctx.log('info', 'Clear Input action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Clear Input execution failed: ${error}`)
					return false
				}
			},
		},
		setInputValue: {
			name: 'Set Input Value',
			hasResult: true,
			options: [
				{
					type: 'textinput',
					id: 'selector',
					label: 'Selector',
					default: '',
					tooltip: 'Selector for the input element',
				},
				{
					type: 'textinput',
					id: 'value',
					label: 'Value',
					default: '',
				},
				{
					type: 'textinput',
					id: 'keyword',
					label: 'Tab Keyword (Override)',
					default: '',
					tooltip: 'Leave blank to use default',
				},
			],
			callback: async (action) => {
				const keyword = action.options.keyword || ctx.config.tabKeyword
				ctx.log(
					'info',
					`Action triggered: Set Input Value "${action.options.selector}" value="${action.options.value}" on tab "${keyword}"`
				)
				const page = await resolvePage(keyword)

				if (!page) {
					ctx.log('warn', `Page not found for keyword: ${keyword}`)
					return false
				}

				try {
					await page.evaluate(
						(s: string, v: string) => {
							const el = document.querySelector(s) as HTMLInputElement
							if (el) {
								el.value = v
								el.dispatchEvent(new Event('input', { bubbles: true }))
								el.dispatchEvent(new Event('change', { bubbles: true }))
							}
						},
						action.options.selector,
						action.options.value
					)
					ctx.log('info', 'Set Input Value action executed successfully.')
					return true
				} catch (error) {
					ctx.log('error', `Set Input Value execution failed: ${error}`)
					return false
				}
			},
		},
	}
}
