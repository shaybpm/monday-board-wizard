
import React from "react";

interface FormulaExampleProps {
  isLogicTestMode: boolean;
}

const FormulaExample: React.FC<FormulaExampleProps> = ({
  isLogicTestMode
}) => {
  return (
    <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
      <p className="font-medium mb-1">Example:</p>
      {isLogicTestMode ? (
        <>
          <p>
            <strong>IF</strong> Column2 == 0 <strong>THEN</strong> Column2 + 1 <strong>ELSE</strong> Column2
          </p>
          <p className="mt-1">
            This will check if Column2 equals 0, and if true, store Column2 + 1 in the target column.
            If false, the original value in Column2 is stored.
          </p>
          <p className="mt-2 text-xs">
            <strong>How to build:</strong> First click the IF button, then select columns and comparison operators for your condition.
            Next, click the THEN button and build what happens when true. Finally, click the ELSE button and build what happens when false.
          </p>
        </>
      ) : (
        <>
          <p>
            Column2 + Column3 * 2
          </p>
          <p className="mt-1">
            This will multiply Column3 by 2 and add it to Column2, storing the result in the target column.
          </p>
          <p className="mt-2 text-xs">
            To build this formula: Click on columns and math operators in the desired sequence.
          </p>
        </>
      )}
    </div>
  );
};

export default FormulaExample;
