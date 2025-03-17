"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Search, Calendar, Download } from 'lucide-react';

// Mock data based on the SQL query results
const MOCK_SECURITY_EVENTS = [
  {
    eventId: "SEC-4625",
    eventType: "Unauthorized Access",
    timestamp: "2025-03-17 14:23:15",
    sourceIp: "192.168.1.45",
    description: "Access attempt to /Sensitive/"
  },
  {
    eventId: "SEC-4621",
    eventType: "Unauthorized Access",
    timestamp: "2025-03-16 09:45:22",
    sourceIp: "192.168.1.22",
    description: "Multiple login attempts"
  },
  {
    eventId: "SEC-4589",
    eventType: "Unauthorized Access",
    timestamp: "2025-03-15 17:12:08",
    sourceIp: "192.168.1.45",
    description: "Attempted folder traversal"
  },
  {
    eventId: "SEC-4534",
    eventType: "Unauthorized Access",
    timestamp: "2025-03-10 11:03:45",
    sourceIp: "192.168.1.110",
    description: "Privilege escalation attempt"
  },
  {
    eventId: "SEC-4498",
    eventType: "Unauthorized Access",
    timestamp: "2025-03-08 22:17:39",
    sourceIp: "192.168.1.85",
    description: "Off-hours login attempt"
  },
  {
    eventId: "SEC-4452",
    eventType: "Unauthorized Access",
    timestamp: "2025-03-05 14:48:10",
    sourceIp: "192.168.1.45",
    description: "Unauthorized file access"
  }
];

const SecurityEventsTable = ({ showTitle = true, limitRows, className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter events based on search term
  const filteredEvents = MOCK_SECURITY_EVENTS.filter(event => 
    event.eventId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.sourceIp.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Limit the number of rows if specified
  const displayEvents = limitRows ? filteredEvents.slice(0, limitRows) : filteredEvents;
  
  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader className="pb-3">
        {showTitle && (
          <>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <CardTitle>Security Events</CardTitle>
            </div>
            <CardDescription>
              Recent unauthorized access attempts detected in your environment
            </CardDescription>
          </>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="text" 
              placeholder="Search events..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <Calendar className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Event ID</TableHead>
                <TableHead className="w-[150px]">Event Type</TableHead>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[120px]">Source IP</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayEvents.length > 0 ? (
                displayEvents.map((event) => (
                  <TableRow key={event.eventId}>
                    <TableCell className="font-medium">{event.eventId}</TableCell>
                    <TableCell className="text-red-600 font-medium">{event.eventType}</TableCell>
                    <TableCell>{event.timestamp}</TableCell>
                    <TableCell>{event.sourceIp}</TableCell>
                    <TableCell>{event.description}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No security events found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {!limitRows && filteredEvents.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <div>
              Showing {filteredEvents.length} out of {MOCK_SECURITY_EVENTS.length} events
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityEventsTable; 