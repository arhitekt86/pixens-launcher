import type { PixensApi } from './index'

declare global {
  interface Window {
    pixens: PixensApi
  }
}

export {}
