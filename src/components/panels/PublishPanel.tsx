import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { COMPONENT_STYLES, COMMON_CLASSES } from '@/constants/theme';
import { useWorkflowStore } from '@/hooks/useWorkflowState';

interface PublishPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishPanel: React.FC<PublishPanelProps> = ({ isOpen, onClose }) => {
  const { workflowName } = useWorkflowStore();
  const [scheduleEnable, setScheduleEnable] = useState('');
  const [scheduleDisable, setScheduleDisable] = useState('');
  const [allowReentry, setAllowReentry] = useState(true);
  const [specificTime, setSpecificTime] = useState(false);

  const handleSave = () => {
    console.log('Saving automation settings:', {
      scheduleEnable,
      scheduleDisable,
      allowReentry,
      specificTime
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] lg:w-[480px] bg-white shadow-xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
        <h2 className={COMPONENT_STYLES.PUBLISH.TITLE}>Publish Workflow</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Workflow Title */}
        <div className="mb-6">
          <h2 className={`${COMPONENT_STYLES.PUBLISH.SECTION_HEADER} mb-2`}>
            {workflowName || 'Untitled Automation'}
          </h2>
          <p className={`${COMPONENT_STYLES.PUBLISH.VALIDATION_ERROR} mb-4`}>Trigger Not Set</p>
          <p className={COMPONENT_STYLES.PUBLISH.DESCRIPTION}>
            Below is general information of the automation. You can update the settings and click 'Save' button.
          </p>
        </div>

        {/* Schedule Enable */}
        <div className="mb-6">
          <label className={`${COMPONENT_STYLES.PUBLISH.LABEL} mb-2 block`}>Schedule Enable</label>
          <input
            type="datetime-local"
            value={scheduleEnable}
            onChange={(e) => setScheduleEnable(e.target.value)}
            className={`${COMMON_CLASSES.INPUT_FIELD} w-full`}
            placeholder="mm/dd/yyyy --:-- --"
          />
        </div>

        {/* Schedule Disable */}
        <div className="mb-6">
          <label className={`${COMPONENT_STYLES.PUBLISH.LABEL} mb-1 block`}>Schedule Disable</label>
          <p className={`${COMPONENT_STYLES.PUBLISH.VALIDATION_INFO} mb-2`}>
            (if date not selected then it will not disable automatically)
          </p>
          <input
            type="datetime-local"
            value={scheduleDisable}
            onChange={(e) => setScheduleDisable(e.target.value)}
            className={`${COMMON_CLASSES.INPUT_FIELD} w-full`}
            placeholder="mm/dd/yyyy --:-- --"
          />
        </div>

        {/* Allow Re-entry */}
        <div className="mb-6">
          <div className="flex items-center justify-between py-2">
            <label className={COMPONENT_STYLES.PUBLISH.LABEL}>Allow Re-entry</label>
            <Switch
              checked={allowReentry}
              onCheckedChange={setAllowReentry}
            />
          </div>
        </div>

        {/* Specific Time */}
        <div className="mb-8">
          <div className="flex items-center justify-between py-2">
            <label className={COMPONENT_STYLES.PUBLISH.LABEL}>Specific Time</label>
            <Switch
              checked={specificTime}
              onCheckedChange={setSpecificTime}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 border-t border-gray-200 space-y-3">
        <Button
          onClick={handleSave}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2 px-4 rounded-md"
        >
          Save
        </Button>

        <Button
          onClick={onClose}
          variant="outline"
          className="w-full text-sm font-medium py-2 px-4 rounded-md"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
