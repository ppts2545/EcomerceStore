              />
            ) : (
              <>
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0'
                }}>
                  <h2 style={{ 
                    margin: '0 0 10px 0', 
                    color: '#ee4d2d',
                    textAlign: 'left',
                    fontSize: '18px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    🛍️ สินค้าทั้งหมด
                    <span style={{
                      fontSize: '14px',
                      color: '#666',
                      fontWeight: 'normal'
                    }}>
                      ({filteredProducts.length} รายการ)
                    </span>
                  </h2>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(188px, 1fr))', 
                    gap: '15px',
                    marginTop: '15px'
                  }}>
                    {loading ? (
                      Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} style={{
                          backgroundColor: '#f5f5f5',
                          borderRadius: '2px',
                          height: '280px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ccc'
                        }}>
                          Loading...
                        </div>
                      ))
                    ) : filteredProducts.length === 0 ? (
                      <div style={{ 
                        gridColumn: '1 / -1', 
                        textAlign: 'center', 
                        padding: '40px',
                        color: '#666' 
                      }}>
                        ไม่มีสินค้าให้แสดง
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <div 
                          key={product.id}
                          onClick={() => {
                            window.history.pushState({}, '', `/product/${product.id}`);
                            setCurrentPath(`/product/${product.id}`);
                          }}
                          style={{
                            backgroundColor: 'white',
                            borderRadius: '2px',
                            overflow: 'hidden',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            border: '1px solid #f0f0f0',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                          }}
                        >
                          {/* Product content */}
                          <div style={{ position: 'relative', overflow: 'hidden' }}>
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              style={{
                                width: '100%',
                                height: '188px',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease'
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/188x188?text=No+Image';
                              }}
                            />
                            
                            {product.stock === 0 && (
                              <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                bottom: '0',
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold'
                              }}>
                                สินค้าหมด
                              </div>
                            )}
                          </div>
                          
                          <div style={{ padding: '12px' }}>
                            <h3 style={{
                              margin: '0 0 8px 0',
                              fontSize: '14px',
                              fontWeight: '400',
                              color: '#333',
                              lineHeight: '1.2',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {product.name}
                            </h3>
                            
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              margin: '8px 0'
                            }}>
                              <span style={{
                                color: '#ee4d2d',
                                fontSize: '16px',
                                fontWeight: 'bold'
                              }}>
                                ฿{(product.price * 35).toLocaleString()}
                              </span>
                              {isAdmin && isEditMode && (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingProduct(product);
                                    }}
                                    style={{
                                      backgroundColor: '#ffc107',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px',
                                      padding: '4px 8px',
                                      fontSize: '12px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    แก้ไข
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteProduct(product.id);
                                    }}
                                    disabled={isDeleting === product.id}
                                    style={{
                                      backgroundColor: isDeleting === product.id ? '#ccc' : '#dc3545',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px',
                                      padding: '4px 8px',
                                      fontSize: '12px',
                                      cursor: isDeleting === product.id ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    {isDeleting === product.id ? 'ลบ...' : 'ลบ'}
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '12px'
                            }}>
                              <div style={{ display: 'flex', color: '#ffa500' }}>
                                {[...Array(5)].map((_, i) => (
                                  <span key={i}>★</span>
                                ))}
                              </div>
                              <span style={{ color: '#666' }}>จำนวน: {product.stock}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 🛍️ Add Product Form */}
            {showAddForm && isAdmin && (
              <AddProductForm 
                onSubmit={handleAddProduct}
                onCancel={() => setShowAddForm(false)}
                isSubmitting={isSubmitting}
              />
            )}

            {/* ✏️ Edit Product Form */}
            {editingProduct && isAdmin && (
              <EditProductForm 
                product={editingProduct}
                onSubmit={handleEditProduct}
                onCancel={() => setEditingProduct(null)}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </main>

        {/* 🔐 Authentication Modal */}
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )}

        {/* 🛒 Cart */}
        {showCart && (
          <Cart
            isOpen={showCart}
            onClose={() => setShowCart(false)}
          />
        )}
      </div>
    );
  }

export default App
