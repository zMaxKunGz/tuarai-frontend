import liff from '@line/liff'

let initialized = false

export async function initLiff(): Promise<void> {
  if (initialized) return
  await liff.init({ liffId: import.meta.env.VITE_LIFF_ID })
  initialized = true
  // Only trigger login redirect when opened in an external browser.
  // Inside LINE (isInClient), liff.init() already authenticates the user —
  // calling liff.login() again causes an "unknown error" on Android WebView.
  if (!liff.isLoggedIn() && !liff.isInClient()) {
    liff.login()
  }
}

export function getLiffProfile() {
  return liff.getProfile()
}

export { liff }
