export function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <span className="text-[17px] font-semibold tracking-tight text-gray-900">USPTO</span>
          </a>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">Signa API replica</span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/signa-so/demo-uspto-trademark-search"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            GitHub
          </a>
          <a
            href="https://docs.signa.so/quickstart"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-[#295E9F] hover:bg-[#1F4A7F] text-white px-3.5 py-1.5 rounded-lg transition-colors font-medium"
          >
            Get API Key
          </a>
        </div>
      </div>
    </header>
  )
}
