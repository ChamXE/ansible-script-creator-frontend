import { Server } from "@/models/device";
import { Project } from "@/models/project";
import axios, { CancelTokenSource } from "axios";

export function getURL(): string {
    const curURL = window.location.hostname;
    return `http://${curURL}/api`;
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
            const project: Project[] = JSON.parse(JSON.stringify(response.data.data.project));
            return project;
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
            const server: Server[] = JSON.parse(JSON.stringify(response.data.data.server));
            return server;
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