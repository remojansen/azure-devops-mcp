import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "crypto";
import { createServer, type Server, IncomingMessage } from "node:http";
import { AddressInfo } from "net";

export async function createAuthServer(mcpServer: McpServer): Promise<{
  server: Server;
  transport: StreamableHTTPServerTransport;
  mcpServer: McpServer;
  baseUrl: URL;
}> {

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    enableJsonResponse: true,
  });

  await mcpServer.connect(transport);

  const server = createServer(async (req: IncomingMessage & { auth?: AuthInfo }, res) => {
    try {
        req.auth = { token: req.headers["authorization"]?.split(" ")[1] } as AuthInfo;
        await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling request:", error);
      if (!res.headersSent) res.writeHead(500).end();
    }
  });

  const baseUrl = await new Promise<URL>((resolve) => {
    server.listen(3000, "127.0.0.1", () => {
      const addr = server.address() as AddressInfo;
      resolve(new URL(`http://127.0.0.1:${addr.port}`));
    });
  });

  return { server, transport, mcpServer, baseUrl };
}