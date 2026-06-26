import { CompanionVariableDefinitions } from '@companion-module/base'

export function createVariableDefinitions(): CompanionVariableDefinitions {
  return {
    lastUrl: { name: 'Last URL' },
    lastTitle: { name: 'Last Title' },
    lastStatus: { name: 'Last Status' },
    waitResult: { name: 'Wait Result' },
    clickResult: { name: 'Click Result' },
    typeResult: { name: 'Type Result' },
    navigateResult: { name: 'Navigate Result' },
    goBackResult: { name: 'Go Back Result' },
    goForwardResult: { name: 'Go Forward Result' },
    reloadResult: { name: 'Reload Result' },
    pressKeyResult: { name: 'Press Key Result' },
    scrollResult: { name: 'Scroll Result' },
    selectResult: { name: 'Select Result' },
    checkResult: { name: 'Check Result' },
    hoverResult: { name: 'Hover Result' },
    closeTabResult: { name: 'Close Tab Result' },
    newTabResult: { name: 'New Tab Result' },
    executeJsResult: { name: 'Execute JS Result' },
    clearInputResult: { name: 'Clear Input Result' },
    setInputValueResult: { name: 'Set Input Value Result' },
  }
}
