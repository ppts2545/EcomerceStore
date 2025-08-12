import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Order {
  id: number;
  userEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'orders' | 'products'>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load sample data - replace with actual API calls
      const sampleStats: DashboardStats = {
        totalUsers: 1250,
        totalOrders: 850,
        totalProducts: 125,
        totalRevenue: 2500000
      };

      const sampleUsers: User[] = [
        { id: 1, firstName: 'สมชาย', lastName: 'ใจดี', email: 'somchai@email.com', role: 'USER', createdAt: '2024-01-15' },
        { id: 2, firstName: 'สมใส', lastName: 'รักสุข', email: 'somsai@email.com', role: 'USER', createdAt: '2024-01-16' },
        { id: 3, firstName: 'Admin', lastName: 'User', email: 'admin@email.com', role: 'ADMIN', createdAt: '2024-01-01' }
      ];

      const sampleOrders: Order[] = [
        { id: 1001, userEmail: 'somchai@email.com', totalAmount: 48800, status: 'DELIVERED', createdAt: '2024-01-15' },
        { id: 1002, userEmail: 'somsai@email.com', totalAmount: 25000, status: 'SHIPPED', createdAt: '2024-01-16' },
        { id: 1003, userEmail: 'customer@email.com', totalAmount: 12500, status: 'PENDING', createdAt: '2024-01-17' }
      ];

      const sampleProducts: Product[] = [
        { id: 1, name: 'iPhone 15 Pro', price: 39900, category: 'Electronics', stock: 25, status: 'ACTIVE' },
        { id: 2, name: 'MacBook Air M2', price: 34900, category: 'Electronics', stock: 12, status: 'ACTIVE' },
        { id: 3, name: 'Nike Air Force 1', price: 3500, category: 'Fashion', stock: 0, status: 'INACTIVE' }
      ];

      setStats(sampleStats);
      setUsers(sampleUsers);
      setOrders(sampleOrders);
      setProducts(sampleProducts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'delivered':
        return 'green';
      case 'inactive':
      case 'cancelled':
        return 'red';
      case 'pending':
        return 'orange';
      case 'shipped':
        return 'blue';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>📊 Admin Dashboard</h1>
          <div className="admin-actions">
            <button className="admin-btn primary">
              + เพิ่มสินค้า
            </button>
            <button className="admin-btn secondary">
              📤 Export ข้อมูล
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav">
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📈 Dashboard
        </button>
        <button
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 ผู้ใช้งาน ({users.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 คำสั่งซื้อ ({orders.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          🛍️ สินค้า ({products.length})
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-tab">
            <div className="stats-grid">
              <div className="stat-card users">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers.toLocaleString()}</h3>
                  <p>ผู้ใช้งานทั้งหมด</p>
                </div>
              </div>
              
              <div className="stat-card orders">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{stats.totalOrders.toLocaleString()}</h3>
                  <p>คำสั่งซื้อทั้งหมด</p>
                </div>
              </div>
              
              <div className="stat-card products">
                <div className="stat-icon">🛍️</div>
                <div className="stat-info">
                  <h3>{stats.totalProducts.toLocaleString()}</h3>
                  <p>สินค้าทั้งหมด</p>
                </div>
              </div>
              
              <div className="stat-card revenue">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>{formatCurrency(stats.totalRevenue)}</h3>
                  <p>รายได้ทั้งหมด</p>
                </div>
              </div>
            </div>

            <div className="dashboard-charts">
              <div className="chart-card">
                <h3>📊 ยอดขายรายเดือน</h3>
                <div className="chart-placeholder">
                  <p>กราฟยอดขายจะแสดงที่นี่</p>
                </div>
              </div>
              
              <div className="chart-card">
                <h3>📈 ผู้ใช้งานใหม่</h3>
                <div className="chart-placeholder">
                  <p>กราฟผู้ใช้งานใหม่จะแสดงที่นี่</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="table-header">
              <h2>👥 จัดการผู้ใช้งาน</h2>
              <div className="table-actions">
                <input
                  type="search"
                  placeholder="ค้นหาผู้ใช้งาน..."
                  className="search-input"
                />
                <button className="admin-btn primary">+ เพิ่มผู้ใช้</button>
              </div>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>อีเมล</th>
                    <th>สิทธิ์</th>
                    <th>วันที่สมัคร</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status-badge ${user.role.toLowerCase()}`}>
                          {user.role === 'ADMIN' ? 'ผู้ดูแล' : 'ผู้ใช้'}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td className="table-actions">
                        <button className="action-btn edit">แก้ไข</button>
                        <button className="action-btn delete">ลบ</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-tab">
            <div className="table-header">
              <h2>📦 จัดการคำสั่งซื้อ</h2>
              <div className="table-actions">
                <select className="filter-select">
                  <option value="">ทุกสถานะ</option>
                  <option value="pending">รอดำเนินการ</option>
                  <option value="shipped">จัดส่งแล้ว</option>
                  <option value="delivered">ส่งสำเร็จ</option>
                </select>
                <input
                  type="search"
                  placeholder="ค้นหาคำสั่งซื้อ..."
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>เลขที่คำสั่งซื้อ</th>
                    <th>ลูกค้า</th>
                    <th>ยอดรวม</th>
                    <th>สถานะ</th>
                    <th>วันที่สั่งซื้อ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.userEmail}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ color: getStatusColor(order.status) }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td className="table-actions">
                        <button className="action-btn view">ดู</button>
                        <button className="action-btn edit">แก้ไข</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="products-tab">
            <div className="table-header">
              <h2>🛍️ จัดการสินค้า</h2>
              <div className="table-actions">
                <select className="filter-select">
                  <option value="">ทุกหมวดหมู่</option>
                  <option value="electronics">อิเล็กทรอนิกส์</option>
                  <option value="fashion">แฟชั่น</option>
                  <option value="home">บ้านและสวน</option>
                </select>
                <input
                  type="search"
                  placeholder="ค้นหาสินค้า..."
                  className="search-input"
                />
                <button className="admin-btn primary">+ เพิ่มสินค้า</button>
              </div>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ชื่อสินค้า</th>
                    <th>หมวดหมู่</th>
                    <th>ราคา</th>
                    <th>คลังสินค้า</th>
                    <th>สถานะ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>
                        <span className={product.stock === 0 ? 'stock-out' : 'stock-available'}>
                          {product.stock} ชิ้น
                        </span>
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ color: getStatusColor(product.status) }}
                        >
                          {product.status === 'ACTIVE' ? 'เปิดขาย' : 'ปิดขาย'}
                        </span>
                      </td>
                      <td className="table-actions">
                        <button className="action-btn edit">แก้ไข</button>
                        <button className="action-btn delete">ลบ</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
