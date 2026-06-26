import { SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = {
  browserType: 'chrome' | 'firefox'
  host: string
  port: number
  tabKeyword: string
  [key: string]: any
}

export function GetConfigFields(): SomeCompanionConfigField[] {
  return [
    {
      type: 'dropdown',
      id: 'browserType',
      label: 'Browser',
      width: 12,
      default: 'chrome',
      choices: [
        { id: 'chrome', label: 'Chrome' },
        { id: 'firefox', label: 'Firefox' },
      ],
    },
    {
      type: 'static-text',
      id: 'chromeTip',
      label: '',
      width: 20,
      value: 'Allow remote debugging in <code>chrome://inspect/#remote-debugging</code>',
      isVisibleExpression: '$(options:browserType) == "chrome"',
    },
    {
      type: 'static-text',
      id: 'firefoxTip',
      label: '',
      width: 20,
      value: 'Set <code>remote.active-protocols=1</code> in <code>about:config</code>,<br/>then launch Firefox with: <code>firefox --remote-debugging-port=9222</code>',
      isVisibleExpression: '$(options:browserType) == "firefox"',
    },
    {
      type: 'textinput',
      id: 'host',
      label: 'Host IP Address',
      width: 8,
      default: '127.0.0.1',
    },
    {
      type: 'number', // Reinstated as a numeric field type
      id: 'port',
      label: 'Remote Debugging Port',
      width: 4,
      default: 9222, // Default reset to 9222
      min: 1,
      max: 65535,
    },
    {
      type: 'textinput',
      id: 'tabKeyword',
      label: 'Tab/Window Keyword',
      width: 12,
      default: '',
      tooltip: 'e.g., Google or dashboard',
    },
  ]
}
