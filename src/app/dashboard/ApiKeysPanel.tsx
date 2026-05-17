"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export function ApiKeysPanel({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("Default");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const supabase = createClient();

  const fetchKeys = useCallback(async () => {
    const { data } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
      .is("revoked_at", null)
      .order("created_at", { ascending: false });
    setKeys(data || []);
  }, [supabase]);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (data.key) {
        setRevealedKey(data.key);
        setShowForm(false);
        setNewKeyName("Default");
        fetchKeys();
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    await supabase
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id);
    fetchKeys();
  }

  return (
    <div>
      {revealedKey && (
        <div
          className="card"
          style={{
            marginBottom: "var(--space-4)",
            background: "#D1FAE5",
            border: "1px solid #6EE7B7",
          }}
        >
          <p style={{ fontSize: "var(--text-sm)", fontWeight: 500, marginBottom: "var(--space-2)", color: "#065F46" }}>
            Your API key (copy it now, it will not be shown again):
          </p>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", wordBreak: "break-all", color: "#065F46" }}>
            {revealedKey}
          </code>
          <button
            onClick={() => { navigator.clipboard.writeText(revealedKey); setRevealedKey(null); }}
            className="btn-primary"
            style={{ marginTop: "var(--space-3)", padding: "6px 16px", fontSize: "var(--text-xs)" }}
          >
            Copy and dismiss
          </button>
        </div>
      )}

      {keys.length === 0 && !showForm ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-8)" }}>
          <p style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)", marginBottom: "var(--space-4)" }}>
            No API keys yet. Create one to start using the API.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: "var(--text-sm)" }}>
            Create API key
          </button>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="w-full" style={{ fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                  <th style={{ padding: "10px 16px", fontWeight: 500, color: "var(--text-tertiary)", fontSize: "var(--text-xs)" }}>Name</th>
                  <th style={{ padding: "10px 16px", fontWeight: 500, color: "var(--text-tertiary)", fontSize: "var(--text-xs)" }}>Key</th>
                  <th style={{ padding: "10px 16px", fontWeight: 500, color: "var(--text-tertiary)", fontSize: "var(--text-xs)" }}>Created</th>
                  <th style={{ padding: "10px 16px", fontWeight: 500, color: "var(--text-tertiary)", fontSize: "var(--text-xs)" }}></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 16px" }}>{k.name}</td>
                    <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{k.key_prefix}...</td>
                    <td style={{ padding: "10px 16px", color: "var(--text-tertiary)" }}>{new Date(k.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>
                      <button onClick={() => handleRevoke(k.id)} className="hover:opacity-70 transition-opacity" style={{ fontSize: "var(--text-xs)", color: "var(--color-error)" }}>
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn-outline" style={{ marginTop: "var(--space-3)", fontSize: "var(--text-sm)" }}>
              Create another key
            </button>
          )}
        </>
      )}

      {showForm && (
        <div className="card" style={{ marginTop: "var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name"
            style={{
              flex: 1,
              height: 36,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              padding: "0 var(--space-3)",
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-body)",
              outline: "none",
            }}
          />
          <button onClick={handleCreate} disabled={creating} className="btn-primary" style={{ fontSize: "var(--text-sm)", padding: "6px 16px", opacity: creating ? 0.6 : 1 }}>
            {creating ? "Creating..." : "Create"}
          </button>
          <button onClick={() => setShowForm(false)} className="hover:opacity-70 transition-opacity" style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
