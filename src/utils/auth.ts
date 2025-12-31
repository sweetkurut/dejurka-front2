const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const saveTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
    try {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        // Ignore error
    }
};

export const getAccessToken = async (): Promise<string | null> => {
    try {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
        return null;
    }
};

export const getRefreshToken = async (): Promise<string | null> => {
    try {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
        return null;
    }
};

export const removeTokens = async (): Promise<void> => {
    try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
        // Ignore error
    }
};

export const hasTokens = async (): Promise<boolean> => {
    const refreshToken = await getRefreshToken();
    return !!refreshToken;
};

export const verifyAuthWithDelay = async (minDelay = 500): Promise<boolean> => {
    const startTime = Date.now();

    try {
        const hasToken = await hasTokens();
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDelay - elapsed);

        if (remaining > 0) {
            await new Promise((resolve) => setTimeout(resolve, remaining));
        }

        return hasToken;
    } catch {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDelay - elapsed);

        if (remaining > 0) {
            await new Promise((resolve) => setTimeout(resolve, remaining));
        }

        return false;
    }
};
