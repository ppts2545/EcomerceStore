import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService, { type User } from '../../services/AuthService';
import './UserProfile.css';

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface Order {
  id: number;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  });

  const loadUserProfile = useCallback(async () => {
    try {
      const userData = await AuthService.getCurrentUser();
      if (userData) {
        setUser(userData);
        setFormData(userData);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const loadUserOrders = useCallback(async () => {
    try {
      // Sample orders data - replace with actual API call
      const sampleOrders: Order[] = [
        {
          id: 1,
          orderDate: '2024-01-15',
          status: 'delivered',
          totalAmount: 1250.00,
          items: [
            { productId: 1, productName: 'iPhone 15 Pro', quantity: 1, price: 39900, totalPrice: 39900 },
            { productId: 2, productName: 'AirPods Pro', quantity: 1, price: 8900, totalPrice: 8900 }
          ]
        },
        {
          id: 2,
          orderDate: '2024-01-20',
          status: 'shipped',
          totalAmount: 890.00,
          items: [
            { productId: 3, productName: 'MacBook Case', quantity: 2, price: 445, totalPrice: 890 }
          ]
        }
      ];
      setOrders(sampleOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
    loadUserOrders();
  }, [loadUserProfile, loadUserOrders]);

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement API call to update user profile
      setUser({ ...user, ...formData } as User);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationToggle = (type: 'email' | 'sms' | 'push') => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const getStatusBadgeClass = (status: string) => {
    return `status-badge status-${status}`;
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'รอดำเนินการ',
      confirmed: 'ยืนยันแล้ว',
      processing: 'กำลังเตรียม',
      shipped: 'จัดส่งแล้ว',
      delivered: 'ส่งสำเร็จ',
      cancelled: 'ยกเลิก'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner">⏳</div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <p>ไม่พบข้อมูลผู้ใช้</p>
          <button onClick={() => navigate('/login')}>เข้าสู่ระบบ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← กลับ
        </button>
        <h1>บัญชีของฉัน</h1>
      </div>

      <div className="profile-layout">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="user-card">
            <div className="user-avatar">
              {user.firstName.charAt(0).toUpperCase()}
            </div>
            <h3>{user.firstName} {user.lastName}</h3>
            <p>{user.email}</p>
          </div>

          <nav className="profile-nav">
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 ข้อมูลส่วนตัว
            </button>
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 คำสั่งซื้อของฉัน
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ การตั้งค่า
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="profile-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div className="section-header">
                <h2>ข้อมูลส่วนตัว</h2>
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'ยกเลิก' : 'แก้ไข'}
                </button>
              </div>

              {isEditing ? (
                <div className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>ชื่อจริง</label>
                      <input
                        type="text"
                        value={formData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>นามสกุล</label>
                      <input
                        type="text"
                        value={formData.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>อีเมล</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>เบอร์โทรศัพท์</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="เช่น 098-123-4567"
                    />
                  </div>

                  <div className="form-group">
                    <label>ที่อยู่</label>
                    <textarea
                      rows={3}
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="ที่อยู่สำหรับจัดส่งสินค้า"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setIsEditing(false)}>
                      ยกเลิก
                    </button>
                    <button type="button" className="save-btn" onClick={handleSaveProfile}>
                      บันทึก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-info">
                  <div className="info-row">
                    <label>ชื่อ-นามสกุล:</label>
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
                  <div className="info-row">
                    <label>อีเมล:</label>
                    <span>{user.email}</span>
                  </div>
                  <div className="info-row">
                    <label>เบอร์โทรศัพท์:</label>
                    <span>{user.phoneNumber || 'ยังไม่ได้กรอก'}</span>
                  </div>
                  <div className="info-row">
                    <label>ที่อยู่:</label>
                    <span>{user.address || 'ยังไม่ได้กรอก'}</span>
                  </div>
                  <div className="info-row">
                    <label>สถานะ:</label>
                    <span>{user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}</span>
                  </div>
                  <div className="info-row">
                    <label>เข้าร่วมเมื่อ:</label>
                    <span>{new Date(user.createdAt).toLocaleDateString('th-TH')}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <div className="section-header">
                <h2>คำสั่งซื้อของฉัน</h2>
              </div>

              {orders.length === 0 ? (
                <div className="no-orders">
                  <div className="empty-icon">📦</div>
                  <h3>ยังไม่มีคำสั่งซื้อ</h3>
                  <p>เริ่มช้อปปิ้งและสั่งซื้อสินค้าที่คุณชอบ</p>
                  <button onClick={() => navigate('/')}>
                    เริ่มช้อปปิ้ง
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h4>คำสั่งซื้อ #{order.id}</h4>
                          <p>วันที่สั่งซื้อ: {new Date(order.orderDate).toLocaleDateString('th-TH')}</p>
                        </div>
                        <span className={getStatusBadgeClass(order.status)}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <span>{item.productName} (x{item.quantity})</span>
                            <span>฿{item.totalPrice.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-total">
                        <strong>รวม: ฿{order.totalAmount.toLocaleString()}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <div className="section-header">
                <h2>การตั้งค่า</h2>
              </div>

              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>การแจ้งเตือนทางอีเมล</h4>
                    <p>รับการแจ้งเตือนคำสั่งซื้อและโปรโมชั่นทางอีเมล</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={() => handleNotificationToggle('email')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>การแจ้งเตือนทาง SMS</h4>
                    <p>รับการแจ้งเตือนสถานะคำสั่งซื้อทาง SMS</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={() => handleNotificationToggle('sms')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Push Notifications</h4>
                    <p>รับการแจ้งเตือนผ่านเบราว์เซอร์</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={() => handleNotificationToggle('push')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>เปลี่ยนรหัสผ่าน</h4>
                    <p>อัปเดตรหัสผ่านของคุณเพื่อความปลอดภัย</p>
                  </div>
                  <button className="edit-btn">เปลี่ยนรหัสผ่าน</button>
                </div>

                <div className="setting-item danger">
                  <div className="setting-info">
                    <h4>ลบบัญชี</h4>
                    <p>ลบบัญชีและข้อมูลทั้งหมดอย่างถาวร</p>
                  </div>
                  <button className="danger-btn">ลบบัญชี</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      'pending': { text: 'รอดำเนินการ', className: 'status-pending' },
      'confirmed': { text: 'ยืนยันแล้ว', className: 'status-confirmed' },
      'processing': { text: 'กำลังเตรียม', className: 'status-processing' },
      'shipped': { text: 'จัดส่งแล้ว', className: 'status-shipped' },
      'delivered': { text: 'ส่งสำเร็จ', className: 'status-delivered' },
      'cancelled': { text: 'ยกเลิก', className: 'status-cancelled' }
    };
    const statusInfo = statusMap[status] || { text: status, className: 'status-default' };
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner">⏳</div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← กลับหน้าหลัก
        </button>
        <h1>โปรไฟล์ของฉัน</h1>
      </div>

      <div className="profile-layout">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="user-card">
            <div className="user-avatar">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
            <h3>{user.firstName} {user.lastName}</h3>
            <p>{user.email}</p>
          </div>

          <nav className="profile-nav">
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 ข้อมูลส่วนตัว
            </button>
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 ประวัติการสั่งซื้อ
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ การตั้งค่า
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>ข้อมูลส่วนตัว</h2>
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'ยกเลิก' : '✏️ แก้ไข'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>ชื่อ</label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          firstName: e.target.value
                        })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>นามสกุล</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          lastName: e.target.value
                        })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>เบอร์โทรศัพท์</label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        phoneNumber: e.target.value
                      })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>ที่อยู่</label>
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        address: e.target.value
                      })}
                      rows={3}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setIsEditing(false)}>
                      ยกเลิก
                    </button>
                    <button type="submit" className="save-btn">
                      ✅ บันทึก
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="info-row">
                    <label>อีเมล:</label>
                    <span>{user.email}</span>
                  </div>
                  <div className="info-row">
                    <label>ชื่อ:</label>
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
                  <div className="info-row">
                    <label>เบอร์โทรศัพท์:</label>
                    <span>{user.phoneNumber || '-'}</span>
                  </div>
                  <div className="info-row">
                    <label>ที่อยู่:</label>
                    <span>{user.address || '-'}</span>
                  </div>
                  <div className="info-row">
                    <label>สมาชิกตั้งแต่:</label>
                    <span>{new Date(user.createdAt).toLocaleDateString('th-TH')}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>ประวัติการสั่งซื้อ</h2>
              {orders.length === 0 ? (
                <div className="no-orders">
                  <div className="empty-icon">📦</div>
                  <h3>ยังไม่มีประวัติการสั่งซื้อ</h3>
                  <p>เริ่มช้อปปิ้งเพื่อสั่งซื้อสินค้า</p>
                  <button onClick={() => navigate('/')}>
                    เริ่มช้อปปิ้ง
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h4>คำสั่งซื้อ #{order.orderNumber}</h4>
                          <p>{new Date(order.date).toLocaleDateString('th-TH')}</p>
                        </div>
                        <div className="order-status">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      
                      <div className="order-items">
                        {order.items.map((item) => (
                          <div key={item.id} className="order-item">
                            <span>{item.productName}</span>
                            <span>x{item.quantity}</span>
                            <span>฿{item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-total">
                        <strong>ยอดรวม: ฿{order.total.toLocaleString()}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>การตั้งค่า</h2>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>การแจ้งเตือน</h4>
                    <p>รับแจ้งเตือนเกี่ยวกับคำสั่งซื้อและโปรโมชั่น</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>อีเมลโปรโมชั่น</h4>
                    <p>รับข้อมูลโปรโมชั่นและส่วนลดทางอีเมล</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item danger">
                  <div className="setting-info">
                    <h4>ลบบัญชี</h4>
                    <p>ลบบัญชีผู้ใช้อย่างถาวร</p>
                  </div>
                  <button className="danger-btn">
                    🗑️ ลบบัญชี
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
