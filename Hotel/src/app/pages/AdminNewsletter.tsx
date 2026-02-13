import React, { useEffect, useState } from 'react';
import { Download, Trash2, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const AdminNewsletter = () => {
  const { user } = useAuth();
  const API_BASE = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5000';
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const getAuthToken = () => {
    const stored = localStorage.getItem('auth');
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return parsed.token as string | undefined;
    } catch {
      return null;
    }
  };

  const loadSubscriptions = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/admin/newsletters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load subscriptions (${response.status})`);
      }

      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load subscriptions';
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadSubscriptions();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/admin/newsletters/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete subscription (${response.status})`);
      }

      toast.success('Subscription deleted');
      setSubscriptions(prev => prev.filter(sub => sub._id !== id));
    } catch (error) {
      toast.error('Failed to delete subscription');
    }
  };

  const handleExport = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/admin/newsletters/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export subscriptions');
      }

      const csv = await response.text();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'newsletter-subscriptions.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Exported subscriptions');
    } catch (error) {
      toast.error('Failed to export subscriptions');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Access Denied</h2>
          <p className="text-stone-600">Admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-stone-800">Newsletter Subscriptions</h1>
            <p className="text-stone-600">Manage newsletter subscribers</p>
          </div>
          <Button onClick={handleExport} className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {loading && (
          <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
            Loading subscriptions...
          </div>
        )}

        {loadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {!loading && !loadError && subscriptions.length === 0 && (
          <div className="rounded-xl border border-stone-200 bg-white px-4 py-8 text-center text-stone-600">
            <Mail className="w-8 h-8 mx-auto mb-3 text-stone-400" />
            No newsletter subscriptions yet.
          </div>
        )}

        {!loading && !loadError && subscriptions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-stone-700">Email</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-stone-700">Subscribed At</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-stone-700">Status</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-stone-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub._id} className="border-b border-stone-100 last:border-b-0">
                      <td className="px-6 py-4 text-sm text-stone-800">{sub.email}</td>
                      <td className="px-6 py-4 text-sm text-stone-600">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {sub.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(sub._id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNewsletter;
