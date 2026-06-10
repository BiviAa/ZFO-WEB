import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import ToDoForm from "./AddTask";
import TaskItem from "./Task";

const TASKS_STORAGE_KEY = 'tasks-list-project-web';

function App() {
    const [rates, setRates] = useState({ USDrate: '--.--', EURrate: '--.--' });
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [todos, setTodos] = useState([]);

    useEffect(() => {
        const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
        console.log('Загружаем задачи из localStorage:', storedTasks);

        if (storedTasks) {
            try {
                const parsedTasks = JSON.parse(storedTasks);
                if (Array.isArray(parsedTasks)) {
                    const normalizedTasks = parsedTasks.map(task => ({
                        id: task.id || Date.now().toString(),
                        task: task.task || task.text || 'Без названия',
                        complete: task.complete !== undefined ? task.complete : (task.done || false)
                    }));
                    setTodos(normalizedTasks);
                    console.log('Задачи восстановлены:', normalizedTasks.length);
                }
            } catch (error) {
                console.error('Ошибка при чтении задач:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (todos.length > 0) {
            localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
            console.log('Задачи сохранены:', todos.length);
        } else if (todos.length === 0 && localStorage.getItem(TASKS_STORAGE_KEY)) {
            localStorage.removeItem(TASKS_STORAGE_KEY);
            console.log('Список задач пуст, localStorage очищен');
        }
    }, [todos]);

    useEffect(() => {
        async function fetchAllData() {
            try {
                const currencyResponse = await axios.get(
                    'https://www.cbr-xml-daily.ru/daily_json.js'
                );
                if (!currencyResponse.data || !currencyResponse.data.Valute) {
                    throw new Error('Нет данных о валюте.');
                }
                const USDrate = currencyResponse.data.Valute.USD.Value.toFixed(4).replace('.', ',');
                const EURrate = currencyResponse.data.Valute.EUR.Value.toFixed(4).replace('.', ',');
                setRates({ USDrate, EURrate });

                navigator.geolocation.getCurrentPosition(async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const weatherResponse = await axios.get(
                        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,cloud_cover,weather_code`
                    );
                    if (!weatherResponse.data.current) {
                        throw new Error('Нет данных о погоде.');
                    }
                    setWeatherData(weatherResponse.data.current);
                });
            } catch (err) {
                console.error(err);
                setError('Ошибка загрузки данных.');
            } finally {
                setLoading(false);
            }
        }
        fetchAllData();
    }, []);

    const addTask = (userInput) => {
        if (userInput && userInput.trim()) {
            const newItem = {
                id: Date.now().toString(),
                task: userInput.trim(),
                complete: false
            };
            setTodos(prevTodos => [...prevTodos, newItem]);
            console.log('Задача добавлена:', newItem);
        }
    };

    const removeTask = (id) => {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
        console.log('Задача удалена:', id);
    };

    const handleToggle = (id) => {
        setTodos(prevTodos => prevTodos.map(task =>
            task.id === id ? { ...task, complete: !task.complete } : task
        ));
        console.log('Статус задачи изменён:', id);
    };

    return (
        <div className="App">
            {loading && <p style={{ color: 'white' }}>Загрузка данных...</p>}
            {error && <p style={{ color: 'red', background: 'white', padding: '5px' }}>{error}</p>}

            <div className='info'>
                <div className='money'>
                    <div id="USD"> Доллар США $ — {rates.USDrate} руб.</div>
                    <div id="EUR"> Евро € — {rates.EURrate} руб.</div>
                </div>

                <div className="weather-info">
                    {weatherData ? (
                        <div>
                            🌡 {weatherData.temperature_2m.toFixed(1)}°C<br />
                            💨 {weatherData.wind_speed_10m} м/с<br />
                            ☁ {weatherData.cloud_cover}%
                        </div>
                    ) : (
                        <div>⏳ Загрузка погоды...</div>
                    )}
                </div>
            </div>

            <header>
                <h1 className='list-header'>Список задач: {todos.length}</h1>
            </header>

            <ToDoForm addTask={addTask} />

            {todos.map((todo) => (
                <TaskItem
                    key={todo.id}
                    todo={todo}
                    toggleTask={handleToggle}
                    removeTask={removeTask}
                />
            ))}
        </div>
    );
}

export default App;