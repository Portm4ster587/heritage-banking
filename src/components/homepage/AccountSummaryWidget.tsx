import { Eye, EyeOff, Copy, Check, Building2 } from "lucide-react";
import { useState } from "react";
import { HeritageSVGLogo } from "../HeritageSVGLogo";

export const AccountSummaryWidget = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const heritageRouting = "021000021";
  const sampleAccountNumber = "8847291034";
  const totalBalance = 2333287.00;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-[#0a1628] rounded-2xl overflow-hidden shadow-2xl border border-heritage-gold/20">
      {/* Header with Logo */}
      <div className="bg-gradient-to-r from-[#0d2140] to-[#1a365d] p-6 border-b border-heritage-gold/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <HeritageSVGLogo size="lg" className="animate-pulse" />
            <div>
              <h3 className="text-2xl font-bold text-heritage-gold tracking-wide">HERITAGE</h3>
              <p className="text-heritage-gold/80 text-sm">BANK</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-heritage-gold/60 text-xs">Heritage US</p>
            <p className="text-white font-mono text-sm">Ecosystem Account</p>
          </div>
        </div>
      </div>

      {/* Balance Section - Navy Blue Container */}
      <div className="bg-[#0d2140] p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-heritage-gold/80 text-sm font-medium">Available Balance</p>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="text-heritage-gold hover:text-heritage-gold/80 transition-colors"
          >
            {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-4xl font-bold text-white mb-2 tracking-wide">
          {showBalance ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
        </p>
        <p className="text-heritage-gold/60 text-xs">USD - United States Dollar</p>
      </div>

      {/* Account Details - Navy Blue Container */}
      <div className="bg-[#0a1628] p-6 space-y-4">
        {/* Account Number */}
        <div className="bg-[#0d2140] rounded-xl p-4 border border-heritage-gold/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-heritage-gold/60 text-xs mb-1">Account Number</p>
              <p className="text-white font-mono text-lg tracking-wider">
                {showBalance ? sampleAccountNumber : '•••• •••• ••••'}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(sampleAccountNumber, 'account')}
              className="text-heritage-gold hover:text-heritage-gold/80 transition-colors p-2"
            >
              {copied === 'account' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Routing Number */}
        <div className="bg-[#0d2140] rounded-xl p-4 border border-heritage-gold/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-heritage-gold/60 text-xs mb-1">Heritage US Routing Number</p>
              <p className="text-white font-mono text-lg tracking-wider">{heritageRouting}</p>
            </div>
            <button
              onClick={() => copyToClipboard(heritageRouting, 'routing')}
              className="text-heritage-gold hover:text-heritage-gold/80 transition-colors p-2"
            >
              {copied === 'routing' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Bank Info */}
        <div className="bg-[#0d2140] rounded-xl p-4 border border-heritage-gold/10">
          <div className="flex items-center space-x-3">
            <Building2 className="w-5 h-5 text-heritage-gold" />
            <div>
              <p className="text-heritage-gold/60 text-xs">Bank Name</p>
              <p className="text-white font-semibold">Heritage Bank US</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-[#0d2140] to-[#1a365d] p-4 border-t border-heritage-gold/20">
        <div className="flex items-center justify-between text-xs">
          <span className="text-heritage-gold/60">FDIC Insured • Member FDIC</span>
          <span className="text-heritage-gold font-semibold">Since 1892</span>
        </div>
      </div>
    </div>
  );
};
