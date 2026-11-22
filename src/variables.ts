import { CompanionVariableDefinitions } from '@companion-module/base'
import { VariableSchemas } from './schemas.js'

/**
 * Module-level variables.
 *
 * Per-action success/failure is intentionally NOT listed here. Each action now
 * returns a result (see ActionSchemas), which a preset can store into a
 * button-local variable. These three variables remain because they represent
 * cross-button navigation state, not per-action flags.
 */
export function createVariableDefinitions(): CompanionVariableDefinitions<VariableSchemas> {
	return {
		lastUrl: { name: 'Last URL' },
		lastTitle: { name: 'Last Title' },
		lastStatus: { name: 'Last Status' },
	}
}
