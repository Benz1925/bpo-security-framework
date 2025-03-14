"use client";

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bell, X, Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const AlertNotificationPanel = ({ alerts, clearAlerts, dismissAlert, maxAlerts = 4, horizontal = false }) => {
  // Function to get the appropriate icon based on alert type
  const getAlertIcon = (type) => {
    switch(type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // Limit the number of visible alerts
  const visibleAlerts = alerts ? alerts.slice(0, maxAlerts) : [];
  const hiddenAlertsCount = Math.max(0, alerts ? alerts.length - maxAlerts : 0);
  const hasAlerts = alerts && alerts.length > 0;

  // Always render the Card component with the same structure, just empty content when no alerts
  return (
    <Card className={`shadow-md border transition-all duration-300 ease-in-out ${horizontal ? 'min-h-[60px]' : ''} ${hasAlerts && alerts.some(a => a.type === 'error') ? 'border-l-4 border-l-red-500 bg-red-50' : 'border-gray-200'}`}>
      <CardHeader className={`pb-2 bg-gray-50 rounded-t-lg ${horizontal ? 'py-2' : ''}`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="relative">
              <Bell className={`h-5 w-5 ${hasAlerts && alerts.some(a => a.type === 'error') ? 'text-red-500' : 'text-blue-500'}`} />
              {hasAlerts && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {alerts.length > 9 ? '9+' : alerts.length}
                </span>
              )}
            </div>
            Alerts
          </CardTitle>
          {hasAlerts && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAlerts}
              className="text-xs text-gray-500 hover:text-gray-700 py-1 h-7"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={`${hasAlerts ? (horizontal ? 'p-2' : 'p-3') : 'py-4'}`}>
        {hasAlerts ? (
          <div className={`${horizontal ? 'flex flex-wrap gap-2' : 'space-y-2'}`}>
            {visibleAlerts.map((alert, index) => (
              <Alert 
                key={alert.id || index} 
                variant={alert.type === 'error' ? 'destructive' : 'default'}
                className={`shadow-sm relative ${
                  horizontal ? 'flex-1 min-w-[200px] max-w-[300px] p-3' : ''
                } ${
                  alert.type === 'success' ? 'border-green-100 bg-green-50 text-green-800' : 
                  alert.type === 'error' ? 'border-red-200 bg-red-100 text-red-800 font-medium' : 
                  alert.type === 'info' ? 'border-blue-100 bg-blue-50 text-blue-800' : 
                  alert.type === 'warning' ? 'border-amber-100 bg-amber-50 text-amber-800' : ''
                }`}
              >
                <div className="flex items-start pr-6">
                  <div className="flex-shrink-0 mr-2">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <AlertDescription className="text-sm">
                      {alert.message}
                    </AlertDescription>
                    <span className="text-xs text-gray-500 block mt-1">{alert.timestamp}</span>
                  </div>
                  <button 
                    onClick={() => dismissAlert(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Alert>
            ))}
            
            {hiddenAlertsCount > 0 && (
              <div className={`text-sm text-gray-500 ${horizontal ? 'self-center flex-shrink-0' : 'text-center pt-1'}`}>
                +{hiddenAlertsCount} more notification{hiddenAlertsCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        ) : (
          <div className={`text-center py-2 text-gray-500 text-sm ${horizontal ? 'min-h-[40px] flex items-center justify-center' : ''}`}>
            <p>No notifications</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertNotificationPanel; 