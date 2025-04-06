import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, SendIcon, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancialAdvice, Transaction, BankAccount, Investment, Loan, Insurance, Business } from '@/api/entities';
import { User } from '@/api/entities';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function CustomQuestion({ onAdviceGiven }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('general');

  const determineCategory = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    // Simple keyword matching to determine the likely category
    if (lowerQuestion.includes('spend') || lowerQuestion.includes('purchase') || lowerQuestion.includes('bought')) {
      return 'spending';
    } else if (lowerQuestion.includes('save') || lowerQuestion.includes('saving')) {
      return 'savings';
    } else if (lowerQuestion.includes('invest') || lowerQuestion.includes('portfolio') || lowerQuestion.includes('stock')) {
      return 'investments';
    } else if (lowerQuestion.includes('debt') || lowerQuestion.includes('loan') || lowerQuestion.includes('credit') || lowerQuestion.includes('mortgage')) {
      return 'debt';
    } else if (lowerQuestion.includes('budget') || lowerQuestion.includes('plan') || lowerQuestion.includes('goal')) {
      return 'budgeting';
    } else if (lowerQuestion.includes('business') || lowerQuestion.includes('company') || lowerQuestion.includes('client')) {
      return 'business';
    } else if (lowerQuestion.includes('tax')) {
      return 'taxes';
    } else if (lowerQuestion.includes('insurance') || lowerQuestion.includes('policy') || lowerQuestion.includes('coverage')) {
      return 'insurance';
    }
    
    return 'general';
  };

  const determineRequiredContext = (question, category) => {
    const contextNeeded = [];
    
    // Always include transactions as they're useful for most questions
    contextNeeded.push('transactions');
    
    // Add context based on category
    switch (category) {
      case 'spending':
        // Already have transactions
        break;
      case 'savings':
        contextNeeded.push('accounts');
        break;
      case 'investments':
        contextNeeded.push('investments');
        break;
      case 'debt':
        contextNeeded.push('loans');
        break;
      case 'budgeting':
        contextNeeded.push('accounts');
        break;
      case 'business':
        contextNeeded.push('business');
        break;
      case 'taxes':
        contextNeeded.push('business');
        break;
      case 'insurance':
        contextNeeded.push('insurance');
        break;
      default:
        // Add all contexts for general questions
        contextNeeded.push('accounts', 'investments', 'loans', 'insurance', 'business');
        break;
    }
    
    return [...new Set(contextNeeded)]; // Remove duplicates
  };

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

  const generateAnswer = (question, category, data) => {
    let answer = '';

    // This is a very simplified approach - in a real app, you would use more sophisticated
    // NLP techniques or a real AI model to generate answers
    
    try {
      // Handle common question patterns with simple template responses
      const lowerQuestion = question.toLowerCase();
      
      // Check for spending-related questions
      if (lowerQuestion.includes('how much did i spend')) {
        const currentMonthTransactions = data.transactions?.current || [];
        const expenseTransactions = currentMonthTransactions.filter(t => t.type === 'expense');
        const totalSpent = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        
        if (lowerQuestion.includes('on')) {
          // Try to extract the category from the question
          const questionWords = lowerQuestion.split(' ');
          const onIndex = questionWords.indexOf('on');
          
          if (onIndex !== -1 && onIndex < questionWords.length - 1) {
            const potentialCategory = questionWords[onIndex + 1];
            
            // Look for transactions with this category
            const matchingTransactions = expenseTransactions.filter(tx => 
              tx.category && tx.category.toLowerCase().includes(potentialCategory)
            );
            
            if (matchingTransactions.length > 0) {
              const categorySpent = matchingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
              answer = `This month, you've spent ${categorySpent.toFixed(2)} on ${potentialCategory.charAt(0).toUpperCase() + potentialCategory.slice(1)}.`;
            } else {
              answer = `I couldn't find any transactions for ${potentialCategory} this month.`;
            }
          } else {
            answer = `This month, you've spent a total of ${totalSpent.toFixed(2)} across all categories.`;
          }
        } else if (lowerQuestion.includes('last month')) {
          const previousMonthTransactions = data.transactions?.previous || [];
          const prevExpenseTransactions = previousMonthTransactions.filter(t => t.type === 'expense');
          const prevTotalSpent = prevExpenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);
          
          answer = `Last month, you spent a total of ${prevTotalSpent.toFixed(2)}.`;
        } else {
          answer = `This month, you've spent a total of ${totalSpent.toFixed(2)} across all categories.`;
        }
      } 
      // Income questions
      else if (lowerQuestion.includes('how much did i earn') || lowerQuestion.includes('what was my income')) {
        const currentMonthTransactions = data.transactions?.current || [];
        const incomeTransactions = currentMonthTransactions.filter(t => t.type === 'income');
        const totalIncome = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        
        if (lowerQuestion.includes('last month')) {
          const previousMonthTransactions = data.transactions?.previous || [];
          const prevIncomeTransactions = previousMonthTransactions.filter(t => t.type === 'income');
          const prevTotalIncome = prevIncomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
          
          answer = `Last month, your total income was ${prevTotalIncome.toFixed(2)}.`;
        } else {
          answer = `This month, your total income so far is ${totalIncome.toFixed(2)}.`;
        }
      }
      // Balance questions
      else if (lowerQuestion.includes('what is my balance') || lowerQuestion.includes('how much money do i have')) {
        const accounts = data.accounts || [];
        
        if (accounts.length === 0) {
          answer = "I don't have information about your account balances.";
        } else {
          const totalBalance = accounts.reduce((sum, account) => sum + account.current_balance, 0);
          
          answer = `Your total balance across all accounts is ${totalBalance.toFixed(2)}.`;
          
          if (accounts.length > 1) {
            answer += "\n\nHere's the breakdown:";
            accounts.forEach(account => {
              answer += `\n- ${account.name}: ${account.current_balance.toFixed(2)} ${account.currency}`;
            });
          }
        }
      }
      // Investment questions
      else if (lowerQuestion.includes('how are my investments') || lowerQuestion.includes('investment performance')) {
        const investments = data.investments || [];
        
        if (investments.length === 0) {
          answer = "You don't have any investments tracked in the system.";
        } else {
          const totalInitial = investments.reduce((sum, inv) => sum + (inv.initial_amount || 0), 0);
          const totalCurrent = investments.reduce((sum, inv) => sum + (inv.current_amount || inv.initial_amount || 0), 0);
          const difference = totalCurrent - totalInitial;
          const percentChange = ((difference / totalInitial) * 100).toFixed(2);
          
          if (difference >= 0) {
            answer = `Your investments have grown by ${difference.toFixed(2)} (${percentChange}%) from an initial value of ${totalInitial.toFixed(2)}.`;
          } else {
            answer = `Your investments have declined by ${Math.abs(difference).toFixed(2)} (${Math.abs(parseFloat(percentChange)).toFixed(2)}%) from an initial value of ${totalInitial.toFixed(2)}.`;
          }
        }
      }
      // Debt/loan questions
      else if (lowerQuestion.includes('how much debt') || lowerQuestion.includes('loan balance')) {
        const loans = data.loans || [];
        
        if (loans.length === 0) {
          answer = "You don't have any loans tracked in the system.";
        } else {
          const totalLoanBalance = loans.reduce((sum, loan) => sum + (loan.current_balance || 0), 0);
          
          answer = `Your total outstanding loan balance is ${totalLoanBalance.toFixed(2)}.`;
          
          if (loans.length > 1) {
            answer += "\n\nHere's the breakdown:";
            loans.forEach(loan => {
              answer += `\n- ${loan.name}: ${loan.current_balance.toFixed(2)} ${loan.currency}`;
              if (loan.interest_rate) {
                answer += ` (${loan.interest_rate}% interest)`;
              }
            });
          }
        }
      }
      // Savings rate questions
      else if (lowerQuestion.includes('savings rate') || lowerQuestion.includes('how much am i saving')) {
        const currentMonthTransactions = data.transactions?.current || [];
        
        if (currentMonthTransactions.length === 0) {
          answer = "I don't have enough transaction data to calculate your savings rate.";
        } else {
          const incomeTransactions = currentMonthTransactions.filter(t => t.type === 'income');
          const expenseTransactions = currentMonthTransactions.filter(t => t.type === 'expense');
          
          const totalIncome = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
          const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);
          
          if (totalIncome === 0) {
            answer = "I don't see any income for the current month, so I can't calculate your savings rate.";
          } else {
            const savings = totalIncome - totalExpenses;
            const savingsRate = ((savings / totalIncome) * 100).toFixed(2);
            
            if (savings >= 0) {
              answer = `This month, you're saving ${savings.toFixed(2)} (${savingsRate}% of your income).`;
            } else {
              answer = `This month, you're spending more than you earn by ${Math.abs(savings).toFixed(2)} (${Math.abs(parseFloat(savingsRate)).toFixed(2)}% deficit).`;
            }
          }
        }
      }
      // Fallback for other questions
      else {
        answer = "I'm not sure how to answer that specific question. Try asking about your spending, income, account balances, investments, loans, or savings rate.";
      }
    } catch (error) {
      console.error('Error generating answer:', error);
      answer = "I encountered an error while trying to answer your question. Please try a different question or check back later.";
    }

    return answer;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setAnswer(null);

      // Determine the likely category and required context
      const determinedCategory = determineCategory(question);
      setCategory(determinedCategory);
      const requiredContext = determineRequiredContext(question, determinedCategory);

      // Fetch required data
      const data = await fetchRequiredData(requiredContext);
      
      // Generate answer based on the question and data
      const generatedAnswer = generateAnswer(question, determinedCategory, data);

      // Save the advice
      const user = await User.me();
      await FinancialAdvice.create({
        user_id: user.id,
        custom_question: question,
        answer: generatedAnswer,
        date: new Date().toISOString(),
        category: determinedCategory,
        data_used: data
      });

      setAnswer(generatedAnswer);
      if (onAdviceGiven) onAdviceGiven();
    } catch (err) {
      console.error('Error processing question:', err);
      setError('Could not generate advice at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const resetQuestion = () => {
    setQuestion('');
    setAnswer(null);
    setError(null);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-white">Ask Your Own Question</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {answer ? (
          <div className="space-y-6">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-300 font-medium">{question}</p>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-line text-gray-300">{answer}</p>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={resetQuestion}
                className="bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
              >
                Ask Another Question
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="Ask anything about your finances. For example: 'How much did I spend on groceries this month?'"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="h-32 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div className="text-gray-400 flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                For best results, ask specific questions about your spending, income, balances, investments, 
                loans, or savings. The Financial Advisor uses your actual financial data to provide insights.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg flex items-start gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!question.trim() || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Skeleton className="h-4 w-4 rounded-full bg-white/20 mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <SendIcon className="h-4 w-4 mr-2" />
                    Get Advice
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}