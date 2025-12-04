export interface RedisAdapter<Client = any> {
    /**
     * Inicializa la conexión y devuelve el cliente de Redis.
     */
    connect(): Promise<Client> | Client;

    /**
     * Cierra la conexión de forma limpia.
     */
    disconnect(client: Client): Promise<void> | void;
}