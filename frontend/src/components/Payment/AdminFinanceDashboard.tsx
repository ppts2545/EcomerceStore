import React, { useState, useEffect } from 'react';
import './AdminFinanceDashboard.css';

interface PaymentSummary {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalUsers: number;
  activeUsers: number;
}

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  description: string;
  createdAt: string;
  orderId?: string;
  reference: string;
}

interface ChartData {
  date: string;
  revenue: number;
  transactions: number;
}

const AdminFinanceDashboard: React.FC = () => {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Mock data
  const mockSummary: PaymentSummary = {
    totalRevenue: 2547850.50,
    todayRevenue: 45230.00,
    monthlyRevenue: 185400.75,
    totalTransactions: 1247,
    successfulTransactions: 1198,
    pendingTransactions: 23,
    failedTransactions: 26,
    totalUsers: 542,
    activeUsers: 387
  };

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      userId: 'usr001',
      userName: 'สมชาย ใจดี',
      userEmail: 'somchai@email.com',
      amount: 1500.00,
      fee: 45.00,
      netAmount: 1455.00,
      method: 'promptpay',
      status: 'completed',
      description: 'ซื้อสินค้า - iPhone 15 Pro',
      createdAt: '2025-08-13T10:30:00Z',
      orderId: 'ORD001',
      reference: 'REF123456789'
    },
    {
      id: '2',
      userId: 'usr002',
      userName: 'สมหญิง รักดี',
      userEmail: 'somying@email.com',
      amount: 850.00,
      fee: 25.50,
      netAmount: 824.50,
      method: 'bank_transfer',
      status: 'completed',
      description: 'ซื้อสินค้า - Samsung Galaxy Watch',
      createdAt: '2025-08-13T09:15:00Z',
      orderId: 'ORD002',
      reference: 'REF987654321'
    },
    {
      id: '3',
      userId: 'usr003',
      userName: 'วิทย์ ชาญฉลาด',
      userEmail: 'wit@email.com',
      amount: 2200.00,
      fee: 66.00,
      netAmount: 2134.00,
      method: 'credit_card',
      status: 'failed',
      description: 'ซื้อสินค้า - MacBook Air',
      createdAt: '2025-08-13T08:45:00Z',
      orderId: 'ORD003',
      reference: 'REF555666777'
    },
    {
      id: '4',
      userId: 'usr004',
      userName: 'นิดา สวยงาม',
      userEmail: 'nida@email.com',
      amount: 320.00,
      fee: 9.60,
      netAmount: 310.40,
      method: 'truemoney',
      status: 'pending',
      description: 'ซื้อสินค้า - Bluetooth Speaker',
      createdAt: '2025-08-13T07:20:00Z',
      orderId: 'ORD004',
      reference: 'REF888999000'
    }
  ];

  const mockChartData: ChartData[] = [
    { date: '2025-08-07', revenue: 15420.50, transactions: 42 },
    { date: '2025-08-08', revenue: 18750.25, transactions: 51 },
    { date: '2025-08-09', revenue: 22100.00, transactions: 67 },
    { date: '2025-08-10', revenue: 19500.75, transactions: 58 },
    { date: '2025-08-11', revenue: 25800.00, transactions: 73 },
    { date: '2025-08-12', revenue: 31200.50, transactions: 89 },
    { date: '2025-08-13', revenue: 45230.00, transactions: 124 }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter, statusFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSummary(mockSummary);
      setTransactions(mockTransactions);
      setChartData(mockChartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getPaginatedTransactions = () => {
    const filtered = getFilteredTransactions();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredTransactions().length / ITEMS_PER_PAGE);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      completed: '#27ae60',
      pending: '#f39c12',
      failed: '#e74c3c',
      refunded: '#9b59b6'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusText = (status: string): string => {
    const texts: Record<string, string> = {
      completed: 'สำเร็จ',
      pending: 'รอดำเนินการ',
      failed: 'ล้มเหลว',
      refunded: 'คืนเงิน'
    };
    return texts[status] || status;
  };

  const getPaymentMethodName = (method: string): string => {
    const methods: Record<string, string> = {
      bank_transfer: 'โอนธนาคาร',
      promptpay: 'พร้อมเพย์',
      truemoney: 'TrueMoney',
      credit_card: 'บัตรเครดิต'
    };
    return methods[method] || method;
  };

  const exportTransactions = () => {
    const headers = [
      'วันที่', 'ชื่อลูกค้า', 'อีเมล', 'จำนวนเงิน', 'ค่าธรรมเนียม', 
      'จำนวนสุทธิ', 'วิธีการชำระ', 'สถานะ', 'หมายเลขอ้างอิง', 'รายละเอียด'
    ];
    
    const csvContent = [
      headers.join(','),
      ...getFilteredTransactions().map(t => [
        new Date(t.createdAt).toLocaleDateString('th-TH'),
        `"${t.userName}"`,
        t.userEmail,
        t.amount.toString(),
        t.fee.toString(),
        t.netAmount.toString(),
        getPaymentMethodName(t.method),
        getStatusText(t.status),
        t.reference,
        `"${t.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `admin_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดข้อมูลระบบ...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-state">
          <h3>ไม่สามารถโหลดข้อมูลได้</h3>
          <p>กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>แดชบอร์ดการเงิน</h1>
          <p>ภาพรวมรายได้และธุรกรรมทั้งหมด</p>
        </div>
        <div className="header-actions">
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as 'today' | 'week' | 'month' | 'all')}
            className="date-filter"
          >
            <option value="today">วันนี้</option>
            <option value="week">สัปดาห์นี้</option>
            <option value="month">เดือนนี้</option>
            <option value="all">ทั้งหมด</option>
          </select>
          <button className="btn-export" onClick={exportTransactions}>
            📊 ส่งออกรายงาน
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">฿{summary.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">รายได้รวม</div>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">฿{summary.todayRevenue.toLocaleString()}</div>
            <div className="stat-label">รายได้วันนี้</div>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-value">{summary.totalTransactions.toLocaleString()}</div>
            <div className="stat-label">ธุรกรรมทั้งหมด</div>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{summary.activeUsers.toLocaleString()}</div>
            <div className="stat-label">ผู้ใช้งานที่ใช้งาน</div>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="section-header">
          <h2>กราฟรายได้รายวัน</h2>
        </div>
        <div className="chart-container">
          <div className="simple-chart">
            {chartData.map((data, index) => (
              <div key={data.date} className="chart-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${(data.revenue / Math.max(...chartData.map(d => d.revenue))) * 100}%`,
                    backgroundColor: `hsl(${200 + index * 10}, 70%, 50%)`
                  }}
                ></div>
                <div className="bar-label">
                  <div className="bar-date">{new Date(data.date).getDate()}</div>
                  <div className="bar-amount">฿{(data.revenue / 1000).toFixed(0)}k</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <div className="section-header">
          <h2>รายการธุรกรรมล่าสุด</h2>
          <div className="section-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="ค้นหาลูกค้า, อีเมล, หมายเลขอ้างอิง..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'completed' | 'pending' | 'failed');
                setCurrentPage(1);
              }}
              className="status-filter"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="completed">สำเร็จ</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="failed">ล้มเหลว</option>
            </select>
          </div>
        </div>

        <div className="transactions-table">
          <div className="table-header">
            <div className="header-cell">วันที่/เวลา</div>
            <div className="header-cell">ลูกค้า</div>
            <div className="header-cell">จำนวนเงิน</div>
            <div className="header-cell">ค่าธรรมเนียม</div>
            <div className="header-cell">สุทธิ</div>
            <div className="header-cell">วิธีการชำระ</div>
            <div className="header-cell">สถานะ</div>
            <div className="header-cell">รายละเอียด</div>
          </div>

          <div className="table-body">
            {getPaginatedTransactions().map((transaction) => (
              <div key={transaction.id} className="table-row">
                <div className="table-cell">
                  <div className="datetime">
                    <div className="date">
                      {new Date(transaction.createdAt).toLocaleDateString('th-TH')}
                    </div>
                    <div className="time">
                      {new Date(transaction.createdAt).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="table-cell">
                  <div className="customer-info">
                    <div className="customer-name">{transaction.userName}</div>
                    <div className="customer-email">{transaction.userEmail}</div>
                  </div>
                </div>
                
                <div className="table-cell">
                  <div className="amount-display">
                    ฿{transaction.amount.toLocaleString()}
                  </div>
                </div>
                
                <div className="table-cell">
                  <div className="fee-display">
                    ฿{transaction.fee.toLocaleString()}
                  </div>
                </div>
                
                <div className="table-cell">
                  <div className="net-amount">
                    ฿{transaction.netAmount.toLocaleString()}
                  </div>
                </div>
                
                <div className="table-cell">
                  <div className="payment-method">
                    {getPaymentMethodName(transaction.method)}
                  </div>
                </div>
                
                <div className="table-cell">
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(transaction.status) }}
                  >
                    {getStatusText(transaction.status)}
                  </div>
                </div>
                
                <div className="table-cell">
                  <div className="transaction-details">
                    <div className="description">{transaction.description}</div>
                    <div className="reference">อ้างอิง: {transaction.reference}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {getFilteredTransactions().length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>ไม่พบข้อมูลธุรกรรม</h3>
            <p>ไม่มีธุรกรรมที่ตรงกับเงื่อนไขที่คุณค้นหา</p>
          </div>
        )}

        {getTotalPages() > 1 && (
          <div className="pagination">
            <button
              className="btn-page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ← ก่อนหน้า
            </button>
            
            <span className="page-info">
              หน้า {currentPage} จาก {getTotalPages()} 
              ({getFilteredTransactions().length} รายการ)
            </span>
            
            <button
              className="btn-page"
              disabled={currentPage === getTotalPages()}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              ถัดไป →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFinanceDashboard;
