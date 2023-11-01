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

export function PanelWithHeaderAndFooterNoPadding({ header, footer, children }) {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
      { header }
      { children }
      { footer }
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
  
export function PanelWithLeftText({ header, children }) {
  return (
    <div className="bg-white border border-gray-200 px-4 py-5 sm:rounded-lg sm:p-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          { header }
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          { children }
        </div>
      </div>
    </div>
  )
}