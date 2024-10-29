import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import './Dashboard.css';

// Register the components with Chart.js
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState('2020-01-22');
    const [endDate, setEndDate] = useState('2023-06-13');
    const [orderBy, setOrderBy] = useState('total');
    const [interval, setInterval] = useState('daily');
    const [drillDownData, setDrillDownData] = useState([]);
    const [isDrillingDown, setIsDrillingDown] = useState(false);
    const [detailedData, setDetailedData] = useState({});
    const [labels, setLabels] = useState([]);
    const [aggregatedData, setAggregatedData] = useState([]);
    const [drillDownBarChartData, setDrillDownBarChartData] = useState([]);

    useEffect(() => {
        if (orderBy === 'total') {
            fetchData();
        } else if (orderBy === 'diff') {
            fetchDiffData();
        }
    }, [startDate, endDate, orderBy]);

    const fetchData = async () => {
        const response = await axios.get('https://final-project-database-backend.onrender.com/covid-data', {
            params: { startDate, endDate, orderBy },
        });
        setData(response.data);
    };

    const fetchDiffData = async () => {
        const response = await axios.get('https://final-project-database-backend.onrender.com/getDiffDay', {
            params: { startDate, endDate, orderBy },
        });
        setData(response.data);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const aggregateData = (interval) => {
        const aggregatedData = {};
        const detailedData = {};

        data.forEach((item) => {
            const date = new Date(item.date);
            let key;

            switch (interval) {
                case 'daily':
                    key = formatDate(item.date);
                    break;
                case 'weekly':
                    const week = Math.floor(date.getDate() / 7) + 1;
                    key = `${date.getFullYear()}-${date.getMonth() + 1}-${week}`;
                    break;
                case 'monthly':
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
                default:
                    key = formatDate(item.date);
            }

            if (!aggregatedData[key]) {
                aggregatedData[key] = 0;
                detailedData[key] = [];
            }

            aggregatedData[key] += item.total;
            detailedData[key].push(item);
        });

        setDetailedData(detailedData);
        return {
            labels: Object.keys(aggregatedData),
            data: Object.values(aggregatedData),
        };
    };

    useEffect(() => {
        const { labels: newLabels, data: newAggregatedData } = aggregateData(interval);
        setLabels(newLabels);
        setAggregatedData(newAggregatedData);
    }, [data, interval]);

    const formattedLabels = labels.map(label => formatDate(label));

    const lineChartData = {
        labels: formattedLabels,
        datasets: [
            {
                label: 'Total COVID-19 Reports',
                data: aggregatedData,
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };

    const barChartData = {
        labels: formattedLabels,
        datasets: [
            {
                label: 'Total COVID-19 Reports',
                data: aggregatedData,
                backgroundColor: 'rgba(75,192,192,0.4)',
            },
        ],
    };

    const handleDrillDown = (key) => {
        const formattedKey = key.slice(0, 7);
        if (detailedData[formattedKey]) {
            setDrillDownData(detailedData[formattedKey]);
            setIsDrillingDown(true);
            const drillDownBarData = {
                labels: detailedData[formattedKey].map(item => formatDate(item.date)),
                datasets: [
                    {
                        label: 'Daily COVID-19 Reports',
                        data: detailedData[formattedKey].map(item => item.total),
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    },
                ],
            };
            setDrillDownBarChartData(drillDownBarData);
        } else {
            console.warn(`Key ${formattedKey} does not exist in detailedData`);
        }
    };

    return (
        <div className="dashboard">
            <h1>COVID-19 Dashboard</h1>
            <div className='wrap-filter'>
                <div>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div>
                    <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
                        <option value="total">Order by Date</option>
                        <option value="diff">Deaths Ascending</option>
                    </select>
                    <select value={interval} onChange={(e) => setInterval(e.target.value)}>
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>

            </div>
            <div className="data-table">
                <h2>Data Table</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>{interval.charAt(0).toUpperCase() + interval.slice(1)}</th>
                                <th>Total Reports</th>
                            </tr>
                        </thead>
                        <tbody>
                            {labels.slice(0, 1200).map((label, index) => (
                                <tr key={index}>
                                    <td>{label}</td>
                                    <td>{aggregatedData[index]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="Chart">
                <div className="chart-container">
                    <h2>Line Chart</h2>
                    <Line data={lineChartData}
                        options={{
                            onClick: (evt, item) => {
                                if (item.length > 0) {
                                    const index = item[0].index;
                                    handleDrillDown(labels[index]);
                                }
                            }
                        }}
                    />
                </div>
                <div className="chart-container">
                    <h2>Bar Chart</h2>
                    <Bar data={barChartData}
                        options={{
                            onClick: (evt, item) => {
                                if (item.length > 0) {
                                    const index = item[0].index;
                                    handleDrillDown(formattedLabels[index]);
                                }
                            }
                        }}
                    />
                </div>
            </div>
            {isDrillingDown && (
                <div>
                    {/* <h2>Daily Data for {drillDownData.length > 0 ? formatDate(drillDownData[0].date).slice(0, 7) : ""}</h2> */}
                    <button onClick={() => setIsDrillingDown(false)}>Back</button>
                    <h2>Drill Down Bar Chart</h2>
                    <div className='Drill'>
                        <div className='Drill2'>
                            <Bar data={drillDownBarChartData} />
                        </div>    
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
