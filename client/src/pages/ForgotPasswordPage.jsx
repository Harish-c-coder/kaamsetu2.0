import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <ForgotPasswordModal
        isOpen={true}
        onClose={() => navigate(-1)}
        onSuccessRedirect={(accountType) => {
          if (accountType === 'worker') {
            navigate('/login');
          } else {
            navigate('/customer/login');
          }
        }}
      />
    </div>
  );
}
