export type Server = {
    serverid: number | null;
    username: string;
    servername: string;
}

export type Router = {
    routerid: number | null;
    routername: string;
    serverid: number;
    nic: string[];
}

export type Switch = {
    switchid: number | null;
    switchname: string;
    serverid: number;
}

export type Host = {
    hostid: number | null;
    hostname: string;
    serverid: number;
}