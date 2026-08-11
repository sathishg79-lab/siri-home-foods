import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const MaintenanceModal = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        animation: 'slideIn 0.3s ease-out',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#999',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <AlertCircle size={32} color="#ff6b6b" strokeWidth={1.5} />
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#2b2b2b' }}>Under Maintenance</h2>
        </div>

        <p style={{
          fontSize: '1rem',
          color: '#555',
          lineHeight: '1.6',
          marginBottom: '1rem',
          margin: '0 0 1rem 0',
        }}>
          We're currently performing system upgrades to bring you a better experience. The site will remain accessible, but some features may be temporarily unavailable.
        </p>

        <p style={{
          fontSize: '0.95rem',
          color: '#777',
          margin: '1rem 0 0 0',
          lineHeight: '1.5',
        }}>
          Thank you for your patience! For urgent inquiries, please contact us at{' '}
          <strong>+91 9912142247</strong>
        </p>

        <button
          onClick={onClose}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#2b2b2b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1a1a1a'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#2b2b2b'}
        >
          Got It
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MaintenanceModal;
