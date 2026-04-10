import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface LoginState {
  email: string
  password: string
  errors: {
    email?: string
    password?: string
    general?: string
  }
}

interface SignupState {
  name: string
  email: string
  password: string
  confirmPassword: string
  errors: {
    name?: string
    email?: string
    password?: string
    general?: string
  }
  passwordStrength: 0 | 1 | 2 | 3 | 4
}

interface AuthFormsState {
  login: LoginState
  signup: SignupState
}

const initialState: AuthFormsState = {
  login: {
    email: '',
    password: '',
    errors: {},
  },
  signup: {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    errors: {},
    passwordStrength: 0,
  },
}

const authFormsSlice = createSlice({
  name: 'authForms',
  initialState,
  reducers: {
    // Login form actions
    setLoginEmail: (state, action: PayloadAction<string>) => {
      state.login.email = action.payload
      state.login.errors.email = undefined
    },
    setLoginPassword: (state, action: PayloadAction<string>) => {
      state.login.password = action.payload
      state.login.errors.password = undefined
    },
    setLoginErrors: (state, action: PayloadAction<LoginState['errors']>) => {
      state.login.errors = action.payload
    },
    clearLoginErrors: (state) => {
      state.login.errors = {}
    },

    // Signup form actions
    setSignupName: (state, action: PayloadAction<string>) => {
      state.signup.name = action.payload
      state.signup.errors.name = undefined
    },
    setSignupEmail: (state, action: PayloadAction<string>) => {
      state.signup.email = action.payload
      state.signup.errors.email = undefined
    },
    setSignupPassword: (state, action: PayloadAction<string>) => {
      state.signup.password = action.payload
      state.signup.errors.password = undefined
    },
    setSignupConfirmPassword: (state, action: PayloadAction<string>) => {
      state.signup.confirmPassword = action.payload
    },
    setSignupErrors: (state, action: PayloadAction<SignupState['errors']>) => {
      state.signup.errors = action.payload
    },
    clearSignupErrors: (state) => {
      state.signup.errors = {}
    },
    setPasswordStrength: (state, action: PayloadAction<0 | 1 | 2 | 3 | 4>) => {
      state.signup.passwordStrength = action.payload
    },

    // Reset all forms
    resetForms: (state) => {
      state.login = { email: '', password: '', errors: {} }
      state.signup = { 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '', 
        errors: {}, 
        passwordStrength: 0 
      }
    },
  },
})

export const {
  setLoginEmail,
  setLoginPassword,
  setLoginErrors,
  clearLoginErrors,
  setSignupName,
  setSignupEmail,
  setSignupPassword,
  setSignupConfirmPassword,
  setSignupErrors,
  clearSignupErrors,
  setPasswordStrength,
  resetForms,
} = authFormsSlice.actions

export default authFormsSlice.reducer
