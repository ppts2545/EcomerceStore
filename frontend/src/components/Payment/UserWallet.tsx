import React, { useState, useEffect } from 'react';
import './UserWallet.css';

interface WalletTransaction {
  id: string;
  type: 'incoming' | 'outgoing' | 'refund' | 'bonus';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  fromUser?: string;
  toUser?: string;
  reference?: string;
}

interface UserWalletProps {
  userId: string;
  onWithdraw?: (amount: number) => void;
}

const UserWallet: React.FC<UserWalletProps> = ({ userId, onWithdraw }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  // Mock data - replace with actual API
  const mockTransactions: WalletTransaction[] = [
    {
      id: '1',
      type: 'incoming',
      amount: 500.00,
      description: 'รับเงินจากการขายสินค้า - iPhone 15 Pro',
      status: 'completed',
      createdAt: '2025-08-13T10:30:00Z',
      fromUser: 'customer123',
      reference: 'REF123456789'
    },
    {
      id: '2',
      type: 'incoming',
      amount: 1200.00,
      description: 'รับเงินจากการขายสินค้า - MacBook Air',
      status: 'completed',
      createdAt: '2025-08-12T15:45:00Z',
      fromUser: 'customer456',
      reference: 'REF987654321'
    },
    {
      id: '3',
      type: 'outgoing',
      amount: -300.00,
      description: 'ถอนเงินเข้าบัญชีธนาคาร SCB',
      status: 'completed',
      createdAt: '2025-08-12T09:20:00Z',
      reference: 'WTH555666777'
    },
    {
      id: '4',
      type: 'refund',
      amount: -150.00,
      description: 'คืนเงินให้ลูกค้า - Sony Headphones',
      status: 'completed',
      createdAt: '2025-08-11T14:30:00Z',
      toUser: 'customer789',
      reference: 'RFD111222333'
    },
    {
      id: '5',
      type: 'bonus',
      amount: 100.00,
      description: 'โบนัสจากการใช้งานระบบ',
      status: 'completed',
      createdAt: '2025-08-10T08:15:00Z',
      reference: 'BON888999000'
    }
  ];

  const thailandBanks = [
    { code: 'SCB', name: 'ธนาคารไทยพาณิชย์' },
    { code: 'KBANK', name: 'ธนาคารกสิกรไทย' },
    { code: 'BBL', name: 'ธนาคารกรุงเทพ' },
    { code: 'KTB', name: 'ธนาคารกรุงไทย' },
    { code: 'TMB', name: 'ธนาคารทหารไทย' },
    { code: 'BAY', name: 'ธนาคารกรุงศรีอยุธยา' }
  ];

  useEffect(() => {
    fetchWalletData();
  }, [userId]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate balance from transactions
      const totalBalance = mockTransactions.reduce((sum, transaction) => {
        if (transaction.status === 'completed') {
          return sum + (transaction.type === 'outgoing' || transaction.type === 'refund' 
            ? transaction.amount 
            : transaction.amount);
        }
        return sum;
      }, 0);
      
      setBalance(totalBalance);
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => {
      if (filter === 'incoming') return t.type === 'incoming' || t.type === 'bonus';
      if (filter === 'outgoing') return t.type === 'outgoing' || t.type === 'refund';
      return true;
    });
  };

  const getTransactionIcon = (type: string): string => {
    const icons: Record<string, string> = {
      incoming: '💰',
      outgoing: '📤',
      refund: '↩️',
      bonus: '🎁'
    };
    return icons[type] || '💳';
  };

  const getTransactionColor = (type: string): string => {
    const colors: Record<string, string> = {
      incoming: '#27ae60',
      outgoing: '#e74c3c',
      refund: '#f39c12',
      bonus: '#9b59b6'
    };
    return colors[type] || '#95a5a6';
  };

  const formatAmount = (amount: number, type: string) => {
    const absAmount = Math.abs(amount);
    const sign = (type === 'outgoing' || type === 'refund') ? '-' : '+';
    return `${sign}฿${absAmount.toLocaleString()}`;
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      alert('กรุณาใส่จำนวนเงินที่ถูกต้อง');
      return;
    }
    
    if (amount > balance) {
      alert('จำนวนเงินที่ถอนมากกว่ายอดคงเหลือ');
      return;
    }
    
    if (!selectedBank) {
      alert('กรุณาเลือกธนาคาร');
      return;
    }

    try {
      // Call API to process withdrawal
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add new transaction
      const newTransaction: WalletTransaction = {
        id: Date.now().toString(),
        type: 'outgoing',
        amount: -amount,
        description: `ถอนเงินเข้าบัญชีธนาคาร ${selectedBank}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        reference: `WTH${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setBalance(prev => prev - amount);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setSelectedBank('');
      
      onWithdraw?.(amount);
      
      alert('คำขอถอนเงินได้รับการส่งแล้ว กรุณารอการยืนยัน');
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('เกิดข้อผิดพลาดในการถอนเงิน');
    }
  };

  if (loading) {
    return (
      <div className="user-wallet-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดข้อมูลกระเป๋าเงิน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-wallet-container">
      <div className="wallet-header">
        <h2>กระเป๋าเงินของฉัน</h2>
        <div className="balance-display">
          <div className="balance-label">ยอดคงเหลือ</div>
          <div className="balance-amount">฿{balance.toLocaleString()}</div>
          <button 
            className="btn-withdraw"
            onClick={() => setShowWithdrawModal(true)}
            disabled={balance <= 0}
          >
            ถอนเงิน
          </button>
        </div>
      </div>

      <div className="wallet-stats">
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <div className="stat-value">
              ฿{transactions
                .filter(t => (t.type === 'incoming' || t.type === 'bonus') && t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </div>
            <div className="stat-label">รายได้ทั้งหมด</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📤</div>
          <div className="stat-info">
            <div className="stat-value">
              ฿{Math.abs(transactions
                .filter(t => (t.type === 'outgoing' || t.type === 'refund') && t.status === 'completed')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0))
                .toLocaleString()}
            </div>
            <div className="stat-label">จ่ายออกทั้งหมด</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <div className="stat-value">{transactions.length}</div>
            <div className="stat-label">ธุรกรรมทั้งหมด</div>
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <div className="section-header">
          <h3>รายการธุรกรรม</h3>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              ทั้งหมด
            </button>
            <button 
              className={`filter-btn ${filter === 'incoming' ? 'active' : ''}`}
              onClick={() => setFilter('incoming')}
            >
              รับเงิน
            </button>
            <button 
              className={`filter-btn ${filter === 'outgoing' ? 'active' : ''}`}
              onClick={() => setFilter('outgoing')}
            >
              จ่ายเงิน
            </button>
          </div>
        </div>

        <div className="transactions-list">
          {getFilteredTransactions().map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-icon">
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="transaction-details">
                <div className="transaction-description">
                  {transaction.description}
                </div>
                <div className="transaction-meta">
                  <span className="transaction-date">
                    {new Date(transaction.createdAt).toLocaleString('th-TH')}
                  </span>
                  <span className="transaction-reference">
                    {transaction.reference}
                  </span>
                </div>
              </div>
              <div className="transaction-amount">
                <span 
                  className="amount-text"
                  style={{ color: getTransactionColor(transaction.type) }}
                >
                  {formatAmount(transaction.amount, transaction.type)}
                </span>
                <div className={`status-badge ${transaction.status}`}>
                  {transaction.status === 'completed' ? 'สำเร็จ' : 
                   transaction.status === 'pending' ? 'รอดำเนินการ' : 'ล้มเหลว'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {getFilteredTransactions().length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3>ไม่มีรายการธุรกรรม</h3>
            <p>ยังไม่มีการเคลื่อนไหวในกระเป๋าเงินของคุณ</p>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="withdraw-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>ถอนเงิน</h3>
              <button 
                className="btn-close"
                onClick={() => setShowWithdrawModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="balance-info">
                <span>ยอดคงเหลือ: </span>
                <strong>฿{balance.toLocaleString()}</strong>
              </div>
              
              <div className="form-group">
                <label>จำนวนเงินที่ต้องการถอน:</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  max={balance}
                  min="1"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label>เลือกธนาคาร:</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                >
                  <option value="">เลือกธนาคาร</option>
                  {thailandBanks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="withdrawal-note">
                <p>หมายเหตุ: การถอนเงินจะใช้เวลา 1-3 วันทำการ</p>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-confirm"
                  onClick={handleWithdraw}
                >
                  ยืนยันถอนเงิน
                </button>
                <button 
                  className="btn-cancel"
                  onClick={() => setShowWithdrawModal(false)}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWallet;
