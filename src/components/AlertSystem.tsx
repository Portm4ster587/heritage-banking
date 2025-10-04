import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertSystemProps {
  type: AlertType;
  title: string;
  message: string;
  className?: string;
}

export const AlertSystem = ({ type, title, message, className }: AlertSystemProps) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'info':
        return <Info className="h-5 w-5 text-heritage-blue" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-success/50 bg-success/5';
      case 'error':
        return 'border-destructive/50 bg-destructive/5';
      case 'warning':
        return 'border-warning/50 bg-warning/5';
      case 'info':
        return 'border-heritage-blue/50 bg-heritage-blue/5';
    }
  };

  return (
    <Alert className={cn('border-2 animate-fade-in', getBorderColor(), className)}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <AlertTitle className="text-base font-semibold mb-1">{title}</AlertTitle>
          <AlertDescription className="text-sm">{message}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
