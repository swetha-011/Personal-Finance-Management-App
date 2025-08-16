const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { createTransaction, getTransactions, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { expect } = chai;

describe('Transaction Controller - CRUD Operations', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

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
        ...req.body,
        save: sandbox.stub().resolves({
          _id: new mongoose.Types.ObjectId(),
          user: req.user.id,
          ...req.body
        })
      };

      // Stub Transaction constructor
      const TransactionStub = sandbox.stub(Transaction).returns(createdTransaction);

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await createTransaction(req, res);

      // Assertions
      expect(TransactionStub.calledOnceWith({
        user: req.user.id,
        type: req.body.type,
        category: req.body.category,
        amount: req.body.amount,
        description: req.body.description,
        date: req.body.date,
        tags: req.body.tags
      })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
    });

    it('should return 500 if an error occurs during creation', async () => {
      // Mock request data
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: {
          type: 'income',
          category: 'Salary',
          amount: 3000.00,
          description: 'Monthly salary'
        }
      };

      // Mock transaction with save that throws error
      const transactionWithError = {
        save: sandbox.stub().throws(new Error('DB Error'))
      };

      // Stub Transaction constructor to return transaction with error
      sandbox.stub(Transaction).returns(transactionWithError);

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await createTransaction(req, res);

      // Assertions
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Server error' })).to.be.true;
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
          amount: 3000.00,
          description: 'Monthly salary',
          date: new Date()
        }
      ];

      // Stub Transaction.find to return mock transactions
      const findStub = sandbox.stub(Transaction, 'find').returns({
        sort: sandbox.stub().resolves(mockTransactions)
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
      await getTransactions(req, res);

      // Assertions
      expect(findStub.calledOnceWith({ user: userId })).to.be.true;
      expect(res.json.calledWith(mockTransactions)).to.be.true;
    });

    it('should return 500 if an error occurs while fetching transactions', async () => {
      // Stub Transaction.find to throw an error
      sandbox.stub(Transaction, 'find').throws(new Error('DB Error'));

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
      await getTransactions(req, res);

      // Assertions
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Server error' })).to.be.true;
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction successfully', async () => {
      // Mock transaction ID
      const transactionId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      // Mock existing transaction
      const existingTransaction = {
        _id: transactionId,
        user: userId,
        type: 'expense',
        category: 'Food & Dining',
        amount: 50.00,
        description: 'Lunch',
        date: new Date(),
        toString: sandbox.stub().returns(userId.toString())
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

      // Stub Transaction.findById to return existing transaction
      const findByIdStub = sandbox.stub(Transaction, 'findById').resolves(existingTransaction);

      // Stub Transaction.findByIdAndUpdate to return updated transaction
      const updateStub = sandbox.stub(Transaction, 'findByIdAndUpdate').resolves(updatedTransaction);

      // Mock request data
      const req = {
        params: { id: transactionId },
        user: { id: userId },
        body: {
          amount: 75.00,
          description: 'Updated lunch expense'
        }
      };

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await updateTransaction(req, res);

      // Assertions
      expect(findByIdStub.calledOnceWith(transactionId)).to.be.true;
      expect(updateStub.calledOnceWith(
        transactionId,
        req.body,
        { new: true }
      )).to.be.true;
      expect(res.json.calledWith(updatedTransaction)).to.be.true;
    });

    it('should return 404 if transaction not found', async () => {
      // Stub Transaction.findById to return null
      sandbox.stub(Transaction, 'findById').resolves(null);

      // Mock request data
      const req = {
        params: { id: new mongoose.Types.ObjectId() },
        user: { id: new mongoose.Types.ObjectId() },
        body: { amount: 100.00 }
      };

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await updateTransaction(req, res);

      // Assertions
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Transaction not found' })).to.be.true;
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction successfully', async () => {
      // Mock transaction ID
      const transactionId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      // Mock existing transaction
      const existingTransaction = {
        _id: transactionId,
        user: userId,
        type: 'expense',
        category: 'Food & Dining',
        amount: 50.00,
        description: 'Lunch',
        toString: sandbox.stub().returns(userId.toString())
      };

      // Stub Transaction.findById to return existing transaction
      const findByIdStub = sandbox.stub(Transaction, 'findById').resolves(existingTransaction);

      // Stub Transaction.findByIdAndDelete to return deleted transaction
      const deleteStub = sandbox.stub(Transaction, 'findByIdAndDelete').resolves({ _id: transactionId });

      // Mock request data
      const req = {
        params: { id: transactionId },
        user: { id: userId }
      };

      // Mock response object
      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      // Call function
      await deleteTransaction(req, res);

      // Assertions
      expect(findByIdStub.calledOnceWith(transactionId)).to.be.true;
      expect(deleteStub.calledOnceWith(transactionId)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Transaction removed' })).to.be.true;
    });

    it('should return 404 if transaction not found for deletion', async () => {
      // Stub Transaction.findById to return null
      sandbox.stub(Transaction, 'findById').resolves(null);

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
      await deleteTransaction(req, res);

      // Assertions
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Transaction not found' })).to.be.true;
    });
  });
});
