const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const { createBudget, getBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { expect } = chai;

describe('Budget Controller - CRUD Operations', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createBudget', () => {
    it('should create a new budget successfully', async () => {
      // Mock request data
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: {
          name: 'Grocery Budget',
          category: 'Food & Dining',
          amount: 500.00,
          period: 'monthly',
          startDate: new Date(),
          description: 'Monthly grocery budget'
        }
      };

      // Mock budget that would be created
      const createdBudget = {
        _id: new mongoose.Types.ObjectId(),
        user: req.user.id,
        ...req.body,
        isActive: true,
        save: sandbox.stub().resolves({
          _id: new mongoose.Types.ObjectId(),
          user: req.user.id,
          ...req.body,
          isActive: true
        })
      };

      // Stub Budget constructor and save method
      const BudgetStub = sandbox.stub(Budget).returns(createdBudget);

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await createBudget(req, res);

      // Assertions
      expect(BudgetStub.calledOnceWith({
        user: req.user.id,
        name: req.body.name,
        category: req.body.category,
        amount: req.body.amount,
        period: req.body.period,
        startDate: req.body.startDate,
        endDate: undefined,
        description: req.body.description
      })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
    });

    it('should return 500 if an error occurs during creation', async () => {
      // Mock request data
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: {
          name: 'Transport Budget',
          category: 'Transportation',
          amount: 200.00,
          period: 'monthly'
        }
      };

      // Mock budget with save that throws error
      const budgetWithError = {
        save: sandbox.stub().throws(new Error('DB Error'))
      };

      // Stub Budget constructor to return budget with error
      sandbox.stub(Budget).returns(budgetWithError);

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await createBudget(req, res);

      // Assertions
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Server error' })).to.be.true;
    });
  });

  describe('getBudgets', () => {
    it('should get all budgets for a user successfully', async () => {
      // Mock user ID
      const userId = new mongoose.Types.ObjectId();

      // Mock budgets data
      const mockBudgets = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: userId,
          name: 'Grocery Budget',
          category: 'Food & Dining',
          amount: 500.00,
          period: 'monthly',
          isActive: true
        },
        {
          _id: new mongoose.Types.ObjectId(),
          user: userId,
          name: 'Transport Budget',
          category: 'Transportation',
          amount: 200.00,
          period: 'monthly',
          isActive: true
        }
      ];

      // Stub Budget.find to return mock budgets
      const findStub = sandbox.stub(Budget, 'find').returns({
        sort: sandbox.stub().resolves(mockBudgets)
      });

      // Mock request data
      const req = {
        user: { id: userId }
      };

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await getBudgets(req, res);

      // Assertions
      expect(findStub.calledOnceWith({ user: userId })).to.be.true;
      expect(res.json.calledWith(mockBudgets)).to.be.true;
    });

    it('should return 500 if an error occurs while fetching budgets', async () => {
      // Stub Budget.find to throw an error
      sandbox.stub(Budget, 'find').throws(new Error('DB Error'));

      // Mock request data
      const req = {
        user: { id: new mongoose.Types.ObjectId() }
      };

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await getBudgets(req, res);

      // Assertions
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Server error' })).to.be.true;
    });
  });

  describe('updateBudget', () => {
    it('should update a budget successfully', async () => {
      // Mock budget ID
      const budgetId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      // Mock existing budget
      const existingBudget = {
        _id: budgetId,
        user: userId,
        name: 'Grocery Budget',
        category: 'Food & Dining',
        amount: 500.00,
        period: 'monthly',
        isActive: true,
        toString: sandbox.stub().returns(userId.toString())
      };

      // Mock updated budget
      const updatedBudget = {
        _id: budgetId,
        user: userId,
        name: 'Updated Grocery Budget',
        category: 'Food & Dining',
        amount: 600.00,
        period: 'monthly',
        isActive: true
      };

      // Stub Budget.findById to return existing budget
      const findByIdStub = sandbox.stub(Budget, 'findById').resolves(existingBudget);

      // Stub Budget.findByIdAndUpdate to return updated budget
      const updateStub = sandbox.stub(Budget, 'findByIdAndUpdate').resolves(updatedBudget);

      // Mock request data
      const req = {
        params: { id: budgetId },
        user: { id: userId },
        body: {
          name: 'Updated Grocery Budget',
          amount: 600.00
        }
      };

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await updateBudget(req, res);

      // Assertions
      expect(findByIdStub.calledOnceWith(budgetId)).to.be.true;
      expect(updateStub.calledOnceWith(
        budgetId,
        req.body,
        { new: true }
      )).to.be.true;
      expect(res.json.calledWith(updatedBudget)).to.be.true;
    });

    it('should return 404 if budget not found', async () => {
      // Stub Budget.findById to return null
      sandbox.stub(Budget, 'findById').resolves(null);

      // Mock request data
      const req = {
        params: { id: new mongoose.Types.ObjectId() },
        user: { id: new mongoose.Types.ObjectId() },
        body: { name: 'Updated Budget' }
      };

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await updateBudget(req, res);

      // Assertions
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Budget not found' })).to.be.true;
    });
  });

  describe('deleteBudget', () => {
    it('should delete a budget successfully', async () => {
      // Mock budget ID
      const budgetId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      // Mock existing budget
      const existingBudget = {
        _id: budgetId,
        user: userId,
        name: 'Grocery Budget',
        category: 'Food & Dining',
        amount: 500.00,
        toString: sandbox.stub().returns(userId.toString())
      };

      // Stub Budget.findById to return existing budget
      const findByIdStub = sandbox.stub(Budget, 'findById').resolves(existingBudget);

      // Stub Budget.findByIdAndDelete to return deleted budget
      const deleteStub = sandbox.stub(Budget, 'findByIdAndDelete').resolves({ _id: budgetId });

      // Mock request data
      const req = {
        params: { id: budgetId },
        user: { id: userId }
      };

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await deleteBudget(req, res);

      // Assertions
      expect(findByIdStub.calledOnceWith(budgetId)).to.be.true;
      expect(deleteStub.calledOnceWith(budgetId)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Budget removed' })).to.be.true;
    });

    it('should return 404 if budget not found for deletion', async () => {
      // Stub Budget.findById to return null
      sandbox.stub(Budget, 'findById').resolves(null);

      // Mock request data
      const req = {
        params: { id: new mongoose.Types.ObjectId() },
        user: { id: new mongoose.Types.ObjectId() }
      };

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await deleteBudget(req, res);

      // Assertions
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Budget not found' })).to.be.true;
    });
  });
});
