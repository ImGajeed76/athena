export function generateUUID(): string {
    let d = new Date().getTime();

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

export function millsToTimeFormat(mills: number): string {
    const hours = Math.floor(mills / 3600000);
    const minutes = Math.floor((mills - (hours * 3600000)) / 60000);
    const seconds = Math.floor((mills - (hours * 3600000) - (minutes * 60000)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
}

export async function getRandomUnsplashImage(query: string[]) {
    const url = `https://source.unsplash.com/1600x900/?${query.join(",")}`;
    const response = await fetch(url);
    return response.url;
}

export function validateEmail(email: string) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

export function download(filename: string, text: string) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}