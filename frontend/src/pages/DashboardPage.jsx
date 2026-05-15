/**
 * src/pages/DashboardPage.jsx
 *
 * Professional SaaS Dashboard
 * Features: Clean statistics, activity grid, and minimal TicKas overview.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket,
  Monitor,
  Clock,
  ArrowRight,
  Activity,
  TrendingUp,
  Users,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ticketsApi, assetsApi } from '../services/api';
import { Card, Button, Badge, cn } from '../components/ui';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    totalAssets: 0,
    activeAssets: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [ticketsData, assetsData] = await Promise.all([
          ticketsApi.getAll(),
          assetsApi.getAll()
        ]);

        const ticketsList = Array.isArray(ticketsData) ? ticketsData : ticketsData.tickets || [];
        const assetsList = Array.isArray(assetsData) ? assetsData : assetsData.assets || [];

        setStats({
          totalTickets: ticketsList.length,
          openTickets: ticketsList.filter(t => t.status === 'open' || t.status === 'in-progress').length,
          totalAssets: assetsList.length,
          activeAssets: assetsList.filter(a => a.status === 'active' || a.status === 'available').length,
        });

        setRecentTickets(ticketsList.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Total Tickets', value: stats.totalTickets, icon: Ticket, trend: '+4%', trendUp: true },
    { label: 'Pending Requests', value: stats.openTickets, icon: Clock, trend: '-2%', trendUp: false },
    { label: 'Assets Tracked', value: stats.totalAssets, icon: Monitor, trend: '+12%', trendUp: true },
    { label: 'Active Fleet', value: stats.activeAssets, icon: ShieldCheck, trend: 'Optimal', trendUp: true },
  ];

  return (
    <div className="space-y-8 fade-in">

      {/* Header Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Welcome back. Here is what is happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/assets')} size="md">
            Manage Assets
          </Button>
          <Button variant="primary" onClick={() => navigate('/tickets')} size="md">
            <Plus size={16} />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="p-5 flex flex-col justify-between min-h-[140px]">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                <stat.icon size={20} className="text-neutral-900 dark:text-neutral-100" />
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                stat.trendUp
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                  : "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
              )}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-4">{loading ? '...' : stat.value}</p>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recent Tickets Section */}
        <Card className="lg:col-span-2 p-0 flex flex-col border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Recent Activity</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')} className="text-xs">
              View all
              <ArrowRight size={14} />
            </Button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 flex-1">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="px-6 py-5 animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-1/3" />
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : recentTickets.length > 0 ? (
              recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="px-6 py-5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
                      <Ticket size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{ticket.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-neutral-400 font-medium">#{ticket.id}</span>
                        <span className="w-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                        <span className="text-[11px] text-neutral-400 font-medium">
                          {new Date(ticket.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={ticket.status === 'open' ? 'warning' : ticket.status === 'closed' ? 'success' : 'info'} className="hidden sm:inline-flex">
                    {ticket.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <CheckCircle2 size={32} className="text-neutral-200 dark:text-neutral-800 mb-3" />
                <p className="text-sm font-medium text-neutral-500">No recent activity found.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Sidebar Insights */}
        <div className="space-y-8">
          {/* Quick Stats Card */}
          <Card className="bg-neutral-950 dark:bg-neutral-900 text-white p-6 border-none shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={80} />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-6">Service Health</h3>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-neutral-400">Response Rate</span>
                    <span className="text-white">98%</span>
                  </div>
                  <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} className="h-full bg-white" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-neutral-400">Resolution Time</span>
                    <span className="text-white">Optimal</span>
                  </div>
                  <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-neutral-400" />
                  </div>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-8 bg-white hover:bg-neutral-200 text-black border-none h-10 text-xs font-bold">
                Run System Audit
              </Button>
            </div>
          </Card>

          {/* Infrastructure Health */}
          <Card className="p-6">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-5">Infrastructure</h4>
            <div className="space-y-4">
              {[
                { name: 'Core API', status: 'Healthy', color: 'emerald' },
                { name: 'Database', status: 'Stable', color: 'emerald' },
                { name: 'Auth Node', status: 'Active', color: 'emerald' },
                { name: 'Storage', status: 'Available', color: 'emerald' },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider text-emerald-500")}>
                      {service.status}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
