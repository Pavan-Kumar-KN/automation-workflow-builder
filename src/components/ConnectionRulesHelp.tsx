import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, X, ArrowRight, ArrowDown } from 'lucide-react';

export const ConnectionRulesHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-white shadow-lg border-blue-200 text-blue-600 hover:bg-blue-50"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Connection Rules
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80 shadow-xl border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-700">Connection Rules</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Rule 1: One Trigger to One Action */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🔥</span>
            <ArrowRight className="w-4 h-4 text-red-600" />
            <span className="text-lg">⚡</span>
            <span className="text-sm font-medium text-red-700">1:1 Only</span>
          </div>
          <p className="text-xs text-red-600">
            <strong>Each trigger can connect to only ONE action.</strong> If you need multiple actions, 
            connect the action to conditions or other actions.
          </p>
        </div>

        {/* Rule 2: Multiple Triggers to Same Action */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex flex-col items-center">
              <span className="text-sm">🔥</span>
              <span className="text-sm">🔥</span>
            </div>
            <ArrowRight className="w-4 h-4 text-green-600" />
            <span className="text-lg">⚡</span>
            <span className="text-sm font-medium text-green-700">Many:1 OK</span>
          </div>
          <p className="text-xs text-green-600">
            <strong>Multiple triggers can connect to the same action.</strong> This allows different 
            events to trigger the same workflow action.
          </p>
        </div>

        {/* Rule 3: Valid Flow Pattern */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-1 mb-2">
            <span className="text-sm">🔥</span>
            <ArrowRight className="w-3 h-3 text-blue-600" />
            <span className="text-sm">⚡</span>
            <ArrowRight className="w-3 h-3 text-blue-600" />
            <span className="text-sm">🎯</span>
            <ArrowRight className="w-3 h-3 text-blue-600" />
            <span className="text-sm">⚡</span>
          </div>
          <p className="text-xs text-blue-600">
            <strong>Recommended flow:</strong> Trigger → Action → Condition → Action
          </p>
        </div>

        {/* Invalid Connections */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">❌ Invalid Connections:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Trigger → Trigger</li>
            <li>• Action → Trigger</li>
            <li>• Trigger → Multiple Actions (directly)</li>
          </ul>
        </div>

        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Need help? Check the documentation for more details.
        </div>
      </CardContent>
    </Card>
  );
};
