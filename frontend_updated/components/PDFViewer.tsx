
'use client';

interface PDFViewerProps {
  fileName: string;
  pageNumber: number;
}

export default function PDFViewer({ fileName, pageNumber }: PDFViewerProps) {
  return (
    <div className="h-full bg-gray-100 p-4">
      <div className="h-full flex flex-col">
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg w-full h-full flex flex-col">
              <div className="bg-gray-800 text-white p-3 rounded-t-lg flex items-center justify-between">
                <span className="text-sm truncate">{fileName}</span>
                <div className="flex items-center space-x-3">
                  <button className="text-gray-300 hover:text-white w-8 h-8 flex items-center justify-center cursor-pointer">
                    <i className="ri-zoom-out-line"></i>
                  </button>
                  <span className="text-sm">100%</span>
                  <button className="text-gray-300 hover:text-white w-8 h-8 flex items-center justify-center cursor-pointer">
                    <i className="ri-zoom-in-line"></i>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-gray-50 p-6 overflow-auto">
                <div className="bg-white shadow-sm border rounded p-8 h-full relative">
                  <div className="absolute top-6 right-6 bg-red-100 border-2 border-red-300 rounded p-3">
                    <div className="text-sm text-red-600 font-medium mb-2">Detected Table</div>
                    <div className="w-40 h-28 bg-red-50 border border-red-200 rounded flex items-center justify-center">
                      <i className="ri-table-line text-red-400 text-2xl"></i>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-5/6"></div>
                    <div className="mt-12 space-y-4">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 px-6 py-3 rounded-b-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 bg-white border rounded text-sm hover:bg-gray-50 whitespace-nowrap cursor-pointer">
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pageNumber}
                  </span>
                  <button className="px-4 py-2 bg-white border rounded text-sm hover:bg-gray-50 whitespace-nowrap cursor-pointer">
                    Next
                  </button>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 whitespace-nowrap cursor-pointer">
                  Fit to Window
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
