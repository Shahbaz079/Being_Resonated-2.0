// components/MyCustomLayout.tsx
import React, { ReactNode } from 'react';
import SubHeader from '../SubHeader/SubHeader';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className='bg-black'>
      <SubHeader />
      <main>{children}</main>

    </div>
  );
};

export default Layout;
