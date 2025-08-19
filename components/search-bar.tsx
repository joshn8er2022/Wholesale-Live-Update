
'use client';

import { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchBar({ 
  onSearch, 
  onRefresh, 
  isLoading = false, 
  placeholder = "Search products by name or SKU..." 
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch?.(query);
  };

  const handleRefresh = () => {
    onRefresh?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e?.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="luxury-card p-6 mb-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e?.target?.value ?? '')}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-lg transition-all duration-200"
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="luxury-button min-w-[120px]"
          >
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            className="border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
}
