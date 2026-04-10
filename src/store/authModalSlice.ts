import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthModalState {
  isOpen: boolean
  activeTab: 'login' | 'signup'
  isLoading: boolean
}

const initialState: AuthModalState = {
  isOpen: false,
  activeTab: 'login',
  isLoading: false,
}

const authModalSlice = createSlice({
  name: 'authModal',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<'login' | 'signup' | undefined>) => {
      state.isOpen = true
      state.activeTab = action.payload || 'login'
    },
    closeModal: (state) => {
      state.isOpen = false
      state.isLoading = false
    },
    switchTab: (state, action: PayloadAction<'login' | 'signup'>) => {
      state.activeTab = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { openModal, closeModal, switchTab, setLoading } = authModalSlice.actions
export default authModalSlice.reducer
