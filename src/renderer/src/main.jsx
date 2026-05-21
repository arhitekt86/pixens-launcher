// PIXENS Launcher renderer entry.
//
// The Claude Design bundle was written for Babel-standalone: the files
// (tweaks-panel / ui / screens / app) share one global scope, reference
// React + hooks + each other as BARE globals, and publish via
// Object.assign(window, {...}). To run it under a proper Vite build with
// ZERO edits to those 2700 lines, we replicate that global environment
// here, then import the modules in the original index.html order.
import React from 'react'
import * as ReactDOMClient from 'react-dom/client'
import '@fontsource/press-start-2p'
import '@fontsource/vt323'
import './styles.css'
import './launcher-overrides.css' // desktop overrides — MUST win cascade (after styles.css)

// app.jsx does `ReactDOM.createRoot(...).render(<App/>)`.
window.React = React
window.ReactDOM = ReactDOMClient
const {
  useState, useEffect, useRef, useMemo, useCallback,
  useLayoutEffect, useContext, createContext, Fragment
} = React
Object.assign(window, {
  useState, useEffect, useRef, useMemo, useCallback,
  useLayoutEffect, useContext, createContext, Fragment
})

// Order matters: tweaks-panel -> ui -> screens -> app (each publishes its
// components to window for the next; app.jsx's tail mounts the React root).
;(async () => {
  await import('./tweaks-panel.jsx')
  await import('./ui.jsx')
  await import('./screens.jsx')
  await import('./app.jsx')
})()
