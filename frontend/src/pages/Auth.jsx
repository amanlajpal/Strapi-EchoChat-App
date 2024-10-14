import { useState, useEffect } from 'react'
import { Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setIsAuthenticated } from '../redux/slices/authSlice';
import axiosInstance from '../utils/AxiosInstance'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  })
  const dispatch = useDispatch();

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(prefersDark)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function login(identifier, password) {
    try {
        const response = await axiosInstance.post('/auth/local', {
            identifier,
            password,
        });

        if(response?.data?.jwt) {
          localStorage.setItem('jwt', response?.data?.jwt);
          dispatch(setIsAuthenticated(true));
        }

    } catch (error) {
        console.error('Login failed', error);
        const errorMessage = error?.response?.data?.error?.message || "Login failed";
        alert(errorMessage);
    }
  }

  async function signup(username, email, password) {
    try {
        const response = await axiosInstance.post('/auth/local/register', {
            username,
            email,
            password,
        });

        if(response?.data?.jwt) {
          localStorage.setItem('jwt', response?.data?.jwt);
          dispatch(setIsAuthenticated(true));
        }

    } catch (error) {
        console.error('Signup failed', error);
        const errorMessage = error?.response?.data?.error?.message || "Signup failed";
        alert(errorMessage);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLogin) {
      await login(formData.email, formData.password)
    } else {
      await signup(formData.username, formData.email, formData.password)
    }
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setFormData({ email: '', password: '', username: '' })
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDarkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' : 'bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500'
    }`}>
      <div className={`relative w-96 p-8 rounded-2xl shadow-xl transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 bg-opacity-30' : 'bg-white bg-opacity-20'
      } backdrop-filter backdrop-blur-lg border border-opacity-20 ${
        isDarkMode ? 'border-gray-700' : 'border-white'
      }`}>
        <div className={`absolute inset-0 rounded-2xl filter blur-xl transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-700 opacity-30' : 'bg-white opacity-30'
        }`}></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {isLogin ? 'Login' : 'Sign Up'}
            </h2>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${
                isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-blue-100 text-gray-800'
              } transition-colors duration-300`}
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label htmlFor="username" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-75 transition duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-400'
                      : 'bg-white bg-opacity-70 text-gray-900 border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your username"
                />
              </div>
            )}
            <div className="space-y-1">
              <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-75 transition duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-400'
                    : 'bg-white bg-opacity-70 text-gray-900 border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-75 transition duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-400'
                      : 'bg-white bg-opacity-70 text-gray-900 border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 opacity-70 hover:opacity-100 transition duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 opacity-70 hover:opacity-100 transition duration-200" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400'
              }`}
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={toggleAuthMode}
              className={`text-sm hover:underline transition duration-200 ${
                isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}