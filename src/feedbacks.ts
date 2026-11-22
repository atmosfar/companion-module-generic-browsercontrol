import { CompanionFeedbackDefinitions } from '@companion-module/base'
import { ModuleConfig } from './config.js'
import { PuppeteerConnector } from './connector.js'
import { FeedbackSchemas } from './schemas.js'

export interface FeedbackContext {
	config: ModuleConfig
	getConnector: () => PuppeteerConnector | null
	lastUsedPage: any
	log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void
}

/**
 * Resolve the page a feedback should inspect, using the same precedence as
 * the actions: explicit keyword > last used page > config default keyword.
 */
export async function resolveFeedbackPage(ctx: FeedbackContext, keyword: string): Promise<any> {
	if (keyword) {
		ctx.log('info', `Feedback: searching by keyword "${keyword}"`)
		return ctx.getConnector()?.findPageByKeyword(keyword)
	} else if (ctx.lastUsedPage) {
		ctx.log('info', 'Feedback: using last used page')
		return ctx.lastUsedPage
	} else {
		ctx.log('info', `Feedback: using config tabKeyword "${ctx.config.tabKeyword}"`)
		return ctx.getConnector()?.findPageByKeyword(ctx.config.tabKeyword)
	}
}

export function createFeedbackDefinitions(ctx: FeedbackContext): CompanionFeedbackDefinitions<FeedbackSchemas> {
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
			callback: async (feedback) => {
				const page = await resolveFeedbackPage(ctx, feedback.options.keyword)

				if (!page) {
					ctx.log('info', 'URL feedback: page not found')
					return false
				}

				try {
					const url = page.url()
					ctx.log('info', `URL feedback: got url "${url}"`)
					const compareValue = feedback.options.value.toLowerCase()
					return url.toLowerCase().includes(compareValue)
				} catch {
					ctx.log('info', 'URL feedback: error getting url')
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
			callback: async (feedback) => {
				const page = await resolveFeedbackPage(ctx, feedback.options.keyword)

				if (!page) return false

				try {
					const title = await page.title()
					const compareValue = feedback.options.value.toLowerCase()
					return title.toLowerCase().includes(compareValue)
				} catch {
					return false
				}
			},
		},
	}
}
