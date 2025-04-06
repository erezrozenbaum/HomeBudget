import React from 'react';

export const CustomTooltip = ({ active, payload, label, currencySymbol = '₪' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e1f2d] border border-gray-700 rounded-lg shadow-lg p-4">
        <p className="font-medium text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm flex items-center justify-between gap-4 text-white">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-semibold">
              {currencySymbol}{Number(entry.value).toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;