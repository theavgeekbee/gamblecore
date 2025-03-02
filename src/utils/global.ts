export let global_vars: {
    current_price: number,
    trades: Trade[],
    offset: number,
    balance: number,
    viewing: string
} = {
    current_price: 0,
    trades: [],
    offset: 1000,
    balance: 10000,
    viewing: "AAPL"
}
export interface Trade {
    type: string,
    stock: string,
    units: number,
    price: number,
    closed: boolean
}
export const waltuh: string = "https://7834-12-7-77-162.ngrok-free.app/";
export const waltuh2: string = "https://believes-wrong-kerry-tree.trycloudflare.com/";