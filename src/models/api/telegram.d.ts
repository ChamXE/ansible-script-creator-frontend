import type * as API from '~/api';
import type { Message, ParseMode } from 'node-telegram-bot-api';

export namespace Telegram {
    // @ts-ignore
    // wonky interactions between interfaces and types causes this to throw errors;
    // Message interface has been manually confirmed to conform to Json standards
    type Request = API.Request<undefined, undefined, Message>;

    type Response = API.Response<{ message?: string; parse_mode?: ParseMode }>;
}
