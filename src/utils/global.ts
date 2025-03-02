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
export const waltuh: string = "https://gamble-express.nwlee.tech/";
export const waltuh2: string = "https://gamble-flask.nwlee.tech/";