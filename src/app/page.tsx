import Link from "next/link";

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--fill-action)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{ fontSize: 'var(--text-sm)' }}>Corix</span>
        </Link>
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/docs" className="transition-colors hover:opacity-70" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>Docs</Link>
          <Link href="/pricing" className="transition-colors hover:opacity-70" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>Pricing</Link>
          <Link href="https://github.com/pif-laborman/corix" className="transition-colors hover:opacity-70" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>GitHub</Link>
          <Link href="/login" className="btn-primary" style={{ padding: '6px 16px', fontSize: 'var(--text-sm)' }}>
            Start building
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroCode() {
  return (
    <div className="w-full max-w-2xl mx-auto overflow-hidden" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center px-4 gap-2" style={{ height: 40, borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#E53935' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#F5A623' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#03A97E' }} />
        </div>
        <span className="ml-3" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>quickstart.py</span>
      </div>
      <pre className="p-5 overflow-x-auto" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7, fontFamily: 'var(--font-mono)', background: 'var(--bg-page)' }}>
        <code>
          <span style={{ color: '#7C3AED' }}>import</span> <span style={{ color: '#03A97E' }}>corix</span>{"\n"}
          {"\n"}
          <span style={{ color: 'var(--text-tertiary)' }}># Boot a desktop in &lt;500ms</span>{"\n"}
          <span style={{ color: 'var(--text-primary)' }}>computer</span> <span style={{ color: 'var(--text-tertiary)' }}>=</span> <span style={{ color: '#03A97E' }}>corix</span>.<span style={{ color: '#2563EB' }}>create</span>({"\n"}
          {"  "}<span style={{ color: '#B8860B' }}>os</span><span style={{ color: 'var(--text-tertiary)' }}>=</span><span style={{ color: '#03A97E' }}>&quot;linux&quot;</span>,{"\n"}
          {"  "}<span style={{ color: '#B8860B' }}>cpu</span><span style={{ color: 'var(--text-tertiary)' }}>=</span><span style={{ color: '#7C3AED' }}>2</span>,{"\n"}
          {"  "}<span style={{ color: '#B8860B' }}>ram</span><span style={{ color: 'var(--text-tertiary)' }}>=</span><span style={{ color: '#03A97E' }}>&quot;8gb&quot;</span>{"\n"}
          ){"\n"}
          {"\n"}
          <span style={{ color: 'var(--text-tertiary)' }}># Connect Claude to drive it</span>{"\n"}
          <span style={{ color: 'var(--text-primary)' }}>computer</span>.<span style={{ color: '#2563EB' }}>prompt</span>({"\n"}
          {"  "}<span style={{ color: '#B8860B' }}>model</span><span style={{ color: 'var(--text-tertiary)' }}>=</span><span style={{ color: '#03A97E' }}>&quot;claude-sonnet-4-6&quot;</span>,{"\n"}
          {"  "}<span style={{ color: '#B8860B' }}>task</span><span style={{ color: 'var(--text-tertiary)' }}>=</span><span style={{ color: '#03A97E' }}>&quot;Open Firefox, go to HN, find the top post&quot;</span>{"\n"}
          ){"\n"}
          {"\n"}
          <span style={{ color: 'var(--text-tertiary)' }}># Or control it directly</span>{"\n"}
          <span style={{ color: 'var(--text-primary)' }}>computer</span>.<span style={{ color: '#2563EB' }}>screenshot</span>(){"\n"}
          <span style={{ color: 'var(--text-primary)' }}>computer</span>.<span style={{ color: '#2563EB' }}>click</span>(<span style={{ color: '#7C3AED' }}>500</span>, <span style={{ color: '#7C3AED' }}>300</span>){"\n"}
          <span style={{ color: 'var(--text-primary)' }}>computer</span>.<span style={{ color: '#2563EB' }}>type</span>(<span style={{ color: '#03A97E' }}>&quot;Hello from Corix&quot;</span>){"\n"}
          <span style={{ color: 'var(--text-primary)' }}>computer</span>.<span style={{ color: '#2563EB' }}>bash</span>(<span style={{ color: '#03A97E' }}>&quot;ls -la /home&quot;</span>)
        </code>
      </pre>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="card group hover:shadow-md transition-shadow" style={{ padding: 'var(--space-6)' }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: 'var(--bg-warm)', color: 'var(--text-secondary)' }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)' }}>{title}</h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}

function Features() {
  return (
    <section className="max-w-5xl mx-auto px-6" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)' }}>
      <div className="text-center" style={{ marginBottom: 'var(--space-12)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>
          Everything agents need to operate
        </h2>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
          Full desktop control through a simple HTTP API. Screenshot, click, type, execute.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FeatureCard
          title="Sub-500ms boot"
          description="Machines initialize in under half a second. No cold starts. No waiting. Your agent fleet scales instantly."
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>}
        />
        <FeatureCard
          title="Full desktop control"
          description="Mouse clicks, keyboard input, screenshots, bash commands, Python execution. Everything a human can do, your agent can do."
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>}
        />
        <FeatureCard
          title="Any model"
          description="Claude, GPT-4, Gemini, open-source. OpenAI-compatible endpoint included. Bring whatever model fits your task."
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>}
        />
        <FeatureCard
          title="Browser-native desktop"
          description="Not just VNC. A real desktop experience rendered in the browser. File manager, terminal, editor. Watch your agent work live."
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>}
        />
        <FeatureCard
          title="Persistent or ephemeral"
          description="Spin up throwaway sandboxes for one-off tasks, or keep persistent machines running with saved state across sessions."
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>}
        />
        <FeatureCard
          title="SDK + raw API"
          description="Python and TypeScript SDKs for quick integration. Or use the plain HTTP API from any language with an HTTP client."
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></svg>}
        />
      </div>
    </section>
  );
}

function AgentLoop() {
  const steps = [
    { label: "See", desc: "Capture a screenshot of the desktop" },
    { label: "Decide", desc: "AI model analyzes and plans next action" },
    { label: "Act", desc: "Click, type, scroll, or run a command" },
    { label: "Repeat", desc: "Loop until the task is complete" },
  ];

  return (
    <section style={{ background: 'var(--bg-warm)' }}>
      <div className="max-w-5xl mx-auto px-6" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)' }}>
        <div className="text-center" style={{ marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>
            The agent loop
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
            Four steps. Infinite capability. Your agent sees the screen, decides what to do, acts, and repeats.
          </p>
        </div>
        <div className="grid sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.label} className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ border: '1px solid var(--border)', background: 'var(--bg-page)', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>{i + 1}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-base)', marginBottom: 'var(--space-1)' }}>{step.label}</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="max-w-5xl mx-auto px-6 text-center" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>
        Give your agents a body
      </h2>
      <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto', marginBottom: 'var(--space-8)' }}>
        Start building in minutes. Free tier included.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link href="/login" className="btn-primary">Start building</Link>
        <Link href="/docs" className="btn-outline">Read the docs</Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Corix</span>
        <div className="flex items-center gap-5">
          <Link href="/docs" className="hover:opacity-70 transition-opacity" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Docs</Link>
          <Link href="/pricing" className="hover:opacity-70 transition-opacity" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Pricing</Link>
          <Link href="/privacy" className="hover:opacity-70 transition-opacity" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Privacy</Link>
          <Link href="/terms" className="hover:opacity-70 transition-opacity" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Terms</Link>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 text-center" style={{ paddingTop: 128, paddingBottom: 'var(--space-16)' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1" style={{ borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', marginBottom: 'var(--space-6)' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-success)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Now in public beta</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15, marginBottom: 'var(--space-5)', letterSpacing: '-0.02em' }}>
            Cloud desktops for<br />AI agents
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6, marginBottom: 'var(--space-10)' }}>
            Spin up a virtual machine in milliseconds. Connect any AI model.
            Let it see, click, type, and execute. Production-grade infrastructure
            for computer-use agents.
          </p>
          <div className="flex items-center justify-center gap-3" style={{ marginBottom: 'var(--space-16)' }}>
            <Link href="/login" className="btn-primary">Start building</Link>
            <Link href="/docs" className="btn-outline">Read the docs</Link>
          </div>
          <HeroCode />
        </section>

        <Features />
        <AgentLoop />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
