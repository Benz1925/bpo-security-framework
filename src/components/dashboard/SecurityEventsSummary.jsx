"use client";

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight } from 'lucide-react';

// Mock data based on the SQL query results - using just the first 4 for the summary
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
  }
];

const SecurityEventsSummary = ({ className = "", onViewAll }) => {
  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <CardTitle>Recent Security Events</CardTitle>
          </div>
          <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
            {MOCK_SECURITY_EVENTS.length} incidents
          </div>
        </div>
        <CardDescription>
          Recent unauthorized access attempts detected
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Event ID</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Source IP</TableHead>
              <TableHead className="pr-6">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_SECURITY_EVENTS.map((event) => (
              <TableRow key={event.eventId}>
                <TableCell className="font-medium pl-6">{event.eventId}</TableCell>
                <TableCell>{event.timestamp.split(' ')[0]}</TableCell>
                <TableCell>{event.sourceIp}</TableCell>
                <TableCell className="pr-6">{event.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      
      <CardFooter className="flex justify-end pt-2 pb-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          onClick={onViewAll}
        >
          View all security events
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SecurityEventsSummary; 