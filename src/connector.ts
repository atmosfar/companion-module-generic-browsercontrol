import puppeteer, { Browser } from 'puppeteer-core'

export type ConnectorStatus = 'connected' | 'disconnected' | 'connecting'

export const puppeteerUtils = {
  connect: (options: Parameters<typeof puppeteer.connect>[0]) => puppeteer.connect(options)
}

export class PuppeteerConnector {
  private host: string
  private port: number
  private browser: Browser | null = null
  private status: ConnectorStatus = 'disconnected'
  private isIntentionallyDisconnected = false
  private log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void
  private onDisconnectCallback?: () => void

  constructor(
    host: string,
    port: number,
    log: (level: 'info' | 'warn' | 'error' | 'debug', message: string) => void = () => {},
    onDisconnect?: () => void // New optional callback to notify the main instance
  ) {
    this.host = host
    this.port = port
    this.log = log
    this.onDisconnectCallback = onDisconnect
  }

  public async connect(browserType: 'chrome' | 'firefox' = 'chrome'): Promise<void> {
    this.status = 'connecting'
    this.isIntentionallyDisconnected = false

    try {
      if (browserType === 'firefox') {
        const wsEndpoint = `ws://${this.host}:${this.port}/session`
        this.log('info', `Connecting to Firefox via WebDriver BiDi: ${wsEndpoint}`)
        this.browser = await puppeteerUtils.connect({
          browserWSEndpoint: wsEndpoint,
          protocol: 'webDriverBiDi',
        })
      } else {
        const dummyGuid = '00000000-0000-0000-0000-000000000000'
        const wsEndpoint = `ws://${this.host}:${this.port}/devtools/browser/${dummyGuid}`

        this.log('info', `Building WebSocket endpoint: ${wsEndpoint}`)
        this.browser = await puppeteerUtils.connect({
          browserWSEndpoint: wsEndpoint,
          defaultViewport: null,
        })
      }

      // Hook into Puppeteer's native browser disconnection event
      this.browser.on('disconnected', () => {
        this.handleUnexpectedDisconnect()
      })
      
      this.status = 'connected'
      this.log('info', 'Puppeteer connection established successfully!')
    } catch (error: any) {
      this.status = 'disconnected'
      let errorMessage = error instanceof Error ? `${error.message}\nStack: ${error.stack}` : String(error)
      this.log('error', `Puppeteer failed to connect. Reason: ${errorMessage}`)
      throw error
    }
  }

  private handleUnexpectedDisconnect(): void {
    this.browser = null
    this.status = 'disconnected'

    // If we didn't trigger this via the disconnect() method, it was an external drop
    if (!this.isIntentionallyDisconnected) {
      this.log('warn', 'Browser connection was lost unexpectedly (browser closed or network dropped).')
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback()
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.browser) {
      this.log('debug', 'Closing browser connection intentionally...')
      this.isIntentionallyDisconnected = true // Arm the flag to ignore the event bubble
      await this.browser.disconnect()
      this.browser = null
    }
    this.status = 'disconnected'
  }

  public getStatus(): ConnectorStatus {
    return this.status
  }

  public getBrowser(): Browser | null {
    return this.browser
  }

  public async findPageByKeyword(keyword: string): Promise<any | null> {
    if (!this.browser) {
      this.log('warn', 'findPageByKeyword: browser is null (not connected)')
      return null
    }

    try {
      const pages = await this.browser.pages()
      this.log('debug', `findPageByKeyword: found ${pages.length} pages, searching for "${keyword}"`)
      for (const page of pages) {
        try {
          const title = await page.title()
          const url = page.url()

          if (title.toLowerCase().includes(keyword.toLowerCase()) || url.toLowerCase().includes(keyword.toLowerCase())) {
            this.log('debug', `findPageByKeyword: matched page (title="${title}", url="${url}")`)
            return page
          }
        } catch (error) {
          this.log('debug', `findPageByKeyword: skipping stale/invalid page: ${error}`)
          continue
        }
      }
      this.log('debug', `findPageByKeyword: no match found for "${keyword}"`)
    } catch (error) {
      this.log('error', `findPageByKeyword: failed to scan open pages: ${error}`)
    }
    return null
  }
}
