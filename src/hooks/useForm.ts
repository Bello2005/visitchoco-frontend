import { useState } from "react";

interface ValidationRules {
  [key: string]: (
    value: string,
    formValues?: { [key: string]: string }
  ) => boolean;
}

interface UseFormProps {
  initialValues: { [key: string]: string };
  validationRules: ValidationRules;
}

export const useForm = ({ initialValues, validationRules }: UseFormProps) => {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  };

  const validateField = (name: string, value: string) => {
    const isValid = validationRules[name](value, values);
    setErrors((prev) => ({ ...prev, [name]: !isValid }));
    return isValid;
  };

  const isValid = () => {
    return Object.keys(validationRules).every((field) =>
      validationRules[field](values[field], values)
    );
  };

  return {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    isValid,
    setValues,
  };
};
