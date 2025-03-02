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