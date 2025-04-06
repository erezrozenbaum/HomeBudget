import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, CreditCard, PiggyBank, Calculator, DollarSign, Briefcase, FileText, Heart, HelpCircle, TrendingUp, Zap } from 'lucide-react';

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

export default function PopularQuestions({ questions, history }) {
  const [loading, setLoading] = useState(true);
  const [popularQuestions, setPopularQuestions] = useState([]);
  const [helpfulAdvice, setHelpfulAdvice] = useState([]);

  useEffect(() => {
    const generatePopularData = () => {
      setLoading(true);
      
      try {
        // Count occurrences of each question in the history
        const questionCounts = {};
        history.forEach(item => {
          if (item.question_id) {
            if (!questionCounts[item.question_id]) {
              questionCounts[item.question_id] = {
                count: 0,
                helpfulCount: 0,
                questionData: null
              };
            }
            
            questionCounts[item.question_id].count += 1;
            
            if (item.is_helpful === true) {
              questionCounts[item.question_id].helpfulCount += 1;
            }
          }
        });
        
        // Match with question data and sort by frequency
        const popular = Object.entries(questionCounts)
          .map(([questionId, data]) => {
            const questionData = questions.find(q => q.id === questionId);
            return {
              ...questionData,
              count: data.count,
              helpfulCount: data.helpfulCount
            };
          })
          .filter(q => q.category) // Ensure question data was found
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5
        
        setPopularQuestions(popular);
        
        // Find most helpful advice
        const helpful = history
          .filter(item => item.is_helpful === true)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3); // Top 3
        
        setHelpfulAdvice(helpful);
      } catch (error) {
        console.error('Error generating popular data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    generatePopularData();
  }, [questions, history]);

  const handleNavigateToQuestion = (questionId) => {
    // In a real app, you would navigate to the quick questions tab
    // and trigger the question automatically
    console.log('Navigate to question:', questionId);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Popular Questions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Popular Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full bg-gray-700" />
                    <Skeleton className="h-4 w-3/4 bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : popularQuestions.length > 0 ? (
            <div className="space-y-4">
              {popularQuestions.map((question) => (
                <div 
                  key={question.id}
                  className="flex gap-3 p-3 rounded-lg hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => handleNavigateToQuestion(question.id)}
                >
                  <div className={`p-2 rounded-full ${getCategoryColor(question.category).split(' ').slice(0, 2).join(' ')}`}>
                    {getCategoryIcon(question.category)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-200">{question.question}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-gray-700 text-gray-300 border-none">
                        Asked {question.count} times
                      </Badge>
                      {question.helpfulCount > 0 && (
                        <Badge className="bg-green-900/30 text-green-400 border-green-800">
                          {question.helpfulCount} found helpful
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">
              No popular questions data available yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Most Helpful Advice */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Most Helpful Advice
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-2/3 bg-gray-700" />
                  <Skeleton className="h-4 w-full bg-gray-700" />
                  <Skeleton className="h-4 w-full bg-gray-700" />
                  <Skeleton className="h-4 w-1/2 bg-gray-700" />
                </div>
              ))}
            </div>
          ) : helpfulAdvice.length > 0 ? (
            <div className="space-y-6">
              {helpfulAdvice.map((advice) => (
                <div key={advice.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(advice.category)}
                    <h3 className="font-medium text-gray-200 text-sm">
                      {advice.custom_question || 'Quick Question'}
                    </h3>
                  </div>
                  <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                    <p className="text-gray-300 text-sm line-clamp-3">{advice.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">
              No helpful advice data available yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}