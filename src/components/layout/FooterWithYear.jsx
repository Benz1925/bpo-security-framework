"use client";

import React, { useState, useEffect } from 'react';

const FooterWithYear = () => {
  const [currentYear, setCurrentYear] = useState('');

  // Set the current year on the client side only, avoiding hydration mismatches
  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {currentYear} BPO Security Framework. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-muted-foreground hover:underline">Terms</a>
          <a href="#" className="text-sm text-muted-foreground hover:underline">Privacy</a>
          <a href="#" className="text-sm text-muted-foreground hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default FooterWithYear; 