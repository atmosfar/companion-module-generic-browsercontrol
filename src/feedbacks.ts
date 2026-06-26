import { CompanionFeedbackDefinitions } from '@companion-module/base'
import { ModuleConfig } from './config.js'
import { PuppeteerConnector } from './connector.js'

export interface FeedbackContext {
  config: ModuleConfig
  getConnector: () => PuppeteerConnector | null
  lastUsedPage: any
  log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void
}

export function createFeedbackDefinitions(ctx: FeedbackContext): CompanionFeedbackDefinitions<any> {
  return {
    urlMatches: {
      name: 'Page URL Contains',
      type: 'boolean',
      defaultStyle: {},
      options: [
        {
          type: 'textinput',
          id: 'keyword',
          label: 'Tab Keyword (Override)',
          default: '',
          tooltip: 'Leave blank to use default',
        },
        {
          type: 'textinput',
          id: 'value',
          label: 'URL Text',
          default: '',
        },
      ],
      callback: async (feedback: { options: { keyword?: string; value?: string } }) => {
        const keyword = feedback.options.keyword as string
        let page: any

        if (keyword) {
          ctx.log('info', `URL feedback: searching by keyword "${keyword}"`)
          page = await ctx.getConnector()?.findPageByKeyword(keyword)
        } else if (ctx.lastUsedPage) {
          ctx.log('info', `URL feedback: using last used page`)
          page = ctx.lastUsedPage
        } else {
          ctx.log('info', `URL feedback: using config tabKeyword "${ctx.config.tabKeyword}"`)
          page = await ctx.getConnector()?.findPageByKeyword(ctx.config.tabKeyword)
        }

        if (!page) {
          ctx.log('info', `URL feedback: page not found`)
          return false
        }

        try {
          const url = page.url()
          ctx.log('info', `URL feedback: got url "${url}"`)
          const compareValue = (feedback.options.value as string).toLowerCase()
          return url.toLowerCase().includes(compareValue)
        } catch {
          ctx.log('info', `URL feedback: error getting url`)
          return false
        }
      },
    },
    titleMatches: {
      name: 'Page Title Contains',
      type: 'boolean',
      defaultStyle: {},
      options: [
        {
          type: 'textinput',
          id: 'keyword',
          label: 'Tab Keyword (Override)',
          default: '',
          tooltip: 'Leave blank to use default',
        },
        {
          type: 'textinput',
          id: 'value',
          label: 'Title Text',
          default: '',
        },
      ],
      callback: async (feedback: { options: { keyword?: string; value?: string } }) => {
        const keyword = feedback.options.keyword as string
        let page: any

        if (keyword) {
          page = await ctx.getConnector()?.findPageByKeyword(keyword)
        } else if (ctx.lastUsedPage) {
          page = ctx.lastUsedPage
        } else {
          page = await ctx.getConnector()?.findPageByKeyword(ctx.config.tabKeyword)
        }

        if (!page) return false

        try {
          const title = await page.title()
          const compareValue = (feedback.options.value as string).toLowerCase()
          return title.toLowerCase().includes(compareValue)
        } catch {
          return false
        }
      },
    },
  }
}
