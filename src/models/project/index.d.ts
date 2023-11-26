export interface Project {
    projectid: number | null;
    username: string;
    projectname: string;
    serverid: number;
    generated: boolean;
    ready: boolean;
    count?: number;
}

export interface RouterSwitch {
    projectid: number;
    routerid: number;
    switchid: number;
    portname: string;
    ip: string;
    subnet: string;
    interfacename: string | null;
}

export interface SwitchSwitch {
    projectid: number;
    switchid_src: number;
    switchid_dst: number;
    portname: string;
}

export interface SwitchHost {
    projectid: number;
    switchid: number;
    hostid: number;
    portname: string;
}

export type Interfaces = {
    [interfacename: string]: string
}