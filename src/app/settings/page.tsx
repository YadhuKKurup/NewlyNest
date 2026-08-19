'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { useBudgetStore } from '../../store/useBudgetStore';
import { workspaceService, Workspace } from '../../lib/workspaceService';
import { WorkspaceModal } from '../../components/WorkspaceModal';
import {
  User,
  Mail,
  ShieldCheck,
  Heart,
  Home,
  Copy,
  Check,
  Download,
  Calendar,
  Sparkles,
  LogOut,
  ArrowLeft,
  Trash2,
  Plus,
  CheckCircle2,
  Sliders,
  Users,
  Settings as SettingsIcon,
  Moon,
  Sun
} from 'lucide-react';

function SettingsContent() {
  const { user, signOut, updateUserProfile } = useAuth();
  const {
    isDarkMode,
    toggleDarkMode,
    activeWorkspace,
    setActiveWorkspace,
    items,
    setItems,
  } = useBudgetStore();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'workspaces' | 'partner' | 'export' | 'preferences'>('profile');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [deletingWorkspaceId, setDeletingWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setDisplayName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      loadWorkspaces();
    }
  }, [user]);

  const loadWorkspaces = async () => {
    if (!user) return;
    const wsList = await workspaceService.getUserWorkspaces(user.id);
    setWorkspaces(wsList);
    if (wsList.length > 0 && !activeWorkspace) {
      setActiveWorkspace(wsList[0]);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-sm font-semibold">Loading Settings & Profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-500 mb-2">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold">Sign In Required</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Please sign in to access your profile settings and workspace manager.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home Budget</span>
          </Link>
        </div>
      </div>
    );
  }

  const userAvatar = user.user_metadata?.avatar_url;
  const userEmail = user.email || 'No email registered';
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent Member';

  const inviteUrl = activeWorkspace
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}?invite=${activeWorkspace.id}`
    : '';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setIsSavingProfile(true);
    const { error } = await updateUserProfile(displayName.trim());
    setIsSavingProfile(false);
    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleSwitchWorkspace = async (ws: Workspace) => {
    setActiveWorkspace(ws);
    const cloudItems = await workspaceService.getWorkspaceItems(ws.id);
    setItems(cloudItems);
  };

  const handleDeleteWorkspace = async (wsId: string) => {
    if (workspaces.length <= 1) {
      alert('You cannot delete your last workspace. You must have at least one workspace.');
      return;
    }

    if (!confirm('Are you sure you want to delete this workspace and all its budget items? This action cannot be undone.')) {
      return;
    }

    setDeletingWorkspaceId(wsId);
    await workspaceService.deleteWorkspace(wsId);
    setDeletingWorkspaceId(null);

    const updated = await workspaceService.getUserWorkspaces(user.id);
    setWorkspaces(updated);

    if (activeWorkspace?.id === wsId && updated.length > 0) {
      handleSwitchWorkspace(updated[0]);
    }
  };

  const handleCopyInvite = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ['Category', 'Item Name', 'Min Price (INR)', 'Max Price (INR)', 'Actual Paid (INR)', 'Purchased', 'Notes'];
    const rows = items.map((item) => [
      `"${item.category}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      item.minPrice,
      item.maxPrice,
      item.actualSpent,
      item.purchased ? 'Yes' : 'No',
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NewlyNest_Budget_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NewlyNest_Budget_Data_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home Budget</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                NewlyNest Settings
              </span>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/50 dark:border-slate-700/50"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Settings Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4">
                {userAvatar ? (
                  <img src={userAvatar} alt="Profile" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-400/40 shadow-xl" />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      {displayName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-300" /> {userEmail}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Member since {joinedDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>

            </div>
          </div>

          {/* Settings Grid Layout (Sidebar + Content) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="space-y-2">
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  activeTab === 'profile'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile & Account</span>
              </button>

              <button
                onClick={() => setActiveTab('workspaces')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left justify-between ${
                  activeTab === 'workspaces'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4" />
                  <span>My Workspaces</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300">
                  {workspaces.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('partner')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  activeTab === 'partner'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Partner & Collaboration</span>
              </button>

              <button
                onClick={() => setActiveTab('export')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  activeTab === 'export'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Backup & Data Export</span>
              </button>

              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  activeTab === 'preferences'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>App Preferences</span>
              </button>

            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

                {/* 1. Profile & Account */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Account Profile Details
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Update your public display name and account settings
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Registered Email
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={userEmail}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                      >
                        {saveSuccess ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-300" />
                            <span>Saved Successfully!</span>
                          </>
                        ) : (
                          <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* 2. My Workspaces Manager */}
                {activeTab === 'workspaces' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          Workspaces Manager
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Create, switch, or delete your personal and shared couple budget workspaces
                        </p>
                      </div>

                      <button
                        onClick={() => setIsWorkspaceModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Workspace</span>
                      </button>
                    </div>

                    <div className="space-y-3 pt-2">
                      {workspaces.map((ws) => {
                        const isActive = activeWorkspace?.id === ws.id;
                        return (
                          <div
                            key={ws.id}
                            className={`p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                              isActive
                                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-sm'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                  {ws.name}
                                </h4>
                                {isActive && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white">
                                    Active
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {ws.mode === 'couple' ? 'Shared / Couple' : 'Solo Mode'}
                                </span>
                              </div>

                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Target Budget: <strong className="text-slate-700 dark:text-slate-200">₹{ws.total_target_budget?.toLocaleString('en-IN') || '5,00,000'}</strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {!isActive && (
                                <button
                                  onClick={() => handleSwitchWorkspace(ws)}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
                                >
                                  Switch Active
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteWorkspace(ws.id)}
                                disabled={deletingWorkspaceId === ws.id}
                                title="Delete Workspace"
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Partner & Collaboration */}
                {activeTab === 'partner' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                        Partner Collaboration & Live Sync
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Invite your spouse or partner to co-manage your home budget in real-time across devices
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                          Partner Share Link
                        </span>
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded-full">
                          WebSockets Enabled
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={inviteUrl}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono focus:outline-none"
                        />
                        <button
                          onClick={handleCopyInvite}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-colors whitespace-nowrap shadow-sm"
                        >
                          {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Send this link on WhatsApp or iMessage. When your partner opens it and signs in with Google, they instantly get joint editing access.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Backup & Data Export */}
                {activeTab === 'export' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Backup & Data Export
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Download your full budget list, prices, and notes for offline backups or spreadsheet analysis
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <button
                        onClick={handleExportCSV}
                        disabled={items.length === 0}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-500 text-left transition-all group disabled:opacity-50"
                      >
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit mb-3">
                          <Download className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          Export to Excel / CSV
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Download spreadsheet format compatible with Excel & Google Sheets (.csv)
                        </p>
                      </button>

                      <button
                        onClick={handleExportJSON}
                        disabled={items.length === 0}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-500 text-left transition-all group disabled:opacity-50"
                      >
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit mb-3">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          Raw JSON Data Backup
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Download structured JSON backup file (.json)
                        </p>
                      </button>

                    </div>
                  </div>
                )}

                {/* 5. App Preferences */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Application Preferences
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Customize currency formatting and application theme
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Application Theme Mode
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Switch between Light Mode and Dark Glassmorphic Theme
                          </p>
                        </div>
                        <button
                          onClick={toggleDarkMode}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                          {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Default Currency Formatting
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Formatted in Indian Rupee (₹) with en-IN numbering
                          </p>
                        </div>
                        <span className="px-3 py-1.5 rounded-xl font-bold text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          ₹ INR (Rupees)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </main>

        {/* Modal for creating a new workspace */}
        <WorkspaceModal
          isOpen={isWorkspaceModalOpen}
          onClose={() => setIsWorkspaceModalOpen(false)}
          activeWorkspace={activeWorkspace}
          onWorkspaceCreated={(ws) => {
            handleSwitchWorkspace(ws);
            loadWorkspaces();
          }}
        />

      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthProvider>
      <SettingsContent />
    </AuthProvider>
  );
}
