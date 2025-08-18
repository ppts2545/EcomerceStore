
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/StorePage.css";

type Store = {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
};

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
};

const PRODUCTS_PER_PAGE = 48;
const COLUMNS_PER_ROW = 6;

const StorePage = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchStore = async () => {
      const res = await fetch(`/api/stores/${storeId}`);
      if (res.ok) setStore(await res.json());
    };
    const fetchProducts = async () => {
      const res = await fetch(`/api/products/store/${storeId}`);
      if (res.ok) setProducts(await res.json());
    };
    Promise.all([fetchStore(), fetchProducts()]).finally(() => setLoading(false));
  }, [storeId]);

  if (loading) return <div className="store-loading">Loading...</div>;
  if (!store) return <div className="store-notfound">Store not found</div>;

  // Pagination logic
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIdx = startIdx + PRODUCTS_PER_PAGE;
  const productsToShow = products.slice(startIdx, endIdx);

  return (
    <div className="store-page">
      <div className="store-header">
        {store.logoUrl && (
          <img
            src={store.logoUrl}
            alt="logo"
            className="store-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Logo';
            }}
          />
        )}
        <div className="store-info">
          <h1 className="store-name">{store.name}</h1>
          <p className="store-desc">{store.description}</p>
          <div className="store-contact">
            {store.email && <span>Email: {store.email}</span>}
            {store.phone && <span> | Phone: {store.phone}</span>}
          </div>
        </div>
      </div>
      <h2 className="store-products-title">สินค้าทั้งหมดของร้าน</h2>
      <div className="store-products-grid store-products-grid-6col">
        {productsToShow.length === 0 ? (
          <div className="store-empty">ร้านค้านี้ยังไม่มีสินค้า</div>
        ) : (
          productsToShow.map((p) => (
            <div className="store-product-card" key={p.id}>
              <img
                src={p.imageUrl}
                alt={p.name}
                className="store-product-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/188x188?text=No+Image';
                }}
              />
              <div className="store-product-info">
                <div className="store-product-name">{p.name}</div>
                <div className="store-product-price">฿{p.price}</div>
              </div>
            </div>
          ))
        )}
      </div>
      {totalPages > 1 && (
        <div className="pagination-bar">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            &lt;
          </button>
          {(() => {
            const pageButtons = [];
            const maxPageButtons = 5;
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);
            if (currentPage <= 3) {
              startPage = 1;
              endPage = Math.min(totalPages, maxPageButtons);
            } else if (currentPage >= totalPages - 2) {
              endPage = totalPages;
              startPage = Math.max(1, totalPages - maxPageButtons + 1);
            }
            // Always show first page
            if (startPage > 1) {
              pageButtons.push(
                <button key={1} className={`pagination-btn${currentPage === 1 ? ' active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
              );
              if (startPage > 2) {
                pageButtons.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
              }
            }
            for (let i = startPage; i <= endPage; i++) {
              if (i === 1 || i === totalPages) continue; // already handled
              pageButtons.push(
                <button key={i} className={`pagination-btn${currentPage === i ? ' active' : ''}`} onClick={() => setCurrentPage(i)}>{i}</button>
              );
            }
            // Always show last page
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pageButtons.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
              }
              pageButtons.push(
                <button key={totalPages} className={`pagination-btn${currentPage === totalPages ? ' active' : ''}`} onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
              );
            }
            return pageButtons;
          })()}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            &gt;
          </button>
        </div>
      )}

    </div>
  );
};

export default StorePage;
