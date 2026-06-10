import React, { useState } from "react";

const TodoForm = ({ addTask }) => {
    const [userInput, setUserInput] = useState("");

    const handleChange = (e) => {
        setUserInput(e.currentTarget.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userInput.trim()) {
            addTask(userInput);
            setUserInput("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={userInput}
                type="text"
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                placeholder="Введите задачу..."
            />
            <button>Сохранить</button>
        </form>
    );
};

export default TodoForm;