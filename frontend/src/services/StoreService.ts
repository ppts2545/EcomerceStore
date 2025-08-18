// StoreService.ts
// บริการสำหรับดึงข้อมูลร้านค้าของ user ปัจจุบัน

export type Store = {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  category?: string;
};


export async function getMyStores(): Promise<Store[]> {
  try {
    const res = await fetch('/api/stores/my');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
