export interface ResourceFile {
  id: string;
  filename: string;
  label: string;
  description: string;
  setupSteps: string[];
}

// Describes exactly what's inside private/downloads/ai-image-generation-pipeline.zip.
// Keep this in sync with that archive's contents.
export const RESOURCE_FILES: ResourceFile[] = [
  {
    id: "launcher",
    filename: "Image Generation Launcher.html",
    label: "Operator console",
    description:
      "The front-end you and your team will actually use day to day — a single static HTML file, no install or server required.",
    setupSteps: [
      "Open the file directly in a browser (double-click it), or host it anywhere static files are served.",
      "Open its Settings panel and paste in your Webhook URL and Status Webhook URL (from the n8n workflow below).",
      "These save to your browser's local storage — you only need to set them once per browser.",
    ],
  },
  {
    id: "main-workflow",
    filename: "Ai Image generation workflow.json",
    label: "Main n8n workflow",
    description:
      "Intake webhook, model routing (Nano Banana Pro, FLUX.1 Kontext, GPT Image 2, Topaz Upscaler), Notion logging, and delivery.",
    setupSteps: [
      "In n8n, go to Workflows → Import from File and select this JSON.",
      "Open each Notion node and repoint it at your own Notion database (see the Notion template file below).",
      "Add your fal.ai API key as an HTTP Header Auth credential (header: Authorization: Key <your key>) on the model nodes and the Grab Images nodes.",
      "Connect your Google Drive OAuth2 credential on the Upload nodes and set your destination folder.",
      "Activate the workflow, then copy the Webhook and Status Webhook production URLs into the launcher's Settings panel.",
    ],
  },
  {
    id: "error-workflow",
    filename: "Error Logs Workflow.json",
    label: "Error-handling workflow",
    description:
      "A second, independent workflow that watches for crashed runs and marks them Error in Notion instead of leaving them stuck at Processing forever.",
    setupSteps: [
      "Import this JSON the same way, via Workflows → Import from File.",
      "Point its Notion node at the same database as the main workflow.",
      "Activate it — it runs independently, no other configuration needed.",
    ],
  },
  {
    id: "notion-template",
    filename: "Notion Logs Database.csv",
    label: "Notion database template",
    description:
      "A ready-to-import template with every column the workflows expect (Model, Prompt, Status, timings, output links, and more).",
    setupSteps: [
      "In Notion, open the sidebar → Import → CSV, and select this file.",
      "Notion creates every column as Text by default — fix the property types (Date, Number, Checkbox) per the setup guide.",
      "Share the database with your Notion integration: •••  → Connections → add your integration.",
      "Copy the database ID from its URL and paste it into both n8n workflows' Notion nodes.",
    ],
  },
  {
    id: "setup-guide",
    filename: "Setup Guide.md",
    label: "Setup guide",
    description:
      "The full written walkthrough — prerequisites, installation steps, usage, and troubleshooting for the whole pipeline.",
    setupSteps: [
      "Read this first — it covers the exact order to do everything above, plus troubleshooting for common issues (stuck runs, 401s from fal.ai, CORS errors).",
    ],
  },
];
