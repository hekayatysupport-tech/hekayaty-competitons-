import { jsPDF } from "jspdf";
import type { Registration } from "@/hooks/useRegistrations";

export const generateReceiptPDF = (registration: Registration) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Since jsPDF standard doesn't support complex Arabic text shaping by default,
  // we will use simple layout and rely heavily on English/latin numbers 
  // for the robust parts of the receipt, while outputting basic Arabic strings.

  // Colors
  const gold = [201, 168, 76] as const;
  const dark = [10, 10, 15] as const;
  
  // Background
  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 297, "F");

  // Border
  doc.setDrawColor(...gold);
  doc.setLineWidth(1);
  doc.rect(10, 10, 190, 277);
  doc.rect(12, 12, 186, 273);

  // Header
  doc.setTextColor(...gold);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("HEKAYATY AWARDS 2026", 105, 40, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("Registration Receipt", 105, 50, { align: "center" });

  // Divider
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.line(40, 60, 170, 60);

  // Content
  doc.setFontSize(12);
  doc.setTextColor(200, 200, 200);
  
  const startY = 80;
  const lineSpacing = 15;

  doc.text("Registration Code:", 40, startY);
  doc.setTextColor(...gold);
  doc.setFont("helvetica", "bold");
  doc.text(registration.code, 170, startY, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);

  doc.text("Writer Email:", 40, startY + lineSpacing);
  doc.setTextColor(255, 255, 255);
  doc.text(registration.email, 170, startY + lineSpacing, { align: "right" });

  doc.setTextColor(200, 200, 200);
  doc.text("Phone Number:", 40, startY + lineSpacing * 2);
  doc.setTextColor(255, 255, 255);
  doc.text(registration.phone, 170, startY + lineSpacing * 2, { align: "right" });

  doc.setTextColor(200, 200, 200);
  doc.text("Payment Status:", 40, startY + lineSpacing * 3);
  doc.setTextColor(...gold);
  doc.text(registration.paymentStatus.toUpperCase(), 170, startY + lineSpacing * 3, { align: "right" });

  doc.setTextColor(200, 200, 200);
  doc.text("Date:", 40, startY + lineSpacing * 4);
  doc.setTextColor(255, 255, 255);
  doc.text(new Date(registration.registeredAt).toLocaleDateString(), 170, startY + lineSpacing * 4, { align: "right" });

  // Divider
  doc.setDrawColor(...gold);
  doc.line(40, startY + lineSpacing * 5.5, 170, startY + lineSpacing * 5.5);

  // Footer Note
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("This receipt is for registration verification purposes only.", 105, 250, { align: "center" });
  
  // Note in Arabic - jsPDF may render it disconnected, but it's required.
  doc.text("هذا الإيصال للتحقق من التسجيل فقط", 105, 260, { align: "center" });

  doc.save(`Hekayaty-Receipt-${registration.code}.pdf`);
};
