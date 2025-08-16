const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const { createBudget, getBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { expect } = chai;

describe('Budget Controller - CRUD Operations', () => {
  
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
        isActive: true
      };

      // Stub Budget.create to return the createdBudget
      const createStub = sinon.stub(Budget, 'create').resolves(createdBudget);

      // Mock response object
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Call function
      await createBudget(req, res);

      // Assertions
      expect(createStub.calledOnceWith({ user: req.user.id, ...req.body })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(createdBudget)).to.be.true;

      // Restore stubbed methods
      createStub.restore();
    });

    it('should return 500 if an error occurs during creation', async () => {
      // Stub Budget.create to throw an error
      const createStub = sinon.stub(Budget, 'create').throws(new Error('DB Error'));

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

      // Mock response object
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Call function
      await createBudget(req, res);

      // Assertions
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

      // Restore stubbed methods
      createStub.restore();
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

      // Mock request
      const req = {
        user: { id: userId }
      };

      // Mock response
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Stub Budget.find
      const findStub = sinon.stub(Budget, 'find').returns({
        sort: sinon.stub().returns({
          populate: sinon.stub().resolves(mockBudgets)
        })
      });

      // Call function
      await getBudgets(req, res);

      // Assertions
      expect(findStub.calledOnceWith({ user: userId })).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockBudgets)).to.be.true;

      // Restore stubbed methods
      findStub.restore();
    });

    it('should return 500 if an error occurs while fetching budgets', async () => {
      // Mock request
      const req = {
        user: { id: new mongoose.Types.ObjectId() }
      };

      // Mock response
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Stub Budget.find to throw an error
      const findStub = sinon.stub(Budget, 'find').throws(new Error('DB Error'));

      // Call function
      await getBudgets(req, res);

      // Assertions
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

      // Restore stubbed methods
      findStub.restore();
    });
  });

  describe('updateBudget', () => {
    it('should update a budget successfully', async () => {
      // Mock budget ID
      const budgetId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      // Mock request
      const req = {
        params: { id: budgetId },
        user: { id: userId },
        body: {
          amount: 600.00,
          description: 'Updated grocery budget'
        }
      };

      // Mock updated budget
      const updatedBudget = {
        _id: budgetId,
        user: userId,
        name: 'Grocery Budget',
        category: 'Food & Dining',
        amount: 600.00,
        period: 'monthly',
        description: 'Updated grocery budget',
        isActive: true
      };

      // Mock response
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Stub Budget.findByIdAndUpdate
      const updateStub = sinon.stub(Budget, 'findByIdAndUpdate').resolves(updatedBudget);

      // Call function
      await updateBudget(req, res);

      // Assertions
      expect(updateStub.calledOnceWith(
        budgetId,
        { user: userId, ...req.body },
        { new: true }
      )).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(updatedBudget)).to.be.true;

      // Restore stubbed methods
      updateStub.restore();
    });

    it('should return 404 if budget not found', async () => {
      // Mock request
      const req = {
        params: { id: new mongoose.Types.ObjectId() },
        user: { id: new mongoose.Types.ObjectId() },
        body: { amount: 300.00 }
      };

      // Mock response
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Stub Budget.findByIdAndUpdate to return null
      const updateStub = sinon.stub(Budget, 'findByIdAndUpdate').resolves(null);

      // Call function
      await updateBudget(req, res);

      // Assertions
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Budget not found' })).to.be.true;

      // Restore stubbed methods
      updateStub.restore();
    });
  });

  describe('deleteBudget', () => {
    it('should delete a budget successfully', async () => {
      // Mock budget ID
      const budgetId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      // Mock request
      const req = {
        params: { id: budgetId },
        user: { id: userId }
      };

      // Mock response
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Stub Budget.findByIdAndDelete
      const deleteStub = sinon.stub(Budget, 'findByIdAndDelete').resolves({ _id: budgetId });

      // Call function
      await deleteBudget(req, res);

      // Assertions
      expect(deleteStub.calledOnceWith(budgetId)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Budget deleted successfully' })).to.be.true;

      // Restore stubbed methods
      deleteStub.restore();
    });

    it('should return 404 if budget not found for deletion', async () => {
      // Mock request
      const req = {
        params: { id: new mongoose.Types.ObjectId() },
        user: { id: new mongoose.Types.ObjectId() }
      };

      // Mock response
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Stub Budget.findByIdAndDelete to return null
      const deleteStub = sinon.stub(Budget, 'findByIdAndDelete').resolves(null);

      // Call function
      await deleteBudget(req, res);

      // Assertions
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Budget not found' })).to.be.true;

      // Restore stubbed methods
      deleteStub.restore();
    });
  });
});
