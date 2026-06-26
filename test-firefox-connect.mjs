import puppeteer from 'puppeteer-core'

const HOST = '127.0.0.1'

// Firefox Marionette default port
const MARIONETTE_PORT = 2828
// Firefox remote debugging port (CDP-style)
const REMOTE_PORT = 9222

async function testWebDriverBiDi(port, label) {
  console.log(`--- ${label}: browserURL + protocol: webDriverBiDi (${port}) ---`)
  const browserURL = `http://${HOST}:${port}`
  try {
    const browser = await puppeteer.connect({
      browserURL,
      protocol: 'webDriverBiDi',
    })
    console.log(`✓ Connected! Browser version: ${await browser.version()}`)
    const pages = await browser.pages()
    console.log(`✓ Pages found: ${pages.length}`)
    for (const page of pages.slice(0, 3)) {
      console.log(`  - ${await page.title()} (${page.url()})`)
    }
    await browser.disconnect()
    console.log('✓ Disconnected cleanly\n')
    return true
  } catch (error) {
    console.log(`✗ Failed: ${error.message}\n`)
    return false
  }
}

async function testCdpWebSocket(port, label) {
  console.log(`--- ${label}: browserWSEndpoint dummy GUID (${port}) ---`)
  const dummyGuid = '00000000-0000-0000-0000-000000000000'
  const wsEndpoint = `ws://${HOST}:${port}/devtools/browser/${dummyGuid}`
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
    })
    console.log(`✓ Connected! Browser version: ${await browser.version()}`)
    await browser.disconnect()
    console.log('✓ Disconnected cleanly\n')
    return true
  } catch (error) {
    console.log(`✗ Failed: ${error.message}\n`)
    return false
  }
}

async function checkEndpoint(port, path) {
  try {
    const resp = await fetch(`http://${HOST}:${port}${path}`)
    console.log(`  ${path} → ${resp.status}`)
    if (resp.ok) {
      const text = await resp.text()
      if (text.length < 500) console.log(`    ${text}`)
    }
  } catch (e) {
    console.log(`  ${path} → ${e.message}`)
  }
}

async function discoverEndpoints(port, label) {
  console.log(`--- Port ${port} (${label}) discovery ---`)
  await checkEndpoint(port, '/')
  await checkEndpoint(port, '/session')
  await checkEndpoint(port, '/json')
  await checkEndpoint(port, '/json/version')
  await checkEndpoint(port, '/json/protocol')
  console.log()
}

async function main() {
  console.log('Firefox connection test\n')
  console.log('Prerequisites:')
  console.log('  1. Set remote.active-protocols = 1 in about:config')
  console.log('  2. Launch Firefox with: firefox --marionette')
  console.log('     (Marionette listens on port 2828 by default)\n')

  // Discover what's listening
  await discoverEndpoints(MARIONETTE_PORT, 'Marionette')
  await discoverEndpoints(REMOTE_PORT, 'Remote Debugging')

  // Test connections
  let success = false
  success ||= await testWebDriverBiDi(MARIONETTE_PORT, 'Marionette')
  success ||= await testCdpWebSocket(MARIONETTE_PORT, 'Marionette')
  success ||= await testWebDriverBiDi(REMOTE_PORT, 'Remote')
  success ||= await testCdpWebSocket(REMOTE_PORT, 'Remote')

  if (!success) {
    console.log('No connection succeeded. Firefox may not be running with remote debugging enabled.')
    console.log('Try: firefox --marionette')
  }
}

main().catch(console.error)
