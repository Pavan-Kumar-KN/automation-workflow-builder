import React from 'react';
import { Node } from '@xyflow/react';

// Import specific config components
import { SendEmailConfig } from './specific/SendEmailConfig';
import { SendSMSConfig } from './specific/SendSMSConfig';

// Import generic config components
import { TriggerConfig } from './TriggerConfig';
import { ActionConfig } from './ActionConfig';
import { ConditionConfig } from './ConditionConfig';
import { SplitConfig } from './SplitConfig';
import { GotoConfig } from './GotoConfig';

import { NodeConfig } from './types';
import ProductEnquiredConfig from './triggers/forms/ProductEnquiredConfig';
import FormConfig from './triggers/forms/FormConfig';
import FacebookConfig from './triggers/forms/FacebookConfig';
import ContactSourceConfig from './triggers/contact/ContactSourceConfig';
import ContactUpdatedConfig from './triggers/contact/ContactUpdatedConfig';
import ContactTaggedConfig from './triggers/contact/ContactTaggedConfig';
import HappyBirthdayConfig from './triggers/contact/HappyBirthdayConfig';
import NoteAddedConfig from './triggers/crm/NoteAddedConfig';
import AddedPipelineConfig from './triggers/crm/AddedPipelineConfig';
import StageChangedConfig from './triggers/crm/StageChangedConfig';
import FollowUpConfig from './triggers/crm/FollowUpConfig';
import Calendar from '../../components/node-config/triggers/calendar/Calendar';
import FinanceConfig from './triggers/finance/FinanceConfig';
import LessonConfig from './triggers/lms/LessonConfig';
import Course from './triggers/lms/Course';
import ApiConfig from './triggers/api/ApiConfig';
import SpecificDateConfig from './triggers/schedule/SpecificDateConfig';
import MonthlyReccurConfig from './triggers/schedule/MonthlyReccurConfig';
import WeeklyReccurConfig from './triggers/schedule/WeeklyReccurConfig';
import EventDateConfig from './triggers/schedule/EventDateConfig';

interface DynamicNodeConfigProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export const DynamicNodeConfig: React.FC<DynamicNodeConfigProps> = ({ node, onUpdate, onClose }) => {
  // For specific node configurations based on node ID
  const getSpecificConfig = () => {
    const nodeId = node.data?.id;

    switch (nodeId) {

      case 'product-enquiry-trigger':
        return (
          <ProductEnquiredConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'form-submitted-trigger':
        return (
          // {/* Add form selection logic here */}
          <FormConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'facebook-form-trigger':
        return (
          <FacebookConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      // Contact module triggers
      case 'contact-source-trigger':
        return (
          <ContactSourceConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'contact-updated-trigger':
        return (
          <ContactUpdatedConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'contact-tagged-trigger':
        return (
          <ContactTaggedConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'happy-birthday-trigger':
        return (
          <HappyBirthdayConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      // CRM module triggers
      case 'notes-added-trigger':
        return (
          <NoteAddedConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'added-to-pipeline-trigger':
        return (
          <AddedPipelineConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'stage-changed-trigger':
        return (
          <StageChangedConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'follow-up-trigger':
        return (
          <FollowUpConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      // Calendar module triggers
      case 'appointment-booked-trigger':
        return (
          <Calendar
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
            name="Appointment Booked"
            description="When an appointment is booked, the workflow will trigger."
          />
        );

      case 'appointment-cancelled-trigger':
        return (
          <Calendar
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
            name="Appointment Cancelled"
            description="Appointment cancelled will run the workflow."
          />
        );

      case 'appointment-rescheduled-trigger':
        return (
          <Calendar
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
            name="Appointment Rescheduled"
            description="Appointment rescheduled will run the workflow."
          />
        );

      case 'no-show-trigger':
        return (
          <Calendar
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
            name="No-Show Appointment"
            description="No-show appointment will run the workflow."
          />
        );

      case 'show-up-trigger':
        return (
          <Calendar
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
            name="Show Up Appointment"
            description="Show Appointment within 24 hours will run the workflow."
          />
        );


      // Finance Config
      case 'subcription-created-trigger':
        return (
          <FinanceConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'subcription-overdue-trigger':
        return (
          <FinanceConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'subcription-paid-trigger':
        return (
          <FinanceConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'subcription-cancelled-trigger':
        return (
          <FinanceConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'installment-created-trigger':
        return (
          <FinanceConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'installment-paid-trigger':
        return (
          <FinanceConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'installment-overdue-trigger':
        return (
          <FinanceConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'installment-cancelled-trigger':
        return (
          <FinanceConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );


      case 'payment-failed-trigger':
        return (
          <FinanceConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'invoice-paid-trigger':
        return (
          <FinanceConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );


      case 'lesson-completed-trigger':
        return (
          <LessonConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'course-completed-trigger':
        return (
          <Course
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'comment-added-trigger':
        return (
          <Course
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )


        // api trigger
      case 'api-trigger':
        return (
          <ApiConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );


      case 'specific-date-trigger':
        return (
          <SpecificDateConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

        case 'weekly-recurring-trigger':
        return (
          <WeeklyReccurConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

        case 'monthly-recurring-trigger':
        return (
          <MonthlyReccurConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

        case 'event-date-trigger':
        return (
          <EventDateConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      // Add more specific configs as needed
      default:
        return null;
    }
  };

  // Get generic config based on node type
  const getGenericConfig = () => {
    switch (node.type) {
      case 'trigger':
        return (
          <TriggerConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );
      case 'action':
        return (
          <ActionConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );
      case 'condition':
        return (
          <ConditionConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );
      case 'split-condition':
        return (
          <SplitConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );
      case 'goto-node':
        return (
          <GotoConfig
            node={node}
            onUpdate={onUpdate}
            onClose={onClose}
          />
        );
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>No configuration available for this node type.</p>
          </div>
        );
    }
  };

  // Try specific config first, fall back to generic
  const specificConfig = getSpecificConfig();

  return (
    <div className="p-6">
      {specificConfig || getGenericConfig()}
    </div>
  );
};
