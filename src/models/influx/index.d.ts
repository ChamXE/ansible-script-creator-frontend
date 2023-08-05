import type { WriteOptions } from '@influxdata/influxdb-client';

export type Config = {
    url: string;
    bucket: string;
    org: string;
    token: string;
    writeOptions?: Partial<WriteOptions>;
};

export type Payload = {
    timestamp: number;
    measurement: string;
    precision?: 's' | 'ms';
    tags: { [key: string]: string };
    fields: { [key: string]: number | boolean | string };
};

