const chai = require('chai');
const { createTransaction, getTransactions, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { expect } = chai;

describe('Transaction Controller - CRUD Operations', () => {
  describe('createTransaction', () => {
    it('should be a function', () => {
      expect(createTransaction).to.be.a('function');
    });
  });

  describe('getTransactions', () => {
    it('should be a function', () => {
      expect(getTransactions).to.be.a('function');
    });
  });

  describe('updateTransaction', () => {
    it('should be a function', () => {
      expect(updateTransaction).to.be.a('function');
    });
  });

  describe('deleteTransaction', () => {
    it('should be a function', () => {
      expect(deleteTransaction).to.be.a('function');
    });
  });
});
