import React, { useState, useEffect } from "react";
import { 
  Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown, 
  Calendar, Clock, Target, Award, BarChart3, PieChart,
  RefreshCw, Filter, Download, Eye
} from "lucide-react";
import axios from "axios";

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  
  // Data states
  const [overview, setOverview] = useState(null);
  const [ordersByDate, setOrdersByDate] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [customerGrowth, setCustomerGrowth] = useState([]);
  const [avgOrderValue, setAvgOrderValue] = useState(null);
  const [salesByHour, setSalesByHour] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel
      const [
        overviewRes,
        ordersRes,
        topCustomersRes,
        revenueTrendsRes,
        customerGrowthRes,
        avgOrderValueRes,
        salesByHourRes
      ] = await Promise.all([
        axios.get("/api/metrics/overview", { headers }),
        axios.get(`/api/metrics/orders-by-date?from=${dateRange.from}&to=${dateRange.to}`, { headers }),
        axios.get("/api/metrics/top-customers", { headers }),
        axios.get("/api/metrics/revenue-trends", { headers }),
        axios.get("/api/metrics/customer-growth", { headers }),
        axios.get("/api/metrics/average-order-value", { headers }),
        axios.get("/api/metrics/sales-by-hour", { headers })
      ]);

      setOverview(overviewRes.data);
      setOrdersByDate(ordersRes.data);
      setTopCustomers(topCustomersRes.data);
      setRevenueTrends(revenueTrendsRes.data);
      setCustomerGrowth(customerGrowthRes.data);
      setAvgOrderValue(avgOrderValueRes.data);
      setSalesByHour(salesByHourRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Target className="h-4 w-4 text-gray-500" />;
  };

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Comprehensive insights into your business performance</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                onClick={fetchData}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(overview?.revenue || 0)}
            icon={<DollarSign className="h-6 w-6" />}
            trend={calculateTrend(overview?.revenue || 0, 0)}
            color="green"
          />
          <MetricCard
            title="Total Orders"
            value={formatNumber(overview?.orders || 0)}
            icon={<ShoppingCart className="h-6 w-6" />}
            trend={calculateTrend(overview?.orders || 0, 0)}
            color="blue"
          />
          <MetricCard
            title="Total Customers"
            value={formatNumber(overview?.customers || 0)}
            icon={<Users className="h-6 w-6" />}
            trend={calculateTrend(overview?.customers || 0, 0)}
            color="purple"
          />
          <MetricCard
            title="Avg Order Value"
            value={formatCurrency(avgOrderValue?.avg_order_value || 0)}
            icon={<Target className="h-6 w-6" />}
            trend={0}
            color="orange"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Orders by Date Chart */}
          <ChartCard
            title="Orders by Date"
            icon={<BarChart3 className="h-5 w-5" />}
          >
            <OrdersChart data={ordersByDate} />
          </ChartCard>

          {/* Revenue Trends */}
          <ChartCard
            title="Revenue Trends (30 days)"
            icon={<TrendingUp className="h-5 w-5" />}
          >
            <RevenueChart data={revenueTrends} />
          </ChartCard>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Customers */}
          <ChartCard
            title="Top Customers by Spend"
            icon={<Award className="h-5 w-5" />}
          >
            <TopCustomersList customers={topCustomers} />
          </ChartCard>

          {/* Sales by Hour */}
          <ChartCard
            title="Sales by Hour"
            icon={<Clock className="h-5 w-5" />}
          >
            <SalesByHourChart data={salesByHour} />
          </ChartCard>

          {/* Customer Growth */}
          <ChartCard
            title="Customer Growth"
            icon={<Users className="h-5 w-5" />}
          >
            <CustomerGrowthChart data={customerGrowth} />
          </ChartCard>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Min Order</span>
                <span className="font-semibold">{formatCurrency(avgOrderValue?.min_order || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Order</span>
                <span className="font-semibold">{formatCurrency(avgOrderValue?.max_order || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-semibold">{formatNumber(avgOrderValue?.total_orders || 0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Revenue is growing</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Orders are consistent</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Customer base expanding</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Eye className="h-4 w-4 mr-2" />
                View Reports
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    green: "bg-green-50 text-green-600 border-green-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200"
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      {trend !== 0 && (
        <div className="flex items-center mt-4">
          {getTrendIcon(trend > 0, trend < 0)}
          <span className={`ml-2 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(trend)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Chart Card Component
const ChartCard = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="text-gray-400">{icon}</div>
    </div>
    {children}
  </div>
);

// Simple Chart Components
const OrdersChart = ({ data }) => (
  <div className="h-64 flex items-end justify-between space-x-2">
    {data.length === 0 ? (
      <div className="flex items-center justify-center w-full h-full text-gray-500">
        No data available for the selected date range
      </div>
    ) : (
      data.map((item, index) => {
        const maxOrders = Math.max(...data.map(d => d.orders));
        const height = (item.orders / maxOrders) * 200;
        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="bg-indigo-500 rounded-t w-full transition-all duration-500 hover:bg-indigo-600"
              style={{ height: `${height}px` }}
              title={`${new Date(item.day).toLocaleDateString()}: ${item.orders} orders`}
            />
            <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
              {new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        );
      })
    )}
  </div>
);

const RevenueChart = ({ data }) => (
  <div className="h-64 flex items-end justify-between space-x-1">
    {data.length === 0 ? (
      <div className="flex items-center justify-center w-full h-full text-gray-500">
        No revenue data available
      </div>
    ) : (
      data.map((item, index) => {
        const maxRevenue = Math.max(...data.map(d => d.revenue));
        const height = (item.revenue / maxRevenue) * 200;
        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="bg-green-500 rounded-t w-full transition-all duration-500 hover:bg-green-600"
              style={{ height: `${height}px` }}
              title={`${new Date(item.day).toLocaleDateString()}: $${Number(item.revenue || 0).toFixed(2)}`}

            />
          </div>
        );
      })
    )}
  </div>
);

const TopCustomersList = ({ customers }) => (
  <div className="space-y-3">
    {customers.length === 0 ? (
      <div className="text-center text-gray-500 py-8">No customer data available</div>
    ) : (
      customers.map((customer, index) => (
        <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-semibold text-indigo-600">
                {customer.name?.charAt(0) || customer.email?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {customer.name || customer.email?.split('@')[0] || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500">{customer.order_count} orders</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">${Number(customer.total_spent || 0).toFixed(2)}</p>
            <p className="text-xs text-gray-500">#{index + 1}</p>
          </div>
        </div>
      ))
    )}
  </div>
);

const SalesByHourChart = ({ data }) => (
  <div className="h-64 flex items-end justify-between space-x-1">
    {data.length === 0 ? (
      <div className="flex items-center justify-center w-full h-full text-gray-500">
        No sales data available
      </div>
    ) : (
      Array.from({ length: 24 }, (_, hour) => {
        const hourData = data.find(d => parseInt(d.hour) === hour);
        const maxRevenue = Math.max(...data.map(d => d.revenue));
        const height = hourData ? (hourData.revenue / maxRevenue) * 200 : 0;
        return (
          <div key={hour} className="flex flex-col items-center flex-1">
            <div
              className="bg-purple-500 rounded-t w-full transition-all duration-500 hover:bg-purple-600"
              style={{ height: `${height}px` }}
              title={`${hour}:00 - $${Number(hourData?.revenue || 0).toFixed(2)}`}
              />
            <div className="text-xs text-gray-500 mt-1">{hour}</div>
          </div>
        );
      })
    )}
  </div>
);

const CustomerGrowthChart = ({ data }) => (
  <div className="h-64 flex items-end justify-between space-x-2">
    {data.length === 0 ? (
      <div className="flex items-center justify-center w-full h-full text-gray-500">
        No customer growth data available
      </div>
    ) : (
      data.map((item, index) => {
        const maxGrowth = Math.max(...data.map(d => d.new_customers));
        const height = (item.new_customers / maxGrowth) * 200;
        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="bg-orange-500 rounded-t w-full transition-all duration-500 hover:bg-orange-600"
              style={{ height: `${height}px` }}
              title={`${new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}: ${item.new_customers} new customers`}
            />
          </div>
        );
      })
    )}
  </div>
);

export default AnalyticsDashboard;
