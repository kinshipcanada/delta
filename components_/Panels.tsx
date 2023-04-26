export function BasicPanel({ children }) {
    return (
        <div className="overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="px-4 py-5 sm:p-6">{ children }</div>
        </div>
    )
}

export function PanelWithHeader({ header, children }) {
    return (
      <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
        <div className="px-4 py-5 sm:px-6">
          { header }
        </div>
        <div className="px-4 py-5 sm:p-6">{ children }</div>
      </div>
    )
}

export function PanelWithFooter({ footer, children }) {
    return (
        <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="px-4 py-5 sm:p-6">{ children }</div>
            <div className="px-4 py-4 sm:px-6">
                { footer }
            </div>
        </div>
    )
}

export function PanelWithHeaderAndFooter({ header, footer, children }) {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
      <div className="px-4 py-5 sm:px-6">
        { header }
      </div>
      <div className="px-4 py-5 sm:p-6">{ children }</div>
      <div className="px-4 py-4 sm:px-6">
        { footer }
      </div>
    </div>
  )
}

export function PanelWithHeaderNoPadding({ header, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      { header }
      { children }
    </div>
  )
}
  
