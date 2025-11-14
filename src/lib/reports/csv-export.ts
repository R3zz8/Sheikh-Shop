/**
 * CSV Export Utility for Payment Analytics
 */

export interface TransactionExport {
  id: string;
  authority: string;
  reference: string | null;
  amount: number;
  status: string;
  description: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface AnalyticsSummary {
  totalTransactions: number;
  totalAmount: number;
  successRate: number;
  averageAmount: number;
  successfulCount: number;
  failedCount: number;
  pendingCount: number;
}

export function generateCSV(
  transactions: TransactionExport[],
  summary: AnalyticsSummary,
  dateRange: string
): string {
  const lines: string[] = [];

  // Header
  lines.push('Payment Analytics Report');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Date Range: ${dateRange}`);
  lines.push('');

  // Summary Section
  lines.push('SUMMARY');
  lines.push('Total Transactions,' + summary.totalTransactions);
  lines.push('Total Amount (EUR),' + summary.totalAmount.toFixed(2));
  lines.push('Success Rate (%),' + summary.successRate.toFixed(2));
  lines.push('Average Amount (EUR),' + summary.averageAmount.toFixed(2));
  lines.push('Successful Count,' + summary.successfulCount);
  lines.push('Failed Count,' + summary.failedCount);
  lines.push('Pending Count,' + summary.pendingCount);
  lines.push('');

  // Transactions Section
  lines.push('TRANSACTIONS');
  lines.push('ID,Authority,Reference,Amount (EUR),Status,Description,Created At');

  // Limit to 1000 rows for export
  const limitedTransactions = transactions.slice(0, 1000);
  limitedTransactions.forEach((transaction) => {
    const row = [
      transaction.id,
      transaction.authority,
      transaction.reference || '',
      transaction.amount.toFixed(2),
      transaction.status,
      (transaction.description || '').replace(/,/g, ';'), // Replace commas in description
      new Date(transaction.createdAt).toISOString(),
    ];
    lines.push(row.map((cell) => `"${cell}"`).join(','));
  });

  if (transactions.length > 1000) {
    lines.push('');
    lines.push(`Note: Only first 1000 transactions exported. Total: ${transactions.length}`);
  }

  return lines.join('\n');
}

