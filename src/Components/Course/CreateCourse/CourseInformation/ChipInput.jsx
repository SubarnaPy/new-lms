import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { GrFormClose } from 'react-icons/gr';
import { TextField } from '@mui/material';

const ChipInput = ({
  label,
  name,
  placeholder,
  register,
  errors,
  setValue,
  getValues,
}) => {
  const { course, editCourse } = useSelector((state) => state.course);
  const [chips, setChips] = useState([]);

  useEffect(() => {
    register(name, { required: true, validate: (value) => value.length > 0 });

    if (editCourse) {
      setChips(JSON.parse(course?.tags));
    }
  }, [register, name, editCourse, course]);

  useEffect(() => {
    setValue(name, chips);
  }, [chips, setValue, name]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const chipValue = e.target.value.trim();
      if (chipValue) {
        setChips([...chips, chipValue]);
        e.target.value = '';
      }
    }
  };

  const handleDeleteChip = (chipIndex) => {
    const newChips = chips.filter((_, index) => index !== chipIndex);
    setChips(newChips);
  };

  return (
    <div className="flex flex-col mx-2 space-y-2">
      {/* Label */}
      <label className="text-sm text-slate-950 dark:text-white" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>

      {/* Chips and Input */}
      <div className="flex flex-wrap w-full gap-y-2">
        {/* Render Chips */}
        {chips.map((chip, index) => (
          <div
            key={index}
            className="flex items-center px-2 py-1 m-1 text-sm bg-yellow-400 rounded-full dark:bg-yellow-600 text-slate-950 dark:text-white"
          >
            {/* Chip Value */}
            {chip}
            {/* Delete Button */}
            <button
              type="button"
              className="ml-2 focus:outline-none"
              onClick={() => handleDeleteChip(index)}
            >
              <GrFormClose className="text-sm dark:text-white" />
            </button>
          </div>
        ))}

        {/* Input Field */}
        <TextField
          fullWidth
          label="Tags"
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="w-full dark:bg-gray-700 dark:text-white"
          InputLabelProps={{ className: 'dark:text-white' }}
          InputProps={{ className: 'dark:text-white' }}
        />
      </div>

      {/* Error Message */}
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  );
};

export default ChipInput;