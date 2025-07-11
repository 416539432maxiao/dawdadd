import { ALL_PRODUCTS } from "@/config/products";

export function generateOrderNo() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}${random}`;
}

export function getProductById(id: string) {
  return ALL_PRODUCTS.find((product) => product.id === id);
}
