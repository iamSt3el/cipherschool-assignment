import {useState} from "react";
import {Sun, Moon, User, Mail, Lock} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const LoginRegister = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { theme, toggleTheme } = useTheme();
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const result = await login(formData.email, formData.password);
                if (result.success) {
                    navigate('/ide');
                } else {
                    setError(result.message);
                }
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }
                const result = await register(formData.name, formData.email, formData.password);
                if (result.success) {
                    navigate('/ide');
                } else {
                    setError(result.message);
                }
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className={`min-h-screen min-w-screen flex items-center justify-center p-4 ${
            theme === 'dark' ? 'bg-black' : 'bg-white'
        }`}>
           <button
            onClick={toggleTheme}
            className={`fixed top-6 right-6 p-3 rounded-xl transition-colors cursor-pointer ${
                theme === 'dark' ? 'bg-zinc-900/50 hover:bg-zinc-800/50'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            >
            {theme === 'dark' ? 
                (<Sun className = "w-5 h-5 text-orange-500"/>):
                (<Moon className = "w-5 h-5 text-gray-700"/>)
            }
            </button>
            
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-xl shadow-orange-500/30">
                    <span className="text-2xl font-bold text-white">
                        &lt;/&gt;
                    </span>
                    </div>
                    <h1 className={`text-3xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                        CipherStudio
                    </h1>
                    <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        {isLogin ? "Welcome back! Please login to continue." : 'Create your account to get started.'}
                    </p>
                </div>
                
                <div className={`rounded-2xl border p-8 ${
                    theme === 'dark' ?
                        'bg-zinc-900/30 border-zinc-800/50'
                        :'bg-white border-gray-200 shadow-xl'
                }`}>
                    <div className={`flex gap-2 p-1 rounded-xl mb-8 ${
                        theme === 'dark' ? 'bg-zinc-900/50' : 'bg-gray-100'
                    }`}>
                        <button 
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                                isLogin ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30': theme === 'dark' ? 'text-gray-400 hover:text-white':
                                 'text-gray-600 hover:text-gray-900'
                            }`}>
                            Login
                        </button>

                        <button 
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                                !isLogin ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30': theme === 'dark' ? 'text-gray-400 hover:text-white':
                                 'text-gray-600 hover:text-gray-900'
                            }`}>
                            Register
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                    }`}/>
                                    <input
                                     type="text"
                                     name="name"
                                     placeholder="John Doe"
                                     value={formData.name}
                                     onChange={handleChange}
                                     required={!isLogin}
                                     className={`w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none transition-colors ${
                                         theme === 'dark'? 'bg-black/50 border-zinc-700 text-white placeholder-gray-500 focus:border-orange-500':
                                             'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500'
                                     }`}
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                    }`}/>
                                    <input
                                     type="email"
                                     name="email"
                                     placeholder="you@example.com"
                                     value={formData.email}
                                     onChange={handleChange}
                                     required
                                     className={`w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none transition-colors ${
                                         theme === 'dark'? 'bg-black/50 border-zinc-700 text-white placeholder-gray-500 focus:border-orange-500':
                                             'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500'
                                     }`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                    }`}/>
                                    <input
                                     type="password"
                                     name="password"
                                     placeholder="........"
                                     value={formData.password}
                                     onChange={handleChange}
                                     required
                                     className={`w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none transition-colors ${
                                         theme === 'dark'? 'bg-black/50 border-zinc-700 text-white placeholder-gray-500 focus:border-orange-500':
                                             'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500'
                                     }`}
                                    />
                                </div>
                            </div>

                        {!isLogin && <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                    }`}/>
                                    <input
                                     type="password"
                                     name="confirmPassword"
                                     placeholder="........"
                                     value={formData.confirmPassword}
                                     onChange={handleChange}
                                     required={!isLogin}
                                     className={`w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none transition-colors ${
                                         theme === 'dark'? 'bg-black/50 border-zinc-700 text-white placeholder-gray-500 focus:border-orange-500':
                                             'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500'
                                     }`}
                                    />
                                </div>
                            </div>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-orange-500 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-500/40 hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                    
                    <p className={`text-center text-sm mt-6 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                     <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                        }}
                        className="text-orange-500 hover:text-orange-600 font-semibold cursor-pointer"
                        >
                        {isLogin ? 'Sign up' : 'Sign in'}

                    </button>
                    </p>
                    </form>
                </div>

            </div>
        </div>
    )
}
