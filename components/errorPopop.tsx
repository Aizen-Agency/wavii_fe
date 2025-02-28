// components/ErrorPopup.tsx
import React from 'react';

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded shadow-lg max-w-sm w-full">
      <p className="text-red-600">{message}</p>
      <button
        onClick={onClose}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Close
      </button>
    </div>
  </div>
);

export default ErrorPopup;