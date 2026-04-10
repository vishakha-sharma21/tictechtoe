import { configureStore } from '@reduxjs/toolkit'
import authModalReducer from './authModalSlice'
import authFormsReducer from './authFormsSlice'

export const store = configureStore({
  reducer: {
    authModal: authModalReducer,
    authForms: authFormsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
