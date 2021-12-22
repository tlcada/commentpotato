import { ErrorResponse } from "../handler/YouTubeTypes";

export const errorResponseFormatter = (response: { status: number, message: string }): { status: number, message: string } => {
    return {
        status: response.status,
        message: response.message || "General error",
    };
};

export const get = (url: string): any | { status: number, message: string } => {
    return fetch(url, {
        method: "GET",
        cache: "no-cache",
    }).then(async (response: any) => {
        if (!response.ok) {
            const errorResponse: ErrorResponse = await response.json();
            throw errorResponseFormatter({ status: response.status, message: errorResponse.error.message });
        }

        return response.json();
    }, (error: Error) => {
        throw errorResponseFormatter({ status: 503, message: error.message });
    });
};

export const post = (url: string, headers: Headers, data: {}) => {
    return fetch(url, {
        method: "POST",
        cache: "no-cache",
        headers,
        body: JSON.stringify(data),
    }).then(async (response: any) => {
        if (!response.ok) {
            const errorResponse: ErrorResponse = await response.json();
            throw errorResponseFormatter({ status: response.status, message: errorResponse.error.message });
        }

        return response.json();
    }, (error: Error) => {
        throw errorResponseFormatter({ status: 503, message: error.message });
    });
};
