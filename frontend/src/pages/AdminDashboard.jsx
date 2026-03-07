import React from 'react';

const AdminDashboard = () => {
  const reports = [
    { user: "User_123", comment: "Offensive language used here...", reason: "Profanity", status: "Pending" },
    { user: "User_456", comment: "Spam link to external site", reason: "Spam", status: "Pending" }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '40px' }}>Admin <span style={{ color: 'var(--secondary)' }}>Moderation</span></h1>
      
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Total Comments</h4>
          <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>2,543</div>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Active Reports</h4>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--secondary)' }}>12</div>
        </div>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Daily Votes</h4>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>1,892</div>
        </div>
      </div>

      <section>
        <h2 style={{ marginBottom: '24px' }}>Pending Reports</h2>
        <div className="glass-card" style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px' }}>User</th>
                <th style={{ padding: '16px' }}>Comment</th>
                <th style={{ padding: '16px' }}>Reason</th>
                <th style={{ padding: '16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{r.user}</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{r.comment}</td>
                  <td style={{ padding: '16px' }}><span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{r.reason}</span></td>
                  <td style={{ padding: '16px' }}>
                    <button style={{ color: 'var(--secondary)', fontWeight: 600, marginRight: '15px' }}>Hide</button>
                    <button style={{ color: 'var(--primary)', fontWeight: 600 }}>Ignore</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
