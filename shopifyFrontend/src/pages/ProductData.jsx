import React, { useState, useEffect } from "react";
import axios from "axios";

const Products = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get("/api/products", { headers });
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    // Listen for product added events
    const handleProductAdded = () => {
      fetchProducts();
    };
    
    window.addEventListener('productAdded', handleProductAdded);
    
    return () => {
      window.removeEventListener('productAdded', handleProductAdded);
    };
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      p.id.toString().includes(search)
  );

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Products ({products.length})</h2>
        <button 
          onClick={fetchProducts}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by Product Name, SKU, or ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
      />

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">ID</th>
            <th className="p-3">Title</th>
            <th className="p-3">SKU</th>
            <th className="p-3">Price</th>
            <th className="p-3">Inventory</th>
            <th className="p-3">Shopify ID</th>
            <th className="p-3">Created</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{product.id}</td>
              <td className="p-3">{product.title || 'N/A'}</td>
              <td className="p-3">{product.sku || 'N/A'}</td>
              <td className="p-3">${(product.price_cents / 100).toFixed(2)}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.inventory < 10 ? 'bg-red-100 text-red-800' : 
                  product.inventory < 50 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {product.inventory}
                </span>
              </td>
              <td className="p-3">{product.shopify_id || 'N/A'}</td>
              <td className="p-3">{new Date(product.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan="7" className="p-3 text-center text-gray-500">
                {search ? "No products found matching your search." : "No products found."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
