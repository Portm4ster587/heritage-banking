import { Building2, Landmark, CreditCard, Banknote, TrendingUp, Shield, Zap, Globe, Wallet, DollarSign, Star, Briefcase, Home, Users, PiggyBank } from 'lucide-react';
import acfcuLogo from '@/assets/acfcu-logo.png';

export const BankIcon = ({ bankName, className = "w-8 h-8" }: { bankName: string, className?: string }) => {
  const getBankIcon = (name: string) => {
    const bn = name.toLowerCase();
    
    if (bn.includes('acfcu') || bn.includes('american citizens') || bn.includes("america's credit union")) {
      return <img src={acfcuLogo} alt="ACFCU" className={className} style={{ objectFit: 'contain' }} />;
    }
    if (bn.includes('bank of america') || bn.includes('bac')) {
      return <Building2 className={`${className} text-red-600`} />;
    }
    if (bn.includes('wells fargo') || bn.includes('wfc')) {
      return <Landmark className={`${className} text-yellow-600`} />;
    }
    if (bn.includes('jpmorgan') || bn.includes('chase') || bn.includes('jpm')) {
      return <Shield className={`${className} text-blue-600`} />;
    }
    if (bn.includes('citibank') || bn.includes('citi')) {
      return <Globe className={`${className} text-blue-500`} />;
    }
    if (bn.includes('u.s. bank') || bn.includes('usb')) {
      return <TrendingUp className={`${className} text-red-500`} />;
    }
    if (bn.includes('pnc')) {
      return <Building2 className={`${className} text-orange-600`} />;
    }
    if (bn.includes('capital one') || bn.includes('cof')) {
      return <CreditCard className={`${className} text-red-700`} />;
    }
    if (bn.includes('td bank') || bn.includes('td')) {
      return <Zap className={`${className} text-green-600`} />;
    }
    if (bn.includes('regions')) {
      return <Landmark className={`${className} text-green-700`} />;
    }
    if (bn.includes('fifth third') || bn.includes('53')) {
      return <Banknote className={`${className} text-blue-700`} />;
    }
    if (bn.includes('ally')) {
      return <Star className={`${className} text-purple-600`} />;
    }
    if (bn.includes('truist')) {
      return <Shield className={`${className} text-purple-700`} />;
    }
    if (bn.includes('huntington')) {
      return <Landmark className={`${className} text-green-800`} />;
    }
    if (bn.includes('keybank') || bn.includes('key bank')) {
      return <DollarSign className={`${className} text-blue-800`} />;
    }
    if (bn.includes('m&t bank') || bn.includes('m&t')) {
      return <Building2 className={`${className} text-red-800`} />;
    }
    if (bn.includes('usaa')) {
      return <Shield className={`${className} text-blue-900`} />;
    }
    if (bn.includes('navy federal')) {
      return <Users className={`${className} text-blue-700`} />;
    }
    if (bn.includes('comerica')) {
      return <Briefcase className={`${className} text-green-600`} />;
    }
    if (bn.includes('zions')) {
      return <Landmark className={`${className} text-blue-600`} />;
    }
    if (bn.includes('first citizens')) {
      return <Home className={`${className} text-blue-800`} />;
    }
    if (bn.includes('synchrony')) {
      return <Zap className={`${className} text-orange-500`} />;
    }
    if (bn.includes('citizens bank')) {
      return <Building2 className={`${className} text-green-700`} />;
    }
    if (bn.includes('bmo') || bn.includes('harris')) {
      return <Globe className={`${className} text-blue-600`} />;
    }
    if (bn.includes('woodforest')) {
      return <PiggyBank className={`${className} text-red-600`} />;
    }
    if (bn.includes('suntrust')) {
      return <TrendingUp className={`${className} text-yellow-700`} />;
    }
    if (bn.includes('discover')) {
      return <CreditCard className={`${className} text-orange-600`} />;
    }
    if (bn.includes('charles schwab') || bn.includes('schwab')) {
      return <TrendingUp className={`${className} text-blue-500`} />;
    }
    if (bn.includes('goldman') || bn.includes('marcus')) {
      return <Wallet className={`${className} text-blue-900`} />;
    }
    
    return <Building2 className={`${className} text-primary`} />;
  };

  return (
    <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50">
      {getBankIcon(bankName)}
    </div>
  );
};

export const modernBanks = [
  { name: 'Bank of America', code: 'BAC', icon: 'building2', color: 'text-red-600', bgColor: 'bg-red-50' },
  { name: 'Wells Fargo', code: 'WFC', icon: 'landmark', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { name: 'JPMorgan Chase', code: 'JPM', icon: 'shield', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { name: 'Citibank', code: 'CITI', icon: 'globe', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { name: 'U.S. Bank', code: 'USB', icon: 'trending-up', color: 'text-red-500', bgColor: 'bg-red-50' },
  { name: 'PNC Bank', code: 'PNC', icon: 'building2', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { name: 'Capital One', code: 'COF', icon: 'credit-card', color: 'text-red-700', bgColor: 'bg-red-50' },
  { name: 'TD Bank', code: 'TD', icon: 'zap', color: 'text-green-600', bgColor: 'bg-green-50' },
  { name: 'Regions Bank', code: 'RF', icon: 'landmark', color: 'text-green-700', bgColor: 'bg-green-50' },
  { name: 'Fifth Third Bank', code: '53', icon: 'banknote', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  { name: "ACFCU (America's Credit Union)", code: 'ACFCU', icon: 'shield', color: 'text-blue-800', bgColor: 'bg-blue-50' },
  { name: 'Ally Bank', code: 'ALLY', icon: 'star', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { name: 'Truist Financial', code: 'TFC', icon: 'shield', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  { name: 'Huntington National Bank', code: 'HBAN', icon: 'landmark', color: 'text-green-800', bgColor: 'bg-green-50' },
  { name: 'KeyBank', code: 'KEY', icon: 'dollar-sign', color: 'text-blue-800', bgColor: 'bg-blue-50' },
  { name: 'M&T Bank', code: 'MTB', icon: 'building2', color: 'text-red-800', bgColor: 'bg-red-50' },
  { name: 'USAA Federal Savings', code: 'USAA', icon: 'shield', color: 'text-blue-900', bgColor: 'bg-blue-50' },
  { name: 'Navy Federal Credit Union', code: 'NFCU', icon: 'users', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  { name: 'Comerica Bank', code: 'CMA', icon: 'briefcase', color: 'text-green-600', bgColor: 'bg-green-50' },
  { name: 'Zions Bancorporation', code: 'ZION', icon: 'landmark', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { name: 'First Citizens Bank', code: 'FCNCA', icon: 'home', color: 'text-blue-800', bgColor: 'bg-blue-50' },
  { name: 'Synchrony Bank', code: 'SYF', icon: 'zap', color: 'text-orange-500', bgColor: 'bg-orange-50' },
  { name: 'Citizens Bank', code: 'CFG', icon: 'building2', color: 'text-green-700', bgColor: 'bg-green-50' },
  { name: 'BMO Harris Bank', code: 'BMO', icon: 'globe', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { name: 'Woodforest National Bank', code: 'WNB', icon: 'piggy-bank', color: 'text-red-600', bgColor: 'bg-red-50' },
  { name: 'SunTrust Bank', code: 'STI', icon: 'trending-up', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  { name: 'Discover Bank', code: 'DFS', icon: 'credit-card', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { name: 'Charles Schwab Bank', code: 'SCHW', icon: 'trending-up', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { name: 'Goldman Sachs (Marcus)', code: 'GS', icon: 'wallet', color: 'text-blue-900', bgColor: 'bg-blue-50' },
];
