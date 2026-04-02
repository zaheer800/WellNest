let postureIntervalId: ReturnType<typeof setInterval> | null = null

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function showNotification(title: string, body: string, options?: NotificationOptions): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(title, { body, icon: '/icons/icon-192.png', ...options })
}

export function schedulePostureReminder(intervalMinutes: number): void {
  cancelPostureReminder()
  const ms = intervalMinutes * 60 * 1000
  postureIntervalId = setInterval(() => {
    showNotification(
      'Time to stand up!',
      'You have been sitting for a while. Stand up and move for 5 minutes — your spine needs it!',
    )
  }, ms)
}

export function cancelPostureReminder(): void {
  if (postureIntervalId !== null) {
    clearInterval(postureIntervalId)
    postureIntervalId = null
  }
}
