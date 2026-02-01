import React, { useMemo, useState } from "react";

const DEFAULT_COMPANIES = `[
  { "company_name": "Apple", "relation": "phone" },
  { "company_name": "Equifax", "relation": "email" }
]`;

const ComplianceTest: React.FC = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState(
    "https://authentic-tranquility-production-647a.up.railway.app"
  );
  const [complianceBaseUrl, setComplianceBaseUrl] = useState("http://localhost:3001");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [companiesInput, setCompaniesInput] = useState(DEFAULT_COMPANIES);
  const [useSampleData, setUseSampleData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<object | null>(null);

  const trimmedBaseUrl = useMemo(() => apiBaseUrl.replace(/\/$/, ""), [apiBaseUrl]);
  const trimmedComplianceUrl = useMemo(
    () => complianceBaseUrl.replace(/\/$/, ""),
    [complianceBaseUrl]
  );

  const handleRun = async () => {
    setError(null);
    setResult(null);

    if (useSampleData) {
      setIsLoading(true);
      try {
        let companies;
        try {
          companies = JSON.parse(companiesInput);
          if (!Array.isArray(companies)) {
            throw new Error("Input must be a JSON array.");
          }
        } catch (err) {
          throw new Error(err instanceof Error ? err.message : "Invalid JSON input.");
        }

        const response = await fetch(`${trimmedComplianceUrl}/api/compliance/breach-check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ entries: companies })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || "Compliance crawl failed.");
        }

        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Compliance crawl failed.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email && !linkedinUrl && !phone) {
      setError("Provide at least one of email, LinkedIn URL, or phone.");
      return;
    }

    setIsLoading(true);
    try {
      const enrichResponse = await fetch(`${trimmedBaseUrl}/api/enrich`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email || undefined,
          linkedinUrl: linkedinUrl || undefined,
          phone: phone || undefined,
          name: name || undefined
        })
      });

      const enrichData = await enrichResponse.json();
      if (!enrichResponse.ok) {
        throw new Error(enrichData?.error || "Nyne enrichment failed.");
      }

      const workCompanies = Array.isArray(enrichData?.workHistory)
        ? enrichData.workHistory.map((item: { company?: string }) => item?.company).filter(Boolean)
        : [];
      const brandAffinities = enrichData?.brandAffinities || {};
      const brandCompanies = Object.values(brandAffinities)
        .flatMap((items) => (Array.isArray(items) ? items : []))
        .filter(Boolean);

      const combinedCompanies = Array.from(new Set([...workCompanies, ...brandCompanies]));
      const mappedCompanies = combinedCompanies.map((company) => ({
        company_name: company,
        categories: []
      }));

      setCompaniesInput(JSON.stringify(mappedCompanies, null, 2));
      setResult({
        nyne: enrichData,
        derived_companies: mappedCompanies
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nyne enrichment failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
            Compliance Crawl Sandbox
          </p>
          <h1 className="text-3xl font-semibold text-slate-100">
            Test Nyne enrichment + Firecrawl inputs
          </h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Toggle between static sample data and Nyne enrichment. The derived company list can be used for
            Firecrawl searches. This page only collects public facts and avoids legal conclusions.
          </p>
        </header>

        <section className="grid gap-6 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/50">
          <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-100">Use sample data</p>
              <p className="text-xs text-slate-400">
                Disable to run Nyne enrichment against the Railway endpoint.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUseSampleData((prev) => !prev)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full border border-slate-700 transition ${
                useSampleData ? "bg-emerald-400" : "bg-slate-800"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-slate-900 transition ${
                  useSampleData ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="apiBaseUrl">
              Nyne API base URL
            </label>
            <input
              id="apiBaseUrl"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
              value={apiBaseUrl}
              onChange={(event) => setApiBaseUrl(event.target.value)}
              placeholder="http://localhost:3001"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="complianceBaseUrl">
              Compliance API base URL
            </label>
            <input
              id="complianceBaseUrl"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
              value={complianceBaseUrl}
              onChange={(event) => setComplianceBaseUrl(event.target.value)}
              placeholder="http://localhost:3001"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="emailInput">
              Email
            </label>
            <input
              id="emailInput"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="linkedinInput">
              LinkedIn URL
            </label>
            <input
              id="linkedinInput"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
              value={linkedinUrl}
              onChange={(event) => setLinkedinUrl(event.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="phoneInput">
              Phone
            </label>
            <input
              id="phoneInput"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+15551234567"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="nameInput">
              Name (optional)
            </label>
            <input
              id="nameInput"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jane Doe"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="companiesInput">
              Entries JSON (company + relation)
            </label>
            <textarea
              id="companiesInput"
              className="min-h-[200px] w-full rounded-2xl border border-slate-700/80 bg-slate-950 px-4 py-3 font-mono text-xs text-slate-100 placeholder:text-slate-500"
              value={companiesInput}
              onChange={(event) => setCompaniesInput(event.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleRun}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {isLoading
              ? useSampleData
                ? "Validating sample data..."
                : "Running enrichment..."
              : useSampleData
              ? "Use sample data"
              : "Run Nyne enrichment"}
          </button>

          {error && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Results</h2>
            {result && (
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                className="rounded-full border border-slate-700/70 px-4 py-2 text-xs text-slate-200 hover:border-emerald-400 hover:text-emerald-200"
              >
                Copy JSON
              </button>
            )}
          </div>
          <div className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-950 p-4 text-xs text-slate-200">
            {result ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            ) : (
              <p className="text-slate-500">Run a crawl to see structured findings here.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComplianceTest;
