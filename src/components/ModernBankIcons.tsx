import { Building2, Landmark, CreditCard, Banknote, TrendingUp, Shield, Zap, Globe } from 'lucide-react';

export const BankIcon = ({ bankName, className = "w-8 h-8" }: { bankName: string, className?: string }) => {
  const getBankIcon = (name: string) => {
    const bankName = name.toLowerCase();
    
    if (bankName.includes('bank of america') || bankName.includes('bac')) {
      return <Building2 className={`${className} text-red-600`} />;
    }
    if (bankName.includes('wells fargo') || bankName.includes('wfc')) {
      return <Landmark className={`${className} text-yellow-600`} />;
    }
    if (bankName.includes('jpmorgan') || bankName.includes('chase') || bankName.includes('jpm')) {
      return <Shield className={`${className} text-blue-600`} />;
    }
    if (bankName.includes('citibank') || bankName.includes('citi')) {
      return <Globe className={`${className} text-blue-500`} />;
    }
    if (bankName.includes('u.s. bank') || bankName.includes('usb')) {
      return <TrendingUp className={`${className} text-red-500`} />;
    }
    if (bankName.includes('pnc')) {
      return <Building2 className={`${className} text-orange-600`} />;
    }
    if (bankName.includes('capital one') || bankName.includes('cof')) {
      return <CreditCard className={`${className} text-red-700`} />;
    }
    if (bankName.includes('td bank') || bankName.includes('td')) {
      return <Zap className={`${className} text-green-600`} />;
    }
    if (bankName.includes('regions')) {
      return <Landmark className={`${className} text-green-700`} />;
    }
    if (bankName.includes('fifth third') || bankName.includes('53')) {
      return <Banknote className={`${className} text-blue-700`} />;
    }
    
    // Default bank icon
    return <Building2 className={`${className} text-primary`} />;
  };

  return (
    <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50">
      {getBankIcon(bankName)}
    </div>
  );
};

export const modernBanks = [
  { 
    name: 'Bank of America', 
    code: 'BAC', 
    icon: 'building2',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  { 
    name: 'Wells Fargo', 
    code: 'WFC', 
    icon: 'landmark',
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50'
  },
  { 
    name: 'JPMorgan Chase', 
    code: 'JPM', 
    icon: 'shield',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    name: 'Citibank', 
    code: 'CITI', 
    icon: 'globe',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  { 
    name: 'U.S. Bank', 
    code: 'USB', 
    icon: 'trending-up',
    color: 'text-red-500',
    bgColor: 'bg-red-50'
  },
  { 
    name: 'PNC Bank', 
    code: 'PNC', 
    icon: 'building2',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  { 
    name: 'Capital One', 
    code: 'COF', 
    icon: 'credit-card',
    color: 'text-red-700',
    bgColor: 'bg-red-50'
  },
  { 
    name: 'TD Bank', 
    code: 'TD', 
    icon: 'zap',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    name: 'Regions Bank', 
    code: 'RF', 
    icon: 'landmark',
    color: 'text-green-700',
    bgColor: 'bg-green-50'
  },
  { 
    name: 'Fifth Third Bank', 
    code: '53', 
    icon: 'banknote',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50'
  }
];