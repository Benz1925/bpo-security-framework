"use client";

import React, { useState } from 'react';
import { Shield, User, LogOut, BarChart, FileText, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex justify-between items-center">
        {/* Logo and Navigation */}
        <div className="flex items-center">
          <div className="flex items-center gap-2 mr-8">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-lg">BPO Security Framework</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavItem 
              icon={<BarChart className="w-4 h-4" />} 
              label="Dashboard" 
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
            />
            <NavItem 
              icon={<Shield className="w-4 h-4" />} 
              label="Security Tests" 
              active={activeTab === "tests"}
              onClick={() => setActiveTab("tests")}
            />
            <NavItem icon={<FileText className="w-4 h-4" />} label="Reports" />
            <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
          </div>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        {/* User info and logout */}
        {isAuthenticated ? (
          <div className="hidden md:flex items-center gap-4 ml-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-800" />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        ) : null}
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-2 pb-3 border-t border-gray-200 mt-2">
          <div className="flex flex-col space-y-2">
            <MobileNavItem 
              icon={<BarChart className="w-4 h-4" />} 
              label="Dashboard" 
              active={activeTab === "dashboard"}
              onClick={() => {
                setActiveTab("dashboard");
                setMobileMenuOpen(false);
              }}
            />
            <MobileNavItem 
              icon={<Shield className="w-4 h-4" />} 
              label="Security Tests" 
              active={activeTab === "tests"}
              onClick={() => {
                setActiveTab("tests");
                setMobileMenuOpen(false);
              }}
            />
            <MobileNavItem icon={<FileText className="w-4 h-4" />} label="Reports" />
            <MobileNavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
            
            {isAuthenticated && (
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-800" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// Navigation Item Component for Desktop
const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-3 py-2 rounded text-sm font-medium flex items-center gap-1.5 ${
      active 
        ? 'text-blue-600 bg-blue-50' 
        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Navigation Item Component for Mobile
const MobileNavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-2 py-2.5 rounded text-sm font-medium flex items-center gap-2 w-full text-left ${
      active 
        ? 'text-blue-600 bg-blue-50' 
        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default Navbar; 