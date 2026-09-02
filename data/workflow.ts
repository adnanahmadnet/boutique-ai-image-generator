import {
  IconWebhook,
  IconDatabase,
  IconCpu,
  IconCloudUpload,
  type Icon,
} from "@tabler/icons-react";

export interface WorkflowStep {
  index: number;
  title: string;
  description: string;
  icon: Icon;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    index: 1,
    title: "Submit",
    description:
      "Send a prompt and optional reference image to a single webhook — no need to know which model you want yet.",
    icon: IconWebhook,
  },
  {
    index: 2,
    title: "Track",
    description:
      "A Notion row is created instantly with Status: Processing, and the webhook acknowledges with a record ID to poll.",
    icon: IconDatabase,
  },
  {
    index: 3,
    title: "Route & generate",
    description:
      "A router node fans out to one of four fal.ai models based on your request — sync or async, handled transparently.",
    icon: IconCpu,
  },
  {
    index: 4,
    title: "Deliver",
    description:
      "The result is uploaded to Google Drive, the Notion row flips to Done, and the client stops polling with a finished image in hand.",
    icon: IconCloudUpload,
  },
];
