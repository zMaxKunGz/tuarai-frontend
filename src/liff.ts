import liff from '@line/liff'

let initialized = false

export async function initLiff(): Promise<void> {
  if (initialized) return
  await liff.init({ liffId: import.meta.env.VITE_LIFF_ID })
  initialized = true
  if (!liff.isLoggedIn()) {
    liff.login()
  }
}

export function getLiffProfile() {
  return liff.getProfile()
}

export { liff }
