import {
  InstanceBase,
  InstanceStatus,
  SomeCompanionConfigField,
} from '@companion-module/base'
import { GetConfigFields, ModuleConfig } from './config.js'
import { PuppeteerConnector } from './connector.js'
import { createActionDefinitions } from './actions.js'
import { createFeedbackDefinitions } from './feedbacks.js'
import { createVariableDefinitions } from './variables.js'

export default class BrowserInstance extends InstanceBase<{
  config: ModuleConfig
  secrets: any
  actions: any
  feedbacks: any
  variables: any
}> {
  private connector: PuppeteerConnector | null = null
  private config!: ModuleConfig
  private lastUsedPage: any = null

  constructor(internal: any) {
    super(internal)
  }

  public async init(config: ModuleConfig): Promise<void> {
    this.config = config
    this.updateActions()
    this.updateFeedbacks()
    this.updateVariables()
    
    this.log('info', 'Module initializing under API v2.0...')
    void this.initConnector()
  }

  public async destroy(): Promise<void> {
    this.log('info', 'Module destroying...')
    if (this.connector) {
      await this.connector.disconnect()
      this.connector = null
    }
  }

  public async configUpdated(config: ModuleConfig): Promise<void> {
    this.log('info', 'Configuration updated by user.')
    this.config = config
    this.updateFeedbacks()
    this.updateVariables()
    void this.initConnector()
  }

  public getConfigFields(): SomeCompanionConfigField[] {
    return GetConfigFields()
  }

  private async initConnector(): Promise<void> {
    this.updateStatus(InstanceStatus.Connecting)
    
    this.log('debug', `Setting up connector. Configured Host: ${this.config.host}, Port: ${this.config.port}`)

    if (this.connector) {
      this.log('debug', 'Tearing down old connector instance before rebuilding...')
      await this.connector.disconnect()
    }

    this.connector = new PuppeteerConnector(
      this.config.host,
      this.config.port,
      (level, message) => this.log(level, message),
      () => {
        this.updateStatus(InstanceStatus.Disconnected, 'Connection Lost')
      }
    )

    try {
      await this.connector.connect(this.config.browserType || 'chrome')
      this.updateStatus(InstanceStatus.Ok)
    } catch (error) {
      const shortError = error instanceof Error ? error.message : String(error)
      this.log('error', `initConnector encountered an unhandled execution error: ${shortError}`)
      this.updateStatus(InstanceStatus.Disconnected, 'Connection Failed')
    }
  }

  private updateActions(): void {
    this.setActionDefinitions(
      createActionDefinitions({
        config: this.config,
        getConnector: () => this.connector,
        setLastUsedPage: (page: any) => { this.lastUsedPage = page },
        log: (level, message) => this.log(level, message),
        setVariableValues: (values) => this.setVariableValues(values),
      })
    )
  }

  private updateFeedbacks(): void {
    this.setFeedbackDefinitions(
      createFeedbackDefinitions({
        config: this.config,
        getConnector: () => this.connector,
        lastUsedPage: this.lastUsedPage,
        log: (level, message) => this.log(level, message),
      })
    )
  }

  private updateVariables(): void {
    this.setVariableDefinitions(createVariableDefinitions())
  }
}
