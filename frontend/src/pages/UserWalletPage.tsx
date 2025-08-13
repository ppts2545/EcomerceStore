import React from 'react';
import { UserWallet } from '../components/Payment';

const UserWalletPage: React.FC = () => {
  const currentUserId = 'usr001'; // Get from auth context

  const handleWithdraw = (amount: number) => {
    console.log(`User withdrew ${amount} baht`);
    // Handle withdrawal success
    // Show notification, update UI, etc.
  };

  return (
    <div className="user-wallet-page">
      <UserWallet 
        userId={currentUserId}
        onWithdraw={handleWithdraw}
      />
    </div>
  );
};

export default UserWalletPage;
