
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FinancialAdvice, Transaction, BankAccount, Investment, Loan, Insurance, Business } from '@/api/entities';
import { User } from '@/api/entities';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, CreditCard, PiggyBank, Calculator, DollarSign, Briefcase, FileText, Heart, HelpCircle } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'spending': return <CreditCard className="w-4 h-4" />;
    case 'savings': return <PiggyBank className="w-4 h-4" />;
    case 'investments': return <Coins className="w-4 h-4" />;
    case 'debt': return <Calculator className="w-4 h-4" />;
    case 'budgeting': return <DollarSign className="w-4 h-4" />;
    case 'business': return <Briefcase className="w-4 h-4" />;
    case 'taxes': return <FileText className="w-4 h-4" />;
    case 'insurance': return <Heart className="w-4 h-4" />;
    default: return <HelpCircle className="w-4 h-4" />;
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'spending': return 'bg-red-900/30 text-red-400 border-red-800';
    case 'savings': return 'bg-blue-900/30 text-blue-400 border-blue-800';
    case 'investments': return 'bg-green-900/30 text-green-400 border-green-800';
    case 'debt': return 'bg-orange-900/30 text-orange-400 border-orange-800';
    case 'budgeting': return 'bg-yellow-900/30 text-yellow-400 border-yellow-800';
    case 'business': return 'bg-purple-900/30 text-purple-400 border-purple-800';
    case 'taxes': return 'bg-indigo-900/30 text-indigo-400 border-indigo-800';
    case 'insurance': return 'bg-pink-900/30 text-pink-400 border-pink-800';
    default: return 'bg-gray-900/30 text-gray-400 border-gray-800';
  }
};

export default function QuickQuestions({ questions, onAdviceGiven }) {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequiredData = async (contextTypes) => {
    const data = {};
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    try {
      // Get current user
      const currentUser = await User.me();
      data.user = currentUser;

      // Fetch data based on required context
      if (contextTypes.includes('transactions')) {
        // Get transactions for current and previous month
        const currentMonthTransactions = await Transaction.filter({
          date: {
            $gte: format(startOfCurrentMonth, 'yyyy-MM-dd'),
            $lte: format(endOfCurrentMonth, 'yyyy-MM-dd')
          }
        });

        const previousMonthTransactions = await Transaction.filter({
          date: {
            $gte: format(startOfLastMonth, 'yyyy-MM-dd'),
            $lte: format(endOfLastMonth, 'yyyy-MM-dd')
          }
        });

        data.transactions = {
          current: currentMonthTransactions,
          previous: previousMonthTransactions
        };
      }

      if (contextTypes.includes('accounts')) {
        data.accounts = await BankAccount.list();
      }

      if (contextTypes.includes('investments')) {
        data.investments = await Investment.list();
      }

      if (contextTypes.includes('loans')) {
        data.loans = await Loan.list();
      }

      if (contextTypes.includes('insurance')) {
        data.insurance = await Insurance.list();
      }

      if (contextTypes.includes('business')) {
        data.business = await Business.list();
      }

      return data;
    } catch (error) {
      console.error('Error fetching required data:', error);
      throw new Error('Could not fetch required data');
    }
  };

  const generateNetWorthAnswer = (question, data) => {
    if (question.question.includes('changed over the past year')) {
        const assets = data.assets || [];
        const investments = data.investments || [];
        const loans = data.loans || [];
        
        const totalAssets = assets.reduce((sum, asset) => sum + (asset.current_value || 0), 0);
        const totalInvestments = investments.reduce((sum, inv) => sum + (inv.current_amount || 0), 0);
        const totalLoans = loans.reduce((sum, loan) => sum + (loan.current_balance || 0), 0);
        
        const currentNetWorth = totalAssets + totalInvestments - totalLoans;
        
        // Calculate past year values (if available)
        const pastYearAssets = assets.reduce((sum, asset) => sum + (asset.purchase_value || asset.current_value || 0), 0);
        const pastYearInvestments = investments.reduce((sum, inv) => sum + (inv.initial_amount || 0), 0);
        const pastYearLoans = loans.reduce((sum, loan) => sum + (loan.initial_amount || 0), 0);
        
        const pastYearNetWorth = pastYearAssets + pastYearInvestments - pastYearLoans;
        
        const change = currentNetWorth - pastYearNetWorth;
        const percentChange = ((change / Math.abs(pastYearNetWorth)) * 100).toFixed(1);
        
        let answer = `Your current net worth is ${currentNetWorth.toFixed(2)}. `;
        
        if (change > 0) {
            answer += `It has increased by ${change.toFixed(2)} (${percentChange}%) over the past year.`;
        } else if (change < 0) {
            answer += `It has decreased by ${Math.abs(change).toFixed(2)} (${Math.abs(parseFloat(percentChange)).toFixed(1)}%) over the past year.`;
        } else {
            answer += `It has remained stable over the past year.`;
        }
        
        return answer;
    }
    
    if (question.question.includes('contributing most')) {
        const assets = data.assets || [];
        const investments = data.investments || [];
        
        const assetChanges = assets.map(asset => ({
            name: asset.name,
            type: 'asset',
            change: (asset.current_value || 0) - (asset.purchase_value || asset.current_value || 0)
        }));
        
        const investmentChanges = investments.map(inv => ({
            name: inv.name,
            type: 'investment',
            change: (inv.current_amount || 0) - (inv.initial_amount || 0)
        }));
        
        const allChanges = [...assetChanges, ...investmentChanges]
            .sort((a, b) => b.change - a.change);
        
        if (allChanges.length === 0) {
            return "I don't have enough historical data to determine what's contributing to your net worth changes.";
        }
        
        const topContributors = allChanges.slice(0, 3);
        let answer = `Here are your top contributors to net worth growth:\n`;
        
        topContributors.forEach((item, index) => {
            if (item.change > 0) {
                answer += `\n${index + 1}. ${item.name} (${item.type}): +${item.change.toFixed(2)}`;
            }
        });
        
        const negativeContributors = allChanges.filter(item => item.change < 0)
            .slice(0, 2);
        
        if (negativeContributors.length > 0) {
            answer += `\n\nAreas showing decline:\n`;
            negativeContributors.forEach((item, index) => {
                answer += `\n${index + 1}. ${item.name} (${item.type}): ${item.change.toFixed(2)}`;
            });
        }
        
        return answer;
    }
    
    return "I need more specific information about your net worth to provide an analysis.";
};

const generateAccountSpecificAnswer = (question, data) => {
    if (question.question.includes('highest fees')) {
        const transactions = [...(data.transactions?.current || []), ...(data.transactions?.previous || [])];
        const accounts = data.accounts || [];
        
        const feesByAccount = {};
        
        transactions.forEach(tx => {
            if (tx.category?.toLowerCase().includes('fee') || tx.description?.toLowerCase().includes('fee')) {
                if (!feesByAccount[tx.bank_account_id]) {
                    feesByAccount[tx.bank_account_id] = 0;
                }
                feesByAccount[tx.bank_account_id] += tx.amount;
            }
        });
        
        const accountFees = Object.entries(feesByAccount)
            .map(([accountId, fees]) => ({
                account: accounts.find(a => a.id === accountId)?.name || 'Unknown Account',
                fees
            }))
            .sort((a, b) => b.fees - a.fees);
        
        if (accountFees.length === 0) {
            return "I don't see any significant fees in your accounts over the analyzed period.";
        }
        
        let answer = `Here's a breakdown of fees by account:\n`;
        accountFees.forEach(({ account, fees }) => {
            answer += `\n${account}: ${fees.toFixed(2)} in fees`;
        });
        
        if (accountFees[0].fees > 0) {
            answer += `\n\nConsider reviewing the fees in ${accountFees[0].account} as it has the highest charges.`;
        }
        
        return answer;
    }
    
    return "I need more specific information about your accounts to provide an analysis.";
};

const generateCreditCardAnswer = (question, data) => {
    if (question.question.includes('credit utilization')) {
        const cards = data.credit_cards || [];
        
        if (cards.length === 0) {
            return "You don't have any credit cards tracked in the system.";
        }
        
        let totalLimit = 0;
        let totalUsed = 0;
        const cardUtilization = [];
        
        cards.forEach(card => {
            const limit = card.spending_limit || 0;
            const used = calculateCardUsage(card, data.transactions?.current || []);
            
            totalLimit += limit;
            totalUsed += used;
            
            cardUtilization.push({
                name: card.name,
                utilization: limit > 0 ? (used / limit) * 100 : 0,
                used,
                limit
            });
        });
        
        const overallUtilization = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;
        
        let answer = `Your overall credit utilization is ${overallUtilization.toFixed(1)}%.\n`;
        
        if (overallUtilization > 30) {
            answer += "\nThis is higher than the recommended 30% utilization rate. Consider paying down some balances.";
        } else {
            answer += "\nThis is within the recommended range (below 30%).";
        }
        
        answer += "\n\nBreakdown by card:";
        cardUtilization.forEach(card => {
            answer += `\n${card.name}: ${card.utilization.toFixed(1)}% (${card.used.toFixed(2)} of ${card.limit.toFixed(2)})`;
        });
        
        return answer;
    }
    
    return "I need more specific information about your credit cards to provide an analysis.";
};

// Helper function for credit card calculations
const calculateCardUsage = (card, transactions) => {
    return transactions
        .filter(tx => tx.credit_card_id === card.id && tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
};

  const generateAnswer = (question, data) => {
    let answer = '';

    try {
      // Simple rule-based answers based on question category
      switch (question.category) {
        case 'spending':
          answer = generateSpendingAnswer(question, data);
          break;
        case 'savings':
          answer = generateSavingsAnswer(question, data);
          break;
        case 'investments':
          answer = generateInvestmentsAnswer(question, data);
          break;
        case 'debt':
          answer = generateDebtAnswer(question, data);
          break;
        case 'budgeting':
          answer = generateBudgetingAnswer(question, data);
          break;
        case 'business':
          answer = generateBusinessAnswer(question, data);
          break;
        case 'taxes':
          answer = generateTaxesAnswer(question, data);
          break;
        case 'insurance':
          answer = generateInsuranceAnswer(question, data);
          break;
            case 'net_worth':
                answer = generateNetWorthAnswer(question, data);
                break;
            case 'accounts':
                answer = generateAccountSpecificAnswer(question, data);
                break;
            case 'credit_cards':
                answer = generateCreditCardAnswer(question, data);
                break;
        default:
          answer = "I don't have enough information to answer this question right now.";
      }
    } catch (error) {
      console.error('Error generating answer:', error);
      answer = "Sorry, I couldn't generate an answer based on your available data.";
    }

    return answer;
  };

  const generateSpendingAnswer = (question, data) => {
    if (question.question.includes('top spending')) {
      // Calculate top spending categories
      const currentMonthTransactions = data.transactions?.current || [];
      const expenseTransactions = currentMonthTransactions.filter(t => t.type === 'expense');
      
      // Group transactions by category and sum amounts
      const categoriesMap = expenseTransactions.reduce((acc, tx) => {
        const category = tx.category || 'Uncategorized';
        if (!acc[category]) acc[category] = 0;
        acc[category] += tx.amount;
        return acc;
      }, {});

      // Convert to array and sort by amount
      const sortedCategories = Object.entries(categoriesMap)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5); // Top 5 categories
      
      if (sortedCategories.length === 0) {
        return "I don't see any spending transactions for this month yet.";
      }
      
      const topCategory = sortedCategories[0];
      const totalSpent = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      let answer = `Your top spending category this month is ${topCategory.category} at ${topCategory.amount.toFixed(2)}, which represents about ${((topCategory.amount / totalSpent) * 100).toFixed(1)}% of your total spending.`;
      
      if (sortedCategories.length > 1) {
        answer += "\n\nHere are your top spending categories this month:\n";
        sortedCategories.forEach((cat, index) => {
          answer += `${index + 1}. ${cat.category}: ${cat.amount.toFixed(2)} (${((cat.amount / totalSpent) * 100).toFixed(1)}%)\n`;
        });
      }
      
      return answer;
    }
    
    return "I need more information to analyze your spending patterns.";
  };

  const generateSavingsAnswer = (question, data) => {
    if (question.question.includes('compared to last month')) {
      const currentMonthTransactions = data.transactions?.current || [];
      const previousMonthTransactions = data.transactions?.previous || [];
      
      // Calculate income and expenses for current month
      const currentIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const currentExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      // Calculate income and expenses for previous month
      const prevIncome = previousMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const prevExpenses = previousMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      // Calculate savings
      const currentSavings = currentIncome - currentExpenses;
      const prevSavings = prevIncome - prevExpenses;
      const savingsDifference = currentSavings - prevSavings;
      
      let answer = '';
      if (currentMonthTransactions.length === 0) {
        answer = "I don't see any transactions for the current month yet.";
      } else if (previousMonthTransactions.length === 0) {
        answer = `Your savings this month so far is ${currentSavings.toFixed(2)}. I don't have data from last month to compare.`;
      } else {
        const percentChange = prevSavings !== 0 
          ? ((savingsDifference / Math.abs(prevSavings)) * 100).toFixed(1) 
          : 'N/A';
        
        if (savingsDifference > 0) {
          answer = `Great job! You saved ${savingsDifference.toFixed(2)} more this month compared to last month (${percentChange}% increase).`;
        } else if (savingsDifference < 0) {
          answer = `You saved ${Math.abs(savingsDifference).toFixed(2)} less this month compared to last month (${Math.abs(parseFloat(percentChange)).toFixed(1)}% decrease).`;
        } else {
          answer = `Your savings remain consistent at ${currentSavings.toFixed(2)} compared to last month.`;
        }
        
        answer += `\n\nCurrent month: Income ${currentIncome.toFixed(2)} - Expenses ${currentExpenses.toFixed(2)} = Savings ${currentSavings.toFixed(2)}`;
        answer += `\nPrevious month: Income ${prevIncome.toFixed(2)} - Expenses ${prevExpenses.toFixed(2)} = Savings ${prevSavings.toFixed(2)}`;
      }
      
      return answer;
    }
    
    return "I need more specific information about your savings to provide an analysis.";
  };

  const generateInvestmentsAnswer = (question, data) => {
    if (question.question.includes('portfolio performing')) {
      const investments = data.investments || [];
      
      if (investments.length === 0) {
        return "You don't have any investments tracked in the system yet.";
      }
      
      let totalInitial = 0;
      let totalCurrent = 0;
      let gainLossByType = {};
      
      investments.forEach(inv => {
        const initialAmount = inv.initial_amount || 0;
        const currentAmount = inv.current_amount || initialAmount;
        
        totalInitial += initialAmount;
        totalCurrent += currentAmount;
        
        if (!gainLossByType[inv.type]) {
          gainLossByType[inv.type] = {
            initial: 0,
            current: 0
          };
        }
        
        gainLossByType[inv.type].initial += initialAmount;
        gainLossByType[inv.type].current += currentAmount;
      });
      
      const totalGainLoss = totalCurrent - totalInitial;
      const percentChange = ((totalGainLoss / totalInitial) * 100).toFixed(2);
      
      let answer = totalGainLoss >= 0 
        ? `Your investment portfolio is up by ${totalGainLoss.toFixed(2)} (${percentChange}% gain) from your initial investment of ${totalInitial.toFixed(2)}.`
        : `Your investment portfolio is down by ${Math.abs(totalGainLoss).toFixed(2)} (${Math.abs(parseFloat(percentChange)).toFixed(2)}% loss) from your initial investment of ${totalInitial.toFixed(2)}.`;
      
      answer += "\n\nBreakdown by investment type:";
      
      for (const [type, amounts] of Object.entries(gainLossByType)) {
        const typeDiff = amounts.current - amounts.initial;
        const typePercent = ((typeDiff / amounts.initial) * 100).toFixed(2);
        
        answer += `\n- ${type.charAt(0).toUpperCase() + type.slice(1)}: `;
        
        if (typeDiff >= 0) {
          answer += `${typeDiff.toFixed(2)} gain (${typePercent}%)`;
        } else {
          answer += `${Math.abs(typeDiff).toFixed(2)} loss (${Math.abs(parseFloat(typePercent)).toFixed(2)}%)`;
        }
      }
      
      return answer;
    }
    
    return "I need more specific information about your investments to provide an analysis.";
  };

  const generateDebtAnswer = (question, data) => {
    if (question.question.includes('debt-to-income')) {
      const loans = data.loans || [];
      const currentMonthTransactions = data.transactions?.current || [];
      
      if (loans.length === 0) {
        return "You don't have any loans tracked in the system yet.";
      }
      
      if (currentMonthTransactions.length === 0) {
        return "I need current income data to calculate your debt-to-income ratio.";
      }
      
      // Calculate monthly debt payments
      const monthlyDebtPayments = loans.reduce((sum, loan) => {
        return sum + (loan.payment_amount || 0);
      }, 0);
      
      // Calculate monthly income
      const monthlyIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      if (monthlyIncome === 0) {
        return "I don't see any income transactions for this month yet.";
      }
      
      // Calculate debt-to-income ratio
      const dtiRatio = (monthlyDebtPayments / monthlyIncome) * 100;
      
      let answer = `Your current debt-to-income (DTI) ratio is approximately ${dtiRatio.toFixed(2)}%.`;
      
      // Provide context based on the ratio
      if (dtiRatio < 20) {
        answer += " This is considered excellent! Lenders typically prefer a DTI ratio below 36%.";
      } else if (dtiRatio < 36) {
        answer += " This is considered good. Lenders typically prefer a DTI ratio below 36%.";
      } else if (dtiRatio < 43) {
        answer += " This is getting on the higher side. Many lenders prefer a DTI ratio below 36%, though up to 43% is often acceptable for home loans.";
      } else {
        answer += " This is relatively high. Most lenders prefer a DTI ratio below 43%. You might want to consider strategies to reduce your debt or increase your income.";
      }
      
      answer += `\n\nYour monthly debt payments total: ${monthlyDebtPayments.toFixed(2)}`;
      answer += `\nYour monthly income: ${monthlyIncome.toFixed(2)}`;
      
      return answer;
    }
    
    return "I need more specific information about your debt to provide an analysis.";
  };

  const generateBudgetingAnswer = (question, data) => {
    // This is a simplified example. In a real app, you would have a budget entity to compare against.
    if (question.question.includes('on track')) {
      const currentMonthTransactions = data.transactions?.current || [];
      
      if (currentMonthTransactions.length === 0) {
        return "I don't see any transactions for the current month yet.";
      }
      
      // Group expenses by category
      const expensesByCategory = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, tx) => {
          const category = tx.category || 'Uncategorized';
          if (!acc[category]) acc[category] = 0;
          acc[category] += tx.amount;
          return acc;
        }, {});
      
      // In a real app, you would compare with budget limits
      // Here, we'll just give an overview of spending
      const totalSpent = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
      
      let answer = `This month, you've spent a total of ${totalSpent.toFixed(2)}.`;
      
      answer += "\n\nBreakdown by category:";
      Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, amount]) => {
          const percentage = ((amount / totalSpent) * 100).toFixed(1);
          answer += `\n- ${category}: ${amount.toFixed(2)} (${percentage}%)`;
        });
      
      return answer;
    }
    
    return "Without a defined budget, I can only show your spending patterns.";
  };

  const generateBusinessAnswer = (question, data) => {
    if (question.question.includes('largest expenses')) {
      const businesses = data.business || [];
      
      if (businesses.length === 0) {
        return "You don't have any businesses set up in the system.";
      }
      
      const currentMonthTransactions = data.transactions?.current || [];
      const previousMonthTransactions = data.transactions?.previous || [];
      
      // Combine last 3 months of transactions to get quarterly data
      const allTransactions = [...currentMonthTransactions, ...previousMonthTransactions];
      
      // Filter business expenses
      const businessExpenses = allTransactions.filter(tx => 
        tx.type === 'expense' && 
        tx.is_business === true
      );
      
      if (businessExpenses.length === 0) {
        return "I don't see any business expenses in the last quarter.";
      }
      
      // Group by business and category
      const expensesByBusiness = {};
      
      businessExpenses.forEach(tx => {
        const businessId = tx.business_id;
        const category = tx.business_category || tx.category || 'Uncategorized';
        
        if (!expensesByBusiness[businessId]) {
          expensesByBusiness[businessId] = {
            total: 0,
            categories: {}
          };
        }
        
        expensesByBusiness[businessId].total += tx.amount;
        
        if (!expensesByBusiness[businessId].categories[category]) {
          expensesByBusiness[businessId].categories[category] = 0;
        }
        
        expensesByBusiness[businessId].categories[category] += tx.amount;
      });
      
      let answer = "Here are your largest business expenses this quarter:\n";
      
      // For each business, show top expenses
      for (const businessId in expensesByBusiness) {
        const business = businesses.find(b => b.id === businessId) || { name: 'Unknown Business' };
        
        answer += `\n${business.name}:\n`;
        answer += `Total expenses: ${expensesByBusiness[businessId].total.toFixed(2)}\n`;
        
        // Get top 5 categories
        const topCategories = Object.entries(expensesByBusiness[businessId].categories)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        topCategories.forEach(([category, amount], index) => {
          const percentage = ((amount / expensesByBusiness[businessId].total) * 100).toFixed(1);
          answer += `${index + 1}. ${category}: ${amount.toFixed(2)} (${percentage}%)\n`;
        });
      }
      
      return answer;
    }
    
    return "I need more specific information about your business to provide an analysis.";
  };

  const generateTaxesAnswer = (question, data) => {
    if (question.question.includes('set aside for taxes')) {
      const currentMonthTransactions = data.transactions?.current || [];
      const previousMonthTransactions = data.transactions?.previous || [];
      
      // Combine transactions from current year
      const allTransactions = [...currentMonthTransactions, ...previousMonthTransactions];
      
      // Filter tax-related transactions
      const taxTransactions = allTransactions.filter(tx => 
        (tx.category === 'Taxes' || tx.subcategory === 'Taxes' || 
         tx.description?.toLowerCase().includes('tax'))
      );
      
      if (taxTransactions.length === 0) {
        return "I don't see any transactions specifically marked for taxes this year.";
      }
      
      // Calculate total tax payments
      const totalTaxPayments = taxTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      return `This year, you've set aside or paid ${totalTaxPayments.toFixed(2)} for taxes based on transactions tagged with tax-related categories or descriptions.`;
    }
    
    return "I need more specific information about your tax planning to provide an analysis.";
  };

  const generateInsuranceAnswer = (question, data) => {
    if (question.question.includes('due for renewal')) {
      const insurancePolicies = data.insurance || [];
      
      if (insurancePolicies.length === 0) {
        return "You don't have any insurance policies tracked in the system.";
      }
      
      const now = new Date();
      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(now.getDate() + 60);
      
      // Find policies due for renewal in the next 60 days
      const upcomingRenewals = insurancePolicies.filter(policy => {
        if (!policy.renewal_date) return false;
        
        const renewalDate = new Date(policy.renewal_date);
        return renewalDate >= now && renewalDate <= sixtyDaysFromNow;
      });
      
      if (upcomingRenewals.length === 0) {
        return "None of your insurance policies are due for renewal in the next 60 days.";
      }
      
      let answer = "The following insurance policies are due for renewal in the next 60 days:\n";
      
      upcomingRenewals.forEach(policy => {
        const renewalDate = new Date(policy.renewal_date);
        const daysUntilRenewal = Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24));
        
        answer += `\n- ${policy.name} (${policy.type}): due on ${format(renewalDate, 'MMM d, yyyy')} (${daysUntilRenewal} days from now)`;
        
        if (policy.premium_amount) {
          answer += `\n  Premium: ${policy.premium_amount} ${policy.currency} (${policy.premium_frequency})`;
        }
      });
      
      return answer;
    }
    
    return "I need more specific information about your insurance policies to provide an analysis.";
  };

  const handleQuestionClick = async (question) => {
    try {
      setActiveQuestion(question);
      setLoading(true);
      setError(null);
      setAnswer(null);

      // Fetch required data based on question's context_required
      const data = await fetchRequiredData(question.context_required || []);
      
      // Generate answer based on the question and data
      const generatedAnswer = generateAnswer(question, data);

      // Save the advice
      const user = await User.me();
      await FinancialAdvice.create({
        user_id: user.id,
        question_id: question.id,
        answer: generatedAnswer,
        date: new Date().toISOString(),
        category: question.category,
        data_used: data
      });

      setAnswer(generatedAnswer);
      if (onAdviceGiven) onAdviceGiven();
    } catch (err) {
      console.error('Error answering question:', err);
      setError('Could not generate advice at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const resetQuestion = () => {
    setActiveQuestion(null);
    setAnswer(null);
    setError(null);
  };

  const renderCategories = () => {
    // Group questions by category
    const questionsByCategory = questions.reduce((acc, q) => {
      if (!acc[q.category]) acc[q.category] = [];
      acc[q.category].push(q);
      return acc;
    }, {});

    return Object.entries(questionsByCategory).map(([category, questions]) => (
      <div key={category} className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
          {getCategoryIcon(category)}
          <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
        </h3>
        <div className="grid gap-2 md:grid-cols-2">
          {questions.map(question => (
            <Button
              key={question.id}
              variant="outline"
              className={`justify-start text-left h-auto p-4 ${getCategoryColor(category)}`}
              onClick={() => handleQuestionClick(question)}
            >
              <div className="flex flex-col items-start">
                <span>{question.question}</span>
                {question.is_premium && (
                  <Badge className="mt-1 bg-yellow-900/50 text-yellow-400 border-yellow-800">
                    Premium
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>
    ));
  };

  const renderAnswerCard = () => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          {getCategoryIcon(activeQuestion.category)}
          <span>{activeQuestion.question}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full bg-gray-700" />
            <Skeleton className="h-4 w-full bg-gray-700" />
            <Skeleton className="h-4 w-3/4 bg-gray-700" />
          </div>
        ) : error ? (
          <div className="text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-800">
            {error}
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <p className="whitespace-pre-line text-gray-300">{answer}</p>
          </div>
        )}
        <div className="flex justify-end mt-6">
          <Button 
            variant="outline" 
            onClick={resetQuestion}
            className="bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
          >
            Ask Another Question
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      {activeQuestion && answer ? (
        renderAnswerCard()
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="border-b border-gray-700">
            <CardTitle className="text-white">Common Questions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full bg-gray-700" />
                <Skeleton className="h-4 w-full bg-gray-700" />
                <Skeleton className="h-4 w-3/4 bg-gray-700" />
              </div>
            ) : questions.length > 0 ? (
              renderCategories()
            ) : (
              <p className="text-gray-400">No questions available.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
