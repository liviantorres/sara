import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-xl border border-red-100 shadow-sm mt-10">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ops! Ocorreu um erro inesperado.</h2>
          <p className="text-gray-500 mb-6 max-w-md">Não conseguimos renderizar esta parte do painel. A equipe técnica já foi notificada.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2 px-6 py-2 bg-[#005386] text-white rounded-lg hover:bg-[#003f66] transition-colors"
          >
            <RefreshCw size={18} /> Recarregar Tela
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;