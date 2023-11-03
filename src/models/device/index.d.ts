export interface Server {
    serverid: number | null;
    servername: string;
    ip: string;
    rootcredential: User;
}

export interface Router {
    routerid: number | null;
    routername: string;
    projectid: number;
    management: string | null;
    configuration: RouterConfiguration;
}

export interface Switch {
    switchid: number | null;
    switchname: string;
    projectid: number;
    controller: string;
}

export interface Host {
    hostid: number | null;
    hostname: string;
    projectid: number;
    ip: string | null;
    subnet: string | null;
    defaultgateway: number;
}

export interface RouterConfiguration {
    users: RouterUser[]
    routes: Route[]
}

export interface IP {
    ip: string;
    mask: string | number;
    description?: string;
    portName?: string;
}

export interface User {
    username: string;
    password: string;
}

export interface Route {
    prefix: string;
    mask: string;
    exitInterface?: string;
    exitGateway?: string;
    metric?: number;
}

export interface RouterUser extends User {
    privilege: number;
}

export interface ProjectDevice {
    router: Router[];
    switch: Switch[];
    host: Host[]
}