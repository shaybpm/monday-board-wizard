
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Info, Key } from "lucide-react";

interface ApiTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiToken: string;
  setApiToken: (token: string) => void;
}

const ApiTokenDialog: React.FC<ApiTokenDialogProps> = ({
  open,
  onOpenChange,
  apiToken,
  setApiToken,
}) => {
  const [token, setToken] = useState(apiToken);
  const [showHelp, setShowHelp] = useState(false);

  const handleSave = () => {
    setApiToken(token);
    if (token) {
      localStorage.setItem("mondayApiToken", token);
    } else {
      localStorage.removeItem("mondayApiToken");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Monday.com API Token
          </DialogTitle>
          <DialogDescription>
            Enter your Monday.com API token to connect to your boards.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Button 
            type="button"
            variant="ghost" 
            size="sm"
            className="h-7 px-2 text-xs flex items-center"
            onClick={() => setShowHelp(!showHelp)}
          >
            <Info className="h-3.5 w-3.5 mr-1" />
            Help with getting your API token
          </Button>
          
          {showHelp && (
            <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-100">
              <p className="mb-2">To get your API token:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Go to your Monday.com account</li>
                <li>Click on your avatar in the bottom left</li>
                <li>Go to "Admin" ⇾ "API"</li>
                <li>Copy your "API v2 Token"</li>
              </ol>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="apiToken">API Token</Label>
            <div className="relative">
              <Key className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="apiToken"
                type="password"
                placeholder="Enter your Monday API token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-gray-500">
              Your API token is stored securely in your local browser storage.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Token
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiTokenDialog;
