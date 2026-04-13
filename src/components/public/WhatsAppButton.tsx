import { MessageCircle } from "lucide-react";
import { schoolInfo } from "@/lib/demo-data";

export default function WhatsAppButton() {
  const url = `https://wa.me/${schoolInfo.whatsapp.replace(/\s/g, "")}?text=Hello, I would like to inquire about Prestige Academy.`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-success text-success-foreground rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
