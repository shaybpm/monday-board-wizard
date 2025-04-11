
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { SavedTaskTemplate } from "@/pages/Index";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TemplateLoadButtonProps {
  savedTemplates: SavedTaskTemplate[];
  onLoadTemplate: (template: SavedTaskTemplate) => void;
}

const TemplateLoadButton = ({ savedTemplates, onLoadTemplate }: TemplateLoadButtonProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredTemplates = savedTemplates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    format(new Date(template.dateCreated), "PPP").toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Load Template
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end" sideOffset={4} style={{ width: '300px' }}>
        <Command>
          <CommandInput 
            placeholder="Search templates..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>No templates found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {filteredTemplates.map((template, index) => (
              <CommandItem
                key={index}
                onSelect={() => {
                  onLoadTemplate(template);
                  setOpen(false);
                }}
                className="flex flex-col items-start py-3"
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(template.dateCreated), "PPP")} • {template.tasks.length} tasks
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default TemplateLoadButton;
