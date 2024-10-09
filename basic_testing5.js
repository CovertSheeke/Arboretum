import { useState, useEffect } from "react";
// import useState from "react";
// import useEffect from "react";

function CounterWithEffect() {
  const [count, setCount] = useState(0);

  // Update the document title whenever 'count' changes
  useEffect(() => {
    document.title = `Count: ${count}`;

    // Cleanup (optional) if needed when the component unmounts or before the effect re-runs
    return () => {
      console.log("Cleaning up");
    };
  }, [count]); // Effect runs whenever 'count' changes

  return (
    <div>
      <p>You've clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
