type Json = string | number | boolean | null | { [property: string | number]: Json } | Json[];

interface Token {
    username: string;
    token: string;
}