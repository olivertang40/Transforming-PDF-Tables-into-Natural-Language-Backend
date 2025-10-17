'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 模拟登录API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟不同角色的返回结果
      const mockRoles = ['system-admin', 'org-admin', 'project-manager', 'annotator', 'qa', 'exporter'];
      const mockRole = mockRoles[Math.floor(Math.random() * mockRoles.length)];
      
      // 根据角色跳转到对应页面
      switch (mockRole) {
        case 'system-admin':
          router.push('/console/system');
          break;
        case 'org-admin':
          router.push('/console/org');
          break;
        case 'project-manager':
          router.push('/console/project');
          break;
        case 'annotator':
          router.push('/annotator');
          break;
        case 'qa':
          router.push('/qa');
          break;
        case 'exporter':
          router.push('/export');
          break;
        default:
          setError('No valid role or permission. Please contact your administrator.');
      }
    } catch (err) {
      setError('Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = () => {
    setLoading(true);
    // 模拟SSO登录
    setTimeout(() => {
      setLoading(false);
      router.push('/annotator');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Logo and Branding */}
          <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 lg:p-12 flex flex-col justify-center text-white">
            <div className="mb-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <i className="ri-file-text-line text-3xl text-white"></i>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                Document Annotation Platform
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed">
                AI-powered document processing with intelligent annotation workflows. 
                Streamline your document analysis with collaborative tools and quality assurance.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-robot-line text-white"></i>
                </div>
                <span className="text-blue-100">AI-powered document parsing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-team-line text-white"></i>
                </div>
                <span className="text-blue-100">Collaborative annotation workflow</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-shield-check-line text-white"></i>
                </div>
                <span className="text-blue-100">Quality assurance system</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
                <p className="text-gray-600">Sign in to manage your annotation workflow</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <i className="ri-error-warning-line text-red-500 mr-2"></i>
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSSOLogin}
                  disabled={loading}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Connecting...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <i className="ri-shield-keyhole-line mr-2"></i>
                      Continue with SSO
                    </div>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-700">Terms of Service</Link>
          <Link href="/support" className="hover:text-gray-700">Support</Link>
        </div>
      </div>
    </div>
  );
}