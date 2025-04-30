export const NetworkStatusIndicator = ({ quality }) => {
    const getStatusColor = () => {
      switch (quality) {
        case 'poor': return 'bg-red-500';
        case 'moderate': return 'bg-yellow-500';
        default: return 'bg-green-500';
      }
    };
  
    return (
      <div className="flex items-center space-x-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
        <span>Network: {quality}</span>
      </div>
    );
  };