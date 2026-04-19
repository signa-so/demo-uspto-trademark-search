import { ExternalLink } from "lucide-react"

export function UsptoRef() {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-[#295E9F]/5 border-b">
      <div className="max-w-[1400px] mx-auto px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[#295E9F]">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            <span>
              This demo recreates the{" "}
              <a
                href="https://tmsearch.uspto.gov/search/search-results"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#295E9F] hover:text-[#1F4A7F] font-medium inline-flex items-center gap-1"
              >
                USPTO Trademark Search
                <ExternalLink className="h-3 w-3" />
              </a>
              {" "}experience using the Signa API.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
