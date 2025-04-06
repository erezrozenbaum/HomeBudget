import { apiClient } from './client';

// Base entity class with common CRUD operations
class Entity {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async list() {
    return apiClient.list(this.endpoint);
  }

  async get(id) {
    return apiClient.get(this.endpoint, id);
  }

  async create(data) {
    return apiClient.create(this.endpoint, data);
  }

  async update(id, data) {
    return apiClient.update(this.endpoint, id, data);
  }

  async delete(id) {
    return apiClient.delete(this.endpoint, id);
  }
}

// Define all entities
export const BankAccount = new Entity('bank-accounts');
export const CreditCard = new Entity('credit-cards');
export const Transaction = new Entity('transactions');
export const Investment = new Entity('investments');
export const Category = new Entity('categories');
export const UserSettings = new Entity('user-settings');
export const Loan = new Entity('loans');
export const Asset = new Entity('assets');
export const RecurringTransaction = new Entity('recurring-transactions');
export const Insurance = new Entity('insurance');
export const InsuranceCategory = new Entity('insurance-categories');
export const Goal = new Entity('goals');
export const Business = new Entity('businesses');
export const BusinessClient = new Entity('business-clients');
export const BusinessInvoice = new Entity('business-invoices');
export const Invoice = new Entity('invoices');
export const Project = new Entity('projects');
export const FinancialQuestion = new Entity('financial-questions');
export const FinancialAdvice = new Entity('financial-advice');
export const EmergencyFund = new Entity('emergency-funds');
export const UserAudit = new Entity('user-audits');

// Auth entity for user management
export const User = new Entity('users');