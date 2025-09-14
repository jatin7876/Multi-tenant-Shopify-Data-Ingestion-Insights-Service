import React, { useState, useEffect } from "react";
import axios from "axios";

const Customers = () => {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get("/api/customers", { headers });
      setCustomers(response.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    
    // Listen for customer added events
    const handleCustomerAdded = () => {
      fetchCustomers();
    };
    
    window.addEventListener('customerAdded', handleCustomerAdded);
    
    return () => {
      window.removeEventListener('customerAdded', handleCustomerAdded);
    };
  }, []);
  
  const filteredCustomers = customers.filter(
    (c) =>
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading customers...</span>
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
            onClick={fetchCustomers}
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
        <h2 className="text-lg font-semibold">Customers ({customers.length})</h2>
        <button 
          onClick={fetchCustomers}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by Name or Email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
      />

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">ID</th>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Shopify ID</th>
            <th className="p-3">Created</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer) => (
            <tr key={customer.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{customer.id}</td>
              <td className="p-3">{customer.name || 'N/A'}</td>
              <td className="p-3">{customer.email || 'N/A'}</td>
              <td className="p-3">{customer.phone || 'N/A'}</td>
              <td className="p-3">{customer.shopify_id || 'N/A'}</td>
              <td className="p-3">{new Date(customer.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {filteredCustomers.length === 0 && (
            <tr>
              <td colSpan="6" className="p-3 text-center text-gray-500">
                {search ? "No customers found matching your search." : "No customers found."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Customers;
