import { broadcastUnauthorized, clearAuthToken, getAuthToken } from "@/lib/auth";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_BASE_URL ??
    process.env.API_URL ??
    "";

if (process.env.NODE_ENV !== "production" && !API_BASE_URL) {
    const g = globalThis as any;
    const warnKey = "__CHAT_ADMIN_API_BASE_URL_WARNED__";
    if (!g[warnKey]) {
        g[warnKey] = true;
        console.warn(
            "API base URL is not set. Define NEXT_PUBLIC_API_BASE_URL (or NEXT_PUBLIC_API_URL) in .env.local and restart the dev server."
        );
    }
}

function withBaseUrl(path: string) {
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = API_BASE_URL;
    if (!baseUrl) return path;

    const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
}

export const API = {
    auth: {
        login: withBaseUrl("/api/auth/login"),
    },
    users: {
        list: withBaseUrl("/api/users"),
        get: (id: string) => withBaseUrl(`/api/users/${id}`),
    },
    categories: {
        list: withBaseUrl("/api/categories"),
        get: (id: string) => withBaseUrl(`/api/categories/${id}`),
        create: withBaseUrl("/api/categories"),
        update: (id: string) => withBaseUrl(`/api/categories/${id}`),
        delete: (id: string) => withBaseUrl(`/api/categories/${id}`),
    },
    characters: {
        list: withBaseUrl("/api/characters"),
        get: (id: string) => withBaseUrl(`/api/characters/${id}`),
        create: withBaseUrl("/api/characters"),
        update: (id: string) => withBaseUrl(`/api/characters/${id}`),
        delete: (id: string) => withBaseUrl(`/api/characters/${id}`),
    },
    plans: {
        list: withBaseUrl("/api/plans"),
        get: (id: string) => withBaseUrl(`/api/plans/${id}`),
        create: withBaseUrl("/api/plans"),
        update: (id: string) => withBaseUrl(`/api/plans/${id}`),
        delete: (id: string) => withBaseUrl(`/api/plans/${id}`),
    },
    invoices: {
        list: withBaseUrl("/api/invoices"),
        get: (id: string) => withBaseUrl(`/api/invoices/${id}`),
    },
    messages: {
        list: withBaseUrl("/api/messages"),
        get: (id: string) => withBaseUrl(`/api/messages/${id}`),
    },
    conversations: {
        list: withBaseUrl("/api/conversations"),
        get: (id: string) => withBaseUrl(`/api/conversations/${id}`),
    },
} as const;

export type SortOrder = "asc" | "desc";

export type PrimitiveFilterValue = string | number | boolean;
export type FilterValue =
    | PrimitiveFilterValue
    | null
    | undefined
    | Array<PrimitiveFilterValue>;

export type ListParams = {
    page?: number;
    limit?: number;
    search?: string;
    /** Backend expects `sort` */
    sort?: string;
    /** Backend expects `order` */
    order?: SortOrder;
    /** Back-compat: will be mapped to `sort` */
    sortBy?: string;
    /** Back-compat: will be mapped to `order` */
    sortOrder?: SortOrder;
    filters?: Record<string, FilterValue>;
};

export type PaginatedResult<T> = {
    items: T[];
    page: number;
    limit: number;
    total?: number;
    totalPages?: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
};

function buildSearchParams(params: ListParams = {}) {
    const sp = new URLSearchParams();
    if (params.page != null) sp.set("page", String(params.page));
    if (params.limit != null) sp.set("limit", String(params.limit));
    if (params.search) sp.set("search", params.search);

    // NestJS PaginationQueryDto: `sort` + `order`
    const sort = params.sort ?? params.sortBy;
    const order = params.order ?? params.sortOrder;
    if (sort) sp.set("sort", sort);
    if (order) sp.set("order", order);

    const filters = params.filters ?? {};
    for (const [key, value] of Object.entries(filters)) {
        if (value == null) continue;
        if (Array.isArray(value)) {
            for (const v of value) sp.append(key, String(v));
            continue;
        }
        sp.set(key, String(value));
    }

    return sp;
}

function withQuery(url: string, params?: ListParams) {
    const sp = buildSearchParams(params);
    const qs = sp.toString();
    if (!qs) return url;
    return url.includes("?") ? `${url}&${qs}` : `${url}?${qs}`;
}

async function fetchJson<T>(
    url: string,
    init?: RequestInit & { signal?: AbortSignal }
): Promise<T> {
    const token = getAuthToken();

    const res = await fetch(url, {
        method: init?.method ?? "GET",
        headers: {
            Accept: "application/json",
            ...(init?.body ? { "Content-Type": "application/json" } : null),
            ...(token ? { Authorization: `Bearer ${token}` } : null),
            ...(init?.headers ?? {}),
        },
        body: init?.body,
        credentials: "include",
        cache: "no-store",
        signal: init?.signal,
    });

    if (res.status === 401 || res.status === 403) {
        clearAuthToken();
        broadcastUnauthorized();
    }

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
            `API request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`
        );
    }

    return (await res.json()) as T;
}

function normalizePaginatedResult<T>(
    raw: unknown,
    fallback: { page: number; limit: number }
): PaginatedResult<T> {
    const page = fallback.page;
    const limit = fallback.limit;

    const asAny = raw as any;
    let items: T[] = [];
    if (Array.isArray(raw)) {
        items = raw as T[];
    } else if (asAny?.items && Array.isArray(asAny.items)) {
        items = asAny.items as T[];
    } else if (asAny?.data && Array.isArray(asAny.data)) {
        items = asAny.data as T[];
    } else if (asAny?.results && Array.isArray(asAny.results)) {
        items = asAny.results as T[];
    }

    const meta = asAny?.meta ?? asAny?.pagination ?? undefined;
    const total: number | undefined =
        asAny?.total ??
        asAny?.totalCount ??
        asAny?.count ??
        meta?.total ??
        meta?.totalCount ??
        meta?.count;

    const resolvedPage: number =
        asAny?.page ?? meta?.page ?? meta?.currentPage ?? page;
    const resolvedLimit: number =
        asAny?.limit ?? asAny?.pageSize ?? meta?.limit ?? meta?.pageSize ?? limit;

    const totalPages: number | undefined =
        asAny?.totalPages ?? meta?.totalPages ??
        (typeof total === "number" && resolvedLimit > 0
            ? Math.max(1, Math.ceil(total / resolvedLimit))
            : undefined);

    const hasPreviousPage = resolvedPage > 1;
    const hasNextPage =
        typeof totalPages === "number"
            ? resolvedPage < totalPages
            : items.length === resolvedLimit;

    return {
        items,
        page: resolvedPage,
        limit: resolvedLimit,
        total,
        totalPages,
        hasPreviousPage,
        hasNextPage,
    };
}

export async function listResource<T>(
    url: string,
    params: ListParams = {},
    init?: RequestInit & { signal?: AbortSignal }
): Promise<PaginatedResult<T>> {
    const fallback = {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
    };

    const raw = await fetchJson<unknown>(withQuery(url, params), init);
    return normalizePaginatedResult<T>(raw, fallback);
}

function unwrapDataObject<T>(raw: unknown): T {
    const asAny = raw as any;
    if (asAny && typeof asAny === "object" && !Array.isArray(asAny) && asAny.data && !Array.isArray(asAny.data)) {
        return asAny.data as T;
    }
    return raw as T;
}

export async function getResource<T>(
    url: string,
    init?: RequestInit & { signal?: AbortSignal }
): Promise<T> {
    const raw = await fetchJson<unknown>(url, init);
    return unwrapDataObject<T>(raw);
}

export type LoginRequest = {
    email: string;
    password: string;
};

export async function loginAdmin(
    body: LoginRequest,
    init?: RequestInit & { signal?: AbortSignal }
): Promise<unknown> {
    return fetchJson<unknown>(API.auth.login, {
        ...init,
        method: "POST",
        body: JSON.stringify(body),
    });
}

export const listUsers = (params?: ListParams, init?: RequestInit & { signal?: AbortSignal }) =>
    listResource(API.users.list, params, init);
export const listCategories = (params?: ListParams, init?: RequestInit & { signal?: AbortSignal }) =>
    listResource(API.categories.list, params, init);
export const listCharacters = (params?: ListParams, init?: RequestInit & { signal?: AbortSignal }) =>
    listResource(API.characters.list, params, init);
export const listPlans = (params?: ListParams, init?: RequestInit & { signal?: AbortSignal }) =>
    listResource(API.plans.list, params, init);
export const listInvoices = (params?: ListParams, init?: RequestInit & { signal?: AbortSignal }) =>
    listResource(API.invoices.list, params, init);
export const listMessages = (params?: ListParams, init?: RequestInit & { signal?: AbortSignal }) =>
    listResource(API.messages.list, params, init);
export const listConversations = (params?: ListParams, init?: RequestInit & { signal?: AbortSignal }) =>
    listResource(API.conversations.list, params, init);

export const getUser = (id: string, init?: RequestInit & { signal?: AbortSignal }) =>
    getResource<any>(API.users.get(id), init);

export const getCategory = (id: string, init?: RequestInit & { signal?: AbortSignal }) =>
    getResource<any>(API.categories.get(id), init);

export const getCharacter = (id: string, init?: RequestInit & { signal?: AbortSignal }) =>
    getResource<any>(API.characters.get(id), init);

export const getPlan = (id: string, init?: RequestInit & { signal?: AbortSignal }) =>
    getResource<any>(API.plans.get(id), init);

export const getInvoice = (id: string, init?: RequestInit & { signal?: AbortSignal }) =>
    getResource<any>(API.invoices.get(id), init);

export const getMessage = (id: string, init?: RequestInit & { signal?: AbortSignal }) =>
    getResource<any>(API.messages.get(id), init);

export const getConversation = (id: string, init?: RequestInit & { signal?: AbortSignal }) =>
    getResource<any>(API.conversations.get(id), init);

export default API;