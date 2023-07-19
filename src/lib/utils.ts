

export function generateUUID(): string {
    let d = new Date().getTime();

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
}

export function millsToTimeFormat(mills: number): string {
    const hours = Math.floor(mills / 3600000);
    const minutes = Math.floor((mills - (hours * 3600000)) / 60000);
    const seconds = Math.floor((mills - (hours * 3600000) - (minutes * 60000)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
}