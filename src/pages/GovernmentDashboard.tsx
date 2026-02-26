import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { governmentAPI } from '../config/api';
import { LogOut, Trash2, Edit2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GovernmentDashboard = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('msp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [mspData, setMspData] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [coldStorage, setColdStorage] = useState([]);
  const [fuelPrices, setFuelPrices] = useState([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [mspForm, setMspForm] = useState({ commodity: '', price: '', year: '' });
  const [marketForm, setMarketForm] = useState({ commodity: '', state: '', date: '', price_per_quintal: '' });
  const [coldStorageForm, setColdStorageForm] = useState({ date: '', state: '', fci_owned: '', private_owned: '', total_units: '', storage_capacity: '' });
  const [fuelForm, setFuelForm] = useState({ date: '', cng: '', petrol: '', diesel: '' });

  useEffect(() => {
    if (token) loadAllData();
  }, [token]);

  const loadAllData = async () => {
    try {
      const [msp, market, storage, fuel] = await Promise.all([
        fetch(`http://localhost:5000/api/farmer/msp`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`http://localhost:5000/api/farmer/market-prices`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`http://localhost:5000/api/farmer/cold-storage`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`http://localhost:5000/api/farmer/fuel-prices`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      setMspData(msp);
      setMarketPrices(market);
      setColdStorage(storage);
      setFuelPrices(fuel);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddMSP = async () => {
    try {
      setLoading(true);
      await governmentAPI.addMSP(token!, { commodity: mspForm.commodity, price: parseFloat(mspForm.price), year: parseInt(mspForm.year) });
      setMspForm({ commodity: '', price: '', year: '' });
      await loadAllData();
    } catch (err) {
      setError('Failed to add MSP');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMSP = async (id: string) => {
    try {
      await governmentAPI.deleteMSP(token!, id);
      await loadAllData();
    } catch (err) {
      setError('Failed to delete MSP');
    }
  };

  const handleAddMarketPrice = async () => {
    try {
      setLoading(true);
      await governmentAPI.addMarketPrice(token!, { commodity: marketForm.commodity, state: marketForm.state, date: marketForm.date, price_per_quintal: parseFloat(marketForm.price_per_quintal) });
      setMarketForm({ commodity: '', state: '', date: '', price_per_quintal: '' });
      await loadAllData();
    } catch (err) {
      setError('Failed to add market price');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMarketPrice = async (id: string) => {
    try {
      await governmentAPI.deleteMarketPrice(token!, id);
      await loadAllData();
    } catch (err) {
      setError('Failed to delete market price');
    }
  };

  const handleAddColdStorage = async () => {
    try {
      setLoading(true);
      await governmentAPI.addColdStorage(token!, { date: coldStorageForm.date, state: coldStorageForm.state, fci_owned: parseInt(coldStorageForm.fci_owned), private_owned: parseInt(coldStorageForm.private_owned), total_units: parseInt(coldStorageForm.total_units), storage_capacity: coldStorageForm.storage_capacity });
      setColdStorageForm({ date: '', state: '', fci_owned: '', private_owned: '', total_units: '', storage_capacity: '' });
      await loadAllData();
    } catch (err) {
      setError('Failed to add cold storage');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColdStorage = async (id: string) => {
    try {
      await governmentAPI.deleteColdStorage(token!, id);
      await loadAllData();
    } catch (err) {
      setError('Failed to delete cold storage');
    }
  };

  const handleAddFuelPrice = async () => {
    try {
      setLoading(true);
      await governmentAPI.addFuelPrice(token!, { date: fuelForm.date, cng: parseFloat(fuelForm.cng), petrol: parseFloat(fuelForm.petrol), diesel: parseFloat(fuelForm.diesel) });
      setFuelForm({ date: '', cng: '', petrol: '', diesel: '' });
      await loadAllData();
    } catch (err) {
      setError('Failed to add fuel price');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFuelPrice = async (id: string) => {
    try {
      await governmentAPI.deleteFuelPrice(token!, id);
      await loadAllData();
    } catch (err) {
      setError('Failed to delete fuel price');
    }
  };

  const handleExport = async () => {
    try {
      const response = await governmentAPI.exportMSP(token!);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'msp_data.xlsx';
      a.click();
    } catch (err) {
      setError('Failed to export data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-yellow-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AgroPrice - Government Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user?.name} ({user?.state})</span>
            <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition">
              <Download size={18} />
              Export
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

        <div className="flex gap-2 mb-6">
          {['msp', 'market', 'cold-storage', 'fuel'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === tab ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {activeTab === 'msp' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Add MSP</h3>
                <input type="text" placeholder="Commodity" value={mspForm.commodity} onChange={(e) => setMspForm({ ...mspForm, commodity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                <input type="number" placeholder="Price" value={mspForm.price} onChange={(e) => setMspForm({ ...mspForm, price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                <input type="number" placeholder="Year" value={mspForm.year} onChange={(e) => setMspForm({ ...mspForm, year: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4" />
                <button onClick={handleAddMSP} disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg transition disabled:opacity-50">
                  {loading ? 'Adding...' : 'Add MSP'}
                </button>
              </div>
            )}

            {activeTab === 'market' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Add Market Price</h3>
                <input type="text" placeholder="Commodity" value={marketForm.commodity} onChange={(e) => setMarketForm({ ...marketForm, commodity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                <input type="text" placeholder="State" value={marketForm.state} onChange={(e) => setMarketForm({ ...marketForm, state: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                <input type="date" value={marketForm.date} onChange={(e) => setMarketForm({ ...marketForm, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                <input type="number" placeholder="Price per Quintal" value={marketForm.price_per_quintal} onChange={(e) => setMarketForm({ ...marketForm, price_per_quintal: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4" />
                <button onClick={handleAddMarketPrice} disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg transition disabled:opacity-50">
                  {loading ? 'Adding...' : 'Add Price'}
                </button>
              </div>
            )}

            {activeTab === 'cold-storage' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Add Cold Storage</h3>
                <input type="date" value={coldStorageForm.date} onChange={(e) => setColdStorageForm({ ...coldStorageForm, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                <input type="text" placeholder="State" value={coldStorageForm.state} onChange={(e) => setColdStorageForm({ ...coldStorageForm, state: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                <input type="number" placeholder="FCI Owned" value={coldStorageForm.fci_owned} onChange={(e) => setColdStorageForm({ ...coldStorageForm, fci_owned: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                <input type="number" placeholder="Private Owned" value={coldStorageForm.private_owned} onChange={(e) => setColdStorageForm({ ...coldStorageForm, private_owned: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                <input type="number" placeholder="Total Units" value={coldStorageForm.total_units} onChange={(e) => setColdStorageForm({ ...coldStorageForm, total_units: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                <input type="text" placeholder="Storage Capacity" value={coldStorageForm.storage_capacity} onChange={(e) => setColdStorageForm({ ...coldStorageForm, storage_capacity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4" />
                <button onClick={handleAddColdStorage} disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg transition disabled:opacity-50">
                  {loading ? 'Adding...' : 'Add Storage'}
                </button>
              </div>
            )}

            {activeTab === 'fuel' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Add Fuel Price</h3>
                <input type="date" value={fuelForm.date} onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                <input type="number" placeholder="CNG" value={fuelForm.cng} onChange={(e) => setFuelForm({ ...fuelForm, cng: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                <input type="number" placeholder="Petrol" value={fuelForm.petrol} onChange={(e) => setFuelForm({ ...fuelForm, petrol: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                <input type="number" placeholder="Diesel" value={fuelForm.diesel} onChange={(e) => setFuelForm({ ...fuelForm, diesel: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4" />
                <button onClick={handleAddFuelPrice} disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg transition disabled:opacity-50">
                  {loading ? 'Adding...' : 'Add Price'}
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {activeTab === 'msp' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">MSP Records</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2 px-4">Commodity</th>
                        <th className="text-left py-2 px-4">Price</th>
                        <th className="text-left py-2 px-4">Year</th>
                        <th className="text-left py-2 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mspData.map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{item.commodity}</td>
                          <td className="py-3 px-4">₹{item.price}</td>
                          <td className="py-3 px-4">{item.year}</td>
                          <td className="py-3 px-4 flex gap-2">
                            <button onClick={() => handleDeleteMSP(item.id)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'market' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Market Prices</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2 px-4">Commodity</th>
                        <th className="text-left py-2 px-4">State</th>
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-left py-2 px-4">Price</th>
                        <th className="text-left py-2 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketPrices.map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{item.commodity}</td>
                          <td className="py-3 px-4">{item.state}</td>
                          <td className="py-3 px-4">{item.date}</td>
                          <td className="py-3 px-4">₹{item.price_per_quintal}</td>
                          <td className="py-3 px-4 flex gap-2">
                            <button onClick={() => handleDeleteMarketPrice(item.id)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'cold-storage' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Cold Storage Data</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2 px-4">State</th>
                        <th className="text-left py-2 px-4">FCI</th>
                        <th className="text-left py-2 px-4">Private</th>
                        <th className="text-left py-2 px-4">Total</th>
                        <th className="text-left py-2 px-4">Capacity</th>
                        <th className="text-left py-2 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coldStorage.map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{item.state}</td>
                          <td className="py-3 px-4">{item.fci_owned}</td>
                          <td className="py-3 px-4">{item.private_owned}</td>
                          <td className="py-3 px-4">{item.total_units}</td>
                          <td className="py-3 px-4">{item.storage_capacity}</td>
                          <td className="py-3 px-4 flex gap-2">
                            <button onClick={() => handleDeleteColdStorage(item.id)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'fuel' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Fuel Prices</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-left py-2 px-4">CNG</th>
                        <th className="text-left py-2 px-4">Petrol</th>
                        <th className="text-left py-2 px-4">Diesel</th>
                        <th className="text-left py-2 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fuelPrices.map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{item.date}</td>
                          <td className="py-3 px-4">₹{item.cng}</td>
                          <td className="py-3 px-4">₹{item.petrol}</td>
                          <td className="py-3 px-4">₹{item.diesel}</td>
                          <td className="py-3 px-4 flex gap-2">
                            <button onClick={() => handleDeleteFuelPrice(item.id)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
