export let global_vars: {
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
export const waltuh: string = "https://7834-12-7-77-162.ngrok-free.app/";
export const waltuh2: string = "https://believes-wrong-kerry-tree.trycloudflare.com/";