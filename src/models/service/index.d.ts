import { InterfaceConfiguration } from "~/project";

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

export type ParsedConnection = {
    source: Connection;
    destination: Connection;
}

type Connection = {
    [source: string]: Destination;
}

export type Destination = {
    [destination: string]: string;
}

export interface Source {
    routerid: number;
    routername: string;
    configuration: InterfaceConfiguration;
}

export interface CustomIntent {
    configid?: number;
    projectid: number;
    routerid: number;
    source: string;
    sourcekey: string;
    intermediate: string[];
    destination: string;
    destkey: string;
    ethertype: string;
    protocol: string | null;
}