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

const [customers, setCustomers] = useState([]);
const [customerName, setCustomerName] = useState('');
const [customerPhone, setCustomerPhone] = useState('');
const [customerType, setCustomerType] = useState('Customer');
const [customerNotes, setCustomerNotes] = useState('');

const [editingCustomerId, setEditingCustomerId] = useState(null);

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

useEffect(() => {
  fetch(`${API_URL}/customers`)
    .then((response) => {
      if (!response.ok) throw new Error('Failed to load customers');
      return response.json();
    })
    .then((result) => {
      setCustomers(result.data);
    })
    .catch((error) => {
      console.error('Could not load customers:', error);
    });
}, []);

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('Sale');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');


async function addTransaction(event) {
  event.preventDefault();

  if (!title.trim() || !amount || Number(amount) <= 0) {
    alert('Please enter a description and a valid amount.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        title: title.trim(),
        category: type === 'Sale' ? 'Sales' : 'General',
        amount: Number(amount),
        date: new Date().toISOString().slice(0, 10),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to save transaction.');
    }

    setTransactions((previous) => [result.data, ...previous]);
    setTitle('');
    setAmount('');
    setType('Sale');
    setShowForm(false);
  } catch (error) {
    alert(error.message || 'Could not connect to the backend.');
  }
}


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


async function addCustomer(event) {
  event.preventDefault();

  if (!customerName.trim()) return;

  const isEditing = editingCustomerId !== null;

  try {
    const response = await fetch(
      isEditing
        ? `${API_URL}/customers/${editingCustomerId}`
        : `${API_URL}/customers`,
      {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          type: customerType,
          notes: customerNotes.trim(),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to save customer');
    }

    if (isEditing) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer.id === result.data.id ? result.data : customer
        )
      );
    } else {
      setCustomers((previous) => [result.data, ...previous]);
    }

    setCustomerName('');
    setCustomerPhone('');
    setCustomerType('Customer');
    setCustomerNotes('');
    setEditingCustomerId(null);
  } catch (error) {
    alert(error.message || 'Could not connect to the backend.');
  }
}


function startEditingCustomer(customer) {
  setEditingCustomerId(customer.id);
  setCustomerName(customer.name);
  setCustomerPhone(customer.phone || '');
  setCustomerType(customer.type);
  setCustomerNotes(customer.notes || '');

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

async function deleteCustomer(customerId) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this customer or lead?'
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_URL}/customers/${customerId}`,
      { method: 'DELETE' }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete record');
    }

    setCustomers((previous) =>
      previous.filter((customer) => customer.id !== customerId)
    );

    if (editingCustomerId === customerId) {
      setEditingCustomerId(null);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerType('Customer');
      setCustomerNotes('');
    }
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
    <article className="stat-card">
      <div className="stat-top">
        <span>Customers</span>
        <span className="stat-icon blue">♙</span>
      </div>
      <h2>{customers.filter((item) => item.type === 'Customer').length}</h2>
      <div className="stat-foot">Saved customer records</div>
    </article>

    <article className="stat-card">
      <div className="stat-top">
        <span>Potential leads</span>
        <span className="stat-icon purple">✧</span>
      </div>
      <h2>{customers.filter((item) => item.type === 'Lead').length}</h2>
      <div className="stat-foot">Potential customers</div>
    </article>

    <article className="panel full-panel customer-message">
      <h3>Add a customer or lead</h3>

      <form onSubmit={addCustomer} className="customer-form">
        <input
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          placeholder="Name"
          required
        />

        <input
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
          placeholder="Phone (optional)"
        />

        <select
          value={customerType}
          onChange={(event) => setCustomerType(event.target.value)}
        >
          <option value="Customer">Customer</option>
          <option value="Lead">Lead</option>
        </select>

        <textarea
          value={customerNotes}
          onChange={(event) => setCustomerNotes(event.target.value)}
          placeholder="Notes (optional)"
        />

        <button type="submit">Save record</button>
      </form>

      <h3>Saved customers and leads</h3>

      {customers.length === 0 ? (
        <p>No records yet. Add your first customer or lead above.</p>
      ) : (
        <div className="customer-list">

{customers.map((customer) => (
  <article className="customer-row" key={customer.id}>
    <div className="customer-info">
      <strong>{customer.name}</strong>
      <p>{customer.phone || 'No phone provided'}</p>

      {customer.notes && <p>{customer.notes}</p>}
    </div>

    <div className="customer-actions">
      <span className="customer-type">{customer.type}</span>

      <button
        type="button"
        onClick={() => startEditingCustomer(customer)}
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() => deleteCustomer(customer.id)}
      >
        Delete
      </button>
    </div>
  </article>
))}

        </div>
      )}
    </article>
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