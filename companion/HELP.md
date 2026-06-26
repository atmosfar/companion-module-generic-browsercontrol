## Browser Control

Control Chrome or Firefox browser tabs via Puppeteer remote debugging.

> **Warning:** This module gives full automated access to your open browser window to potentially any device on your network. This means your saved data, cookies, history, open webpages, etc. Act with caution.

### Setup

1. Select target browser from the dropdown
2. Enter the host IP address and remote debugging port
3. (Optional) Set a keyword to match the target tab. This can also be set on a per-action basis.

### Chrome

Allow remote debugging in `chrome://inspect/#remote-debugging`

### Firefox

Set `remote.active-protocols=1` in `about:config`, then launch Firefox:

**macOS**
<pre>open -a firefox --args --remote-debugging-port 9222</pre>

**Linux**
<pre>firefox --remote-debugging-port 9222</pre>

**Windows**
<pre>"%PROGRAMFILES%\Mozilla Firefox\firefox.exe" --remote-debugging-port 9222</pre>
