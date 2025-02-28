import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bell, X, Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const AlertNotificationPanel = ({ alerts, clearAlerts, dismissAlert }) => {
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

  return (
    <Card className={`shadow-md mt-4 border ${alerts.some(a => a.type === 'error') ? 'border-l-4 border-l-red-500 bg-red-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-2 bg-gray-50 rounded-t-lg">
        <div className="flex flex-col items-start gap-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="relative">
              <Bell className={`h-5 w-5 ${alerts.some(a => a.type === 'error') ? 'text-red-500' : 'text-blue-500'}`} />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {alerts.length > 9 ? '9+' : alerts.length}
                </span>
              )}
            </div>
            Alerts & Notifications
          </CardTitle>
          {alerts.length > 0 && (
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
      <CardContent className={`${alerts.length > 0 ? 'p-3' : 'py-6'}`}>
        {alerts.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts.map((alert, index) => (
              <Alert 
                key={index} 
                variant={alert.type === 'error' ? 'destructive' : 'default'}
                className={`shadow-sm relative ${
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
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            <Bell className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p>No notifications at this time</p>
            <p className="mt-1 text-xs">Alerts will appear here when you run security tests or perform other actions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertNotificationPanel; 