
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { SavedTaskTemplate } from "@/types/task";
import { format } from "date-fns";

interface TemplateLoadButtonProps {
  savedTemplates: SavedTaskTemplate[];
  onLoadTemplate: (template: SavedTaskTemplate) => void;
}

const TemplateLoadButton = ({ savedTemplates, onLoadTemplate }: TemplateLoadButtonProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Ensure templates is ALWAYS an array, no matter what
  const templates = Array.isArray(savedTemplates) ? savedTemplates : [];
  
  // Make sure we're not calling filter on undefined
  const filteredTemplates = templates.filter(template => {
    if (!template) return false;
    
    const nameMatch = template.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const dateMatch = template.dateCreated ? 
      format(new Date(template.dateCreated), "PPP").toLowerCase().includes(searchQuery.toLowerCase()) : 
      false;
      
    return searchQuery.trim() === "" || nameMatch || dateMatch;
  });
  
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
        {templates.length === 0 ? (
          <div className="py-6 text-center text-sm">No saved templates yet.</div>
        ) : (
          <Command className="rounded-lg border shadow-md">
            <CommandInput 
              placeholder="Search templates..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {filteredTemplates.length === 0 ? (
                <CommandEmpty>No templates match your search.</CommandEmpty>
              ) : (
                filteredTemplates.map((template, index) => (
                  template && (
                    <CommandItem
                      key={`template-${index}-${template.name || 'unnamed'}`}
                      onSelect={() => {
                        onLoadTemplate(template);
                        setOpen(false);
                      }}
                      className="flex flex-col items-start py-3"
                    >
                      <div className="font-medium">{template.name || 'Unnamed Template'}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.dateCreated ? format(new Date(template.dateCreated), "PPP") : 'No date'} • {Array.isArray(template.tasks) ? template.tasks.length : 0} tasks
                      </div>
                    </CommandItem>
                  )
                ))
              )}
            </CommandGroup>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default TemplateLoadButton;
