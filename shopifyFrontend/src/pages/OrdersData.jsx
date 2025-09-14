import React, { useState } from "react";

const Orders = () => {
  const [search, setSearch] = useState("");

  // Dummy data inside the JSX file
  const orders = [
    { id: "ORD-001", customer: "Alice", total: "$120", status: "Completed" },
    { id: "ORD-002", customer: "Bob", total: "$80", status: "Pending" },
    { id: "ORD-003", customer: "Charlie", total: "$150", status: "Shipped" },
    { id: "ORD-004", customer: "Daisy", total: "$60", status: "Completed" },
  ];

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Orders</h2>

      <input
        type="text"
        placeholder="Search by Order ID, Customer, or Status"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
      />

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Order ID</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{order.id}</td>
              <td className="p-3">{order.customer}</td>
              <td className="p-3">{order.total}</td>
              <td
                className={`p-3 font-medium ${
                  order.status === "Completed"
                    ? "text-green-600"
                    : order.status === "Pending"
                    ? "text-yellow-600"
                    : "text-blue-600"
                }`}
              >
                {order.status}
              </td>
            </tr>
          ))}
          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan="4" className="p-3 text-center text-gray-500">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
