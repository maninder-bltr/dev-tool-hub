import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    FaClock, FaCalendarAlt, FaCopy,
    FaCheckCircle, FaExclamationCircle, FaArrowRight,
    FaSun, FaMoon, FaChevronLeft, FaChevronRight,
    FaRegClock, FaRegCalendar, FaChevronDown
} from 'react-icons/fa';
import { format, fromUnixTime, isValid } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import AnalogClock from './AnalogClock';
import './EpochCalculator.css'

const EpochCalculator = () => {
    // State
    const [epochMillis, setEpochMillis] = useState(Date.now());
    const [epochSeconds, setEpochSeconds] = useState(Math.floor(Date.now() / 1000));
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(format(new Date(), 'HH:mm:ss'));
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [inputEpoch, setInputEpoch] = useState('');
    const [inputError, setInputError] = useState('');
    const [copySuccess, setCopySuccess] = useState({});
    const [showYearDropdown, setShowYearDropdown] = useState(false);

    // Available timezones
    const timezones = [
        'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
        'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
        'Europe/Berlin', 'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Shanghai',
        'Australia/Sydney', 'Pacific/Auckland'
    ].sort();

    // Generate year range
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

    // Update epoch when date/time/timezone changes
    useEffect(() => {
        try {
            const [hours, minutes, seconds] = selectedTime.split(':').map(Number);
            const dateWithTime = new Date(selectedDate);
            dateWithTime.setHours(hours || 0, minutes || 0, seconds || 0, 0);

            const utcDate = timezone === 'UTC'
                ? dateWithTime
                : fromZonedTime(dateWithTime, timezone);

            const millis = utcDate.getTime();
            setEpochMillis(millis);
            setEpochSeconds(Math.floor(millis / 1000));
            setInputError('');
        } catch (err) {
            setInputError('Invalid date/time combination');
        }
    }, [selectedDate, selectedTime, timezone]);

    // Handle manual epoch input
    const handleEpochInput = (value) => {
        setInputEpoch(value);

        if (!value.trim()) {
            setInputError('');
            return;
        }

        const num = Number(value);
        if (isNaN(num)) {
            setInputError('Please enter a valid number');
            return;
        }

        try {
            const isSeconds = num < 10000000000;
            const date = isSeconds ? fromUnixTime(num) : new Date(num);

            if (!isValid(date)) {
                setInputError('Invalid epoch value');
                return;
            }

            setEpochMillis(isSeconds ? num * 1000 : num);
            setEpochSeconds(isSeconds ? num : Math.floor(num / 1000));
            setSelectedDate(date);
            setSelectedTime(format(date, 'HH:mm:ss'));
            setInputError('');
        } catch (err) {
            setInputError('Error parsing epoch value');
        }
    };

    // Get formatted dates
    const utcDate = useMemo(() => new Date(epochMillis), [epochMillis]);
    const localDate = useMemo(() => new Date(epochMillis), [epochMillis]);
    const timezoneDate = useMemo(() => {
        try {
            return timezone === 'UTC'
                ? utcDate
                : toZonedTime(utcDate, timezone);
        } catch {
            return utcDate;
        }
    }, [utcDate, timezone]);

    // Format for display
    const formattedUTC = format(utcDate, 'yyyy-MM-dd HH:mm:ss');
    const formattedLocal = format(localDate, 'yyyy-MM-dd HH:mm:ss');
    const formattedTimezone = timezoneDate ? format(timezoneDate, 'yyyy-MM-dd HH:mm:ss') : '';
    const isoString = utcDate.toISOString();

    // Generate calendar
    const generateCalendar = useCallback(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const weeks = [];
        let days = [];

        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            days.push(d);
            if (days.length === 7) {
                weeks.push(days);
                days = [];
            }
        }

        if (days.length > 0) {
            while (days.length < 7) {
                days.push(null);
            }
            weeks.push(days);
        }

        return weeks;
    }, [selectedDate]);

    const calendarWeeks = generateCalendar();

    // Copy handler
    const handleCopy = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(prev => ({ ...prev, [field]: true }));
            setTimeout(() => {
                setCopySuccess(prev => ({ ...prev, [field]: false }));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Date handlers
    const handleDateSelect = (day) => {
        if (!day) return;
        const newDate = new Date(selectedDate);
        newDate.setDate(day);
        setSelectedDate(newDate);
    };

    const changeMonth = (delta) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(selectedDate.getMonth() + delta);
        setSelectedDate(newDate);
        setShowYearDropdown(false);
    };

    const changeYear = (year) => {
        const newDate = new Date(selectedDate);
        newDate.setFullYear(year);
        setSelectedDate(newDate);
        setShowYearDropdown(false);
    };

    const setToNow = () => {
        const now = new Date();
        setSelectedDate(now);
        setSelectedTime(format(now, 'HH:mm:ss'));
    };

    const setToMidnight = () => {
        setSelectedTime('00:00:00');
    };

    const setToNoon = () => {
        setSelectedTime('12:00:00');
    };

    return (
        <div className="epoch-calculator">
            {/* Header */}
            <div className="epoch-header">
                <div className="header-left">
                    <div className="header-icon-wrapper">
                        <FaClock className="header-icon" />
                    </div>
                    <div className="header-title">
                        <h2>Epoch Converter</h2>
                        <div className="epoch-display">
                            <span className="epoch-label">Current:</span>
                            <strong className="epoch-value">{epochMillis.toLocaleString()}</strong>
                            <span className="epoch-unit">ms</span>
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="action-btn primary" onClick={setToNow}>
                        <FaSun /> Now
                    </button>
                    <button className="action-btn" onClick={setToMidnight}>
                        <FaMoon /> 00:00
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="epoch-grid">
                {/* Left Panel - Calendar & Time */}
                <div className="epoch-card">
                    <div className="card-header">
                        <div className="card-title">
                            <FaRegCalendar className="card-icon" />
                            <span>Calendar & Time</span>
                        </div>
                        <select
                            className="timezone-select"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                        >
                            {timezones.map(tz => (
                                <option key={tz} value={tz}>{tz}</option>
                            ))}
                        </select>
                    </div>

                    <div className="card-content">
                        <div className="calendar-time-wrapper">
                            {/* Calendar Section */}
                            <div className="calendar-section">
                                <div className="calendar-nav">
                                    <button className="nav-btn" onClick={() => changeMonth(-1)}>
                                        <FaChevronLeft />
                                    </button>
                                    <div className="month-year-selector">
                                        <span className="month">{format(selectedDate, 'MMMM')}</span>
                                        <div className="year-dropdown-container">
                                            <button
                                                className="year-selector-btn"
                                                onClick={() => setShowYearDropdown(!showYearDropdown)}
                                            >
                                                {selectedDate.getFullYear()}
                                                <FaChevronDown className={`dropdown-icon ${showYearDropdown ? 'open' : ''}`} />
                                            </button>
                                            {showYearDropdown && (
                                                <div className="year-dropdown">
                                                    {years.map(year => (
                                                        <button
                                                            key={year}
                                                            className={`year-option ${year === selectedDate.getFullYear() ? 'selected' : ''}`}
                                                            onClick={() => changeYear(year)}
                                                        >
                                                            {year}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button className="nav-btn" onClick={() => changeMonth(1)}>
                                        <FaChevronRight />
                                    </button>
                                </div>

                                <div className="calendar-weekdays">
                                    <span className="weekday">Su</span>
                                    <span className="weekday">Mo</span>
                                    <span className="weekday">Tu</span>
                                    <span className="weekday">We</span>
                                    <span className="weekday">Th</span>
                                    <span className="weekday">Fr</span>
                                    <span className="weekday">Sa</span>
                                </div>

                                <div className="calendar-grid">
                                    {calendarWeeks.map((week, weekIndex) => (
                                        <div key={weekIndex} className="calendar-week">
                                            {week.map((day, dayIndex) => (
                                                <button
                                                    key={`${weekIndex}-${dayIndex}`}
                                                    className={`calendar-day 
                  ${day === selectedDate.getDate() ? 'selected' : ''} 
                  ${!day ? 'empty' : ''}
                  ${day === new Date().getDate() &&
                                                            selectedDate.getMonth() === new Date().getMonth() &&
                                                            selectedDate.getFullYear() === new Date().getFullYear() ? 'today' : ''}`}
                                                    onClick={() => handleDateSelect(day)}
                                                    disabled={!day}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Clock Section */}
                            <div className="clock-section">
                                <AnalogClock date={timezoneDate} size={140} />
                                <div className="digital-time">
                                    {format(timezoneDate, 'HH:mm:ss')}
                                </div>
                            </div>
                        </div>

                        {/* Time Selection */}
                        <div className="time-section">
                            <div className="time-label">
                                <FaRegClock className="time-icon" />
                                <span>Select Time</span>
                            </div>
                            <div className="time-input-group">
                                <input
                                    type="text"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    placeholder="HH:MM:SS"
                                    className="time-input"
                                />
                                <div className="time-presets">
                                    <button onClick={setToNow} className="time-preset">Now</button>
                                    <button onClick={setToMidnight} className="time-preset">00:00</button>
                                    <button onClick={setToNoon} className="time-preset">12:00</button>
                                </div>
                            </div>
                        </div>

                        {/* Epoch Values */}
                        <div className="epoch-values">
                            <div className="value-row">
                                <span className="value-label">Milliseconds</span>
                                <div className="value-content">
                                    <code>{epochMillis.toLocaleString()}</code>
                                    <button
                                        className="copy-btn"
                                        onClick={() => handleCopy(epochMillis.toString(), 'millis')}
                                    >
                                        {copySuccess.millis ? <FaCheckCircle className="success" /> : <FaCopy />}
                                    </button>
                                </div>
                            </div>
                            <div className="value-row">
                                <span className="value-label">Seconds</span>
                                <div className="value-content">
                                    <code>{epochSeconds.toLocaleString()}</code>
                                    <button
                                        className="copy-btn"
                                        onClick={() => handleCopy(epochSeconds.toString(), 'seconds')}
                                    >
                                        {copySuccess.seconds ? <FaCheckCircle className="success" /> : <FaCopy />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Epoch Input & Conversions */}
                <div className="epoch-card">
                    <div className="card-header">
                        <div className="card-title">
                            <FaClock className="card-icon" />
                            <span>Epoch Input & Conversions</span>
                        </div>
                    </div>

                    <div className="card-content">
                        {/* Manual Input */}
                        <div className="input-section">
                            <label className="input-label">
                                Enter Epoch (ms or seconds)
                                <FaArrowRight className="input-arrow" />
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={inputEpoch}
                                    onChange={(e) => handleEpochInput(e.target.value)}
                                    placeholder="e.g., 1771737608738"
                                    className={`epoch-input ${inputError ? 'error' : ''}`}
                                />
                                {inputError && (
                                    <span className="input-error">
                                        <FaExclamationCircle /> {inputError}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Conversion Results */}
                        <div className="conversion-section">
                            <h4>Converted Times</h4>
                            <div className="conversion-list">
                                <div className="conversion-row">
                                    <span className="conv-label">UTC</span>
                                    <div className="conv-value">
                                        <code>{formattedUTC}</code>
                                        <button
                                            className="copy-btn"
                                            onClick={() => handleCopy(formattedUTC, 'utc')}
                                        >
                                            {copySuccess.utc ? <FaCheckCircle className="success" /> : <FaCopy />}
                                        </button>
                                    </div>
                                </div>
                                <div className="conversion-row">
                                    <span className="conv-label">Local</span>
                                    <div className="conv-value">
                                        <code>{formattedLocal}</code>
                                        <button
                                            className="copy-btn"
                                            onClick={() => handleCopy(formattedLocal, 'local')}
                                        >
                                            {copySuccess.local ? <FaCheckCircle className="success" /> : <FaCopy />}
                                        </button>
                                    </div>
                                </div>
                                <div className="conversion-row">
                                    <span className="conv-label">ISO</span>
                                    <div className="conv-value">
                                        <code className="iso-code">{isoString}</code>
                                        <button
                                            className="copy-btn"
                                            onClick={() => handleCopy(isoString, 'iso')}
                                        >
                                            {copySuccess.iso ? <FaCheckCircle className="success" /> : <FaCopy />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="epoch-footer">
                <div className="footer-note">
                    <span className="note-icon">💡</span>
                    <span>Auto-converts. Supports ms (13 digits) or seconds (10 digits).</span>
                </div>
                <div className="footer-shortcuts">
                    <kbd>N</kbd> now • <kbd>M</kbd> midnight • <kbd>⌘C</kbd> copy
                </div>
            </div>
        </div>
    );
};

export default EpochCalculator;