import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const AlertMessage = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const icons = {
    info: <Info size={18} />,
    success: <CheckCircle size={18} />,
    danger: <AlertCircle size={18} />,
    warning: <AlertCircle size={18} />,
  };

  return (
    <div className={`alert alert-${type}`}>
      {icons[type] || icons.info}
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
