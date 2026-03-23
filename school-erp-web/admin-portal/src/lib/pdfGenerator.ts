import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PDFStep {
    title: string;
    description: string;
    example?: string;
}

export interface PDFFlowContent {
    featureName: string;
    description: string;
    steps: PDFStep[];
    proTip?: string;
}

/**
 * Standardized function to generate and download a Feature Flow PDF.
 */
export const generateFlowPDF = (content: PDFFlowContent) => {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [37, 99, 235]; // Blue-600
    const secondaryColor: [number, number, number] = [100, 116, 139]; // Slate-500
    const exampleColor: [number, number, number] = [16, 185, 129]; // Emerald-500

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text(`${content.featureName} Flow Guide`, 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(...secondaryColor);
    const splitDesc = doc.splitTextToSize(content.description, 180);
    doc.text(splitDesc, 14, 32);

    let startY = 32 + (splitDesc.length * 6) + 10;

    // --- Steps (using autoTable to manage text wrapping and borders cleanly) ---
    const tableBody = content.steps.map((step, index) => {
        let text = `${index + 1}. ${step.title}\n\n${step.description}`;
        if (step.example) {
            text += `\n\nReal-time Example:\n${step.example}`;
        }
        return [text];
    });

    autoTable(doc, {
        startY: startY,
        head: [["Step-by-Step Flow"]],
        body: tableBody,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontSize: 12,
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            textColor: 50,
            fontSize: 11,
            cellPadding: 6,
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252], // Slate-50
        },
        didDrawCell: (data) => {
            // Apply a slight emerald tint to text representing "Real-time Examples" if we wanted to get fancy,
            // but standard text is fine for the MVP. The label clarifies it.
        }
    });

    startY = (doc as any).lastAutoTable.finalY + 15;

    // --- Pro Tip / Footer ---
    if (content.proTip) {
        if (startY > 270) {
            doc.addPage();
            startY = 20;
        }
        doc.setFillColor(239, 246, 255); // Blue-50
        doc.roundedRect(14, startY, 182, 25, 3, 3, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text("Pro Tip:", 18, startY + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30);
        const splitTip = doc.splitTextToSize(content.proTip, 170);
        doc.text(splitTip, 18, startY + 14);
    }

    // Save the PDF
    const filename = `${content.featureName.toLowerCase().replace(/\s+/g, '_')}_flow.pdf`;
    doc.save(filename);
};
