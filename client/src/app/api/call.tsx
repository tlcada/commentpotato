export const errorResponseFormatter = (response: { status: number, message: string }): { status: number, message: string } => {
    return {
        status: response.status,
        message: response.message || "General error"
    }
};

export const get = (url: string, init: RequestInit): any | { status: number, message: string } => {
    return fetch(url, init).then(async (response: any) => {
        if (!response.ok) {
            const errorResponse: { error: { message: string }} = await response.json();
            throw errorResponseFormatter({ status: response.status, message: errorResponse.error.message });
        }

        return response.json();
    }, (error: Error) => {
        throw errorResponseFormatter({ status: 503, message: error.message });
    });
};
