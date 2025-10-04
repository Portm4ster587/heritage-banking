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
        // Check if account already has a card
        const { data: existingCards } = await supabase
          .from('cards')
          .select('id')
          .eq('account_id', accountId);

        if (existingCards && existingCards.length > 0) {
          return; // Card already exists
        }

        // Generate card details
        const cardNumber = generateCardNumber(accountType);
        const cvv = Math.random().toString().slice(2, 5).padStart(3, '0');
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
            cvv: cvv,
            last4: cardNumber.slice(-4),
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

  return null; // This component doesn't render anything
};

const generateCardNumber = (accountType: string): string => {
  // Generate realistic card numbers based on account type
  const prefixes = {
    'personal_checking': '4532', // Visa
    'personal_savings': '4716',  // Visa
    'business_checking': '5412', // Mastercard
    'business_savings': '5134',  // Mastercard
    'credit': '4000',            // Visa
  };

  const prefix = prefixes[accountType as keyof typeof prefixes] || '4532';
  const remaining = Math.random().toString().slice(2, 14).padStart(12, '0');
  return prefix + remaining;
};

const getCardType = (accountType: string): string => {
  const cardTypes = {
    'personal_checking': 'debit',
    'personal_savings': 'debit',
    'business_checking': 'business-debit',
    'business_savings': 'business-debit',
    'credit': 'credit',
  };

  return cardTypes[accountType as keyof typeof cardTypes] || 'debit';
};