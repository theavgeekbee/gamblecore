export const global_vars: {
    current_price: number,
    trades: Trade[],
    balance: number,
    viewing: string
} = {
    current_price: 0,
    trades: [],
    balance: -1,
    viewing: "AAPL"
}
export interface Trade {
    id: string,
    type: string,
    stock: string,
    units: number,
    price: number,
    closed: boolean
}
export const waltuh: string = "http://localhost:3500/";
export const waltuh2: string = "http://localhost:5000/";