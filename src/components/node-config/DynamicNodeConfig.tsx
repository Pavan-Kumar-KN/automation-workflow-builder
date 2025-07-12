import React from 'react';
import { Node } from '@xyflow/react';

// Import generic config components
import { TriggerConfig } from './TriggerConfig';
import { ActionConfig } from './ActionConfig';
import { ConditionConfig } from './ConditionConfig';

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
import SendMailConfig from './actions/communication/SendMailConfig';
import SendWhatsappConfig from './actions/communication/SendWhatsaapConfig';
import SmsConfig from './actions/communication/SmsConfig';
import DelayConfig from './actions/DelayConfig';
import ContactUpdatedEvalConfig from './actions/evaluate/contact/ContactUpdatedEvalConfig';
import ContactTaggedEvalConfig from './actions/evaluate/contact/ContactTaggedEvalConfig';
import ContactTypeEvalConfig from './actions/evaluate/contact/ContactTypeEvalConfig';
import LeadQualityEvalConfig from './actions/evaluate/crm/LeadQualityEvalConfig';
import AssignedStaffEvalConfig from './actions/evaluate/crm/AssignedStaffEvalConfig';
import InvoiceEvalConfig from './actions/evaluate/sales/InvoiceEvalConfig';
import ProductFormEvalConfig from './actions/evaluate/forms/ProductFromEvalConfig'
import FacebookEvalConfig from './actions/evaluate/forms/FacebookEvalConfig'
import MagicFromEvalConfig from './actions/evaluate/forms/MagicFromEvalConfig'
import CalendarEvalConfig from './actions/evaluate/calendar/CalendarEvalConfig';
import WebhookEvalConfig from './actions/webhook/WebhookEvalConfig';
import WebhookAdvanceEvalConfig from './actions/webhool(advance)/WebhookAdvanceEvalConfig';
import RemoveWorkFlow from './actions/RemovWorkFlow';
import InternalNotificationConfig from './actions/notification/InternalNotificationConfig';
import UpdateContactAttributeConfig from './actions/operations/UpdateContactAttributeConfig';
import ConvertLeadToCustomer from './actions/operations/ConvertLeadToCustomer';
import ContactTaggedOperation from './actions/operations/contact_ops/contact_tag_ops/ContactTaggedOperation';
import RemoveTagOperation from './actions/operations/contact_ops/contact_tag_ops/RemoveTagOperation';
import ContactGroupOperation from './actions/operations/contact_ops/contact_group/ContactGroupOperation';
import ContactGroupRemoveOperation from './actions/operations/contact_ops/contact_group/ContactGroupRemoveOperation';
import AddUpdateToCRMConfig from './actions/operations/crm_ops/AddUpdateToCRM';
import RemoveFromCRMConfig from './actions/operations/crm_ops/RemoveFromCRM';
import CourseAccessOperation from './actions/operations/lms_ops/CourseAccessOperation';
import ChangeLeadQuality from './actions/operations/lead_quality/ChangeLeadQuality';
import CourseRevokeOperation from './actions/operations/lms_ops/CourseRevokeOperation';
import ExecuteAutomation from './actions/operations/ExecuteAutomation';
import EventStartOperation from './actions/operations/EventStartOperation';
import ChangeAppointmentStatusConfig from './actions/operations/ChangeAppointmentStatusConfig';
import AssignToStaffOperation from './actions/operations/staff_ops/AssignToStaffConfig';
import RemoveAssignedStaffOperation from './actions/operations/staff_ops/RemoveAssinedStaffConfig';
import CommunityAccess from './actions/operations/community_ops/CommunityAccess';
import CommunityRevoke from './actions/operations/community_ops/ComminityRevoke';
import ChatGroupAccessConfig from './actions/operations/contact_ops/chat_group/ChatGroupAccessConfig';
import ChatGroupRevokeConfig from './actions/operations/contact_ops/chat_group/ChatGroupRevokeConfig';



interface DynamicNodeConfigProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export const DynamicNodeConfig: React.FC<DynamicNodeConfigProps> = ({ node, onUpdate, onClose }) => {
  // For specific node configurations based on node ID

  console.log('Node data in DynamicNodeConfig:', node.data);

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

      // ******************************* ACTION CONFIGs ***************************************
      case 'send-email-action':
        return (
          <SendMailConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'send-whatsapp-action':
        return (
          <SendWhatsappConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'send-sms-action':
        return (
          <SmsConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'delay-action':
        return (
          <DelayConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      // Evaluation Actions (contact sub module)
      case 'contact-updated-action':
        return (
          <ContactUpdatedEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'contact-tagged-action':
        return (
          <ContactTaggedEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'contact-type-action':
        return (
          <ContactTypeEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      // Evaluation Actions (CRM sub module)
      case 'lead-quality':
        return (
          <LeadQualityEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'assigned-staff':
        return (
          <AssignedStaffEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      // Sales category 
      case 'invoice-form':
        return (
          <InvoiceEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      // Forms 
      case 'product-form':
        return (
          <ProductFormEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'facebook-form':
        return (
          <FacebookEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'magic-form':
        return (
          <MagicFromEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      // Calendar Actions 
      case 'appointment-booked-action':
        return (
          <CalendarEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'appointment-cancelled-action':
        return (
          <CalendarEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'appointment-rescheduled-action':
        return (
          <CalendarEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'no-show-action':
        return (
          <CalendarEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'show-up-action':
        return (
          <CalendarEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      // Webhook actions 
      case 'webhook-basic-action':
        return (
          <WebhookEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'webhook-advance-action':
        return (
          <WebhookAdvanceEvalConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'remove-workflow-action':
        return (
          <RemoveWorkFlow
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      // Internal Notification 
      case 'internal-notification-action':
        return (
          <InternalNotificationConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      // operations 
      case 'update-contact-attribute-action':
        return (
          <UpdateContactAttributeConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )
      case 'convert-lead-to-customer-action':
        return (
          <ConvertLeadToCustomer
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'contact-tagged-operation-action':
        return (
          <ContactTaggedOperation
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'remove-tag-operation-action':
        return (
          <RemoveTagOperation
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )
      case 'contact-group-operation-action':
        return (
          <ContactGroupOperation
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )
      case 'remove-contact-operation-action':
        return (
          <ContactGroupRemoveOperation
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'add-update-to-crm-action':
        return (
          <AddUpdateToCRMConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'remove-from-crm-action':
        return (
          <RemoveFromCRMConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

      case 'course-access-operation-action':
        return (
          <CourseAccessOperation
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )
      case 'course-revoke-operation-action':
        return (
          <CourseRevokeOperation
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )


      case 'lead-quality-operation-action':
        return (
          <ChangeLeadQuality
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

        case 'execute-automation-action':
        return (
          <ExecuteAutomation
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

        case 'event-start-operation-action':
        return (
          <EventStartOperation
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

        case 'appointment-status-change-action':
        return (
          <ChangeAppointmentStatusConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

        case 'exit-workflow-operation-action':
        return (
          <RemoveWorkFlow
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

        case 'assign-to-staff-operation-action':
        return (
          <AssignToStaffOperation
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

        case 'remove-assigned-staff-operation-action':
        return (
          <RemoveAssignedStaffOperation
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )


        case 'community-access-operation-action':
        return (
          <CommunityAccess
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

        case 'community-revoke-operation-action':
        return (
          <CommunityRevoke
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

        case 'chatgroup-access-operation-action':
        return (
          <ChatGroupAccessConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )

        case 'chatgroup-revoke-operation-action':
        return (
          <ChatGroupRevokeConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        )



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
      case 'action': {
        // Check if this action has a specific configuration
        const specificConfig = getSpecificConfig();
        if (specificConfig) {
          return specificConfig;
        }
        // Default action configuration
        return (
          <ActionConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );
      }
      case 'condition': {
        // Check if this is a router node with a specific action ID
        const nodeId = (node.data as NodeConfig).id;
        if (nodeId && nodeId !== 'condition-action') {
          // This is a router node with a specific action - use the action's config
          return getSpecificConfig();
        }
        // Default condition configuration
        return (
          <ConditionConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );
      }

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
