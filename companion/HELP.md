# Browser Control

Control open instances of Chrome or Firefox via [Puppeteer](https://pptr.dev/) remote debugging.

> **Warning:** Configuring your browser to work with this module gives full remote access to potentially any device on your network. This means your saved data, cookies, history, open webpages, etc. It is strongly recommended for security reasons that you use a dedicated browser profile without sensitive information.

## Config

1. Start the browser with the steps below.
2. Select target browser from the module connection dropdown.
3. Enter the host IP address and remote debugging port.
4. (Optional) Set a keyword to match the target tab. This can also be set on a per-action basis.

### Chrome

Allow remote debugging in `chrome://inspect/#remote-debugging`. Optionally, create a new profile in the profile manager and restart Chrome in that profile. Allow the permission request that pops up when Companion connects.

### Firefox

Set `remote.active-protocols=1` in `about:config` and relaunch Firefox with these command line arguments:

**Mac**

<pre>open -a firefox --args --remote-debugging-port 9222 [--profilemanager]</pre>

**Linux**

<pre>firefox --remote-debugging-port 9222 [--profilemanager]</pre>

**Windows**

<pre>"%PROGRAMFILES%\Mozilla Firefox\firefox.exe" --remote-debugging-port 9222 [--profilemanager]</pre>

## Actions

- Click Element
- Type Text
- Navigate to URL
- Go Back
- Go Forward
- Reload Page
- Press Key
- Scroll to Element
- Select Dropdown
- Check/Uncheck
- Hover Element
- Close Tab
- New Tab
- Execute JS
- Wait for Selector
- Clear Input
- Set Input Value

## Action results

Every action returns a result describing whether it succeeded:

- Most actions return `true` / `false`.
- Navigate to URL returns `{ success, url, title, status }`.

In a preset, an action can store its result into a button-local variable ("store result"), so you can build buttons and logic that react to success vs. failure.

The module also exposes the `Last URL`, `Last Title` and `Last Status` variables, set after a successful Navigate to URL.

## Timeouts

Browser operations are network-bound and can be slow. Companion aborts an action after a default window of about 5 seconds, in which case the action reports failure. A per-action `executionTimeout` option is planned in a future `@companion-module/base` release to raise this for slow operations.
