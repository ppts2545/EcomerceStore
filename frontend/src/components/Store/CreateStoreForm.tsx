import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/CreateStoreForm.css";

const CATEGORIES = [
  "แฟชั่น", "อิเล็กทรอนิกส์", "ความงาม", "บ้านและไลฟ์สไตล์", "อาหาร", "กีฬา", "ของเล่น", "อื่นๆ"
];

const CreateStoreForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
  logoUrl: "",
    address: "",
    phone: "",
    email: "",
    category: ""
  });
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File|null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handle file input change
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    // Upload to backend
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload/logo", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("อัปโหลดโลโก้ไม่สำเร็จ");
      const url = await res.text();
      setForm((prev) => ({ ...prev, logoUrl: url }));
    } catch (err) {
      setError("อัปโหลดโลโก้ไม่สำเร็จ");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // File upload removed


  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, logoUrl: e.target.value }));
    setLogoPreview(e.target.value);
    setLogoFile(null);
  }

  const handleLogoRemove = () => {
    setForm((prev) => ({ ...prev, logoUrl: "" }));
    setLogoPreview("");
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
  const payload = { ...form };
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("สร้างร้านค้าไม่สำเร็จ");
      setSuccess(true);
      // ดึง id ร้านจาก response (สมมุติ backend ส่ง {id: ...})
      const data = await res.json();
      if (data && data.id) {
        navigate(`/store/${data.id}`);
      }
  setForm({ name: "", description: "", logoUrl: "", address: "", phone: "", email: "", category: "" });
  setLogoPreview("");
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-store-form professional-form" onSubmit={handleSubmit}>
      <h2 className="form-title">🏪 เปิดร้านใหม่บน Big Market</h2>
      <p className="form-subtitle">กรอกข้อมูลด้านล่างเพื่อเริ่มขายสินค้ากับเรา</p>

      <div className="form-section">
        <label className="form-label">ชื่อร้าน <span className="required">*</span></label>
        <input name="name" value={form.name} onChange={handleChange} placeholder="เช่น ร้านสมใจ" required maxLength={40} />
      </div>

      <div className="form-section">
        <label className="form-label">หมวดหมู่ร้าน <span className="required">*</span></label>
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">เลือกหมวดหมู่</option>
          {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="form-section">
        <label className="form-label">โลโก้ร้าน (อัปโหลดไฟล์หรือใส่ URL)</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ maxWidth: 180 }}
            onChange={handleLogoFileChange}
          />
          <span>หรือ</span>
          <input
            name="logoUrl"
            value={form.logoUrl}
            onChange={handleLogoUrlChange}
            placeholder="URL โลโก้ เช่น https://..."
            style={{ flex: 1 }}
          />
        </div>
        {logoPreview && (
          <div className="logo-preview-row">
            <img src={logoPreview} alt="โลโก้ร้าน" className="logo-preview" />
            <button type="button" className="btn-danger" onClick={handleLogoRemove}>ลบ</button>
          </div>
        )}
      </div>

      <div className="form-section">
        <label className="form-label">รายละเอียดร้าน</label>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="บอกเล่าเกี่ยวกับร้าน จุดเด่น หรือโปรโมชั่น" maxLength={300} />
      </div>

      <div className="form-section">
        <label className="form-label">ที่อยู่ <span className="required">*</span></label>
        <input name="address" value={form.address} onChange={handleChange} required />
      </div>

      <div className="form-section">
        <label className="form-label">เบอร์โทร <span className="required">*</span></label>
        <input name="phone" value={form.phone} onChange={handleChange} required pattern="[0-9]{9,12}" />
      </div>

      <div className="form-section">
        <label className="form-label">อีเมล <span className="required">*</span></label>
        <input name="email" value={form.email} onChange={handleChange} required type="email" />
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "กำลังสร้าง..." : "สร้างร้านค้า"}
      </button>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">✅ สร้างร้านค้าสำเร็จ!</div>}
    </form>
  );
};

export default CreateStoreForm;