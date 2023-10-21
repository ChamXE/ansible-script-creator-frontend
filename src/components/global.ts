import {Server} from "@/models/device";
import {Project} from "@/models/project";
import axios, {CancelTokenSource} from "axios";

export function getURL(): string {
    // const curURL = window.location.hostname;
    // return `http://${curURL}/api`;
    return `https://api.fyp-rennaux.me/api`;
}

export async function getProject(username: string, source: CancelTokenSource): Promise<Project[] | null> {
    try {
        const response = await axios.get(`${getURL()}/project/${username}`, {
            cancelToken: source.token
        });

        if (!response.data.result) {
            console.error(response.data.message);
            return null;
        }

        if (Object.keys(response.data.data).length) {
            return JSON.parse(JSON.stringify(response.data.data.project));
        }
        return null;
    } catch (e) {
        if (e.code !== "ERR_CANCELED") {
            alert('Error fetching project!');
            console.error(e.message);
        }
        return null;
    }
}

export async function getServer(source: CancelTokenSource): Promise<Server[] | null> {
    try {
        const response = await axios.get(`${getURL()}/device/server`, {
            cancelToken: source.token
        });

        if (!response.data.result) {
            console.error(response.data.message);
            return null;
        }

        if (Object.keys(response.data.data).length) {
            return JSON.parse(JSON.stringify(response.data.data.server));
        }
        return null;
    } catch (e) {
        if (e.code !== "ERR_CANCELED") {
            alert('Error fetching server!');
            console.error(e.message);
        }
        return null;
    }
}

type Subnet = {
    [prefix: number]: string;
}
export const Subnet: Subnet = {
    30: '255.255.255.252',
    29: '255.255.255.248',
    28: '255.255.255.240',
    27: '255.255.255.224',
    26: '255.255.255.192',
    25: '255.255.255.128',
    24: '255.255.255.0',
    23: '255.255.254.0',
    22: '255.255.252.0',
    21: '255.255.248.0',
    20: '255.255.240.0',
    19: '255.255.224.0',
    18: '255.255.192.0',
    17: '255.255.128.0',
    16: '255.255.0.0',
    15: '255.254.0.0',
    14: '255.252.0.0',
    13: '255.248.0.0',
    12: '255.240.0.0',
    11: '255.224.0.0',
    10: '255.192.0.0',
    9: '255.128.0.0',
    8: '255.0.0.0'
}