import { FileDown, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface TransferDetails {
  transactionId: string;
  amount: number;
  fromAccountName: string;
  fromAccountNumber: string;
  fromRoutingNumber: string;
  toAccountName: string;
  toAccountNumber: string;
  toRoutingNumber?: string;
  transferType: string;
  status: string;
  timestamp: Date;
  description?: string;
}

interface TransferReceiptPDFProps {
  transferDetails: TransferDetails;
  onClose?: () => void;
}

export const TransferReceiptPDF = ({ transferDetails, onClose }: TransferReceiptPDFProps) => {
  const {
    transactionId,
    amount,
    fromAccountName,
    fromAccountNumber,
    fromRoutingNumber,
    toAccountName,
    toAccountNumber,
    toRoutingNumber,
    transferType,
    status,
    timestamp,
    description
  } = transferDetails;

  const generatePDFContent = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Heritage Bank - Transfer Receipt</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            background: #f8fafc;
            padding: 40px;
          }
          
          .receipt {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #0d2140 0%, #1a365d 100%);
            padding: 32px;
            text-align: center;
            color: white;
          }
          
          .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 16px;
          }
          
          .logo {
            width: 48px;
            height: 48px;
            background: linear-gradient(180deg, #d4af37 0%, #b8960c 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            color: #0d2140;
          }
          
          .bank-name {
            font-size: 28px;
            font-weight: 700;
            color: #d4af37;
            letter-spacing: 2px;
          }
          
          .receipt-title {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 8px;
          }
          
          .success-badge {
            display: inline-block;
            background: #22c55e;
            color: white;
            padding: 8px 24px;
            border-radius: 20px;
            font-weight: 600;
            margin-top: 16px;
          }
          
          .amount-section {
            background: #f0fdf4;
            padding: 32px;
            text-align: center;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .amount-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          
          .amount {
            font-size: 42px;
            font-weight: 700;
            color: #0d2140;
          }
          
          .details-section {
            padding: 32px;
          }
          
          .section-title {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #d4af37;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f1f5f9;
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }
          
          .detail-label {
            color: #64748b;
            font-size: 14px;
          }
          
          .detail-value {
            color: #0d2140;
            font-weight: 600;
            font-size: 14px;
            text-align: right;
          }
          
          .account-box {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
          }
          
          .account-title {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          
          .account-name {
            font-size: 18px;
            font-weight: 600;
            color: #0d2140;
            margin-bottom: 4px;
          }
          
          .account-number {
            font-family: monospace;
            font-size: 14px;
            color: #64748b;
          }
          
          .footer {
            background: #f8fafc;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer-text {
            color: #64748b;
            font-size: 12px;
          }
          
          .footer-note {
            color: #94a3b8;
            font-size: 10px;
            margin-top: 8px;
          }
          
          @media print {
            body {
              padding: 0;
              background: white;
            }
            .receipt {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo-container">
              <div class="logo">HB</div>
              <span class="bank-name">HERITAGE BANK</span>
            </div>
            <div class="receipt-title">Transfer Receipt</div>
            <div class="success-badge">✓ ${status === 'completed' ? 'Transfer Successful' : status.toUpperCase()}</div>
          </div>
          
          <div class="amount-section">
            <div class="amount-label">Amount Transferred</div>
            <div class="amount">$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          
          <div class="details-section">
            <div class="section-title">From Account</div>
            <div class="account-box">
              <div class="account-title">Account Holder</div>
              <div class="account-name">${fromAccountName}</div>
              <div class="account-number">****${fromAccountNumber.slice(-4)} • RTN: ${fromRoutingNumber}</div>
            </div>
            
            <div class="section-title">To Account</div>
            <div class="account-box">
              <div class="account-title">Recipient</div>
              <div class="account-name">${toAccountName}</div>
              <div class="account-number">****${toAccountNumber.slice(-4)}${toRoutingNumber ? ` • RTN: ${toRoutingNumber}` : ''}</div>
            </div>
            
            <div class="section-title">Transaction Details</div>
            <div class="detail-row">
              <span class="detail-label">Transaction ID</span>
              <span class="detail-value">${transactionId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transfer Type</span>
              <span class="detail-value">${transferType.replace(/_/g, ' ').toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date & Time</span>
              <span class="detail-value">${format(timestamp, 'MMM dd, yyyy • hh:mm a')}</span>
            </div>
            ${description ? `
            <div class="detail-row">
              <span class="detail-label">Description</span>
              <span class="detail-value">${description}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Status</span>
              <span class="detail-value" style="color: #22c55e;">${status === 'completed' ? '✓ Completed' : status}</span>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-text">Heritage Bank US • FDIC Insured • Since 1892</div>
            <div class="footer-note">This is an official receipt. Please keep for your records.</div>
            <div class="footer-note">Generated on ${format(new Date(), 'MMMM dd, yyyy at hh:mm a')}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const downloadPDF = () => {
    const content = generatePDFContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const printReceipt = () => {
    const content = generatePDFContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={downloadPDF}
        className="bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-blue gap-2"
      >
        <FileDown className="w-4 h-4" />
        Download PDF
      </Button>
      <Button
        onClick={printReceipt}
        variant="outline"
        className="border-heritage-gold/30 text-heritage-gold hover:bg-heritage-gold/10 gap-2"
      >
        <Printer className="w-4 h-4" />
        Print
      </Button>
    </div>
  );
};