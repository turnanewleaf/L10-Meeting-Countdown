"use client"

import { useState, useEffect } from "react"

export function usePersistedState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Initialize state with persisted value or initial value
  const [state, setState] = useState<T>(() => {
    try {
      const persistedValue = localStorage.getItem(key)
      return persistedValue ? JSON.parse(persistedValue) : initialValue
    } catch (error) {
      console.error(`Error loading persisted state for key "${key}":`, error)
      return initialValue
    }
  })

  // Update localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (error) {
      console.error(`Error saving persisted state for key "${key}":`, error)
    }
  }, [key, state])

  return [state, setState]
}
