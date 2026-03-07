import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ManifestoDetail from './pages/ManifestoDetail';
import TopCommentsPage from './pages/TopCommentsPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CreateTopic from './pages/CreateTopic';
import Profile from './pages/Profile';
import ActiveDiscussions from './pages/ActiveDiscussions';
import ForPM from './pages/ForPM';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manifesto/:id" element={<ManifestoDetail />} />
        <Route path="/top" element={<TopCommentsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/create-topic" element={<CreateTopic />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/discussions" element={<ActiveDiscussions />} />
        <Route path="/for-pm" element={<ForPM />} />
      </Routes>
    </Layout>
  );
}

export default App;
