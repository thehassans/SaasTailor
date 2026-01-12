import React from 'react';

export const Table = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const Thead = ({ children }) => {
  return (
    <thead className="bg-gray-50 border-b border-gray-100">
      {children}
    </thead>
  );
};

export const Tbody = ({ children }) => {
  return (
    <tbody className="divide-y divide-gray-100">
      {children}
    </tbody>
  );
};

export const Tr = ({ children, className = '', onClick }) => {
  return (
    <tr 
      className={`hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export const Th = ({ children, className = '' }) => {
  return (
    <th className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
};

export const Td = ({ children, className = '' }) => {
  return (
    <td className={`px-6 py-4 text-sm text-gray-700 ${className}`}>
      {children}
    </td>
  );
};

export default Table;
