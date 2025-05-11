"use client";

import React from "react";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  return (
    <div className="flex items-center justify-between w-full border px-4 rounded-md">
      <Search size={18} />
      <Input
        placeholder="Search or Start a new chat"
        className="border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
