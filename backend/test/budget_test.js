const chai = require('chai');
const { createBudget, getBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { expect } = chai;

describe('Budget Controller - CRUD Operations', () => {
  describe('createBudget', () => {
    it('should be a function', () => {
      expect(createBudget).to.be.a('function');
    });
  });

  describe('getBudgets', () => {
    it('should be a function', () => {
      expect(getBudgets).to.be.a('function');
    });
  });

  describe('updateBudget', () => {
    it('should be a function', () => {
      expect(updateBudget).to.be.a('function');
    });
  });

  describe('deleteBudget', () => {
    it('should be a function', () => {
      expect(deleteBudget).to.be.a('function');
    });
  });
});
