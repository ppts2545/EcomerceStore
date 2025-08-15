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
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
          totalAmount: 48800.00,
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
    if (!user) return;
    setSaving(true);
    try {
      const payload: Partial<User> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        // email: formData.email, // Email change is typically restricted; backend doesn't update it currently
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      } as Partial<User>;

  const resp = await fetch(`http://localhost:8082/api/users/${user.id}` , {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (resp.status === 401) {
        navigate('/login');
        return;
      }
      if (resp.status === 403) {
        alert('คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้');
        return;
      }
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(err || 'อัปเดตข้อมูลไม่สำเร็จ');
      }

      const updated: User = await resp.json();
      setUser(updated);
      setFormData(updated);
      // persist to localStorage so AuthService.getUser() stays in sync
      localStorage.setItem('user', JSON.stringify(updated));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('อัปเดตข้อมูลไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
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

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm('คุณต้องการลบบัญชีนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้');
    if (!confirmed) return;
    setDeleting(true);
    try {
  const resp = await fetch(`http://localhost:8082/api/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (resp.status === 401) {
        navigate('/login');
        return;
      }
      if (resp.status === 403) {
        alert('คุณไม่มีสิทธิ์ลบบัญชีนี้');
        return;
      }
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(err || 'ลบบัญชีไม่สำเร็จ');
      }

      // Success: logout and redirect
      await AuthService.logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('ลบบัญชีไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setDeleting(false);
    }
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
          <div className="loading-spinner"></div>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
          </svg>
          กลับ
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
              <span className="item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </span>
              ข้อมูลส่วนตัว
            </button>
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <span className="item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                </svg>
              </span>
              คำสั่งซื้อของฉัน
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
              </span>
              การตั้งค่า
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
                      disabled
                      title="ไม่รองรับการแก้ไขอีเมลในตอนนี้"
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

                  {/* Bottom actions are shown globally below; keep form minimal here */}
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

              {/* Global bottom actions for Profile tab */}
              <div className="form-actions" style={{ marginTop: 16 }}>
                {isEditing && (
                  <button
                    type="button"
                    className="save-btn"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                )}
                <button
                  type="button"
                  className="delete-btn"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  style={{ marginLeft: 8 }}
                >
                  {deleting ? 'กำลังลบ...' : 'ลบบัญชี'}
                </button>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2>คำสั่งซื้อของฉัน</h2>
                <button
                  className="detail-history-btn"
                  style={{ marginLeft: 16, padding: '6px 16px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
                  onClick={() => navigate('/orders/history')}
                >
                  ดูประวัติคำสั่งซื้อแบบละเอียด
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="no-orders">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.4">
                      <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                    </svg>
                  </div>
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
