import type { InstanceTypes } from '@companion-module/base'
import type { ModuleConfig } from './config.js'

/**
 * Action option schemas.
 *
 * Each action declares `options` (the user-editable input values) and `result`
 * (what the action callback returns). `result` is type-level only, but it is
 * what lets Companion presets store an action's outcome in a button-local
 * variable, so users can differentiate a resolved from a failed action.
 */
export type ActionSchemas = {
	click: { options: { selector: string; keyword: string }; result: boolean }
	type: { options: { selector: string; text: string; keyword: string }; result: boolean }
	navigate: {
		options: { url: string; keyword: string }
		result: { success: boolean; url: string; title: string; status: number }
	}
	goBack: { options: { keyword: string }; result: boolean }
	goForward: { options: { keyword: string }; result: boolean }
	reloadPage: { options: { keyword: string }; result: boolean }
	pressKey: { options: { key: string; keyword: string }; result: boolean }
	scrollToElement: { options: { selector: string; keyword: string }; result: boolean }
	selectDropdown: { options: { selector: string; value: string; keyword: string }; result: boolean }
	checkUncheck: {
		options: { selector: string; mode: 'check' | 'uncheck' | 'toggle'; keyword: string }
		result: boolean
	}
	hoverElement: { options: { selector: string; keyword: string }; result: boolean }
	closeTab: { options: { keyword: string }; result: boolean }
	newTab: { options: { url: string }; result: boolean }
	executeJs: { options: { script: string; keyword: string }; result: boolean }
	waitForSelector: { options: { selector: string; timeout: string; keyword: string }; result: boolean }
	clearInput: { options: { selector: string; keyword: string }; result: boolean }
	setInputValue: { options: { selector: string; value: string; keyword: string }; result: boolean }
}

/**
 * Feedback option schemas. Both feedbacks are boolean (style on/off).
 */
export type FeedbackSchemas = {
	urlMatches: { type: 'boolean'; options: { keyword: string; value: string } }
	titleMatches: { type: 'boolean'; options: { keyword: string; value: string } }
}

/**
 * Module variable schemas.
 *
 * Note: per-action success/failure is no longer exposed as module variables.
 * It is returned by each action callback instead (see `ActionSchemas`), and
 * can be captured per-button via a preset's "store result" option. These three
 * remain as module variables because they are useful as cross-button state.
 */
export type VariableSchemas = {
	lastUrl: string
	lastTitle: string
	lastStatus: number
}

/** The manifest passed to InstanceBase for end-to-end type safety. */
export interface ModuleManifest extends InstanceTypes {
	config: ModuleConfig
	secrets: undefined
	actions: ActionSchemas
	feedbacks: FeedbackSchemas
	variables: VariableSchemas
}
