import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Book, History, Star } from "lucide-react";
import QuickQuestions from '../components/advisor/QuickQuestions';
import CustomQuestion from '../components/advisor/CustomQuestion';
import AdviceHistory from '../components/advisor/AdviceHistory';
import PopularQuestions from '../components/advisor/PopularQuestions';
import { FinancialQuestion, FinancialAdvice } from '@/api/entities';

export default function FinancialAdvisor() {
    const [questions, setQuestions] = useState([]);
    const [adviceHistory, setAdviceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('quick');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [questionsData, historyData] = await Promise.all([
                FinancialQuestion.list(),
                FinancialAdvice.list('-date', 50)  // Get last 50 pieces of advice
            ]);
            setQuestions(questionsData);
            setAdviceHistory(historyData);
        } catch (error) {
            console.error('Error loading advisor data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Financial Advisor</h1>
                    <p className="text-gray-400">Get personalized financial insights and advice</p>
                </div>
            </div>

            <Tabs defaultValue={activeTab} className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="quick">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Quick Questions
                    </TabsTrigger>
                    <TabsTrigger value="custom">
                        <Book className="w-4 h-4 mr-2" />
                        Ask Anything
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="w-4 h-4 mr-2" />
                        History
                    </TabsTrigger>
                    <TabsTrigger value="popular">
                        <Star className="w-4 h-4 mr-2" />
                        Popular
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="quick">
                    <QuickQuestions questions={questions} onAdviceGiven={loadData} />
                </TabsContent>

                <TabsContent value="custom">
                    <CustomQuestion onAdviceGiven={loadData} />
                </TabsContent>

                <TabsContent value="history">
                    <AdviceHistory history={adviceHistory} />
                </TabsContent>

                <TabsContent value="popular">
                    <PopularQuestions questions={questions} history={adviceHistory} />
                </TabsContent>
            </Tabs>
        </div>
    );
}