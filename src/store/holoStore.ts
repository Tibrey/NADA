import { create } from 'zustand'
import type { HoloState, ViewMode } from '@/three/hologramConfig'

interface HoloStore {
  viewMode: ViewMode
  holoState: HoloState
  /** increments whenever a fresh scan is requested */
  scanNonce: number
  setViewMode: (mode: ViewMode) => void
  setHoloState: (state: HoloState) => void
  requestScan: () => void
}

export const useHoloStore = create<HoloStore>((set, get) => ({
  viewMode: 'hologram',
  holoState: 'HOLOGRAM',
  scanNonce: 0,
  setViewMode: (viewMode) => set({ viewMode, holoState: viewMode === 'real' ? 'NORMAL' : 'HOLOGRAM' }),
  setHoloState: (holoState) => set({ holoState }),
  requestScan: () => {
    if (get().viewMode !== 'hologram') return
    set((s) => ({ holoState: 'SCANNING', scanNonce: s.scanNonce + 1 }))
  },
}))
