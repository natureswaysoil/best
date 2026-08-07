import { useState } from 'react';
import { addCartItem } from '../lib/cart';

type Props = { productId:string; productName:string; image?:string; price:number; sizeName?:string; sku?:string };
export default function QuickAddButton(props:Props) {
  const [added,setAdded]=useState(false);
  return <button onClick={()=>{addCartItem({...props,quantity:1});setAdded(true);window.location.assign('/cart');}} className="btn-primary text-sm py-2 px-3">{added?'Added ✓':'Quick Add'}</button>;
}
