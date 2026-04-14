import { createContext, useContext } from 'react'
import { playBeep } from '../sound'

export { playBeep }

export const SoundContext = createContext(true)

export function useSoundEnabled() {
  return useContext(SoundContext)
}

export function useBeep() {
  const enabled = useSoundEnabled()
  return (freq, duration, type = 'square') => {
    if (enabled) playBeep(freq, duration, type)
  }
}
