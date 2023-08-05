import type e from 'express';
import type { ParamsDictionary, Query } from 'express-serve-static-core';

export type Config = {
    port: number;
};

export type ResponseBody = Record<string, Json> | undefined;

export interface Request<
    Params extends ParamsDictionary | undefined = undefined,
    ResBody extends ResponseBody = undefined,
    ReqBody extends Json | undefined = undefined,
    ReqQuery = Query
> extends e.Request<Params, ResBody, ReqBody, ReqQuery> {}

export interface Response<ResBody extends ResponseBody = undefined> extends e.Response<ResBody> {}
