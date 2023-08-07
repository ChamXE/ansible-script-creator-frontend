export function getURL(): string {
    const curURL = window.location.hostname;
    return `http://${curURL}:8080`;
}