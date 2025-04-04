const Transaction = require('../models/Transaction');

// Record a transaction (income/expense)
exports.addTransaction = async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get balance sheet (total income, expense, net)
exports.getBalanceSheet = async (req, res) => {
  try {
    const incomes = await Transaction.aggregate([
      { $match: { type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const expenses = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalIncome = incomes[0] ? incomes[0].total : 0;  
    const totalExpense = expenses[0] ? expenses[0].total : 0;
    res.json({ totalIncome, totalExpense, net: totalIncome - totalExpense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
