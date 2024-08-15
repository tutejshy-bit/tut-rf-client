import { Adapter } from "../types";
import WebClient from "./clients/client-web";
import SerialClient from "./clients/client-serial";

const ip = '192.168.4.1';
const webAdapter = new WebClient(`http://${ip}`);
const serialAdapter = new SerialClient({baudRate: 115200});

export default (adapter) => {
    switch(adapter){
        case Adapter.Serial:
            return serialAdapter;
        case Adapter.Web:
        default:
            return webAdapter;
    }
}
