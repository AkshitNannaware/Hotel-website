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
    <div className="min-h-screen bg-[#3f4a40] py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="rounded-[24px] bg-[#4a5449]/40 backdrop-blur-sm border border-[#5b6255] p-8 md:p-10 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.35em] uppercase text-[#c9a35d]" style={{ fontFamily: "'Great Vibes', cursive" }}>Newsletter</p>
              <h1 className="mt-4 text-3xl md:text-4xl font-serif text-[#efece6]">
                Newsletter Subscriptions
              </h1>
              <p className="mt-3 text-[#c9c3b6] text-base md:text-lg">
                Manage newsletter subscribers and export the latest list.
              </p>
            </div>
            <Button
              onClick={handleExport}
              className="h-12 px-6 rounded-xl bg-[#c9a35d] text-[#2a3429] hover:bg-[#b8934d]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-[#5b6255] bg-[#2f3a32]/80 px-4 py-3 text-sm text-[#d7d2c5]">
            Loading subscriptions...
          </div>
        )}

        {loadError && (
          <div className="rounded-xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {loadError}
          </div>
        )}

        {!loading && !loadError && subscriptions.length === 0 && (
          <div className="rounded-2xl border border-[#5b6255] bg-[#2f3a32]/80 px-4 py-10 text-center text-[#d7d2c5]">
            <Mail className="w-8 h-8 mx-auto mb-3 text-[#a89f90]" />
            No newsletter subscriptions yet.
          </div>
        )}

        {!loading && !loadError && subscriptions.length > 0 && (
          <div className="rounded-2xl border border-[#5b6255] bg-[#2f3a32]/90 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#384237]">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-[#cfc9bb]">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-[#cfc9bb]">
                      Subscribed At
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-[#cfc9bb]">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-[#cfc9bb]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub._id} className="border-b border-[#465045] last:border-b-0">
                      <td className="px-6 py-4 text-sm text-[#efece6]">{sub.email}</td>
                      <td className="px-6 py-4 text-sm text-[#cfc9bb]">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            sub.active
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : 'bg-rose-500/20 text-rose-200'
                          }`}
                        >
                          {sub.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-rose-300/40 text-rose-200 hover:bg-rose-500/10"
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
