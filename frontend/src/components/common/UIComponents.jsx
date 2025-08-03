// Common button component with variants
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    outline: 'border-2 border-gray-600 hover:bg-gray-600 hover:text-white text-gray-300 focus:ring-gray-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Card component with glass morphism effect
export const Card = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-gray-800/40 backdrop-blur-lg border border-gray-700/50 rounded-xl ${className}`}
      {...props}
    >
      {children}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-blue-500/5 blur-2xl"></div>
    </div>
  );
};

// Input field component
export const Input = ({ 
  label,
  error,
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-gray-800/30 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500
          focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

// Loading spinner component
export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`relative ${sizes[size]}`}>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
};

// Badge component
export const Badge = ({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) => {
  const variants = {
    default: 'bg-gray-600/50 text-gray-300',
    success: 'bg-emerald-500/20 text-emerald-500',
    warning: 'bg-yellow-500/20 text-yellow-500',
    danger: 'bg-red-500/20 text-red-500',
    info: 'bg-blue-500/20 text-blue-500',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Table components
export const Table = ({ children, className = '', ...props }) => (
  <div className="overflow-x-auto">
    <table className={`min-w-full divide-y divide-gray-700/50 ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const Thead = ({ children, className = '', ...props }) => (
  <thead className={`bg-gray-800/50 ${className}`} {...props}>
    {children}
  </thead>
);

export const Th = ({ children, className = '', ...props }) => (
  <th
    className={`px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${className}`}
    {...props}
  >
    {children}
  </th>
);

export const Tbody = ({ children, className = '', ...props }) => (
  <tbody className={`divide-y divide-gray-700/50 ${className}`} {...props}>
    {children}
  </tbody>
);

export const Tr = ({ children, className = '', ...props }) => (
  <tr
    className={`group hover:bg-gray-800/30 transition-colors ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const Td = ({ children, className = '', ...props }) => (
  <td
    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-300 ${className}`}
    {...props}
  >
    {children}
  </td>
);

// Alert component
export const Alert = ({ 
  children, 
  variant = 'info',
  className = '',
  ...props 
}) => {
  const variants = {
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    error: 'bg-red-500/10 border-red-500/20 text-red-500',
  };

  return (
    <div
      className={`p-4 rounded-lg border ${variants[variant]} ${className}`}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
};
