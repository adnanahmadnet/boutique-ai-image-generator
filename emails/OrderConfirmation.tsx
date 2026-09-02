import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";
import { SITE } from "@/data/site";

export interface OrderConfirmationEmailProps {
  boutiqueName?: string;
  licenseKey: string;
  amount: string;
  currency: string;
  dashboardUrl: string;
  downloadUrl: string;
}

export default function OrderConfirmationEmail({
  boutiqueName,
  licenseKey,
  amount,
  currency,
  dashboardUrl,
  downloadUrl,
}: OrderConfirmationEmailProps) {
  const greetingName = boutiqueName ? `, ${boutiqueName}` : "";

  return (
    <Html>
      <Head />
      <Preview>Your {SITE.name} license and download are ready</Preview>
      <Body style={{ backgroundColor: "#000000", fontFamily: "sans-serif", padding: "24px" }}>
        <Container
          style={{
            backgroundColor: "#0f0f0f",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
            padding: "32px",
            maxWidth: "480px",
          }}
        >
          <Heading style={{ color: "#ffffff", fontSize: "20px" }}>
            Thanks for your purchase{greetingName}
          </Heading>
          <Text style={{ color: "#a0a0a0", fontSize: "14px", lineHeight: "1.6" }}>
            Your payment for {SITE.name} has been confirmed. Here&apos;s your receipt and
            license key — keep this email for your records.
          </Text>

          <Section
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: "10px",
              padding: "16px 20px",
              margin: "20px 0",
            }}
          >
            <Text style={{ color: "#666666", fontSize: "11px", margin: "0 0 4px" }}>
              AMOUNT PAID
            </Text>
            <Text style={{ color: "#ffffff", fontSize: "18px", margin: "0 0 16px" }}>
              {currency} {amount}
            </Text>
            <Text style={{ color: "#666666", fontSize: "11px", margin: "0 0 4px" }}>
              LICENSE KEY
            </Text>
            <Text
              style={{
                color: "#f5c842",
                fontSize: "16px",
                fontFamily: "monospace",
                margin: 0,
              }}
            >
              {licenseKey}
            </Text>
          </Section>

          <Button
            href={downloadUrl}
            style={{
              backgroundColor: "#f5c842",
              color: "#000000",
              fontWeight: 700,
              fontSize: "14px",
              padding: "12px 24px",
              borderRadius: "10px",
              textDecoration: "none",
            }}
          >
            Download now
          </Button>

          <Text style={{ color: "#a0a0a0", fontSize: "13px", lineHeight: "1.6", marginTop: "20px" }}>
            This download link expires in 30 minutes. Once it does, or any time after,{" "}
            <a href={dashboardUrl} style={{ color: "#f5c842" }}>
              log in to your dashboard
            </a>{" "}
            to view your order history, re-issue a fresh download link, and access the
            setup guide.
          </Text>

          <Hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "24px 0" }} />

          <Text style={{ color: "#666666", fontSize: "11px" }}>
            Built by {SITE.builtBy}. Questions? Reply to this email or use the Contact page.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
