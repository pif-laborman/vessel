import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For experimenting and prototyping",
    features: [
      "2 concurrent computers",
      "1 vCPU / 4 GB RAM each",
      "10 GB storage",
      "1,000 API calls/day",
      "Community support",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    description: "For teams shipping agents to production",
    features: [
      "20 concurrent computers",
      "4 vCPU / 16 GB RAM each",
      "100 GB storage",
      "Unlimited API calls",
      "Persistent machines",
      "Environment templates",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Scale",
    price: "$199",
    period: "/mo",
    description: "For high-volume agent fleets",
    features: [
      "100 concurrent computers",
      "8 vCPU / 32 GB RAM each",
      "500 GB storage",
      "Unlimited API calls",
      "Custom templates",
      "WebSocket streaming",
      "Dedicated support",
      "99.9% SLA",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-sm)' }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--fill-action)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            Corix
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/docs" className="hover:opacity-70 transition-opacity" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Docs</Link>
            <Link href="/pricing" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, fontFamily: 'var(--font-display)' }}>Pricing</Link>
            <Link href="/login" className="btn-primary" style={{ padding: '6px 16px', fontSize: 'var(--text-sm)' }}>Start building</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6" style={{ paddingTop: 128, paddingBottom: 'var(--space-16)' }}>
        <div className="text-center" style={{ marginBottom: 'var(--space-12)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', marginBottom: 'var(--space-3)' }}>
            Simple, transparent pricing
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>Start free. Scale as your agent fleet grows.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="card flex flex-col"
              style={{
                padding: 'var(--space-6)',
                borderColor: plan.highlight ? 'var(--fill-action)' : undefined,
                borderWidth: plan.highlight ? 2 : undefined,
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>{plan.name}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>{plan.description}</p>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-3xl)' }}>{plan.price}</span>
                {plan.period && <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>{plan.period}</span>}
              </div>
              <ul className="flex-1" style={{ marginBottom: 'var(--space-8)' }}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                    <svg className="shrink-0" style={{ marginTop: 2, color: 'var(--color-success)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={plan.highlight ? 'btn-primary' : 'btn-outline'}
                style={{ textAlign: 'center', width: '100%' }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
