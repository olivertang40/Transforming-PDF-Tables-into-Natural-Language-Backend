
'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Document Annotation Management System</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Intelligent Document Annotation Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI-powered document parsing and human annotation QA system with complete document processing workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/admin">
            <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-admin-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Dashboard</h3>
              <p className="text-gray-600 mb-4">
                File upload, task assignment, progress monitoring and project management
              </p>
              <div className="flex items-center text-blue-600">
                <span className="text-sm font-medium">Enter Dashboard</span>
                <i className="ri-arrow-right-line ml-2 w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>
          </Link>

          <Link href="/annotator">
            <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-edit-2-line text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Annotator Workspace</h3>
              <p className="text-gray-600 mb-4">
                Task queue management, AI draft editing and content annotation
              </p>
              <div className="flex items-center text-green-600">
                <span className="text-sm font-medium">Start Annotation</span>
                <i className="ri-arrow-right-line ml-2 w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>
          </Link>

          <Link href="/qa">
            <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-shield-check-line text-2xl text-orange-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">QA Workspace</h3>
              <p className="text-gray-600 mb-4">
                Annotation content review, quality check and approve/reject handling
              </p>
              <div className="flex items-center text-orange-600">
                <span className="text-sm font-medium">Start QA</span>
                <i className="ri-arrow-right-line ml-2 w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>
          </Link>

          <Link href="/export">
            <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-download-cloud-2-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Export</h3>
              <p className="text-gray-600 mb-4">
                Annotation results export, format selection and download management
              </p>
              <div className="flex items-center text-purple-600">
                <span className="text-sm font-medium">Export Data</span>
                <i className="ri-arrow-right-line ml-2 w-4 h-4 flex items-center justify-center"></i>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-robot-line text-blue-600"></i>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">AI Smart Parsing</h4>
              <p className="text-sm text-gray-600">Automatically identify document tables and generate drafts</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-team-line text-green-600"></i>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Collaborative Annotation</h4>
              <p className="text-sm text-gray-600">Multi-role collaborative annotation workflow</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-medal-line text-orange-600"></i>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Quality Assurance</h4>
              <p className="text-sm text-gray-600">Comprehensive QA mechanism ensures data quality</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
