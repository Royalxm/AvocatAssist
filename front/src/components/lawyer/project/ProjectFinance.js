import React, { useState, useEffect } from 'react';
// Removed useParams as projectId will be passed as prop

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Accept projectId and isSummary props
function ProjectFinance({ projectId, isSummary = false }) {
  // const { projectId } = useParams(); // projectId now comes from props
  const [estimates, setEstimates] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchFinanceData = async () => {
      if (!projectId) return; // Don't fetch if no projectId
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API calls to fetch financial data for projectId
        // If isSummary, API could fetch only summary totals
        // const response = await api.get(`/api/lawyer-projects/${projectId}/finance?summary=${isSummary}`);
        // if (isSummary) { setSummaryData(response.data); } else { set detailed data... }
        
        // Mock data
        await new Promise(resolve => setTimeout(resolve, 350));

        const mockEstimates = [
          { id: 'DEV001', date: '2025-04-03', amount: 1500, status: 'Accepté' },
          { id: 'DEV002', date: '2025-04-10', amount: 800, status: 'En attente' },
        ];
        const mockPayments = [
          { id: 'PAY001', date: '2025-04-05', amount: 750, method: 'Virement', invoiceId: 'FAC001' },
          { id: 'PAY002', date: '2025-04-15', amount: 500, method: 'Carte Bleue', invoiceId: 'FAC002' },
        ];
        const mockInvoices = [
          { id: 'FAC001', date: '2025-04-04', amount: 750, status: 'Payée', dueDate: '2025-04-14' },
          { id: 'FAC002', date: '2025-04-14', amount: 1200, status: 'Partiellement Payée', dueDate: '2025-04-24' },
          { id: 'FAC003', date: '2025-04-20', amount: 300, status: 'Non Payée', dueDate: '2025-04-30' },
        ];

        setEstimates(mockEstimates);
        setPayments(mockPayments);
        setInvoices(mockInvoices); // Corrected: setInvoices was missing before

      } catch (err) {
          console.error("Error fetching finance data:", err);
          setError("Erreur chargement finances.");
      } finally {
          setLoading(false);
      }
    }; // End of fetchFinanceData async function

    fetchFinanceData(); // Call the async function
  }, [projectId]);

  const handleCreateEstimate = () => alert('Fonctionnalité "Créer Devis" à implémenter.');
  const handleCreateInvoice = () => alert('Fonctionnalité "Créer Facture" à implémenter.');
  const handleRecordPayment = () => alert('Fonctionnalité "Enregistrer Paiement" à implémenter.');


  // --- Calculate Summary Data ---
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
  const outstanding = totalInvoiced - totalPaid;

  // --- Render Summary View ---
  if (isSummary) {
    return (
      <div>
        <h3 className="text-md font-semibold mb-2 text-gray-700">Finances</h3>
        {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
        ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
        ) : (
            <div className="text-sm space-y-1">
                <p>Facturé: <span className="font-medium">{formatCurrency(totalInvoiced)}</span></p>
                <p>Payé: <span className="font-medium text-green-700">{formatCurrency(totalPaid)}</span></p>
                {outstanding > 0 && <p>Restant dû: <span className="font-medium text-red-700">{formatCurrency(outstanding)}</span></p>}
            </div>
        )}
        {/* Optionally add a link to the full view */}
      </div>
    );
  }

  // --- Render Full View ---
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Finances / Facturation</h2>

      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Chargement des données financières...</p>
      ) : (
        <div className="space-y-6 max-h-96 overflow-y-auto pr-2"> {/* Limit height */}
          {/* Section: Devis / Estimations */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-semibold text-gray-700">Devis</h3>
              <button onClick={handleCreateEstimate} className="text-xs px-2 py-0.5 border border-gray-300 text-gray-600 rounded hover:bg-gray-50">
                + Devis
              </button>
            </div>
            <ul className="space-y-1">
              {estimates.length > 0 ? estimates.map(est => (
                <li key={est.id} className="p-1.5 bg-gray-50 rounded border border-gray-200 flex justify-between items-center text-xs">
                  <span>{est.id} ({new Date(est.date).toLocaleDateString()}) - {formatCurrency(est.amount)}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${est.status === 'Accepté' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {est.status}
                  </span>
                </li>
              )) : <p className="text-xs text-gray-500 italic">Aucun devis.</p>}
            </ul>
          </section>

          {/* Section: Factures */}
          <section>
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-gray-700">Factures</h3>
                 <button onClick={handleCreateInvoice} className="text-xs px-2 py-0.5 border border-gray-300 text-gray-600 rounded hover:bg-gray-50">
                    + Facture
                 </button>
             </div>
            <ul className="space-y-1">
              {invoices.length > 0 ? invoices.map(inv => (
                <li key={inv.id} className="p-1.5 bg-gray-50 rounded border border-gray-200 flex justify-between items-center text-xs">
                  <span>{inv.id} ({new Date(inv.date).toLocaleDateString()}) - {formatCurrency(inv.amount)}</span>
                   <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                       inv.status === 'Payée' ? 'bg-green-100 text-green-800' :
                       inv.status === 'Partiellement Payée' ? 'bg-yellow-100 text-yellow-800' :
                       'bg-red-100 text-red-800'
                   }`}>
                    {inv.status}
                  </span>
                </li>
              )) : <p className="text-xs text-gray-500 italic">Aucune facture.</p>}
            </ul>
          </section>

          {/* Section: Suivi des Paiements */}
          <section>
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-gray-700">Paiements</h3>
                 <button onClick={handleRecordPayment} className="text-xs px-2 py-0.5 border border-gray-300 text-gray-600 rounded hover:bg-gray-50">
                    + Paiement
                 </button>
             </div>
            <ul className="space-y-1">
              {payments.length > 0 ? payments.map(pay => (
                <li key={pay.id} className="p-1.5 bg-gray-50 rounded border border-gray-200 text-xs">
                  {formatCurrency(pay.amount)} le {new Date(pay.date).toLocaleDateString()} ({pay.method}) - Fact: {pay.invoiceId || 'N/A'}
                </li>
              )) : <p className="text-xs text-gray-500 italic">Aucun paiement.</p>}
            </ul>
          </section>

        </div>
      )}
    </div>
  );
}

export default ProjectFinance;