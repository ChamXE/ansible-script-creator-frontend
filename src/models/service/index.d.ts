export interface BGP {
    configid?: number;
    routerid: number;
    asnumber?: number;
    bgprouterid?: string;
    neighbour?: Neighbour[];
    network?: AdvertiseNetwork[];
}

export interface Neighbour {
    id?: string;
    remoteas?: number;
    ebgpmultihop?: boolean;
}

export interface AdvertiseNetwork {
    ip?: string;
    mask?: string;
}