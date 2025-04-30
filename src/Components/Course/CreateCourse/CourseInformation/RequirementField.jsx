import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { Button } from '@material-tailwind/react';
import { TextField } from '@mui/material';

const RequirementField = ({
  name,
  label,
  register,
  setValue,
  errors,
  getValues,
}) => {
  const { course, editCourse } = useSelector((state) => state.course);
  const [requirement, setRequirement] = useState('');
  const [requirementsList, setRequirementsList] = useState([]);

  useEffect(() => {
    if (editCourse) {
      setRequirementsList(JSON.parse(course?.instructions));
    }
    register(name, { required: true, validate: (value) => value.length > 0 });
  }, []);

  useEffect(() => {
    setValue(name, requirementsList);
  }, [requirementsList]);

  const handleAddRequirement = () => {
    if (requirement) {
      setRequirementsList([...requirementsList, requirement]);
      setRequirement('');
    }
  };

  const handleRemoveRequirement = (index) => {
    const updatedRequirements = [...requirementsList];
    updatedRequirements.splice(index, 1);
    setRequirementsList(updatedRequirements);
  };

  return (
    <div className="flex flex-col space-y-4">
      <label className="text-sm font-medium text-slate-950 dark:text-gray-100" htmlFor={name}>
        {label} <sup className="text-red-500">*</sup>
      </label>
      <div className="flex flex-col space-y-2">
        <TextField
          fullWidth
          type="text"
          id={name}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="Enter a requirement"
          className="w-full dark:bg-gray-700 dark:text-gray-100"
          InputProps={{
            style: {
              color: 'inherit', // Ensures text color is consistent
            },
          }}
        />
        <Button
          type="button"
          onClick={handleAddRequirement}
          className="px-4 py-2 font-semibold text-white bg-indigo-600 w-fit hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Add Requirement
        </Button>
      </div>

      {requirementsList.length > 0 && (
        <ul className="mt-4 space-y-2">
          {requirementsList.map((requirement, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-2 bg-gray-100 rounded-lg dark:bg-gray-700"
            >
              <span className="text-slate-950 dark:text-gray-100">{requirement}</span>
              <button
                type="button"
                onClick={() => handleRemoveRequirement(index)}
                className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full hover:bg-red-200 dark:text-red-400 dark:bg-gray-800 dark:hover:bg-gray-600"
              >
                Clear
              </button>
            </li>
          ))}
        </ul>
      )}
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-red-500">
          {label} is required
        </span>
      )}
    </div>
  );
};

export default RequirementField;