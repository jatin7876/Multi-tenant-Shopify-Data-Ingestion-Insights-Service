import React from "react";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";

// Main MetricCard
const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend, // "up", "down", or "neutral"
  trendValue,
  color = "indigo",
  subtitle,
  showMenu = false,
  onClick
}) => {
  const colorClasses = {
    indigo: { bg: "bg-indigo-100", text: "text-indigo-600", gradient: "from-indigo-500 to-indigo-600" },
    blue: { bg: "bg-blue-100", text: "text-blue-600", gradient: "from-blue-500 to-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600", gradient: "from-green-500 to-green-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600", gradient: "from-purple-500 to-purple-600" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600", gradient: "from-yellow-500 to-yellow-600" },
    red: { bg: "bg-red-100", text: "text-red-600", gradient: "from-red-500 to-red-600" },
    pink: { bg: "bg-pink-100", text: "text-pink-600", gradient: "from-pink-500 to-pink-600" }
  };

  const currentColor = colorClasses[color] || colorClasses.indigo;

  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className={`p-3 ${currentColor.bg} rounded-xl shadow-sm`}>
              <Icon className={`h-6 w-6 ${currentColor.text}`} />
            </div>
          )}
          {showMenu && (
            <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-baseline justify-between">
          <h3 className="text-3xl font-bold text-gray-900 leading-none">{value}</h3>
        </div>

        {/* Trend Indicator */}
        {trend && trendValue && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div
              className={`flex items-center text-sm font-medium ${
                trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"
              }`}
            >
              {trend === "up" && <ArrowUpRight className="h-4 w-4 mr-1" />}
              {trend === "down" && <ArrowDownRight className="h-4 w-4 mr-1" />}
              {trend === "neutral" && <div className="w-4 h-4 mr-1" />}
              <span>{trendValue}</span>
            </div>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {trend && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${currentColor.gradient} transition-all duration-500`}
              style={{ width: trend === "up" ? "75%" : trend === "down" ? "25%" : "50%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Compact version for smaller spaces
const CompactMetricCard = ({ title, value, icon: Icon, color = "indigo" }) => {
  const colorClasses = {
    indigo: { bg: "bg-indigo-100", text: "text-indigo-600" },
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
    pink: { bg: "bg-pink-100", text: "text-pink-600" }
  };

  const currentColor = colorClasses[color] || colorClasses.indigo;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={`p-2 ${currentColor.bg} rounded-lg`}>
            <Icon className={`h-4 w-4 ${currentColor.text}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export { CompactMetricCard };
export default MetricCard;
