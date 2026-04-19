import { KeyRound } from "lucide-react"

export function MissingKeyScreen() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full">
        <div className="mb-5">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#295E9F]/10">
            <KeyRound className="h-5 w-5 text-[#295E9F]" />
          </div>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Add your Signa API key to get started</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          This is a developer showcase. The app reads your key from a local <code className="px-1.5 py-0.5 bg-gray-100 rounded text-[12px] font-mono">.env</code> file so
          nothing is stored in the browser and the repo has no secrets committed.
        </p>

        <ol className="space-y-4 mb-6">
          <li className="text-sm text-gray-700 leading-relaxed">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-[11px] font-semibold mr-2">1</span>
            Grab an API key from{" "}
            <a
              href="https://docs.signa.so/quickstart"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#295E9F] hover:text-[#1F4A7F] font-medium underline underline-offset-2"
            >
              docs.signa.so/quickstart
            </a>
            .
          </li>
          <li className="text-sm text-gray-700 leading-relaxed">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-[11px] font-semibold mr-2">2</span>
            Create a <code className="px-1.5 py-0.5 bg-gray-100 rounded text-[12px] font-mono">.env</code> file in the project root:
            <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded-lg text-[12px] font-mono overflow-x-auto">{`VITE_SIGNA_API_KEY=sig_live_...`}</pre>
          </li>
          <li className="text-sm text-gray-700 leading-relaxed">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-[11px] font-semibold mr-2">3</span>
            Restart the dev server with <code className="px-1.5 py-0.5 bg-gray-100 rounded text-[12px] font-mono">npm run dev</code>.
          </li>
        </ol>

        <p className="text-xs text-gray-500 leading-relaxed">
          A starter template lives at <code className="px-1.5 py-0.5 bg-gray-100 rounded text-[11px] font-mono">.env.example</code> — copy it with{" "}
          <code className="px-1.5 py-0.5 bg-gray-100 rounded text-[11px] font-mono">cp .env.example .env</code>.
        </p>
      </div>
    </div>
  )
}
