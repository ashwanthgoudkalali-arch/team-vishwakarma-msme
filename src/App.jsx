import { useEffect, useState } from 'react';
import './App.css';

const initialTransactions = [
  { id: 1, type: 'Sale', title: 'Restaurant orders', category: 'Sales', amount: 8500, date: 'Today' },
  { id: 2, type: 'Expense', title: 'Vegetable supplies', category: 'Inventory', amount: 2200, date: 'Today' },
  { id: 3, type: 'Sale', title: 'Catering order', category: 'Sales', amount: 6500, date: 'Yesterday' },
  { id: 4, type: 'Expense', title: 'Electricity bill', category: 'Utilities', amount: 1800, date: 'Yesterday' },
];

const API_URL = 'http://localhost:5000/api';

function App() {
  const [page, setPage] = useState('Dashboard');

const [transactions, setTransactions] = useState([]);

useEffect(() => {
  fetch(`${API_URL}/transactions`)
    .then((response) => {
      if (!response.ok) throw new Error('Failed to load transactions');
      return response.json();
    })
    .then((result) => {
      setTransactions(result.data);
    })
    .catch((error) => {
      console.error('Could not load transactions:', error);
    });
}, []);

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('Sale');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const sales = transactions
    .filter((item) => item.type === 'Sale')
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = transactions
    .filter((item) => item.type === 'Expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const money = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);

async function addTransaction(event) {
  event.preventDefault();

  if (!title.trim() || Number(amount) <= 0) return;

  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        title: title.trim(),
        amount: Number(amount),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to save transaction');
    }

    setTransactions((previous) => [result.data, ...previous]);
    setTitle('');
    setAmount('');
    setShowForm(false);
  } catch (error) {
    alert(error.message || 'Could not connect to the backend.');
  }
}
  const navItems = [
    { name: 'Dashboard', icon: '◫' },
    { name: 'Transactions', icon: '↔' },
    { name: 'Customers & Leads', icon: '♙' },
    { name: 'AI Recommendations', icon: '✳' },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">V</div>
          <div>
            <h2>Vishvakarma</h2>
            <span>MSME GROWTH PLATFORM</span>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${page === item.name ? 'active' : ''}`}
              onClick={() => setPage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
              {item.name === 'AI Recommendations' && (
                <span className="new-tag">AI</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Grow your business</strong>
            <p>Small steps. Smarter decisions.</p>
          </div>
          <div className="profile">
            <div className="avatar">RC</div>
            <div>
              <strong>Restaurant Café</strong>
              <span>Business account</span>
            </div>
            <span className="profile-dots">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {page}</div>
          <div className="topbar-right">
            <span className="demo-badge"><span /> Demo data</span>
            <div className="top-avatar">RC</div>
          </div>
        </header>

        <div className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">YOUR BUSINESS AT A GLANCE</div>
              <h1>{page === 'Dashboard' ? 'Good morning, business owner 👋' : page}</h1>
              <p className="subtitle">
                {page === 'Dashboard'
                  ? 'Here’s what’s happening with your business today.'
                  : `Manage your ${page.toLowerCase()} in one simple place.`}
              </p>
            </div>
            <button className="primary-button" onClick={() => setShowForm(true)}>
              <span>＋</span> Add transaction
            </button>
          </div>

          {page === 'Dashboard' && (
            <>
              <section className="stats-grid">
                <article className="stat-card">
                  <div className="stat-top"><span>Total sales</span><span className="stat-icon green">↗</span></div>
                  <h2>{money(sales)}</h2>
                  <div className="stat-foot"><span className="positive">●</span> Sample business data</div>
                </article>
                <article className="stat-card">
                  <div className="stat-top"><span>Total expenses</span><span className="stat-icon orange">↘</span></div>
                  <h2>{money(expenses)}</h2>
                  <div className="stat-foot">Recorded business costs</div>
                </article>
                <article className="stat-card">
                  <div className="stat-top"><span>Net balance</span><span className="stat-icon purple">₹</span></div>
                  <h2>{money(sales - expenses)}</h2>
                  <div className="stat-foot">Sales minus expenses</div>
                </article>
                <article className="stat-card">
                  <div className="stat-top"><span>Transactions</span><span className="stat-icon blue">⇄</span></div>
                  <h2>{transactions.length}</h2>
                  <div className="stat-foot">Recorded entries</div>
                </article>
              </section>

              <section className="content-grid">
                <article className="panel transactions-panel">
                  <div className="panel-heading">
                    <div><h3>Recent transactions</h3><p>Your latest recorded activity</p></div>
                    <button className="text-button" onClick={() => setPage('Transactions')}>View all →</button>
                  </div>
                  <div className="transaction-list">
                    {transactions.slice(0, 5).map((item) => (
                      <div className="transaction-row" key={item.id}>
                        <div className={`transaction-icon ${item.type === 'Sale' ? 'sale-icon' : 'expense-icon'}`}>
                          {item.type === 'Sale' ? '↗' : '↙'}
                        </div>
                        <div className="transaction-details">
                          <strong>{item.title}</strong>
                          <span>{item.category} · {item.date}</span>
                        </div>
                        <strong className={item.type === 'Sale' ? 'amount-positive' : 'amount-negative'}>
                          {item.type === 'Sale' ? '+' : '−'}{money(item.amount)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="panel insights-panel">
                  <div className="insight-heading"><span className="sparkle">✳</span><div><h3>AI growth insights</h3><p>Ideas for your next move</p></div></div>
                  <div className="insight-item">
                    <div className="insight-number">01</div>
                    <div><strong>Track your daily bestsellers</strong><p>Record which menu items sell most to make smarter stock decisions.</p></div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-number">02</div>
                    <div><strong>Review recurring expenses</strong><p>Compare supplier costs regularly to spot possible savings.</p></div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-number">03</div>
                    <div><strong>Bring customers back</strong><p>Try a simple loyalty offer for repeat café customers.</p></div>
                  </div>
                  <div className="insight-note">✦ Suggestions are examples, not AI-generated analysis.</div>
                </article>
              </section>
            </>
          )}

          {page === 'Transactions' && (
            <section className="panel full-panel">
              <div className="panel-heading"><div><h3>All transactions</h3><p>Sales and expenses recorded in this demo</p></div></div>
              <div className="table-wrap">
                <table><thead><tr><th>TRANSACTION</th><th>TYPE</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th></tr></thead>
                  <tbody>{transactions.map((item) => <tr key={item.id}><td><strong>{item.title}</strong></td><td><span className={`type-pill ${item.type === 'Sale' ? 'sale-pill' : 'expense-pill'}`}>{item.type}</span></td><td>{item.category}</td><td>{item.date}</td><td className={item.type === 'Sale' ? 'amount-positive' : 'amount-negative'}>{money(item.amount)}</td></tr>)}</tbody>
                </table>
              </div>
            </section>
          )}

          {page === 'Customers & Leads' && (
            <section className="stats-grid customer-grid">
              <article className="stat-card"><div className="stat-top"><span>Customers</span><span className="stat-icon blue">♙</span></div><h2>24</h2><div className="stat-foot">Illustrative sample count</div></article>
              <article className="stat-card"><div className="stat-top"><span>Potential leads</span><span className="stat-icon purple">✧</span></div><h2>8</h2><div className="stat-foot">Illustrative sample count</div></article>
              <article className="stat-card"><div className="stat-top"><span>Follow-ups due</span><span className="stat-icon orange">◷</span></div><h2>3</h2><div className="stat-foot">Example reminders</div></article>
              <article className="stat-card"><div className="stat-top"><span>Repeat customers</span><span className="stat-icon green">↻</span></div><h2>12</h2><div className="stat-foot">Illustrative sample count</div></article>
              <article className="panel full-panel customer-message"><h3>Build customer relationships</h3><p>This section is ready for a customer and lead management form in the next step.</p></article>
            </section>
          )}

          {page === 'AI Recommendations' && (
            <section className="panel recommendations-panel">
              <div className="recommendations-title"><span className="sparkle large-sparkle">✳</span><div><h3>Growth ideas for your business</h3><p>Starter suggestions for a small restaurant or café</p></div></div>
              <div className="recommendation-card"><span>01</span><div><h4>Understand profit by item</h4><p>Track ingredient costs and selling prices for popular menu items before changing prices.</p><small>FINANCIAL MANAGEMENT</small></div></div>
              <div className="recommendation-card"><span>02</span><div><h4>Plan inventory around demand</h4><p>Use daily sales records to estimate ingredient needs and reduce avoidable waste.</p><small>OPERATIONS</small></div></div>
              <div className="recommendation-card"><span>03</span><div><h4>Encourage repeat visits</h4><p>Record returning customers and test a small loyalty offer, then compare results.</p><small>CUSTOMER GROWTH</small></div></div>
              <p className="disclaimer">These are general demo suggestions. They are not generated from your live business data.</p>
            </section>
          )}
        </div>
      </main>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-heading"><div><h2>Add transaction</h2><p>Record a sale or business expense.</p></div><button className="close-button" onClick={() => setShowForm(false)}>×</button></div>
            <form onSubmit={addTransaction}>
              <label>Transaction type</label>
              <div className="type-selector">
                <button type="button" className={type === 'Sale' ? 'selected-sale' : ''} onClick={() => setType('Sale')}>↗ Sale</button>
                <button type="button" className={type === 'Expense' ? 'selected-expense' : ''} onClick={() => setType('Expense')}>↙ Expense</button>
              </div>
              <label htmlFor="transaction-title">Description</label>
              <input id="transaction-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Customer order" required />
              <label htmlFor="transaction-amount">Amount (₹)</label>
              <input id="transaction-amount" type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="e.g. 1500" required />
              <button type="submit" className="primary-button form-submit">Save transaction</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;