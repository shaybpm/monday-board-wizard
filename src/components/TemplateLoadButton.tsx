
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { SavedTaskTemplate } from "@/pages/Index";
import { format } from "date-fns";

interface TemplateLoadButtonProps {
  savedTemplates: SavedTaskTemplate[];
  onLoadTemplate: (template: SavedTaskTemplate) => void;
}

const TemplateLoadButton = ({ savedTemplates, onLoadTemplate }: TemplateLoadButtonProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Ensure we have a valid array for templates
  const templates = Array.isArray(savedTemplates) ? savedTemplates : [];
  
  // Ensure we have a valid array for filteredTemplates
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    format(new Date(template.dateCreated), "PPP").toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Only render the popover content when open to avoid rendering issues
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
      {open && (
        <PopoverContent className="p-0" align="end" sideOffset={4} style={{ width: '300px' }}>
          <Command>
            <CommandInput 
              placeholder="Search templates..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandEmpty>No templates found.</CommandEmpty>
            <CommandGroup>
              {templates.length > 0 ? (
                filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template, index) => (
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
                  ))
                ) : (
                  <div className="py-6 text-center text-sm">No templates match your search.</div>
                )
              ) : (
                <div className="py-6 text-center text-sm">No saved templates yet.</div>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default TemplateLoadButton;
