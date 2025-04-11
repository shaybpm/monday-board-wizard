
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTaskContext } from "@/contexts/TaskContext";

interface ApiTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiTokenDialog = ({ open, onOpenChange }: ApiTokenDialogProps) => {
  const { apiToken, setApiToken } = useTaskContext();
  const [inputValue, setInputValue] = React.useState(apiToken);

  React.useEffect(() => {
    // Update input value when apiToken changes
    setInputValue(apiToken);
  }, [apiToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiToken(inputValue);
    localStorage.setItem("mondayApiToken", inputValue);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Monday API Token</DialogTitle>
            <DialogDescription>
              Enter your Monday.com Developer API v2 token. This token will be used to
              authenticate API requests to Monday.com.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="api-token">API Token</Label>
              <Input
                id="api-token"
                placeholder="Enter your API token"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!inputValue}>Save Token</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiTokenDialog;
