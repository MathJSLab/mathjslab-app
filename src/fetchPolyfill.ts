async function fetchPolyfill(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return new Promise((resolve: (value: Response | PromiseLike<Response>) => void) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function (this: XMLHttpRequest, _ev: ProgressEvent<EventTarget>) {
            if (typeof Response === 'function') {
                resolve(new Response(this.responseText, { status: xhttp.status }));
            } else {
                resolve({
                    ok: xhttp.status >= 200 && xhttp.status < 300,
                    status: xhttp.status,
                    text: async () => this.responseText,
                    json: async () => JSON.parse(this.responseText),
                } as Response);
            }
        };
        xhttp.onerror = function (this: XMLHttpRequest, _ev: ProgressEvent<EventTarget>) {
            if (typeof Response === 'function') {
                resolve(new Response(null, { status: xhttp.status || 500 }));
            } else {
                resolve({
                    ok: false,
                    status: xhttp.status || 500,
                    text: async () => '',
                    json: async () => ({}),
                } as Response);
            }
        };
        xhttp.open(init?.method ?? 'GET', input.toString(), true);
        xhttp.send();
    });
}
if (typeof globalThis.fetch !== 'function') {
    globalThis.fetch = fetchPolyfill;
}
