export function isServerless(): boolean {
    // 1. Check for global environment variables (Cloudflare Workers, Deno)
    const globalEnv = (globalThis as any).process?.env || {};

    // 2. Explicit override via env var
    if (globalEnv.KARIN_ENV === 'serverless') return true;

    // 3. Platform specific checks
    const isAwsLambda = !!(globalEnv.AWS_LAMBDA_FUNCTION_NAME || globalEnv.LAMBDA_TASK_ROOT);
    const isVercel = !!globalEnv.VERCEL;
    const isNetlify = !!globalEnv.NETLIFY;
    // @ts-ignore
    const isDeno = typeof Deno !== 'undefined';
    const isCloudflare = (typeof (globalThis as any).WebSocketPair !== 'undefined' && !globalEnv.CF_PAGES); // Heuristic for Workers
    const isCloudflarePages = !!globalEnv.CF_PAGES;
    const isGoogleCloudFunctions = !!(globalEnv.FUNCTION_NAME || globalEnv.K_SERVICE);

    return isAwsLambda || isVercel || isNetlify || isDeno || isCloudflare || isCloudflarePages || isGoogleCloudFunctions;
}
