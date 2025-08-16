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
        isActive: true
      };

      // Stub Budget.create to return the createdBudget
      const createStub = sandbox.stub(Budget, 'create').resolves(createdBudget);

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await createBudget(req, res);

      // Assertions
      expect(createStub.calledOnceWith({ user: req.user.id, ...req.body })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(createdBudget)).to.be.true;
    });

    it('should return 500 if an error occurs during creation', async () => {
      // Stub Budget.create to throw an error
      const createStub = sandbox.stub(Budget, 'create').throws(new Error('DB Error'));

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
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await createBudget(req, res);

      // Assertions
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
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
        exec: sandbox.stub().resolves(mockBudgets)
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
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockBudgets)).to.be.true;
    });

    it('should return 500 if an error occurs while fetching budgets', async () => {
      // Stub Budget.find to throw an error
      const findStub = sandbox.stub(Budget, 'find').returns({
        exec: sandbox.stub().throws(new Error('DB Error'))
      });

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
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  describe('updateBudget', () => {
    it('should update a budget successfully', async () => {
      // Mock budget ID
      const budgetId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

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

      // Stub Budget.findByIdAndUpdate to return updated budget
      const updateStub = sandbox.stub(Budget, 'findByIdAndUpdate').returns({
        exec: sandbox.stub().resolves(updatedBudget)
      });

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
      expect(updateStub.calledOnceWith(budgetId, req.body, { new: true })).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(updatedBudget)).to.be.true;
    });

    it('should return 404 if budget not found', async () => {
      // Stub Budget.findByIdAndUpdate to return null
      const updateStub = sandbox.stub(Budget, 'findByIdAndUpdate').returns({
        exec: sandbox.stub().resolves(null)
      });

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

      // Mock deleted budget
      const deletedBudget = {
        _id: budgetId,
        name: 'Deleted Budget',
        category: 'Food & Dining'
      };

      // Stub Budget.findByIdAndDelete to return deleted budget
      const deleteStub = sandbox.stub(Budget, 'findByIdAndDelete').returns({
        exec: sandbox.stub().resolves(deletedBudget)
      });

      // Mock request data
      const req = {
        params: { id: budgetId },
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
      expect(deleteStub.calledOnceWith(budgetId)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Budget deleted successfully' })).to.be.true;
    });

    it('should return 404 if budget not found for deletion', async () => {
      // Stub Budget.findByIdAndDelete to return null
      const deleteStub = sandbox.stub(Budget, 'findByIdAndDelete').returns({
        exec: sandbox.stub().resolves(null)
      });

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
