export const BasicPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="px-4 py-5 sm:p-6">{ children }</div>
        </div>
    )
}

export const PanelWithHeader: React.FC<{ header: React.ReactNode, children: React.ReactNode }> = ({ header, children }) => {
    return (
      <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
        <div className="px-4 py-5 sm:px-6">
          { header }
        </div>
        <div className="px-4 py-5 sm:p-6">{ children }</div>
      </div>
    )
}

export const PanelWithFooter: React.FC<{ children: React.ReactNode, footer: React.ReactNode }> = ({ footer, children }) => {
    return (
        <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
            <div className="px-4 py-5 sm:p-6">{ children }</div>
            <div className="px-4 py-4 sm:px-6">
                { footer }
            </div>
        </div>
    )
}

export const PanelWithHeaderAndFooter: React.FC<{ header: React.ReactNode, children: React.ReactNode, footer: React.ReactNode }> = ({ header, footer, children }) => {
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

export const PanelWithHeaderAndFooterNoPadding: React.FC<{ header: React.ReactNode, children: React.ReactNode, footer: React.ReactNode }> = ({ header, footer, children }) => {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
      { header }
      { children }
      { footer }
    </div>
  )
}

export const PanelWithHeaderNoPadding: React.FC<{ header: React.ReactNode, children: React.ReactNode }> = ({ header, children }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      { header }
      { children }
    </div>
  )
}
  
export const PanelWithLeftText: React.FC<{ header: React.ReactNode, children: React.ReactNode }> = ({ header, children }) => {
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