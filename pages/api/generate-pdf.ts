import { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { institutionName, recipientName, date, reference, totalAmount, causes } = req.body;

  // Create a document
  const doc = new PDFDocument();

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=distribution-letter-${reference.toLowerCase().replace(/\s+/g, '-')}.pdf`);

  // Pipe the PDF directly to the response
  doc.pipe(res);

  // Add content to the PDF
  doc
    .fontSize(14)
    .text('Kinship Canada', { align: 'center' })
    .fontSize(12)
    .text('43 Matson Dr, Bolton, ON L7E 0B1', { align: 'center' })
    .text('647-919-4368', { align: 'center' })
    .text('www.kinshipcanada.com', { align: 'center' })
    .moveDown(2);

  // Add date
  doc.text(date).moveDown();

  // Add institution name
  doc.text(institutionName).moveDown();

  // Add reference
  doc.text(`Reference: ${reference}`).moveDown();

  // Add greeting
  doc.text(`Assalamu Alaykum ${recipientName}`).moveDown();

  // Add main content
  doc
    .text(`I pray you are well. We have wired $${totalAmount}. The funds must be used for the following causes:`)
    .moveDown();

  // Create table
  const startX = 50;
  let startY = doc.y + 10;
  const rowHeight = 30;
  const colWidth = (doc.page.width - 100) / 2;

  // Draw table headers
  doc
    .rect(startX, startY, doc.page.width - 100, rowHeight)
    .fillAndStroke('#f0f0f0', '#000');
  doc
    .fillColor('#000')
    .text('Cause', startX + 10, startY + 10)
    .text('Amount', startX + colWidth + 10, startY + 10);

  startY += rowHeight;

  // Draw table rows
  causes.forEach((item: { cause: string; amount: string }) => {
    doc
      .rect(startX, startY, doc.page.width - 100, rowHeight)
      .stroke();
    doc
      .text(item.cause, startX + 10, startY + 10)
      .text(`$${item.amount}`, startX + colWidth + 10, startY + 10);
    startY += rowHeight;
  });

  // Finalize the PDF
  doc.end();
} 