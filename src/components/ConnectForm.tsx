import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MondayCredentials } from "@/lib/types";
import { validateCredentials, fetchBoardStructureWithExamples } from "@/lib/mondayAPI";
import { toast } from "sonner";
import { ArrowRight, Info, Key, Loader2 } from "lucide-react";

interface ConnectFormProps {
  onConnect: (credentials: MondayCredentials, boardData: any) => void;
}

const ConnectForm: React.FC<ConnectFormProps> = ({ onConnect }) => {
  const [apiToken, setApiToken] = useState("");
  const [sourceBoard, setSourceBoard] = useState("");
  const [destinationBoard, setDestinationBoard] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showApiHelp, setShowApiHelp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedApiToken = localStorage.getItem("mondayApiToken") || "";
    const savedSourceBoard = localStorage.getItem("mondaySourceBoard") || "";
    const savedDestinationBoard = localStorage.getItem("mondayDestinationBoard") || "";
    
    setApiToken(savedApiToken);
    setSourceBoard(savedSourceBoard);
    setDestinationBoard(savedDestinationBoard);
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiToken || !sourceBoard) {
      toast.error("API token and source board ID are required");
      return;
    }

    const destBoard = destinationBoard || sourceBoard;
    
    const credentials: MondayCredentials = {
      apiToken,
      sourceBoard,
      destinationBoard: destBoard,
    };
    
    localStorage.setItem("mondayApiToken", apiToken);
    localStorage.setItem("mondaySourceBoard", sourceBoard);
    localStorage.setItem("mondayDestinationBoard", destinationBoard);
    
    setIsLoading(true);
    
    try {
      const isValid = await validateCredentials(credentials);
      
      if (!isValid) {
        toast.error("Invalid API token or board ID. Please check your credentials and ensure your token has the correct permissions.");
        setIsLoading(false);
        return;
      }
      
      toast.info("Credentials validated! Fetching board structure...");
      
      const boardData = await fetchBoardStructureWithExamples(credentials);
      
      if (!boardData) {
        toast.error("Failed to fetch board data. Please check your credentials and try again.");
        setIsLoading(false);
        return;
      }
      
      toast.success(`Board structure loaded: ${boardData.boardName} with ${boardData.columns.length} columns and ${boardData.groups.length} groups`);
      
      sessionStorage.setItem("mondayCredentials", JSON.stringify(credentials));
      sessionStorage.setItem("mondayBoardData", JSON.stringify(boardData));
      
      onConnect(credentials, boardData);
      navigate("/board");
      
    } catch (error) {
      console.error("Connection error:", error);
      let errorMessage = "Unknown error";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error stack:", error.stack);
      }
      
      toast.error(`Connection failed: ${errorMessage}. Please check the console for more details.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-monday-blue">Working Monday</span>
          </CardTitle>
          <CardDescription>Connect to your Monday.com boards</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleConnect}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="apiToken" className="text-sm font-medium">
                  Monday API Token
                </label>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setShowApiHelp(!showApiHelp)}
                >
                  <Info className="h-3.5 w-3.5 mr-1" />
                  Help
                </Button>
              </div>
              
              {showApiHelp && (
                <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-100 mb-3">
                  <p className="mb-2">To get your API token:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Go to your Monday.com account</li>
                    <li>Click on your avatar in the bottom left</li>
                    <li>Go to "Admin" ⇾ "API"</li>
                    <li>Copy your "API v2 Token"</li>
                  </ol>
                </div>
              )}
              
              <div className="relative">
                <Key className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="apiToken"
                  placeholder="Paste your Monday API Token here"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="pl-8"
                  required
                  type="password"
                />
              </div>
              <p className="text-[0.8rem] text-muted-foreground">
                Your API token is stored only in your browser's session.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="sourceBoard" className="text-sm font-medium">
                Source Board ID
              </label>
              <Input
                id="sourceBoard"
                placeholder="Enter Source Board ID (e.g. 12345678)"
                value={sourceBoard}
                onChange={(e) => setSourceBoard(e.target.value)}
                required
              />
              <p className="text-[0.8rem] text-muted-foreground">
                You can find the Board ID in the URL when viewing a board:<br />
                https://your-domain.monday.com/boards/<strong>1234567890</strong>/...
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="destinationBoard" className="text-sm font-medium">
                Destination Board ID (Optional)
              </label>
              <Input
                id="destinationBoard"
                placeholder="Enter Destination Board ID (can be same as source)"
                value={destinationBoard}
                onChange={(e) => setDestinationBoard(e.target.value)}
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Leave blank to use the same board as source.
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-monday-blue hover:bg-monday-darkBlue"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Let's Do This <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ConnectForm;
