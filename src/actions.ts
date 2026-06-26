import { CompanionActionDefinitions, CompanionActionEvent } from '@companion-module/base'
import { ModuleConfig } from './config.js'
import { PuppeteerConnector } from './connector.js'

export interface ActionContext {
  config: ModuleConfig
  getConnector: () => PuppeteerConnector | null
  setLastUsedPage: (page: any) => void
  log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void
  setVariableValues: (values: Record<string, any>) => void
}

export function createActionDefinitions(ctx: ActionContext): CompanionActionDefinitions<any> {
  return {
    click: {
      name: 'Click Element',
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
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        ctx.log('info', `Action triggered: Click Element using selector "${action.options.selector}" on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            await page.click(action.options.selector as string)
            ctx.setVariableValues({ clickResult: true })
            ctx.log('info', 'Click action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ clickResult: false })
            ctx.log('error', `Click execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ clickResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    type: {
      name: 'Type Text',
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
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        ctx.log('info', `Action triggered: Type Text into selector "${action.options.selector}" on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            await page.type(action.options.selector as string, action.options.text as string)
            ctx.setVariableValues({ typeResult: true })
            ctx.log('info', 'Type action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ typeResult: false })
            ctx.log('error', `Type execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ typeResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    navigate: {
      name: 'Navigate to URL',
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
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        ctx.log('info', `Action triggered: Navigate to "${action.options.url}" on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            const response = await page.goto(action.options.url as string)
            const url = response?.url() || ''
            const title = await page.title()
            const status = response?.status() || 0
            ctx.setVariableValues({ lastUrl: url, lastTitle: title, lastStatus: status, navigateResult: true })
            ctx.log('info', `Navigate response: status=${status}, url=${url}, title=${title}`)
          } catch (error) {
            ctx.setVariableValues({ navigateResult: false })
            ctx.log('error', `Navigate execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ navigateResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    goBack: {
      name: 'Go Back',
      options: [
        {
          type: 'textinput',
          id: 'keyword',
          label: 'Tab Keyword (Override)',
          default: '',
          tooltip: 'Leave blank to use default',
        },
      ],
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        ctx.log('info', `Action triggered: Go Back on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            await page.goBack()
            ctx.setVariableValues({ goBackResult: true })
            ctx.log('info', 'Go Back action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ goBackResult: false })
            ctx.log('error', `Go Back execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ goBackResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    goForward: {
      name: 'Go Forward',
      options: [
        {
          type: 'textinput',
          id: 'keyword',
          label: 'Tab Keyword (Override)',
          default: '',
          tooltip: 'Leave blank to use default',
        },
      ],
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        ctx.log('info', `Action triggered: Go Forward on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            await page.goForward()
            ctx.setVariableValues({ goForwardResult: true })
            ctx.log('info', 'Go Forward action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ goForwardResult: false })
            ctx.log('error', `Go Forward execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ goForwardResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    reloadPage: {
      name: 'Reload Page',
      options: [
        {
          type: 'textinput',
          id: 'keyword',
          label: 'Tab Keyword (Override)',
          default: '',
          tooltip: 'Leave blank to use default',
        },
      ],
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        ctx.log('info', `Action triggered: Reload Page on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            await page.reload()
            ctx.setVariableValues({ reloadResult: true })
            ctx.log('info', 'Reload Page action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ reloadResult: false })
            ctx.log('error', `Reload Page execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ reloadResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    pressKey: {
      name: 'Press Key',
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
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        ctx.log('info', `Action triggered: Press Key "${action.options.key}" on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            await page.keyboard.press(action.options.key as string)
            ctx.setVariableValues({ pressKeyResult: true })
            ctx.log('info', 'Press Key action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ pressKeyResult: false })
            ctx.log('error', `Press Key execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ pressKeyResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    scrollToElement: {
      name: 'Scroll to Element',
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
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        ctx.log('info', `Action triggered: Scroll to Element "${action.options.selector}" on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            await page.evaluate((selector: string) => {
              const el = document.querySelector(selector)
              if (el) el.scrollIntoView()
            }, action.options.selector as string)
            ctx.setVariableValues({ scrollResult: true })
            ctx.log('info', 'Scroll to Element action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ scrollResult: false })
            ctx.log('error', `Scroll to Element execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ scrollResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    selectDropdown: {
      name: 'Select Dropdown',
      options: [
        {
          type: 'textinput',
          id: 'selector',
          label: 'CSS Selector',
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
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        ctx.log('info', `Action triggered: Select Dropdown "${action.options.selector}" value="${action.options.value}" on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            await page.select(action.options.selector as string, action.options.value as string)
            ctx.setVariableValues({ selectResult: true })
            ctx.log('info', 'Select Dropdown action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ selectResult: false })
            ctx.log('error', `Select Dropdown execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ selectResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    checkUncheck: {
      name: 'Check/Uncheck',
      options: [
        {
          type: 'textinput',
          id: 'selector',
          label: 'CSS Selector',
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
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        const mode = action.options.mode as string
        ctx.log('info', `Action triggered: Check/Uncheck "${action.options.selector}" mode="${mode}" on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            const selector = action.options.selector as string
            if (mode === 'check') {
              await page.evaluate((s: string) => {
                const el = document.querySelector(s) as HTMLInputElement
                if (el) { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })) }
              }, selector)
            } else if (mode === 'uncheck') {
              await page.evaluate((s: string) => {
                const el = document.querySelector(s) as HTMLInputElement
                if (el) { el.checked = false; el.dispatchEvent(new Event('change', { bubbles: true })) }
              }, selector)
            } else {
              await page.evaluate((s: string) => {
                const el = document.querySelector(s) as HTMLInputElement
                if (el) { el.checked = !el.checked; el.dispatchEvent(new Event('change', { bubbles: true })) }
              }, selector)
            }
            ctx.setVariableValues({ checkResult: true })
            ctx.log('info', 'Check/Uncheck action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ checkResult: false })
            ctx.log('error', `Check/Uncheck execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ checkResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    hoverElement: {
      name: 'Hover Element',
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
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        ctx.log('info', `Action triggered: Hover Element "${action.options.selector}" on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            await page.hover(action.options.selector as string)
            ctx.setVariableValues({ hoverResult: true })
            ctx.log('info', 'Hover Element action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ hoverResult: false })
            ctx.log('error', `Hover Element execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ hoverResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    closeTab: {
      name: 'Close Tab',
      options: [
        {
          type: 'textinput',
          id: 'keyword',
          label: 'Tab Keyword (Override)',
          default: '',
          tooltip: 'Leave blank to use default',
        },
      ],
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        ctx.log('info', `Action triggered: Close Tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)

        if (page) {
          try {
            await page.close()
            ctx.setLastUsedPage(null)
            ctx.setVariableValues({ closeTabResult: true })
            ctx.log('info', 'Close Tab action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ closeTabResult: false })
            ctx.log('error', `Close Tab execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ closeTabResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    newTab: {
      name: 'New Tab',
      options: [
        {
          type: 'textinput',
          id: 'url',
          label: 'URL',
          default: '',
          tooltip: 'Leave blank to open an empty tab (about:blank)',
        },
      ],
      callback: async (action: CompanionActionEvent) => {
        const url = action.options.url as string
        ctx.log('info', `Action triggered: New Tab url="${url || 'about:blank'}"`)
        const connector = ctx.getConnector()

        const browser = connector?.getBrowser()
        if (browser) {
          try {
            const page = await browser.newPage()
            await page.setViewport(null)
            if (url) await page.goto(url)
            ctx.setLastUsedPage(page)
            ctx.setVariableValues({ newTabResult: true })
            ctx.log('info', 'New Tab action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ newTabResult: false })
            ctx.log('error', `New Tab execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ newTabResult: false })
          ctx.log('warn', 'Browser not connected')
        }
      },
    },
    executeJs: {
      name: 'Execute JS',
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
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        const script = action.options.script as string
        ctx.log('info', `Action triggered: Execute JS on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            await page.evaluate((s: string) => { void eval(s) }, script)
            ctx.setVariableValues({ executeJsResult: true })
            ctx.log('info', 'Execute JS action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ executeJsResult: false })
            ctx.log('error', `Execute JS execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ executeJsResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    waitForSelector: {
      name: 'Wait for Selector',
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
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        const timeout = parseInt(action.options.timeout as string, 10) || 5000
        ctx.log('info', `Action triggered: Wait for Selector "${action.options.selector}" timeout=${timeout}ms on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            const el = await page.waitForSelector(action.options.selector as string, { timeout })
            const result = !!el
            ctx.setVariableValues({ waitResult: result })
            ctx.log('info', result ? 'Wait for Selector: element found.' : 'Wait for Selector: element not found.')
          } catch (error) {
            ctx.setVariableValues({ waitResult: false })
            ctx.log('error', `Wait for Selector execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ waitResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    clearInput: {
      name: 'Clear Input',
      options: [
        {
          type: 'textinput',
          id: 'selector',
          label: 'CSS Selector',
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
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        ctx.log('info', `Action triggered: Clear Input "${action.options.selector}" on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            await page.evaluate((s: string) => {
              const el = document.querySelector(s) as HTMLInputElement
              if (el) {
                el.value = ''
                el.dispatchEvent(new Event('input', { bubbles: true }))
                el.dispatchEvent(new Event('change', { bubbles: true }))
              }
            }, action.options.selector as string)
            ctx.setVariableValues({ clearInputResult: true })
            ctx.log('info', 'Clear Input action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ clearInputResult: false })
            ctx.log('error', `Clear Input execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ clearInputResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
    setInputValue: {
      name: 'Set Input Value',
      options: [
        {
          type: 'textinput',
          id: 'selector',
          label: 'CSS Selector',
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
      callback: async (action: CompanionActionEvent) => {
        const keyword = (action.options.keyword as string) || ctx.config.tabKeyword
        ctx.log('info', `Action triggered: Set Input Value "${action.options.selector}" value="${action.options.value}" on tab "${keyword}"`)
        const page = await ctx.getConnector()?.findPageByKeyword(keyword)
        if (page) ctx.setLastUsedPage(page)

        if (page) {
          try {
            await page.evaluate((s: string, v: string) => {
              const el = document.querySelector(s) as HTMLInputElement
              if (el) {
                el.value = v
                el.dispatchEvent(new Event('input', { bubbles: true }))
                el.dispatchEvent(new Event('change', { bubbles: true }))
              }
            }, action.options.selector as string, action.options.value as string)
            ctx.setVariableValues({ setInputValueResult: true })
            ctx.log('info', 'Set Input Value action executed successfully.')
          } catch (error) {
            ctx.setVariableValues({ setInputValueResult: false })
            ctx.log('error', `Set Input Value execution failed: ${error}`)
          }
        } else {
          ctx.setVariableValues({ setInputValueResult: false })
          ctx.log('warn', `Page not found for keyword: ${keyword}`)
        }
      },
    },
  }
}
