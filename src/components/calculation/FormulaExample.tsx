
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
          <p className="font-medium">
            <strong>IF</strong> Column1 &lt; 1500 <strong>THEN</strong> Column3 = 0 <strong>ELSE</strong> Column3 = 5
          </p>
          <p className="mt-1">
            This will check if Column1 is less than 1500. If true, it will set Column3 to 0.
            If false, it will set Column3 to 5.
          </p>
          <p className="mt-2 text-xs font-medium">
            <strong>How to build:</strong>
          </p>
          <ol className="mt-1 text-xs list-decimal ml-4">
            <li>Click the IF button, then click on the blue IF section</li>
            <li>Add Column1, add &lt; operator, add number 1500</li>
            <li>Click the THEN button, then click on the green THEN section</li>
            <li>Add Column3, add = operator, add number 0</li>
            <li>Click the ELSE button, then click on the red ELSE section</li>
            <li>Add Column3, add = operator, add number 5</li>
          </ol>
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
