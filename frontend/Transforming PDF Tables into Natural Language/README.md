# Transforming PDF Tables into Natural Language

An intelligent document annotation management system that transforms PDF tables into natural language through AI-powered parsing and human annotation workflow.

## 🚀 Overview

This platform provides a comprehensive solution for processing PDF documents containing tabular data and converting them into natural language descriptions through a collaborative annotation workflow. The system combines AI-powered document parsing with human quality assurance to ensure high-quality output.

## ✨ Features

### 🤖 AI Smart Parsing
- Automatically identify and extract tables from PDF documents
- Generate natural language drafts from tabular data
- Intelligent document structure recognition

### 👥 Collaborative Annotation
- Multi-role workflow system (Admin, Annotator, QA)
- Task assignment and queue management
- Real-time progress tracking

### 🛡️ Quality Assurance
- Comprehensive review mechanism
- Approve/reject workflow
- Quality metrics and monitoring

### 📊 Management Dashboard
- Project management and monitoring
- File upload and processing
- Export functionality with multiple formats

## 🏗️ Architecture

The system consists of four main modules:

1. **Admin Dashboard** - Project management, file uploads, task assignment
2. **Annotator Workspace** - AI draft editing and content annotation
3. **QA Workspace** - Quality review and approval process
4. **Data Export** - Result export and download management

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom React components
- **Charts**: Recharts
- **Maps**: Google Maps API integration

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/AshleyGuoj/Transforming-PDF-Tables-into-Natural-Language.git
cd Transforming-PDF-Tables-into-Natural-Language
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🚀 Usage

### For Administrators
1. Access the Admin Dashboard at `/admin`
2. Upload PDF documents containing tables
3. Assign tasks to annotators
4. Monitor project progress and statistics

### For Annotators
1. Access the Annotator Workspace at `/annotator`
2. Review AI-generated drafts
3. Edit and refine natural language descriptions
4. Submit completed annotations for QA review

### For QA Reviewers
1. Access the QA Workspace at `/qa`
2. Review annotated content
3. Approve high-quality work or request revisions
4. Maintain quality standards across the project

### Data Export
1. Navigate to the Export page at `/export`
2. Select desired format and filters
3. Download processed results

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard page
│   ├── annotator/         # Annotator workspace page
│   ├── qa/                # QA workspace page
│   ├── export/            # Data export page
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── DraftEditor.tsx    # AI draft editing component
│   ├── ExportPanel.tsx    # Data export functionality
│   ├── FileUpload.tsx     # File upload component
│   ├── PDFViewer.tsx      # PDF document viewer
│   ├── ProjectSelector.tsx # Project selection interface
│   ├── ProjectSidebar.tsx  # Project navigation sidebar
│   ├── ProjectStats.tsx    # Statistics dashboard
│   ├── ReviewPanel.tsx     # QA review interface
│   └── TaskTable.tsx       # Task management table
├── package.json           # Project dependencies
└── README.md             # This file
```

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Next.js and modern web technologies
- Designed for scalable document processing workflows
- Optimized for collaborative annotation tasks

## 📞 Support

For questions and support, please open an issue in the GitHub repository.

---

Made with ❤️ for transforming complex tabular data into accessible natural language.
