let mensagens = [];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // Cabeçalhos para permitir o Roblox acessar sem erro de CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json"
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Rota Inicial / Status
    if (url.pathname === "/" && method === "GET") {
      return new Response(JSON.stringify({ status: "Cloudflare Worker do Rd4X Online!" }), { headers: corsHeaders });
    }

    // Enviar Mensagem do Chat (WhatsApp do Roblox)
    if (url.pathname === "/api/enviar" && method === "POST") {
      try {
        const body = await request.json();
        const { usuario, texto, hora } = body;

        if (usuario && texto) {
          const novaMsg = { usuario, texto, hora, id: Date.now() };
          mensagens.push(novaMsg);
          if (mensagens.length > 50) mensagens.shift();

          return new Response(JSON.stringify({ status: "sucesso", msg: novaMsg }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ erro: "Dados inválidos" }), { status: 400, headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ erro: "Erro ao processar JSON" }), { status: 400, headers: corsHeaders });
      }
    }

    // Ler Mensagens no Roblox
    if (url.pathname === "/api/mensagens" && method === "GET") {
      return new Response(JSON.stringify(mensagens), { headers: corsHeaders });
    }

    // Sistema de Tickets
    if (url.pathname === "/api/ticket" && method === "POST") {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== "SUA_CHAVE_PRIVADA_RD4X") {
        return new Response(JSON.stringify({ erro: "Acesso negado!" }), { status: 401, headers: corsHeaders });
      }

      try {
        const body = await request.json();
        const { usuarioRoblox, assunto } = body;
        return new Response(JSON.stringify({ status: "Ticket recebido com sucesso!", usuarioRoblox, assunto }), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ erro: "Erro no ticket" }), { status: 400, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ erro: "Rota não encontrada" }), { status: 404, headers: corsHeaders });
  },
};
