'use client';

import { jsPDF, GState } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction } from '@/lib/api';

export interface PDFUserInfo {
  name: string;
  email: string;
  id: string;
  kycStatus?: string;
}

function generateSecurityHash(data: Transaction[]) {
  const timestamp = new Date().toISOString();
  const payload = `${timestamp}-${data.length}-${data[0]?.id || '0'}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const sha = Math.abs(hash).toString(16).padStart(8, '0');
  return `PM-${sha.toUpperCase()}-${timestamp.split('T')[0].replace(/-/g, '')}`;
}

export function generateTransactionPDF(transactions: Transaction[], user: PDFUserInfo): jsPDF {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const DEEP_CHARCOAL = '#1a1a2e';

  const watermark = () => {
    doc.saveGraphicsState();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(200, 200, 200);
    const gState = new GState({ opacity: 0.15 });
    doc.setGState(gState);
    for (let i = -8; i < 40; i += 12) {
      for (let j = -4; j < 25; j += 8) {
        doc.text('PAYMAESTRO ORIGINAL', i * 15, j * 15 + 10, { angle: 45 } as any);
      }
    }
    doc.restoreGraphicsState();
  };

  const header = () => {
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setFillColor(118, 75, 162);
    doc.rect(0, 28, pageW, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('PayMaestro', 20, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Relevé de Transaction Officiel', 20, 24);

    const legalX = pageW - 80;
    const legalY = 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(230, 230, 255);

    doc.text('Titulaire :', legalX, legalY + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.name || 'N/A', legalX + 18, legalY + 4);

    doc.setFont('helvetica', 'bold');
    doc.text('Email :', legalX, legalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.email || 'N/A', legalX + 18, legalY + 10);

    doc.setFont('helvetica', 'bold');
    doc.text('ID Client :', legalX, legalY + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.id ? user.id.slice(0, 13) + '...' : 'N/A', legalX + 18, legalY + 16);

    doc.setFont('helvetica', 'bold');
    doc.text('Statut :', legalX, legalY + 22);
    const isVerified = user?.kycStatus === 'APPROVED';
    doc.setTextColor(isVerified ? 100 : 255, isVerified ? 230 : 200, isVerified ? 100 : 200);
    doc.setFont('helvetica', 'bold');
    doc.text(isVerified ? 'COMPTE VÉRIFIÉ \u2714' : 'Non vérifié', legalX + 18, legalY + 22);

    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFontSize(7);
    doc.setTextColor(200, 200, 220);
    doc.setFont('helvetica', 'normal');
    doc.text(`Émis le ${dateStr} à ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, legalX, legalY + 28);

    doc.setDrawColor(200, 200, 200);
    doc.line(15, 34, pageW - 15, 34);
  };

  let currentPage = 0;
  const footer = () => {
    currentPage++;
    const securityHash = generateSecurityHash(transactions);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);

    doc.text(`Empreinte de sécurité : ${securityHash}`, 15, pageH - 12);
    doc.text('Document original signé numériquement — Toute modification invalide ce reçu.', 15, pageH - 8);
    doc.text(`Page ${currentPage}`, pageW - 15, pageH - 8, { align: 'right' } as any);

    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageH - 16, pageW - 15, pageH - 16);
  };

  header();
  watermark();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(DEEP_CHARCOAL);
  doc.text('Historique des transactions', 15, 42);

  const totalUSD = transactions.reduce((sum, t) => sum + t.amountUSD, 0);
  const successCount = transactions.filter(t => t.status === 'MOBILE_MONEY_SENT').length;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`${transactions.length} transaction(s) — ${successCount} réussie(s) — Total: $${totalUSD.toFixed(2)} USD`, 15, 47);

  const tableData = transactions.map(t => [
    new Date(t.date).toLocaleDateString('fr-FR'),
    t.id,
    `${t.amountUSD.toFixed(2)} $`,
    `${t.receivedAmount?.toFixed(2) || '0.00'} ${t.currency}`,
    t.status === 'MOBILE_MONEY_SENT' ? 'Succès' :
    t.status === 'FAILED' ? 'Échec' :
    t.status === 'PENDING' ? 'En attente' : t.status,
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Date', 'ID Retrait', 'Montant USD', 'Reçu', 'Statut']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [102, 126, 234],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 35, halign: 'center' },
      1: { cellWidth: 55, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 45, halign: 'right' },
      4: { cellWidth: 35, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [245, 247, 255],
    },
    didParseCell: (data: any) => {
      if (data.column.index === 4) {
        if (data.cell.raw === 'Succès') {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'Échec') {
          data.cell.styles.textColor = [239, 68, 68];
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'En attente') {
          data.cell.styles.textColor = [245, 158, 11];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { top: 50, bottom: 22 },
    tableWidth: 'auto',
    showHead: 'everyPage',
    didDrawPage: () => {
      watermark();
      footer();
    },
  });

  return doc;
}
