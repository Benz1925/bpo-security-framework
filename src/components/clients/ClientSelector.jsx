"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, ChevronDown, Plus, Edit, Trash } from 'lucide-react';

// Sample client data - in a real app, this would come from an API
const initialClients = [
  { id: '1', name: 'ACME Corp', industry: 'Manufacturing', complianceLevel: 'High' },
  { id: '2', name: 'Globex Inc', industry: 'Finance', complianceLevel: 'Critical' },
  { id: '3', name: 'Initech', industry: 'Technology', complianceLevel: 'Medium' }
];

const ClientSelector = ({ onClientSelect }) => {
  const [clients, setClients] = useState(initialClients);
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', industry: '', complianceLevel: 'Medium' });

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setIsDropdownOpen(false);
    if (onClientSelect) onClientSelect(client);
  };

  const handleAddClient = () => {
    if (!newClient.name) return;
    
    const client = {
      id: Date.now().toString(),
      ...newClient
    };
    
    setClients([...clients, client]);
    setNewClient({ name: '', industry: '', complianceLevel: 'Medium' });
    setIsAddingClient(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get compliance level badge color
  const getComplianceBadgeColor = (level) => {
    switch (level) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Building className="w-5 h-5 text-blue-600" />
          Client Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Client Selector Dropdown */}
          <div className="relative">
            <div 
              className="flex items-center justify-between p-3 border rounded-md cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{selectedClient.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getComplianceBadgeColor(selectedClient.complianceLevel)}`}>
                  {selectedClient.complianceLevel}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
            </div>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                {clients.map(client => (
                  <div 
                    key={client.id}
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 ${selectedClient.id === client.id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{client.name}</span>
                      <span className="text-sm text-gray-500">{client.industry}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getComplianceBadgeColor(client.complianceLevel)}`}>
                      {client.complianceLevel}
                    </span>
                  </div>
                ))}
                
                <div 
                  className="flex items-center justify-center p-2 border-t cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsAddingClient(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Add New Client</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Add Client Form */}
          {isAddingClient && (
            <div className="p-4 border rounded-md bg-gray-50">
              <h4 className="font-medium mb-3">Add New Client</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Client Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newClient.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter client name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={newClient.industry}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter industry"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Compliance Level</label>
                  <select
                    name="complianceLevel"
                    value={newClient.complianceLevel}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddClient}>
                    Add Client
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingClient(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Client Info */}
          <div className="p-4 border rounded-md bg-gray-50">
            <h4 className="font-medium mb-3">Client Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{selectedClient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Industry:</span>
                <span>{selectedClient.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compliance Level:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getComplianceBadgeColor(selectedClient.complianceLevel)}`}>
                  {selectedClient.complianceLevel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientSelector; 