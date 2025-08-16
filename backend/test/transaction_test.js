const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { createTransaction, getTransactions, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { expect } = chai;

describe('Transaction Controller - CRUD Operations', () => {
  
  describe('createTransaction', () => {
    it('should create a new transaction successfully', async () => {
      // Mock request data
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: {
          type: 'expense',
          category: 'Food & Dining',
          amount: 50.00,
          description: 'Lunch at restaurant',
          date: new Date(),
          tags: ['food', 'lunch']
        }
      };

      // Mock transaction that would be created
      const createdTransaction = {
        _id: new mongoose.Types.ObjectId(),
        user: req.user.id,
        ...req.body
      };

      // Stub Transaction.create to return the createdTransaction
      const createStub = sinon.stub(Transaction, 'create').resolves(createdTransaction);

      // Mock response object
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Call function
      await createTransaction(req, res);

      // Assertions
      expect(createStub.calledOnceWith({ user: req.user.id, ...req.body })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(createdTransaction)).to.be.true;

      // Restore stubbed methods
      createStub.restore();
    });

    it('should return 500 if an error occurs during creation', async () => {
      // Stub Transaction.create to throw an error
      const createStub = sinon.stub(Transaction, 'create').throws(new Error('DB Error'));

      // Mock request data
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: {
          type: 'income',
          category: 'Salary',
          amount: 1000.00,
          description: 'Monthly salary'
        }
      };

      // Mock response object
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Call function
      await createTransaction(req, res);

      // Assertions
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

      // Restore stubbed methods
      createStub.restore();
    });
  });

  describe('getTransactions', () => {
    it('should get all transactions for a user successfully', async () => {
      // Mock user ID
      const userId = new mongoose.Types.ObjectId();

      // Mock transactions data
      const mockTransactions = [
        {
          _id: new mongoose.Types.ObjectId(),
          user: userId,
          type: 'expense',
          category: 'Food & Dining',
          amount: 50.00,
          description: 'Lunch',
          date: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          user: userId,
          type: 'income',
          category: 'Salary',
          amount: 1000.00,
          description: 'Monthly salary',
          date: new Date()
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

      // Stub Transaction.find
      const findStub = sinon.stub(Transaction, 'find').returns({
        sort: sinon.stub().returns({
          populate: sinon.stub().resolves(mockTransactions)
        })
      });

      // Call function
      await getTransactions(req, res);

      // Assertions
      expect(findStub.calledOnceWith({ user: userId })).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockTransactions)).to.be.true;

      // Restore stubbed methods
      findStub.restore();
    });

    it('should return 500 if an error occurs while fetching transactions', async () => {
      // Mock request
      const req = {
        user: { id: new mongoose.Types.ObjectId() }
      };

      // Mock response
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Stub Transaction.find to throw an error
      const findStub = sinon.stub(Transaction, 'find').throws(new Error('DB Error'));

      // Call function
      await getTransactions(req, res);

      // Assertions
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

      // Restore stubbed methods
      findStub.restore();
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction successfully', async () => {
      // Mock transaction ID
      const transactionId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      // Mock request
      const req = {
        params: { id: transactionId },
        user: { id: userId },
        body: {
          amount: 75.00,
          description: 'Updated lunch expense'
        }
      };

      // Mock updated transaction
      const updatedTransaction = {
        _id: transactionId,
        user: userId,
        type: 'expense',
        category: 'Food & Dining',
        amount: 75.00,
        description: 'Updated lunch expense',
        date: new Date()
      };

      // Mock response
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Stub Transaction.findByIdAndUpdate
      const updateStub = sinon.stub(Transaction, 'findByIdAndUpdate').resolves(updatedTransaction);

      // Call function
      await updateTransaction(req, res);

      // Assertions
      expect(updateStub.calledOnceWith(
        transactionId,
        { user: userId, ...req.body },
        { new: true }
      )).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(updatedTransaction)).to.be.true;

      // Restore stubbed methods
      updateStub.restore();
    });

    it('should return 404 if transaction not found', async () => {
      // Mock request
      const req = {
        params: { id: new mongoose.Types.ObjectId() },
        user: { id: new mongoose.Types.ObjectId() },
        body: { amount: 100.00 }
      };

      // Mock response
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Stub Transaction.findByIdAndUpdate to return null
      const updateStub = sinon.stub(Transaction, 'findByIdAndUpdate').resolves(null);

      // Call function
      await updateTransaction(req, res);

      // Assertions
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Transaction not found' })).to.be.true;

      // Restore stubbed methods
      updateStub.restore();
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction successfully', async () => {
      // Mock transaction ID
      const transactionId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      // Mock request
      const req = {
        params: { id: transactionId },
        user: { id: userId }
      };

      // Mock response
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };

      // Stub Transaction.findByIdAndDelete
      const deleteStub = sinon.stub(Transaction, 'findByIdAndDelete').resolves({ _id: transactionId });

      // Call function
      await deleteTransaction(req, res);

      // Assertions
      expect(deleteStub.calledOnceWith(transactionId)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Transaction deleted successfully' })).to.be.true;

      // Restore stubbed methods
      deleteStub.restore();
    });

    it('should return 404 if transaction not found for deletion', async () => {
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

      // Stub Transaction.findByIdAndDelete to return null
      const deleteStub = sinon.stub(Transaction, 'findByIdAndDelete').resolves(null);

      // Call function
      await deleteTransaction(req, res);

      // Assertions
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Transaction not found' })).to.be.true;

      // Restore stubbed methods
      deleteStub.restore();
    });
  });
});
