import React from 'react';
import { RefreshCw, UtensilsCrossed, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled UI error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border-2 border-amber-300 p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-brand font-black text-xl text-stone-900">
                Kuch Samasya Aayi Hai (Something went wrong)
              </h2>
              <p className="text-xs text-stone-600 mt-1.5">
                Kripya pareshan na hon. Neeche diye button par click karke wapas Menu par jayein.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-[11px] text-stone-500 font-mono text-left break-words">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-gradient-to-r from-red-700 via-red-800 to-amber-700 text-white font-brand font-black py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:opacity-95 transition active:scale-98 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Wapas Menu Par Jayein (Reload Menu)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
