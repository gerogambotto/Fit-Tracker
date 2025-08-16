// Error handling utilities

export const formatErrorMessage = (error) => {
  if (!error) return 'Error desconocido';
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle Pydantic validation errors (array of objects)
  if (Array.isArray(error)) {
    return error.map(err => {
      if (typeof err === 'object' && err.msg) {
        const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : '';
        return field ? `${field}: ${err.msg}` : err.msg;
      }
      return String(err);
    }).join(', ');
  }
  
  // Handle object errors
  if (typeof error === 'object') {
    if (error.msg) return error.msg;
    if (error.message) return error.message;
    if (error.detail) return error.detail;
  }
  
  return String(error);
};

export const getErrorFromResponse = (error) => {
  if (error.response?.data?.detail) {
    return formatErrorMessage(error.response.data.detail);
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Error en la solicitud';
};