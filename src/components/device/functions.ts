import axios, { CancelTokenSource } from "axios";
import { getURL } from "../global";
import { Server, Router, Switch, Host } from "@/models/device";


export async function getDevice(username: string, deviceType: string, source: CancelTokenSource): Promise<Server[] | Router[] | Switch[] | Host[] | null> {
    try {
        const response = await axios.get(`${getURL()}/device/${deviceType}${deviceType === 'server' ? '' : `/${username}`}`, {
            cancelToken: source.token
        });

        if (!response.data.result) {
            console.error(response.data.message);
            return null;
        }

        if (Object.keys(response.data.data).length) {
            switch (deviceType) {
                case "server":
                    const server: Server[] = JSON.parse(JSON.stringify(response.data.data.server));
                    return server;
                case "router":
                    const router: Router[] = JSON.parse(JSON.stringify(response.data.data.router));
                    return router;
                case "switch":
                    const switches: Switch[] = JSON.parse(JSON.stringify(response.data.data.switch));
                    return switches;
                case "host":
                    const host: Host[] = JSON.parse(JSON.stringify(response.data.data.host));
                    return host;
                default:
                    return null;
            }
        }
        return null;
    } catch (e) {
        if (e.code !== "ERR_CANCELED") {
            alert('Error fetching device data!');
            console.error(e.message);
        }
        return null;
    }
}

export async function deleteDevice(id: number, deviceType: string): Promise<number> {
    try {
        const response = await axios.delete(`${getURL()}/device/${deviceType}/${id}`);
        if (!response.data.result) return 0;
        return 1;
    } catch (e) {
        console.error(e.message);
        alert('Device deletion failed!');
        return 0;
    }
}

export async function createDevice(device: Server | Router | Switch | Host, deviceType: string, isEdit: boolean): Promise<number> {
    try {
        const response = await axios.post(`${getURL()}/device/${deviceType}`, device);
        const curDevice = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
        if (!response.data.result) {
            console.error(response.data.message);
            return 0;
        }
        alert(`${curDevice} successfully ${isEdit ? 'updated' : 'created'}!`);
        return 1;
    } catch (e) {
        console.error(e.message);
        return 0;
    }
}