"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";

interface Computer {
  id: string;
  name: string;
  os: string;
  cpu: number;
  ram: number;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  running: '#03A97E',
  creating: '#B8860B',
  starting: '#B8860B',
  stopped: '#999999',
  terminated: '#999999',
  error: '#E53935',
  stopping: '#B8860B',
  restarting: '#B8860B',
};

export function ComputersSection() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchComputers = useCallback(async () => {
    const { data } = await supabase
      .from("computers")
      .select("id, name, os, cpu, ram, status, created_at")
      .not("status", "eq", "terminated")
      .order("created_at", { ascending: false });
    setComputers(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchComputers(); }, [fetchComputers]);

  if (loading) {
    return <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Loading...</div>;
  }

  if (computers.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
          No computers running.
        </p>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
          Create one via the API or SDK to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="w-full" style={{ fontSize: 'var(--text-sm)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
            <th style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>Name</th>
            <th style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>Spec</th>
            <th style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>Status</th>
            <th style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {computers.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{c.name}</td>
              <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                {c.cpu} vCPU / {c.ram} GB
              </td>
              <td style={{ padding: '10px 16px' }}>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[c.status] || '#999' }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: STATUS_COLORS[c.status] || 'var(--text-tertiary)' }}>
                    {c.status}
                  </span>
                </span>
              </td>
              <td style={{ padding: '10px 16px', color: 'var(--text-tertiary)' }}>
                {new Date(c.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
