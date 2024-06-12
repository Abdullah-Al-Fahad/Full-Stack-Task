import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import './App.css'; 

function App() {
    const [loading, setLoading] = useState(true); // State to manage loading status
    const [stocks, setStocks] = useState([]);
    const [newStock, setNewStock] = useState({ date: '', trade_code: '', high: 0, low: 0, open: 0, close: 0, volume: 0 });
    const [selectedTradeCode, setSelectedTradeCode] = useState('AAMRATECH'); // Set the default value to "AAMRATECH"
    const [editedStocks, setEditedStocks] = useState({});
    const filteredStocks = useMemo(() => stocks.filter(stock => stock.trade_code === selectedTradeCode), [stocks, selectedTradeCode]);

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            setLoading(true); // Set loading to true when fetching starts
            const response = await axios.get('https://fahaad.pythonanywhere.com/api/stocks');
            setStocks(response.data);
        } catch (error) {
            console.error('Error fetching stocks:', error);
        } finally {
            setLoading(false); // Set loading to false when fetching finishes
        }
    };

    const addStock = async () => {
        try {
            await axios.post('https://fahaad.pythonanywhere.com/api/stocks', newStock);
            setNewStock({ date: '', trade_code: '', high: 0, low: 0, open: 0, close: 0, volume: 0 });
            fetchStocks();
        } catch (error) {
            console.error('Error adding stock:', error);
        }
    };

    const updateStock = async (id) => {
        try {
            const updatedStockFields = editedStocks[id];
            if (updatedStockFields) {
                const existingStock = stocks.find(stock => stock.id === id);
                const updatedStock = { ...existingStock, ...updatedStockFields };
                await axios.put(`https://fahaad.pythonanywhere.com/api/stocks/${id}`, updatedStock);
                setEditedStocks(prev => {
                    const newEditedStocks = { ...prev };
                    delete newEditedStocks[id];
                    return newEditedStocks;
                });
                fetchStocks();
            }
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };

    const deleteStock = async (id) => {
        try {
            await axios.delete(`https://fahaad.pythonanywhere.com/api/stocks/${id}`);
            fetchStocks();
        } catch (error) {
            console.error('Error deleting stock:', error);
        }
    };

    const handleInputChange = (id, field, value) => {
        setEditedStocks(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    console.log('Filtered Stocks:', filteredStocks);

    return (
        <div className="container">
            <h1 className="title">Stocks</h1>
            {loading ? ( // Display loading message if loading is true
                <p>Loading...</p>
            ) : (
                <>
                    <div className="controls">
                        <select className="select" onChange={e => setSelectedTradeCode(e.target.value)} value={selectedTradeCode}>
                            <option value="">Select Trade Code</option>
                            {Array.from(new Set(stocks.map(stock => stock.trade_code))).map(trade_code => (
                                <option key={trade_code} value={trade_code}>{trade_code}</option>
                            ))}
                        </select>
                    </div>
                    <div className="chart-container">
                        {filteredStocks.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <ComposedChart
                                    data={filteredStocks.sort((a, b) => new Date(a.date) - new Date(b.date))}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="right" dataKey="volume" fill="rgba(75,192,192,0.4)" name="Volume" />
                                    <Line yAxisId="left" type="monotone" dataKey="close" stroke="rgba(75,192,192,1)" name="Close" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No data available for the selected trade code.</p>
                        )}
                    </div>
                    <ul className="stock-list">
                        {filteredStocks.map(stock => (
                            <li key={stock.id} className="stock-item">
                                <input
                                    type="text"
                                    value={editedStocks[stock.id]?.date || stock.date}
                                    onChange={e => handleInputChange(stock.id, 'date', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={editedStocks[stock.id]?.trade_code || stock.trade_code}
                                    onChange={e => handleInputChange(stock.id, 'trade_code', e.target.value)}
                                />
                                <input
                                    type="number"
                                    value={editedStocks[stock.id]?.high || stock.high}
                                    onChange={e => handleInputChange(stock.id, 'high', parseFloat(e.target.value))}
                                />
                                <input
                                    type="number"
                                    value={editedStocks[stock.id]?.low || stock.low}
                                    onChange={e => handleInputChange(stock.id, 'low', parseFloat(e.target.value))}
                                />
                                <input
                                    type="number"
                                    value={editedStocks[stock.id]?.open || stock.open}
                                    onChange={e => handleInputChange(stock.id, 'open', parseFloat(e.target.value))}
                                />
                                <input
                                    type="number"
                                    value={editedStocks[stock.id]?.close || stock.close}
                                    onChange={e => handleInputChange(stock.id, 'close', parseFloat(e.target.value))}
                                />
                                <input
                                    type="number"
                                    value={editedStocks[stock.id]?.volume || stock.volume}
                                    onChange={e => handleInputChange(stock.id, 'volume', parseInt(e.target.value))}
                                />
                                <button className="update-button" onClick={() => updateStock(stock.id)}>Update</button>
                                <button className="delete-button" onClick={() => deleteStock(stock.id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                    <div className="new-stock-form">
                        <input className="input" type="text" placeholder="Date" value={newStock.date} onChange={e => setNewStock({ ...newStock, date: e.target.value })} />
                        <input className="input" type="text" placeholder="Trade Code" value={newStock.trade_code} onChange={e => setNewStock({ ...newStock, trade_code: e.target.value })} />
                        <input className="input" type="number" placeholder="High" value={newStock.high} onChange={e => setNewStock({ ...newStock, high: parseFloat(e.target.value) })} />
                        <input className="input" type="number" placeholder="Low" value={newStock.low} onChange={e => setNewStock({ ...newStock, low: parseFloat(e.target.value) })} />
                        <input className="input" type="number" placeholder="Open" value={newStock.open} onChange={e => setNewStock({ ...newStock, open: parseFloat(e.target.value) })} />
                        <input className="input" type="number" placeholder="Close" value={newStock.close} onChange={e => setNewStock({ ...newStock, close: parseFloat(e.target.value) })} />
                        <input className="input" type="number" placeholder="Volume" value={newStock.volume} onChange={e => setNewStock({ ...newStock, volume: parseInt(e.target.value) })} />
                        <button className="button" onClick={addStock}>Add Stock</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
