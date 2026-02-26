import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { farmerAPI } from '../config/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FarmerDashboard = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [mspData, setMspData] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [coldStorage, setColdStorage] = useState([]);
  const [fuelPrices, setFuelPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      const [msp, prices, storage, fuel] = await Promise.all([
        farmerAPI.getMSP(token!),
        farmerAPI.getMarketPrices(token!),
        farmerAPI.getColdStorage(token!),
        farmerAPI.getFuelPrices(token!),
      ]);
      setMspData(msp);
      setMarketPrices(prices);
      setColdStorage(storage);
      setFuelPrices(fuel);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AgroPrice - Farmer Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          {['overview', 'msp', 'market', 'cold-storage', 'fuel'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium mb-2">MSP Records</h3>
                <p className="text-3xl font-bold text-green-600">{mspData.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Market Prices</h3>
                <p className="text-3xl font-bold text-blue-600">{marketPrices.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Cold Storage Units</h3>
                <p className="text-3xl font-bold text-yellow-600">{coldStorage.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Fuel Price Updates</h3>
                <p className="text-3xl font-bold text-orange-600">{fuelPrices.length}</p>
              </div>
            </div>
          )}

          {activeTab === 'msp' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Minimum Support Price (MSP)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-4">Commodity</th>
                      <th className="text-left py-2 px-4">Price</th>
                      <th className="text-left py-2 px-4">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mspData.map((item: any) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{item.commodity}</td>
                        <td className="py-3 px-4">₹{item.price}</td>
                        <td className="py-3 px-4">{item.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Market Prices</h2>
              {marketPrices.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={marketPrices}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="commodity" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="price_per_quintal" stroke="#10b981" name="Price per Quintal" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500">No market price data available</p>
              )}
            </div>
          )}

          {activeTab === 'cold-storage' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Cold Storage Data</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-4">State</th>
                      <th className="text-left py-2 px-4">FCI Owned</th>
                      <th className="text-left py-2 px-4">Private Owned</th>
                      <th className="text-left py-2 px-4">Total Units</th>
                      <th className="text-left py-2 px-4">Capacity</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'fuel' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Fuel Prices</h2>
              {fuelPrices.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fuelPrices.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cng" fill="#3b82f6" name="CNG" />
                    <Bar dataKey="petrol" fill="#f59e0b" name="Petrol" />
                    <Bar dataKey="diesel" fill="#6366f1" name="Diesel" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500">No fuel price data available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
