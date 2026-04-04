import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AutoCardGenerationProps {
  userId: string;
  accountId: string;
  accountType: string;
}

export const AutoCardGeneration = ({ userId, accountId, accountType }: AutoCardGenerationProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const generateCard = async () => {
      try {
        const { data: existingCards } = await supabase
          .from('cards')
          .select('id')
          .eq('account_id', accountId);

        if (existingCards && existingCards.length > 0) {
          return;
        }

        const last4 = Math.random().toString().slice(2, 6).padStart(4, '0');
        const cardNumber = getCardPrefix(accountType) + '********' + last4;
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 4);
        const expiryText = `${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${String(expiryDate.getFullYear()).slice(-2)}`;
        const cardType = getCardType(accountType);
        const network = Math.random() > 0.5 ? 'VISA' : 'MASTERCARD';

        const { error } = await supabase
          .from('cards')
          .insert([{ 
            account_id: accountId,
            user_id: userId,
            card_type: cardType,
            card_number: cardNumber,
            last4: last4,
            card_network: network,
            expiry_date: expiryText,
            activation_status: 'inactive',
            status: 'pending'
          }]);

        if (error) throw error;

        toast({
          title: "Card Generated!",
          description: `A new ${cardType} card has been created for your account`,
        });

      } catch (error) {
        console.error('Error generating card:', error);
      }
    };

    if (userId && accountId && accountType) {
      generateCard();
    }
  }, [userId, accountId, accountType, toast]);

  return null;
};

const getCardPrefix = (accountType: string): string => {
  const prefixes: Record<string, string> = {
    'personal_checking': '4532',
    'personal_savings': '4716',
    'business_checking': '5412',
    'business_savings': '5134',
    'credit': '4000',
  };
  return prefixes[accountType] || '4532';
};

const getCardType = (accountType: string): string => {
  const cardTypes: Record<string, string> = {
    'personal_checking': 'debit',
    'personal_savings': 'debit',
    'business_checking': 'business-debit',
    'business_savings': 'business-debit',
    'credit': 'credit',
  };
  return cardTypes[accountType] || 'debit';
};