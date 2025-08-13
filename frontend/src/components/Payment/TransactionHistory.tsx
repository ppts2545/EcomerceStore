import React, { useState, useEffect } from 'react';
import './TransactionHistory.css';

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  method: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  orderId?: string;
  refundAmount?: number;
  errorMessage?: string;
}

interface TransactionHistoryProps {
  userId?: string;
  onTransactionSelect?: (transaction: Transaction) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  userId,
  onTransactionSelect 
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const ITEMS_PER_PAGE = 10;

  // Mock data - replace with actual API call
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      reference: 'REF123456789',
      amount: 1500.00,
      status: 'completed',
      method: 'promptpay',
      description: 'ซื้อสินค้า - iPhone 15 Pro',
      createdAt: '2025-08-13T10:30:00Z',
      updatedAt: '2025-08-13T10:32:00Z',
      orderId: 'ORD001'
    },
    {
      id: '2',
      reference: 'REF987654321',
      amount: 850.00,
      status: 'completed',
      method: 'bank_transfer',
      description: 'ซื้อสินค้า - Samsung Galaxy Watch',
      createdAt: '2025-08-12T15:45:00Z',
      updatedAt: '2025-08-12T15:47:00Z',
      orderId: 'ORD002'
    },
    {
      id: '3',
      reference: 'REF555666777',
      amount: 2200.00,
      status: 'failed',
      method: 'credit_card',
      description: 'ซื้อสินค้า - MacBook Air',
      createdAt: '2025-08-12T09:20:00Z',
      updatedAt: '2025-08-12T09:22:00Z',
      orderId: 'ORD003',
      errorMessage: 'บัตรเครดิตไม่เพียงพอ'
    },
    {
      id: '4',
      reference: 'REF111222333',
      amount: 450.00,
      status: 'refunded',
      method: 'truemoney',
      description: 'คืนเงิน - Sony Headphones',
      createdAt: '2025-08-11T14:30:00Z',
      updatedAt: '2025-08-11T16:45:00Z',
      orderId: 'ORD004',
      refundAmount: 450.00
    },
    {
      id: '5',
      reference: 'REF888999000',
      amount: 320.00,
      status: 'processing',
      method: 'promptpay',
      description: 'ซื้อสินค้า - Bluetooth Speaker',
      createdAt: '2025-08-13T08:15:00Z',
      updatedAt: '2025-08-13T08:15:00Z',
      orderId: 'ORD005'
    }
  ];

  useEffect(() => {
    fetchTransactions();
  }, [userId, currentPage, filter, sortBy, sortOrder]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredTransactions = [...mockTransactions];
      
      // Apply filters
      if (filter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.status === filter);
      }
      
      // Apply search
      if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply sorting
      filteredTransactions.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'date':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'amount':
            comparison = a.amount - b.amount;
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
      
      // Pagination
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
      
      setTransactions(paginatedTransactions);
      setTotalPages(Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'รอดำเนินการ',
      processing: 'กำลังประมวลผล',
      completed: 'สำเร็จ',
      failed: 'ล้มเหลว',
      cancelled: 'ยกเลิก',
      refunded: 'คืนเงิน'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      pending: '#f39c12',
      processing: '#3498db',
      completed: '#27ae60',
      failed: '#e74c3c',
      cancelled: '#95a5a6',
      refunded: '#9b59b6'
    };
    return colorMap[status] || '#95a5a6';
  };

  const getPaymentMethodName = (method: string): string => {
    const methodNames: Record<string, string> = {
      bank_transfer: 'โอนเงินผ่านธนาคาร',
      promptpay: 'พร้อมเพย์',
      truemoney: 'TrueMoney',
      credit_card: 'บัตรเครดิต/เดบิต'
    };
    return methodNames[method] || method;
  };

  const handleSort = (field: 'date' | 'amount' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportTransactions = () => {
    // Create CSV content
    const headers = ['หมายเลขอ้างอิง', 'จำนวนเงิน', 'สถานะ', 'วิธีการชำระ', 'รายละเอียด', 'วันที่สร้าง'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.reference,
        t.amount.toString(),
        getStatusText(t.status),
        getPaymentMethodName(t.method),
        `"${t.description}"`,
        formatDate(t.createdAt)
      ].join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="transaction-history-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดประวัติการชำระเงิน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history-container">
      <div className="history-header">
        <h2>ประวัติการชำระเงิน</h2>
        <button className="btn-export" onClick={exportTransactions}>
          <span>📥</span>
          ส่งออกข้อมูล
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="ค้นหาหมายเลขอ้างอิง, รายละเอียด..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => { setFilter('all'); setCurrentPage(1); }}
          >
            ทั้งหมด
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => { setFilter('completed'); setCurrentPage(1); }}
          >
            สำเร็จ
          </button>
          <button
            className={`filter-tab ${filter === 'processing' ? 'active' : ''}`}
            onClick={() => { setFilter('processing'); setCurrentPage(1); }}
          >
            กำลังประมวลผล
          </button>
          <button
            className={`filter-tab ${filter === 'failed' ? 'active' : ''}`}
            onClick={() => { setFilter('failed'); setCurrentPage(1); }}
          >
            ล้มเหลว
          </button>
        </div>
      </div>

      <div className="transactions-table">
        <div className="table-header">
          <div className="header-cell" onClick={() => handleSort('date')}>
            วันที่ {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div className="header-cell">หมายเลขอ้างอิง</div>
          <div className="header-cell" onClick={() => handleSort('amount')}>
            จำนวนเงิน {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div className="header-cell" onClick={() => handleSort('status')}>
            สถานะ {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div className="header-cell">วิธีการชำระ</div>
          <div className="header-cell">รายละเอียด</div>
          <div className="header-cell">การดำเนินการ</div>
        </div>

        <div className="table-body">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="table-row">
              <div className="table-cell">
                {formatDate(transaction.createdAt)}
              </div>
              <div className="table-cell">
                <span className="reference-code">{transaction.reference}</span>
              </div>
              <div className="table-cell">
                <span className="amount">฿{transaction.amount.toLocaleString()}</span>
                {transaction.refundAmount && (
                  <span className="refund-amount">
                    (คืน: ฿{transaction.refundAmount.toLocaleString()})
                  </span>
                )}
              </div>
              <div className="table-cell">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(transaction.status) }}
                >
                  {getStatusText(transaction.status)}
                </span>
              </div>
              <div className="table-cell">
                {getPaymentMethodName(transaction.method)}
              </div>
              <div className="table-cell description">
                {transaction.description}
                {transaction.errorMessage && (
                  <div className="error-message">
                    <small>❌ {transaction.errorMessage}</small>
                  </div>
                )}
              </div>
              <div className="table-cell">
                <button
                  className="btn-view"
                  onClick={() => onTransactionSelect?.(transaction)}
                >
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {transactions.length === 0 && !loading && (
        <div className="no-transactions">
          <div className="empty-state">
            <span className="empty-icon">💳</span>
            <h3>ไม่พบประวัติการชำระเงิน</h3>
            <p>คุณยังไม่มีการทำธุรกรรมในระบบ</p>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-page"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ← ก่อนหน้า
          </button>
          
          <span className="page-info">
            หน้า {currentPage} จาก {totalPages}
          </span>
          
          <button
            className="btn-page"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            ถัดไป →
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
