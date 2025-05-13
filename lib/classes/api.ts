export type ApiResponse<T> = {
    data?: T;
    error?: string;
};

export type ObjectIdApiResponse = ApiResponse<string>
export type NoDataApiResponse = ApiResponse<null>