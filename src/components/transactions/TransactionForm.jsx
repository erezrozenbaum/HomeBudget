
import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { AlertCircle, Calendar as CalendarIcon, X, HelpCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UploadFile } from '@/api/integrations';

export default function TransactionForm({ transaction, accounts, cards, categories, onSave, onCancel }) {
  const [businesses, setBusinesses] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showBusinessFields, setShowBusinessFields] = useState(false);
  const [loadingBusinessData, setLoadingBusinessData] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const [formData, setFormData] = useState({
    date: transaction?.date ? new Date(transaction.date) : new Date(),
    type: transaction?.type || 'expense',
    amount: transaction?.amount || '',
    currency: transaction?.currency || 'USD',
    bank_account_id: transaction?.bank_account_id || '',
    credit_card_id: transaction?.credit_card_id || '',
    category: transaction?.category || '',
    subcategory: transaction?.subcategory || '',
    description: transaction?.description || '',
    is_business: transaction?.is_business || false,
    business_id: transaction?.business_id || '',
    is_recurring: transaction?.is_recurring || false,
    recurring_frequency: transaction?.recurring_frequency || 'monthly',
    recurring_interval: transaction?.recurring_interval || 1,
    recurring_unit: transaction?.recurring_unit || 'month',
    recurring_end_date: transaction?.recurring_end_date ? new Date(transaction.recurring_end_date) : null,
    payment_type: transaction?.payment_type || 'single',
    installments_total: transaction?.installments_total || 1,
    installment_number: transaction?.installment_number || 1,
    tax_deductible: transaction?.tax_deductible || false,
    receipt_url: transaction?.receipt_url || '',
    is_unplanned: transaction?.is_unplanned || false,
    unplanned_category: transaction?.unplanned_category || '',
    unplanned_tags: transaction?.unplanned_tags || [],
    is_reimbursable: transaction?.is_reimbursable || false,
    reimbursed: transaction?.reimbursed || false,
    reimbursement_date: transaction?.reimbursement_date ? new Date(transaction.reimbursement_date) : null,
    emergency_fund_withdrawal: transaction?.emergency_fund_withdrawal || false
  });

  const [selectedCategory, setSelectedCategory] = React.useState(
    categories.find(c => c.name === formData.category)
  );

  const [paymentMethod, setPaymentMethod] = React.useState(
    formData.credit_card_id ? 'credit_card' : 'bank_account'
  );

  const [error, setError] = React.useState(null);
  const [isRecurring, setIsRecurring] = useState(formData.is_recurring || false);
  const [useCustomRecurrence, setUseCustomRecurrence] = useState(formData.recurring_frequency === 'custom');
  const [showCustomFrequency, setShowCustomFrequency] = useState(false);

  useEffect(() => {
    // Load business data when the form is initialized or when is_business becomes true
    if (formData.is_business) {
      loadBusinessData();
    }
  }, [formData.is_business]);

  useEffect(() => {
    // Update business fields visibility based on transaction
    if (transaction) {
      setShowBusinessFields(transaction.is_business);
      if (transaction.business_id) {
        loadBusinessData(transaction.business_id);
      }
    }
  }, [transaction]);

  const loadBusinessData = async (selectedBusinessId = null) => {
    try {
      setLoadingBusinessData(true);
      
      // Import the Business entity
      const Business = (await import('@/api/entities')).Business;
      const BusinessClient = (await import('@/api/entities')).BusinessClient;
      const Project = (await import('@/api/entities')).Project;
      
      const businessesData = await Business.list();
      setBusinesses(businessesData);
      
      // If a business is selected (either from the form or as a parameter), load its clients and projects
      const businessId = selectedBusinessId || formData.business_id;
      
      if (businessId) {
        // Load clients and projects for the selected business
        const [clientsData, projectsData] = await Promise.all([
          BusinessClient.list(),
          Project.list()
        ]);
        
        // Filter clients and projects by business ID
        const filteredClients = clientsData.filter(client => client.business_id === businessId);
        const filteredProjects = projectsData.filter(project => project.business_id === businessId);
        
        setClients(filteredClients);
        setProjects(filteredProjects);
        
        // Set the selected business
        const selectedBusiness = businessesData.find(b => b.id === businessId);
        setSelectedBusiness(selectedBusiness);
      }
    } catch (error) {
      console.error("Error loading business data:", error);
    } finally {
      setLoadingBusinessData(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Additional logic when changing business-related fields
    if (field === 'business_id' && value) {
      loadBusinessData(value);
    }
  };

  // Set account/card when form initially loads
  useEffect(() => {
    if (transaction) {
      // Ensure formData has all transaction properties
      setFormData(prev => ({
        ...prev,
        ...transaction
      }));
      
      if (transaction.credit_card_id) {
        setPaymentMethod('credit_card');
      } else if (transaction.bank_account_id) {
        setPaymentMethod('bank_account');
      }
      
      setIsRecurring(transaction.is_recurring || false);
      setUseCustomRecurrence(transaction.recurring_frequency === 'custom');
    }
  }, [transaction]);

  // Update currency when payment method changes
  useEffect(() => {
    if (paymentMethod === 'bank_account' && formData.bank_account_id) {
      const selectedAccount = accounts.find(a => a.id === formData.bank_account_id);
      if (selectedAccount) {
        setFormData(prev => ({
          ...prev,
          currency: selectedAccount.currency
        }));
      }
    } else if (paymentMethod === 'credit_card' && formData.credit_card_id) {
      const selectedCard = cards.find(c => c.id === formData.credit_card_id);
      if (selectedCard) {
        const cardAccount = accounts.find(a => a.id === selectedCard.bank_account_id);
        if (cardAccount) {
          setFormData(prev => ({
            ...prev,
            currency: cardAccount.currency
          }));
        }
      }
    }
  }, [paymentMethod, formData.bank_account_id, formData.credit_card_id, accounts, cards]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation checks
    if (paymentMethod === 'bank_account' && !formData.bank_account_id) {
      setError('Please select a bank account');
      return;
    }
    
    if (paymentMethod === 'credit_card' && !formData.credit_card_id) {
      setError('Please select a credit card');
      return;
    }
    
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    
    // Prepare data for submission
    const data = { ...formData };
    
    // Format date as ISO string
    if (data.date instanceof Date) {
      data.date = format(data.date, 'yyyy-MM-dd');
    }
    
    // Clear business-related fields if this is not a business transaction
    if (!data.is_business) {
      data.business_id = '';
      data.business_category = '';
      data.client_id = '';
      data.project_id = '';
      data.tax_deductible = false;
    }
    
    // Set is_recurring based on the form state
    data.is_recurring = !!data.is_recurring;
    
    // Parse the amount value to ensure it's a number
    data.amount = parseFloat(data.amount);
    
    // Final processing - clear unneeded fields
    const finalData = { ...formData };
    
    if (paymentMethod === 'bank_account') {
      finalData.credit_card_id = '';
    } else {
      finalData.bank_account_id = '';
    }

    finalData.is_recurring = isRecurring;
    
    onSave(data);
  };

  const handleCategoryChange = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    setSelectedCategory(category);
    setFormData({
      ...formData,
      category: categoryName,
      subcategory: ''
    });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === 'bank_account') {
      setFormData(prev => ({ ...prev, credit_card_id: '' }));
    } else {
      setFormData(prev => ({ ...prev, bank_account_id: '' }));
    }
  };

  const handleBankAccountChange = (accountId) => {
    const selectedAccount = accounts.find(a => a.id === accountId);
    setFormData({
      ...formData,
      bank_account_id: accountId,
      currency: selectedAccount ? selectedAccount.currency : formData.currency
    });
  };

  const handleCreditCardChange = (cardId) => {
    const selectedCard = cards.find(c => c.id === cardId);
    if (selectedCard) {
      const cardAccount = accounts.find(a => a.id === selectedCard.bank_account_id);
      setFormData({
        ...formData,
        credit_card_id: cardId,
        currency: cardAccount ? cardAccount.currency : formData.currency
      });
    }
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (field, date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date ? format(date, 'yyyy-MM-dd') : null,
    }));
  };

  // Add new function for handling unplanned tags
  const handleTagAdd = (tag) => {
    if (!formData.unplanned_tags.includes(tag)) {
      setFormData({
        ...formData,
        unplanned_tags: [...formData.unplanned_tags, tag]
      });
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData({
      ...formData,
      unplanned_tags: formData.unplanned_tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Add new function for handling file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await UploadFile({ file });
      setFormData({
        ...formData,
        receipt_url: file_url
      });
    } catch (error) {
      console.error('Error uploading receipt:', error);
    }
  };

  // Determine which categories to show based on if this is a business transaction
  const getCategoriesForType = () => {
    // Filter categories by type
    let filteredCategories = categories.filter(cat => 
      (!formData.type || cat.type === formData.type || !cat.type)
    );
    
    return filteredCategories;
  };

  // Get the available subcategories for the selected category
  const getSubcategories = () => {
    const category = categories.find(c => c.name === formData.category);
    return category?.subcategories || [];
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Validation checks
    if (paymentMethod === 'bank_account' && !formData.bank_account_id) {
      setError('Please select a bank account');
      return;
    }
    
    if (paymentMethod === 'credit_card' && !formData.credit_card_id) {
      setError('Please select a credit card');
      return;
    }
    
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    
    // Prepare data for submission
    const data = { ...formData };
    
    // Format date as ISO string
    if (data.date instanceof Date) {
      data.date = format(data.date, 'yyyy-MM-dd');
    }

    if (data.recurring_end_date instanceof Date) {
      data.recurring_end_date = format(data.recurring_end_date, 'yyyy-MM-dd');
    }
    
    if (data.reimbursement_date instanceof Date) {
      data.reimbursement_date = format(data.reimbursement_date, 'yyyy-MM-dd');
    }
    
    // Clear business-related fields if this is not a business transaction
    if (!data.is_business) {
      data.business_id = '';
      data.business_category = '';
      data.client_id = '';
      data.project_id = '';
      data.tax_deductible = false;
    }
    
    // Set is_recurring based on the form state
    data.is_recurring = !!data.is_recurring;
    
    // Parse the amount value to ensure it's a number
    data.amount = parseFloat(data.amount);
    
    // Final processing - clear unneeded fields
    const finalData = { ...data };
    
    if (paymentMethod === 'bank_account') {
      finalData.credit_card_id = '';
    } else {
      finalData.bank_account_id = '';
    }

    finalData.is_recurring = isRecurring;
    
    onSave(finalData);
  };

  // Helper component for form field with tooltip
  const renderFieldWithTooltip = (label, tooltip, children) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-white">{label}</Label>
          {tooltip && (
            <div className="relative inline-flex">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-300" 
                onMouseEnter={(e) => {
                  const tooltipContent = e.currentTarget.nextElementSibling;
                  if (tooltipContent) tooltipContent.style.display = 'block';
                }}
                onMouseLeave={(e) => {
                  const tooltipContent = e.currentTarget.nextElementSibling;
                  if (tooltipContent) tooltipContent.style.display = 'none';
                }}
              />
              <div className="hidden absolute left-6 -top-2 z-50 p-2 rounded-md bg-gray-800 border border-gray-700 text-white text-sm max-w-xs whitespace-normal">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        {children}
      </div>
    );
  };

  // Get the appropriate label for unplanned transaction based on transaction type
  const getUnplannedLabel = () => {
    return formData.type === 'expense' 
      ? 'Unplanned Expense' 
      : formData.type === 'income' 
        ? 'Unplanned Income' 
        : 'Unplanned Transaction';
  };

  // Get the appropriate tooltip for unplanned transaction based on transaction type
  const getUnplannedTooltip = () => {
    return formData.type === 'expense'
      ? 'Mark this as an unplanned or unexpected expense. This helps track and analyze irregular financial events.'
      : formData.type === 'income'
        ? 'Mark this as an unplanned or unexpected income. This helps track and analyze irregular financial gains.'
        : 'Mark this as an unplanned or unexpected transaction. This helps track and analyze irregular financial events.';
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 text-white">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        {renderFieldWithTooltip("Date", "When this transaction occurred", 
          <Input
            id="date"
            type="date"
            value={formData.date instanceof Date ? format(formData.date, 'yyyy-MM-dd') : formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className="bg-gray-800 border-gray-700 text-white"
          />
        )}

        {renderFieldWithTooltip("Type", "Whether money is coming in or going out",
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="income" className="text-white">Income</SelectItem>
              <SelectItem value="expense" className="text-white">Expense</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {renderFieldWithTooltip("Payment Method", "How this transaction was paid for or received",
        <Select
          value={paymentMethod}
          onValueChange={handlePaymentMethodChange}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="bank_account" className="text-white">Bank Account</SelectItem>
            <SelectItem value="credit_card" className="text-white">Credit Card</SelectItem>
          </SelectContent>
        </Select>
      )}

      {paymentMethod === 'bank_account' && (
        renderFieldWithTooltip("Bank Account", "The account this transaction is associated with",
          <Select
            value={formData.bank_account_id}
            onValueChange={handleBankAccountChange}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select bank account" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="text-white">
                  {account.name} ({account.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      )}

      {paymentMethod === 'credit_card' && (
        renderFieldWithTooltip("Credit Card", "The card this transaction is associated with",
          <Select
            value={formData.credit_card_id}
            onValueChange={handleCreditCardChange}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select credit card" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {cards.map((card) => {
                const cardAccount = accounts.find(a => a.id === card.bank_account_id);
                return (
                  <SelectItem key={card.id} value={card.id} className="text-white">
                    {card.name} ({cardAccount?.currency || 'Unknown'})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )
      )}

      <div className="grid grid-cols-2 gap-4">
        {renderFieldWithTooltip("Amount", "The total amount of the transaction",
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            required
            className="bg-gray-800 border-gray-700 text-white"
          />
        )}

        {renderFieldWithTooltip("Currency", "Currency of the transaction (inherited from the account)",
          <Input
            value={formData.currency}
            disabled
            className="bg-gray-700 border-gray-700 text-white"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {renderFieldWithTooltip("Payment Type", "Whether this is a single payment or part of installments",
          <Select
            value={formData.payment_type}
            onValueChange={(value) => setFormData({ ...formData, payment_type: value })}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select payment type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="single" className="text-white">Single Payment</SelectItem>
              <SelectItem value="installment" className="text-white">Installment</SelectItem>
            </SelectContent>
          </Select>
        )}

        {renderFieldWithTooltip("Business Transaction", "Whether this transaction is for business purposes",
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              className={`${
                formData.is_business
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
              }`}
              onClick={() => {
                setFormData({...formData, is_business: true});
                setShowBusinessFields(true);
              }}
            >
              Yes
            </Button>
            <Button
              type="button"
              className={`${
                !formData.is_business
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
              }`}
              onClick={() => {
                setFormData({...formData, is_business: false});
                setShowBusinessFields(false);
              }}
            >
              No
            </Button>
          </div>
        )}
      </div>

      {showBusinessFields && (
        <div className="space-y-4 p-4 border border-gray-700 rounded-md bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Business Details</h3>
            {loadingBusinessData && (
              <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-gray-400 block">Business</Label>
            <Select
              value={formData.business_id || ''}
              onValueChange={(value) => handleChange('business_id', value)}
              disabled={loadingBusinessData}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select a business" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {businesses.map(business => (
                  <SelectItem key={business.id} value={business.id} className="text-white">
                    {business.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {formData.business_id && (
            <>
              <div className="space-y-2">
                <Label className="text-sm text-gray-400 block">Business Category</Label>
                <Input
                  value={formData.business_category || ''}
                  onChange={(e) => handleChange('business_category', e.target.value)}
                  placeholder="e.g., Marketing, Operations, Sales"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              {clients.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-400 block">Client</Label>
                  <Select
                    value={formData.client_id || ''}
                    onValueChange={(value) => handleChange('client_id', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value={null} className="text-white">None</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id} className="text-white">
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {projects.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-400 block">Project</Label>
                  <Select
                    value={formData.project_id || ''}
                    onValueChange={(value) => handleChange('project_id', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value={null} className="text-white">None</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id} className="text-white">
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {formData.type === 'expense' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tax_deductible"
                    checked={formData.tax_deductible}
                    onCheckedChange={(e) => handleChange('tax_deductible', e)}
                    className="bg-gray-800 border-gray-600 text-blue-600"
                  />
                  <Label htmlFor="tax_deductible" className="text-sm font-medium text-white">
                    Tax Deductible Expense
                  </Label>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {formData.payment_type === 'installment' && (
        <div className="grid grid-cols-2 gap-4">
          {renderFieldWithTooltip("Total Installments", "Total number of payments for this purchase",
            <Input
              id="installments_total"
              type="number"
              min="2"
              value={formData.installments_total}
              onChange={(e) => setFormData({ ...formData, installments_total: parseInt(e.target.value) })}
              className="bg-gray-800 border-gray-700 text-white"
            />
          )}
          {renderFieldWithTooltip("Current Installment", "Which installment number this payment represents",
            <Input
              id="installment_number"
              type="number"
              min="1"
              max={formData.installments_total}
              value={formData.installment_number}
              onChange={(e) => setFormData({ ...formData, installment_number: parseInt(e.target.value) })}
              className="bg-gray-800 border-gray-700 text-white"
            />
          )}
        </div>
      )}

      {renderFieldWithTooltip("Category", "Primary category for this transaction",
        <Select
          value={formData.category}
          onValueChange={(value) => {
            handleChange('category', value);
            handleChange('subcategory', ''); // Reset subcategory when category changes
          }}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            {getCategoriesForType().map(category => (
              <SelectItem key={category.id || category.name} value={category.name} className="text-white">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {formData.category && getSubcategories().length > 0 && (
        renderFieldWithTooltip("Subcategory", "More specific categorization within the primary category",
          <Select
            value={formData.subcategory}
            onValueChange={(value) => handleChange('subcategory', value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value={null} className="text-white">None</SelectItem>
              {getSubcategories().map(subcategory => (
                <SelectItem key={subcategory} value={subcategory} className="text-white">
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      )}

      {renderFieldWithTooltip("Description", "Details about this transaction",
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-gray-800 border-gray-700 text-white"
        />
      )}

      {renderFieldWithTooltip("Recurring Transaction", "Whether this transaction repeats on a regular schedule",
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            className={`${
              isRecurring
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
            }`}
            onClick={() =>  {
              setIsRecurring(true);
              setFormData(prev => ({
                ...prev,
                is_recurring: true,
                recurring_frequency: 'monthly'
              }));
            }}
          >
            Yes
          </Button>
          <Button
            type="button"
            className={`${
              !isRecurring
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
            }`}
            onClick={() => {
              setIsRecurring(false);
              setFormData(prev => ({
                ...prev,
                is_recurring: false,
                recurring_frequency: null
              }));
            }}
          >
            No
          </Button>
        </div>
      )}
      
      {isRecurring && (
        <div className="space-y-4 border border-gray-700 rounded-md p-4 bg-gray-800">
          <div className="space-y-2">
            <Label className="text-white">Choose Frequency Type</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant={!showCustomFrequency ? "default" : "outline"}
                onClick={() => setShowCustomFrequency(false)}
                className={!showCustomFrequency ? "bg-blue-600" : "bg-gray-800 border-gray-700 text-white"}
              >
                Preset Frequencies
              </Button>
              <Button
                type="button"
                variant={showCustomFrequency ? "default" : "outline"}
                onClick={() => setShowCustomFrequency(true)}
                className={showCustomFrequency ? "bg-blue-600" : "bg-gray-800 border-gray-700 text-white"}
              >
                Custom Frequency
              </Button>
            </div>
          </div>

          {!showCustomFrequency ? (
            <div className="space-y-2">
              <Label className="text-white">Frequency</Label>
              <Select
                value={formData.recurring_frequency}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  recurring_frequency: value
                }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="daily" className="text-white">Daily</SelectItem>
                  <SelectItem value="weekly" className="text-white">Weekly</SelectItem>
                  <SelectItem value="bi-weekly" className="text-white">Every 2 Weeks</SelectItem>
                  <SelectItem value="monthly" className="text-white">Monthly</SelectItem>
                  <SelectItem value="quarterly" className="text-white">Every 3 Months</SelectItem>
                  <SelectItem value="annually" className="text-white">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-white">Every</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.recurring_interval || 1}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    recurring_frequency: 'custom',
                    recurring_interval: parseInt(e.target.value) || 1
                  }))}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Period</Label>
                <Select
                  value={formData.recurring_unit || 'month'}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    recurring_frequency: 'custom',
                    recurring_unit: value
                  }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="day" className="text-white">Days</SelectItem>
                    <SelectItem value="week" className="text-white">Weeks</SelectItem>
                    <SelectItem value="month" className="text-white">Months</SelectItem>
                    <SelectItem value="year" className="text-white">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
            
          <div>
            <Label className="text-white">End Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white"
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.recurring_end_date ? (
                    format(new Date(formData.recurring_end_date), "PPP")
                  ) : (
                    <span>No end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-gray-900 border-gray-700 text-white p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.recurring_end_date ? new Date(formData.recurring_end_date) : undefined}
                  onSelect={(date) => setFormData(prev => ({
                    ...prev,
                    recurring_end_date: date ? format(date, 'yyyy-MM-dd') : null
                  }))}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {renderFieldWithTooltip(getUnplannedLabel(), getUnplannedTooltip(),
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            className={`${
              formData.is_unplanned
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
            }`}
            onClick={() => setFormData({...formData, is_unplanned: true})}
          >
            Yes
          </Button>
          <Button
            type="button"
            className={`${
              !formData.is_unplanned
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
            }`}
            onClick={() => setFormData({...formData, is_unplanned: false})}
          >
            No
          </Button>
        </div>
      )}

      {formData.is_unplanned && (
        <div className="space-y-4 p-4 border border-gray-700 rounded-md bg-gray-800">
          <div className="grid grid-cols-1 gap-4">
            {renderFieldWithTooltip("Unplanned Category", `What type of unplanned ${formData.type} this is`,
              <Select
                value={formData.unplanned_category}
                onValueChange={(value) => 
                  setFormData({...formData, unplanned_category: value})
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {formData.type === 'expense' ? (
                    <>
                      <SelectItem value="medical" className="text-white">Medical</SelectItem>
                      <SelectItem value="car_repairs" className="text-white">Car Repairs</SelectItem>
                      <SelectItem value="home_repairs" className="text-white">Home Repairs</SelectItem>
                      <SelectItem value="travel_emergencies" className="text-white">Travel Emergencies</SelectItem>
                      <SelectItem value="unexpected_bills" className="text-white">Unexpected Bills</SelectItem>
                      <SelectItem value="emergency_purchases" className="text-white">Emergency Purchases</SelectItem>
                      <SelectItem value="family_emergency" className="text-white">Family Emergency</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="bonus" className="text-white">Unexpected Bonus</SelectItem>
                      <SelectItem value="gift" className="text-white">Gift Received</SelectItem>
                      <SelectItem value="tax_refund" className="text-white">Tax Refund</SelectItem>
                      <SelectItem value="insurance_payout" className="text-white">Insurance Payout</SelectItem>
                      <SelectItem value="inheritance" className="text-white">Inheritance</SelectItem>
                      <SelectItem value="gambling" className="text-white">Gambling/Lottery</SelectItem>
                      <SelectItem value="refund" className="text-white">Unexpected Refund</SelectItem>
                    </>
                  )}
                  <SelectItem value="other" className="text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            )}

            {renderFieldWithTooltip("Tags", "Custom labels to further categorize this transaction",
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.unplanned_tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="flex items-center gap-1 bg-gray-700 text-white"
                    >
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleTagRemove(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="tag-input"
                    placeholder="Add tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTagAdd(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('tag-input');
                      if (input?.value) {
                        handleTagAdd(input.value);
                        input.value = '';
                      }
                    }}
                    className="bg-gray-800 border-gray-700 text-white"
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {formData.type === 'expense' && (
              <>
                {renderFieldWithTooltip("Paid from Emergency Fund", "Whether this expense was covered using emergency fund money",
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      className={`${
                        formData.emergency_fund_withdrawal
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                      }`}
                      onClick={() => setFormData({...formData, emergency_fund_withdrawal: true})}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      className={`${
                        !formData.emergency_fund_withdrawal
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                      }`}
                      onClick={() => setFormData({...formData, emergency_fund_withdrawal: false})}
                    >
                      No
                    </Button>
                  </div>
                )}

                {renderFieldWithTooltip("Reimbursable", "Whether you expect to be paid back for this expense",
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      className={`${
                        formData.is_reimbursable
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                      }`}
                      onClick={() => setFormData({...formData, is_reimbursable: true})}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      className={`${
                        !formData.is_reimbursable
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                      }`}
                      onClick={() => setFormData({...formData, is_reimbursable: false})}
                    >
                      No
                    </Button>
                  </div>
                )}
              </>
            )}

            {formData.is_reimbursable && (
              renderFieldWithTooltip("Already Reimbursed", "Whether you've already been paid back for this expense",
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    className={`${
                      formData.reimbursed
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                    }`}
                    onClick={() => setFormData({...formData, reimbursed: true})}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    className={`${
                      !formData.reimbursed
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                    }`}
                    onClick={() => setFormData({...formData, reimbursed: false})}
                  >
                    No
                  </Button>
                </div>
              )
            )}

            {formData.reimbursed && (
              renderFieldWithTooltip("Reimbursement Date", "When you received the reimbursement",
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.reimbursement_date ? (
                        format(new Date(formData.reimbursement_date), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700 text-white">
                    <Calendar
                      mode="single"
                      selected={formData.reimbursement_date}
                      onSelect={(date) => 
                        setFormData({...formData, reimbursement_date: date})
                      }
                      initialFocus
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
              )
            )}
          </div>
        </div>
      )}

      {renderFieldWithTooltip("Receipt", "Upload an image or PDF of your receipt or documentation",
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full bg-gray-800 border-gray-700 text-white"
            >
              Choose File
            </Button>
          </div>
          {formData.receipt_url && (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => window.open(formData.receipt_url, '_blank')}
              className="bg-gray-800 border-gray-700 text-white"
            >
              View
            </Button>
          )}
        </div>
      )}
      
      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {transaction ? 'Update' : 'Add'} Transaction
        </Button>
      </div>
    </form>
  );
}
