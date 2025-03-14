'use client';

import React, { useState, useEffect } from 'react';

export default function FooterWithYear() {
  const [year, setYear] = useState('');
  
  useEffect(() => {
    // This will only run on the client
    setYear(new Date().getFullYear().toString());
  }, []);
  
  return (
    <footer className="mt-8 border-t border-gray-200 bg-white">
      <div className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-2 md:h-14 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {year} BPO Security Framework. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 