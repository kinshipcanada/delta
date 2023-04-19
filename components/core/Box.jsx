import Loading from "./Loading";

export function BoxWithHeaderAndFooter({ children, Header, Footer, loading }) {
    return (
      <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200">
        {
            loading ? 

            <div className="divide-y divide-gray-200 relative">
                <div className="px-4 py-5 sm:px-6">
                    <Header />
                </div>
                <div className="px-4 py-5 sm:p-6">
                    { children }
                </div>
                <div className="px-4 py-4 sm:px-6">
                    <Footer />
                </div>
                <div className="absolute rounded-lg inset-0 flex justify-center items-center bg-gray-300 bg-opacity-50 backdrop-blur-lg">
                    <Loading color={"SLATE"}/>
                    <p className="ml-2 text-slate-600 font-semibold leading-6">Loading...</p>
                </div>
            </div>

            :

            <div className="divide-y divide-gray-200 ">
                <div className="px-4 py-5 sm:px-6">
                    <Header />
                </div>
                <div className="px-4 py-5 sm:p-6">
                    { children }
                </div>
                <div className="px-4 py-4 sm:px-6">
                    <Footer />
                </div>
            </div>
        }
      </div>
    )
  }
  