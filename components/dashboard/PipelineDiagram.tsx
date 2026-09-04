import Image from "next/image";

export default function PipelineDiagram() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-heading text-[14.5px] font-semibold text-text">
          How the pipeline is wired
        </h2>
        <p className="mt-1 text-[12.5px] text-text-muted">
          The real n8n canvas — webhook intake, model routing, and delivery, lane by lane.
        </p>
      </div>
      <div className="bg-black p-3">
        <Image
          src="/images/n8n-workflow-diagram.png"
          alt="n8n workflow diagram: webhook intake and model router feeding four model lanes (Nano Banana Pro, FLUX.1 Kontext, GPT Image 2, Topaz Upscaler), each exporting to Google Drive and Notion, plus a separate error-watcher workflow"
          width={1304}
          height={587}
          className="h-auto w-full rounded"
          sizes="(max-width: 768px) 100vw, 700px"
        />
      </div>
    </div>
  );
}
