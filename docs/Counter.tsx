import {useState} from 'react';

export function Counter() {
  const [ count, setCount ] = useState(0);
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount((count) => count + 1)}>点击加1</button>
    </div>
  );
}

export default Counter