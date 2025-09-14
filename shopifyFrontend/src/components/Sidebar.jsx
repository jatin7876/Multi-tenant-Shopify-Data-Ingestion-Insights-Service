import React, { useState } from "react";
import { ShoppingCart, Users, Package, BarChart3, Settings, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const links = [
    { name: "Orders", path: "orders", icon: ShoppingCart, badge: "23" },
    { name: "Customers", path: "customers", icon: Users, badge: null },
    { name: "Products", path: "products", icon: Package, badge: "5" },
    { name: "Analytics", path: "analytics", icon: BarChart3, badge: null },
    { name: "Settings", path: "settings", icon: Settings, badge: null },
  ];

  const handleItemClick = (path) => {
    if (setActiveTab) {
      setActiveTab(path);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
                <p className="text-sm text-gray-500">Manage your store</p>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.path;
            
            return (
              <button
                key={link.name}
                onClick={() => handleItemClick(link.path)}
                onMouseEnter={() => setHoveredItem(link.name)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}`} />
                  {!isCollapsed && (
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                      {link.name}
                    </span>
                  )}
                </div>
                
                {!isCollapsed && link.badge && (
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    isActive 
                      ? 'bg-white text-indigo-600' 
                      : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => handleItemClick('help')}
            className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
          >
            <HelpCircle className="h-5 w-5 text-gray-600" />
            {!isCollapsed && <span className="font-medium">Help & Support</span>}
          </button>
        </div>

        {/* Tooltip for collapsed state */}
        {isCollapsed && hoveredItem && (
          <div className="fixed left-24 bg-gray-900 text-white px-2 py-1 rounded text-sm z-50 pointer-events-none">
            {hoveredItem}
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 py-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.path;
            
            return (
              <button
                key={link.name}
                onClick={() => handleItemClick(link.path)}
                className={`flex flex-col items-center justify-center py-2 px-1 transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-6 w-6 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`} />
                  {link.badge && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </div>
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
    </>
  );
};

export default Sidebar;