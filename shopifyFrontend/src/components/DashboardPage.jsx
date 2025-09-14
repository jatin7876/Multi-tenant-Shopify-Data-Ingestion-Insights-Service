import React, { useState, useEffect } from "react";
import { ShoppingCart, Users, Package, TrendingUp, DollarSign, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CreateOrderModal from "./CreateOrderModal";
import AddCustomerModal from "./AddCustomerModal";
import ManageInventoryModal from "./ManageInventoryModal";

// Mock components for demonstration
const MetricCard = ({ title, value, icon: Icon, trend, trendValue, color = "indigo" }) => (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-sm font-medium ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}>
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <div className={`p-3 bg-${color}-100 rounded-xl`}>
        <Icon className={`h-7 w-7 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const DashboardContent = ({ activeTab, onNavigateToAnalytics, onCreateOrder, onAddCustomer, onManageInventory, customers, products, refreshData }) => {
  const metrics = [
    {
      title: "Total Orders",
      value: "1,234",
      icon: ShoppingCart,
      trend: "up",
      trendValue: "+12.5%",
      color: "blue"
    },
    {
      title: "Total Customers",
      value: "8,549",
      icon: Users,
      trend: "up",
      trendValue: "+8.2%",
      color: "green"
    },
    {
      title: "Total Products",
      value: "456",
      icon: Package,
      trend: "down",
      trendValue: "-2.1%",
      color: "purple"
    },
    {
      title: "Total Revenue",
      value: "$45,678",
      icon: DollarSign,
      trend: "up",
      trendValue: "+15.3%",
      color: "yellow"
    },
  ];

  const recentOrders = [
    { id: "#12345", customer: "John Doe", amount: "$125.00", status: "Completed", date: "2 hours ago" },
    { id: "#12346", customer: "Jane Smith", amount: "$89.50", status: "Processing", date: "4 hours ago" },
    { id: "#12347", customer: "Bob Johnson", amount: "$234.75", status: "Shipped", date: "1 day ago" },
    { id: "#12348", customer: "Alice Brown", amount: "$67.25", status: "Completed", date: "2 days ago" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "Processing": return "bg-yellow-100 text-yellow-800";
      case "Shipped": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (activeTab === "orders") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <button 
            onClick={onCreateOrder}
            className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md">
            New Order
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-indigo-600 hover:text-indigo-900 font-medium">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "customers") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Customer Management ({customers.length})</h1>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button 
              onClick={refreshData}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
              Refresh
            </button>
            <button 
              onClick={onAddCustomer}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md">
              Add Customer
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Customers</h2>
          </div>
          
          {customers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first customer.</p>
              <button 
                onClick={onAddCustomer}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md">
                Add First Customer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.phone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === "products") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Product Management ({products.length})</h1>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button 
              onClick={refreshData}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
              Refresh
            </button>
            <button 
              onClick={onManageInventory}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md">
              Manage Inventory
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Products</h2>
          </div>
          
          {products.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first product.</p>
              <button 
                onClick={onManageInventory}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md">
                Add First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.title || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(product.price_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.inventory < 10 ? 'bg-red-100 text-red-800' : 
                          product.inventory < 50 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {product.inventory}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default dashboard overview
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
            Export
          </button>
          <button 
            onClick={onNavigateToAnalytics}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md">
            View Analytics
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{order.amount}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              View All Orders
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={onCreateOrder}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-left">
                <div className="flex items-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-900">Create New Order</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-blue-600" />
              </button>
              
              <button 
                onClick={onAddCustomer}
                className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-left">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">Add Customer</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              </button>
              
              <button 
                onClick={onManageInventory}
                className="flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-left">
                <div className="flex items-center">
                  <Package className="h-6 w-6 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Manage Inventory</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-purple-600" />
              </button>
              
              <button 
                onClick={onNavigateToAnalytics}
                className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors text-left">
                <div className="flex items-center">
                  <TrendingUp className="h-6 w-6 text-indigo-600 mr-3" />
                  <span className="font-medium text-indigo-900">View Analytics</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-indigo-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = ({ currentUser, currentTenant, setIsAuthenticated }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showManageInventory, setShowManageInventory] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNavigateToAnalytics = () => {
    navigate("/analytics");
  };

  const handleCreateOrder = () => {
    setShowCreateOrder(true);
  };

  const handleAddCustomer = () => {
    setShowAddCustomer(true);
  };

  const handleManageInventory = () => {
    setShowManageInventory(true);
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get("/api/customers", { headers });
      setCustomers(response.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get("/api/products", { headers });
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchCustomers(), fetchProducts()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
    
    // Listen for data update events
    const handleCustomerAdded = () => {
      fetchCustomers();
    };
    
    const handleProductAdded = () => {
      fetchProducts();
    };
    
    window.addEventListener('customerAdded', handleCustomerAdded);
    window.addEventListener('productAdded', handleProductAdded);
    
    return () => {
      window.removeEventListener('customerAdded', handleCustomerAdded);
      window.removeEventListener('productAdded', handleProductAdded);
    };
  }, []);

  const handleSuccess = () => {
    // Refresh data or show success message
    console.log("Operation successful!");
    refreshData();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Component would be imported and used here */}
      <div className="bg-white shadow-lg border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md mr-3">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Xeno Insights
                </h1>
                {currentTenant && (
                  <p className="text-xs text-gray-500">
                    {currentTenant.storeName} • {currentTenant.domain}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, {currentUser?.name || currentUser?.email?.split('@')[0] || 'User'}
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar Component would be imported and used here */}
        <aside className="hidden lg:flex w-72 bg-white shadow-xl border-r border-gray-200">
          <div className="w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Navigation</h2>
            <nav className="space-y-2">
              {[
                { name: "Overview", path: "overview", icon: TrendingUp },
                { name: "Orders", path: "orders", icon: ShoppingCart },
                { name: "Customers", path: "customers", icon: Users },
                { name: "Products", path: "products", icon: Package },
              ].map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.path;
                
                return (
                  <button
                    key={link.name}
                    onClick={() => setActiveTab(link.path)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                      {link.name}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="grid grid-cols-4 py-2">
            {[
              { name: "Overview", path: "overview", icon: TrendingUp },
              { name: "Orders", path: "orders", icon: ShoppingCart },
              { name: "Customers", path: "customers", icon: Users },
              { name: "Products", path: "products", icon: Package },
            ].map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.path;
              
              return (
                <button
                  key={link.name}
                  onClick={() => setActiveTab(link.path)}
                  className={`flex flex-col items-center justify-center py-2 px-1 transition-all duration-200 ${
                    isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`} />
                  <span className={`text-xs mt-1 font-medium ${
                    isActive ? 'text-indigo-600' : 'text-gray-600'
                  }`}>
                    {link.name}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 lg:pb-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <DashboardContent 
              activeTab={activeTab} 
              onNavigateToAnalytics={handleNavigateToAnalytics}
              onCreateOrder={handleCreateOrder}
              onAddCustomer={handleAddCustomer}
              onManageInventory={handleManageInventory}
              customers={customers}
              products={products}
              refreshData={refreshData}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateOrderModal
        isOpen={showCreateOrder}
        onClose={() => setShowCreateOrder(false)}
        onSuccess={handleSuccess}
      />
      
      <AddCustomerModal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onSuccess={handleSuccess}
      />
      
      <ManageInventoryModal
        isOpen={showManageInventory}
        onClose={() => setShowManageInventory(false)}
      />
    </div>
  );
};

export default DashboardPage;