"use client";

import React, { useState } from 'react';
import SecurityEventsTable from './dashboard/SecurityEventsTable';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Clock, Filter, BarChart, Map } from 'lucide-react';

const SecurityEvents = ({ client, addAlert }) => {
  const [activeTab, setActiveTab] = useState('all');
  
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center mb-2">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
          <h2 className="text-xl font-bold text-gray-800">Security Events</h2>
        </div>
        <p className="text-gray-500 text-sm">
          Monitor and analyze security incidents across your environment
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="access">Access</TabsTrigger>
                <TabsTrigger value="auth">Authentication</TabsTrigger>
                <TabsTrigger value="data">Data Access</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <SecurityEventsTable 
              showTitle={false} 
              className="shadow-none border-0"
            />
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <BarChart className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle className="text-base">Event Statistics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">Unauthorized Access</div>
                  <div className="flex items-center">
                    <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                      6 events
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">Authentication Failures</div>
                  <div className="flex items-center">
                    <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                      3 events
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">Policy Violations</div>
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      2 events
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">Suspicious Activity</div>
                  <div className="flex items-center">
                    <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                      1 event
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle className="text-base">Trends</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Last 24 hours</div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
                <div className="text-sm text-gray-600">Last 7 days</div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="text-sm text-gray-600">Last 30 days</div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Map className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle className="text-base">Source Locations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">Internal Network</div>
                  <div className="flex items-center">
                    <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                      6 events
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">VPN Connection</div>
                  <div className="flex items-center">
                    <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                      2 events
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">External Network</div>
                  <div className="flex items-center">
                    <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                      4 events
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SecurityEvents; 