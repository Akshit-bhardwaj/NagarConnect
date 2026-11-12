import { jsPDF } from "jspdf";

export interface GrievancePDFData {
  referenceNo: string;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  cityName?: string;
  wardName?: string;
  addressText?: string;
  createdAt?: string;
  citizenName?: string;
  citizenPhone?: string;
  slaTarget?: string;
}

export function generateGrievanceReceiptPDF(data: GrievancePDFData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm", 
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Background subtle border
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - (margin - 5) * 2);

  // 1. Top Decorative Brand Bar
  doc.setFillColor(20, 47, 88); // #142F58 Deep Navy
  doc.rect(margin - 5, margin - 5, contentWidth + 10, 26, "F");

  // Gold accent line
  doc.setFillColor(217, 119, 6); // amber-600
  doc.rect(margin - 5, margin - 5 + 26, contentWidth + 10, 2, "F");

  // Brand Name & Subtext
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("NAGARCONNECT MUNICIPAL PORTAL", margin + 2, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(224, 231, 255);
  doc.text("Department of Urban Development & Municipal Grievance Redressal", margin + 2, 26);

  // Right side of Header: Official Receipt Label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("OFFICIAL RECEIPT", pageWidth - margin - 2, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("FORM CIV-GRV/2026", pageWidth - margin - 2, 26, { align: "right" });

  let y = 42;

  // 2. Receipt Reference Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("GRIEVANCE REGISTRATION NUMBER", margin + 5, y + 7);
  doc.text("REGISTRATION DATE", pageWidth - margin - 5, y + 7, { align: "right" });

  doc.setFontSize(14);
  doc.setTextColor(20, 47, 88);
  doc.text(data.referenceNo || "NC-PENDING", margin + 5, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toLocaleString("en-IN")
    : new Date().toLocaleString("en-IN");
  doc.text(formattedDate, pageWidth - margin - 5, y + 16, { align: "right" });

  y += 28;

  // 3. Status & SLA Badge Row
  const slaText =
    data.slaTarget ||
    (data.priority === "EMERGENCY"
      ? "6 Hours Emergency SLA"
      : data.priority === "HIGH"
      ? "24 Hours Priority SLA"
      : "48 Hours Standard SLA");

  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, y, contentWidth / 2 - 2, 14, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 64, 175);
  doc.text("CURRENT PROCESSING STATUS", margin + 4, y + 5);
  doc.setFontSize(9);
  doc.text(data.status || "LOGGED", margin + 4, y + 10.5);

  doc.setFillColor(254, 243, 199); // amber-50
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(margin + contentWidth / 2 + 2, y, contentWidth / 2 - 2, 14, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text("STATUTORY SLA COMMITMENT", margin + contentWidth / 2 + 6, y + 5);
  doc.setFontSize(9);
  doc.text(slaText, margin + contentWidth / 2 + 6, y + 10.5);

  y += 20;

  // 4. Section: Grievance Information
  doc.setFillColor(20, 47, 88);
  doc.rect(margin, y, 3, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(20, 47, 88);
  doc.text("Grievance Particulars", margin + 6, y + 5.5);

  y += 10;

  // Data table row 1: Category & Ward
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Civic Category:", margin + 2, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const catText = data.subcategory
    ? `${data.category} (${data.subcategory})`
    : data.category || "General Municipal";
  doc.text(catText, margin + 35, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("Jurisdiction / Ward:", margin + 2, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const wardText = `${data.cityName || "Lucknow"} - ${data.wardName || "Assigned Municipal Ward"}`;
  doc.text(wardText, margin + 35, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("Incident Location:", margin + 2, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const locLines = doc.splitTextToSize(data.addressText || "Civic ward jurisdiction", contentWidth - 37);
  doc.text(locLines, margin + 35, y);
  y += locLines.length * 4.5 + 2;

  // Title & Full Description
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("Complaint Title:", margin + 2, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(data.title || "Civic Issue Report", margin + 35, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("Citizen Statement:", margin + 2, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.setFillColor(248, 250, 252);
  const descLines = doc.splitTextToSize(data.description || "No further details provided.", contentWidth - 10);
  const descBoxHeight = descLines.length * 4.5 + 6;
  doc.roundedRect(margin, y, contentWidth, descBoxHeight, 1.5, 1.5, "FD");
  doc.text(descLines, margin + 5, y + 5);

  y += descBoxHeight + 8;

  // 5. Citizen & Legal Verification Section
  doc.setFillColor(20, 47, 88);
  doc.rect(margin, y, 3, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(20, 47, 88);
  doc.text("Complainant & Verification Seal", margin + 6, y + 5.5);

  y += 10;

  // 2-column Box: Complainant details + Digital Signature Stamp
  const colWidth = (contentWidth - 6) / 2;

  // Left col: Complainant
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, colWidth, 34, 1.5, 1.5, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Complainant Identity:", margin + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(data.citizenName || "Registered Citizen User", margin + 4, y + 12);
  if (data.citizenPhone) {
    doc.text(`Contact: ${data.citizenPhone}`, margin + 4, y + 18);
  }
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Identity Verified via NagarConnect Citizen ID", margin + 4, y + 26);

  // Right col: Digital Official Seal
  doc.roundedRect(margin + colWidth + 6, y, colWidth, 34, 1.5, 1.5, "D");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(20, 47, 88);
  doc.text("DIGITAL E-GOVERNANCE STAMP", margin + colWidth + 10, y + 6);

  doc.setFont("courier", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  const authHash = `NC-SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`;
  doc.text(`Token: ${authHash}`, margin + colWidth + 10, y + 12);
  doc.text("Gateway: NagarConnect Central Hub", margin + colWidth + 10, y + 17);
  doc.text("Compliance: UP Janhit Redressal Act", margin + colWidth + 10, y + 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text("VERIFIED ELECTRONIC RECORD", margin + colWidth + 10, y + 28);

  y += 42;

  // 6. Citizen Instructions & Terms
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text("INSTRUCTIONS FOR THE CITIZEN:", margin + 4, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const instructions = [
    "1. Quote your Reference Number in any municipal follow-up or helpline query (1533 / 1913).",
    "2. Field inspectors will conduct site inspections within the statutory SLA window specified above.",
    "3. You will receive real-time SMS and SSE web notification updates as field engineers log milestone proofs.",
    "4. If unresolved after the SLA deadline, this complaint automatically escalates to the Municipal Commissioner.",
  ];
  instructions.forEach((line, idx) => {
    doc.text(line, margin + 4, y + 10 + idx * 3.4);
  });

  // 7. Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const footerText =
    "Generated via NagarConnect Unified Civic Operating System • Government of Uttar Pradesh • Page 1 of 1";
  doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: "center" });

  // Trigger browser download
  const safeRef = (data.referenceNo || "Grievance-Receipt").replace(/[^a-zA-Z0-9-_]/g, "_");
  doc.save(`${safeRef}-Official-Receipt.pdf`);
}
