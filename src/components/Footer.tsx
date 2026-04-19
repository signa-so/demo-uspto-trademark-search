export function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-semibold tracking-tight text-gray-900">USPTO</span>
              <span className="text-gray-300">/</span>
              <span className="text-sm text-gray-500">Signa API replica</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              A demo recreating the USPTO Trademark Search experience, powered by the{" "}
              <a
                href="https://signa.so"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#295E9F] hover:text-[#1F4A7F] font-medium"
              >
                Signa
              </a>{" "}
              trademark data API.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Signa</h4>
              <ul className="space-y-1.5">
                <li>
                  <a
                    href="https://signa.so"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    signa.so
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.signa.so"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.signa.so/quickstart"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Get API Key
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Resources</h4>
              <ul className="space-y-1.5">
                <li>
                  <a
                    href="https://tmsearch.uspto.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    USPTO Trademark Search
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.uspto.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    USPTO.gov
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            <span className="font-semibold text-gray-500">Disclaimer.</span>{" "}
            This site is not affiliated with, endorsed by, or sponsored by the United States Patent and Trademark
            Office (USPTO). It is an independent demo of the Signa API designed to illustrate how the official
            USPTO Trademark Search experience can be reconstructed using Signa&apos;s data. USPTO is a trademark of
            the U.S. government. Authoritative trademark information is only available on{" "}
            <a
              href="https://tmsearch.uspto.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 underline hover:text-gray-700"
            >
              tmsearch.uspto.gov
            </a>
            .
          </p>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
              &copy; {new Date().getFullYear()} Signa
            </p>
            <p className="text-[11px] text-gray-400">
              Built on the{" "}
              <a
                href="https://signa.so"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-600 transition-colors"
              >
                Signa
              </a>{" "}
              API
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
