export interface DrizzleAdapter<DB = unknown, Client = unknown> {
    connect(): Promise<{
        db: DB;
        client: Client;
        registeredSchemas?: readonly string[]
    }>;
    disconnect(client: Client): Promise<void>;
}
