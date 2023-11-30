import { RouterSwitch, SwitchHost, SwitchSwitch } from "@/models/project";
import axios, { CancelTokenSource } from "axios";
import { getURL } from "../global";
import { ProjectDevice } from "~/device";

export async function getConnection(
    projectId: number, 
    connectionType: string, 
    source: CancelTokenSource
): Promise<RouterSwitch[] | SwitchSwitch[] | SwitchHost[] | null> {
    try {
        const response = await axios.get(`${getURL()}/project/${connectionType}/${projectId}`, {
            cancelToken: source.token
        });

        if (!response.data.result) {
            console.error(response.data.message);
            return null;
        }

        if (Object.keys(response.data.data).length) {
            switch (connectionType) {
                case "routerSwitch":
                    return JSON.parse(JSON.stringify(response.data.data.connection));
                case "switchSwitch":
                    return JSON.parse(JSON.stringify(response.data.data.connection));
                case "switchHost":
                    return JSON.parse(JSON.stringify(response.data.data.connection));
                default:
                    return null;
            }
        }
        return null;
    } catch (e) {
        if (e.code !== "ERR_CANCELED") {
            alert('Error fetching connection info!');
            console.error(e.message);
        }
        return null;
    }
}

export async function createConnection(
    connectionInfo: RouterSwitch | SwitchSwitch | SwitchHost, 
    connectionType: string
): Promise<number> {
    try {
        const response = await axios.post(`${getURL()}/project/${connectionType}`, connectionInfo);
        if (!response.data.result) {
            console.error(response.data.message);
            return 0;
        }
        alert('Connection successfully created!');
        return 1;
    } catch (e) {
        console.error(e.message);
        return 0;
    }
}

export async function updateConnection(
    oldConnectionInfo: RouterSwitch | SwitchSwitch | SwitchHost,
    newConnectionInfo: RouterSwitch | SwitchSwitch | SwitchHost,
    connectionType: string
): Promise<number> {
    try {
        const response = await axios.put(`${getURL()}/project/${connectionType}`, {
            oldConnectionInfo, newConnectionInfo
        });
        if (!response.data.result) {
            console.error(response.data.message);
            return 0;
        }
        alert('Connection successfully updated!');
        return 1;
    } catch (e) {
        console.error(e.message);
        return 0;
    }
}

export async function deleteConnection(id1: number, id2: number, id3: number, connectionType: string): Promise<number> {
    try {
        const response = await axios.delete(`${getURL()}/project/${connectionType}/${id1}/${id2}/${id3}`);
        if (!response.data.result) return 0;
        return 1;
    } catch (e) {
        console.error(e.message);
        alert('Connection deletion failed!');
        return 0;
    }
}

export async function getProjectDevices(projectId: number, source: CancelTokenSource): Promise<ProjectDevice | null> {
    try {
        const response = await axios.get(`${getURL()}/device/${projectId}`, {
            cancelToken: source.token
        });

        if (!response.data.result) {
            console.error(response.data.message);
            return null;
        }

        if (Object.keys(response.data.data).length) {
            return JSON.parse(JSON.stringify(response.data.data));
        }
        return null;
    } catch (e) {
        if (e.code !== "ERR_CANCELED") {
            alert('Error fetching devices in this project!');
            console.error(e.message);
        }
        return null;
    }
}