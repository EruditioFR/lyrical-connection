
import { useState, useCallback } from 'react';

interface DateErrors {
  endDate?: string;
  registrationDeadline?: string;
}

export const useEventFormValidation = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [registrationDeadline, setRegistrationDeadline] = useState<Date>();
  const [dateErrors, setDateErrors] = useState<DateErrors>({});

  const validateDates = useCallback((start: Date | undefined, end: Date | undefined, registration: Date | undefined) => {
    const errors: DateErrors = {};
    
    if (start && end && end < start) {
      errors.endDate = 'La date de fin doit être après la date de début';
    }
    
    if (start && registration && registration >= start) {
      errors.registrationDeadline = 'La date limite d\'inscription doit être avant la date de début';
    }
    
    setDateErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const handleDateChange = useCallback((field: string, date: Date | undefined, onFormChange: (field: string, value: string) => void) => {
    if (date) {
      const isoString = date.toISOString();
      onFormChange(field, isoString);
      
      let newStartDate = startDate;
      let newEndDate = endDate;
      let newRegistrationDeadline = registrationDeadline;
      
      if (field === 'start_date') {
        setStartDate(date);
        newStartDate = date;
      }
      if (field === 'end_date') {
        setEndDate(date);
        newEndDate = date;
      }
      if (field === 'registration_deadline') {
        setRegistrationDeadline(date);
        newRegistrationDeadline = date;
      }
      
      validateDates(newStartDate, newEndDate, newRegistrationDeadline);
    }
  }, [startDate, endDate, registrationDeadline, validateDates]);

  return {
    startDate,
    endDate,
    registrationDeadline,
    dateErrors,
    setStartDate,
    setEndDate,
    setRegistrationDeadline,
    validateDates,
    handleDateChange
  };
};
