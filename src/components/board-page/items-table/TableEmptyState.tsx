
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";

interface TableEmptyStateProps {
  isLoading: boolean;
}

const TableEmptyState: React.FC<TableEmptyStateProps> = ({ isLoading }) => {
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6 text-center">
          <p>Loading items...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">
          No items available. Try fetching data first by clicking "Fetch All Board Data".
        </p>
      </CardContent>
    </Card>
  );
};

export default TableEmptyState;
