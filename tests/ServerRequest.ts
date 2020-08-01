const fetch = require('node-fetch');

export function request(url: string, method: string, optionsProperty: any) {

    const isGet = method === "GET";
    const properties: any = {}
    Object.keys(optionsProperty).forEach((key) => {
        properties[key] = JSON.stringify(optionsProperty[key])
    })
    const options = {
        method,
        ...properties,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    let params: any = ""
    if (isGet) {
        const p = optionsProperty.query ? optionsProperty.query : (optionsProperty.params ? optionsProperty.params : "");
        params = "?" + (new URLSearchParams(p)).toString();
    };
    const finalUrl = url + params

    return new Promise<any>((resolve, reject) => {
        fetch(finalUrl, options)
            .then((fetchResponse: any) => {
                // console.log("Fetch response", fetchResponse.headers.get('Content-Type'));
                let parsedFetchResponse;
                switch (fetchResponse.headers.get('Content-Type').toLowerCase()) {
                    case 'text/html; charset=utf-8':
                        parsedFetchResponse = fetchResponse.text()
                        break;
                    case 'application/json; charset=utf-8':
                        parsedFetchResponse = fetchResponse.json()
                        break;

                    default:
                        console.log("Fetch response", fetchResponse.headers.get('Content-Type'));
                        break;
                }
                parsedFetchResponse.then((response: any) => {
                    if (fetchResponse.status >= 200 && fetchResponse.status < 300) {
                        console.log("response", response);

                        resolve(response)
                    } else {
                        console.log("response", fetchResponse);
                        reject(response)
                    }

                }).catch((error: any) => {
                    reject(error);
                })
            }).catch((error: any) => {
                reject(error);
            })
    })
}