let mensagens = [];

// Lista de usuários autorizados na Whitelist
const whitelistNicks = ["Joyce", "lhbzk", "J. Epstein", "Rd4X"];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // Cabeçalhos CORS para o Roblox e o Discord acessarem sem erros
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json"
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Rota Inicial / Status
    if (url.pathname === "/" && method === "GET") {
      return new Response(JSON.stringify({ status: "API Rd4X no Cloudflare 100% Online!" }), { headers: corsHeaders });
    }

    // 2. Rota de Whitelist para o Rd4X Hub (Roblox)
    if (url.pathname === "/api/v2/whitelist" && method === "GET") {
      const nick = url.searchParams.get("nick");
      
      // Se o nick estiver na lista ou se não for passado nick especifico
      const isWhitelisted = whitelistNicks.some(n => n.toLowerCase() === (nick || "").toLowerCase());

      return new Response(JSON.stringify({
        success: true,
        whitelisted: isWhitelisted,
        nick: nick || "Desconhecido"
      }), { headers: corsHeaders });
    }

    // 3. Enviar Mensagem do Chat
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
        return new Response(JSON.stringify({ erro: "Erro no JSON" }), { status: 400, headers: corsHeaders });
      }
    }

    // 4. Ler Mensagens do Chat
    if (url.pathname === "/api/mensagens" && method === "GET") {
      return new Response(JSON.stringify(mensagens), { headers: corsHeaders });
    }

    // 5. Sistema de Tickets / Bot do Discord
    if (url.pathname === "/api/ticket" && method === "POST") {
      try {
        const body = await request.json();
        const { usuarioRoblox, assunto } = body;
        return new Response(JSON.stringify({ 
          status: "Ticket recebido no Cloudflare!", 
          usuarioRoblox, 
          assunto 
        }), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ erro: "Erro ao criar ticket" }), { status: 400, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ erro: "Rota não encontrada" }), { status: 404, headers: corsHeaders });
  },
};
