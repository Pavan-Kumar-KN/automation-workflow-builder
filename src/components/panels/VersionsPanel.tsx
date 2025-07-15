import React from 'react';
import { X, GitBranch, Download, Eye, Star, Clock, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VersionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadVersion?: (versionId: string) => void;
}

interface WorkflowVersion {
  id: string;
  version: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  isCurrent: boolean;
  changes: string[];
  nodeCount: number;
  status: 'draft' | 'published' | 'archived';
}

// Mock data for demonstration
const mockVersions: WorkflowVersion[] = [
  {
    id: 'v-001',
    version: '1.3.0',
    name: 'Enhanced Email Notifications',
    description: 'Added conditional email routing and improved error handling',
    createdAt: '2024-01-15 14:30:00',
    createdBy: 'John Doe',
    isActive: true,
    isCurrent: true,
    changes: [
      'Added conditional node for email routing',
      'Improved error handling in email action',
      'Updated trigger configuration'
    ],
    nodeCount: 5,
    status: 'published'
  },
  {
    id: 'v-002',
    version: '1.2.1',
    name: 'Bug Fixes',
    description: 'Fixed API timeout issues and improved logging',
    createdAt: '2024-01-14 09:15:00',
    createdBy: 'Jane Smith',
    isActive: false,
    isCurrent: false,
    changes: [
      'Fixed API timeout configuration',
      'Enhanced logging for debugging',
      'Minor UI improvements'
    ],
    nodeCount: 4,
    status: 'published'
  },
  {
    id: 'v-003',
    version: '1.2.0',
    name: 'API Integration',
    description: 'Added external API integration and data transformation',
    createdAt: '2024-01-12 16:45:00',
    createdBy: 'Mike Johnson',
    isActive: false,
    isCurrent: false,
    changes: [
      'Added API call action',
      'Implemented data transformation node',
      'Updated workflow structure'
    ],
    nodeCount: 4,
    status: 'published'
  },
  {
    id: 'v-004',
    version: '1.1.0',
    name: 'Initial Release',
    description: 'Basic workflow with form trigger and email action',
    createdAt: '2024-01-10 11:20:00',
    createdBy: 'John Doe',
    isActive: false,
    isCurrent: false,
    changes: [
      'Created basic workflow structure',
      'Added form submission trigger',
      'Implemented email notification action'
    ],
    nodeCount: 2,
    status: 'archived'
  }
];

const getStatusColor = (status: WorkflowVersion['status']) => {
  switch (status) {
    case 'published':
      return 'text-green-600 bg-green-50';
    case 'draft':
      return 'text-yellow-600 bg-yellow-50';
    case 'archived':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const VersionsPanel: React.FC<VersionsPanelProps> = ({ 
  isOpen, 
  onClose, 
  onLoadVersion 
}) => {
  const [selectedVersion, setSelectedVersion] = React.useState<WorkflowVersion | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleLoadVersion = (versionId: string) => {
    if (onLoadVersion) {
      onLoadVersion(versionId);
      onClose();
    }
  };

  const filteredVersions = mockVersions.filter(version =>
    version.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-96 bg-white shadow-xl border-r border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Workflow Versions</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search Box */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search versions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!selectedVersion ? (
          // Versions List
          <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-3">
              {filteredVersions.map((version) => (
                <div
                  key={version.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-600">v{version.version}</span>
                      {version.isCurrent && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(version.status)}`}>
                        {version.status.charAt(0).toUpperCase() + version.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-1">{version.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{version.description}</p>
                  
                  <div className="text-xs text-gray-500 space-y-1 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{version.createdBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{version.createdAt}</span>
                    </div>
                    <div>Nodes: {version.nodeCount}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedVersion(version)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    {!version.isCurrent && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleLoadVersion(version.id)}
                        className="flex-1"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Load
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Version Details
          <div className="h-full flex flex-col">
            {/* Version Details Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedVersion(null)}>
                  ← Back
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-blue-600">v{selectedVersion.version}</span>
                {selectedVersion.isCurrent && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(selectedVersion.status)}`}>
                  {selectedVersion.status.charAt(0).toUpperCase() + selectedVersion.status.slice(1)}
                </span>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-2">{selectedVersion.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{selectedVersion.description}</p>
              
              <div className="text-sm space-y-1 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Created by {selectedVersion.createdBy}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{selectedVersion.createdAt}</span>
                </div>
                <div>Nodes: {selectedVersion.nodeCount}</div>
              </div>

              {!selectedVersion.isCurrent && (
                <Button
                  onClick={() => handleLoadVersion(selectedVersion.id)}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Load This Version
                </Button>
              )}
            </div>

            {/* Changes */}
            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="text-sm font-medium mb-3">Changes in this version:</h4>
              <div className="space-y-2">
                {selectedVersion.changes.map((change, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{change}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};