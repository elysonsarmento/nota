# 🏐 VolleyDraft - Sorteador & Avaliador de Jogadores de Vôlei

Aplicativo moderno e responsivo para organização de rachas, treinos e partidas de voleibol, com foco em balanceamento inteligente de equipes, avaliação técnica detalhada e sorteio oficial de bola/lado da quadra.

---

## 🎯 Funcionalidades Principais

### 1. Ficha Completa de Avaliação Individual
Para cada jogador, é possível cadastrar e avaliar com critérios técnicos e táticos específicos de voleibol:
* **Posição Primária**: Levantador, Ponteiro, Central, Oposto, Líbero ou Geral/Coringa.
* **Conhecimento sobre Rotação (ex: 4x2 / 5x1)**: Avaliação detalhada de 1 a 5 com descrição dos níveis (desde iniciante sem noção de rodízio até quem domina movimentação, infiltração e trocas).
* **Passe / Recepção & Defesa**: Nota de 1 a 5 (manchete, recepção de saque e leitura defensiva).
* **Levantamento**: Nota de 1 a 5 (toque e distribuição).
* **Ataque / Finalização**: Nota de 1 a 5 (potência e virada de bola).
* **Saque**: Nota de 1 a 5 (regularidade e agressividade).
* **Bloqueio**: Nota de 1 a 5 (tempo de bola e fechamento de rede).
* **Overall Calculado**: Média ponderada com destaque para rotação e passe.

### 2. Sorteio de Times Inteligente
* **Modo Inteligente (Posições + Nível)**: Distribui prioritariamente os Levantadores de maneira uniforme entre os times, além de equilibrar ponteiros, centrais e atacantes, reduzindo a diferença de médias entre as equipes.
* **Modo por Rating**: Distribui os jogadores equilibrando os níveis técnicos gerais.
* **Modo Aleatório**: Sorteio tradicional.
* **Gestão de Reservas**: Jogadores excedentes entram automaticamente na lista de suplentes/próxima rodada.
* **Copiar para WhatsApp**: Gera com 1 clique a mensagem pronta com emojis, nomes, posições e médias dos times para enviar no grupo.

### 3. Sorteio Oficial: Bola ou Lado da Quadra (Toss)
* Moeda interativa animada entre os times.
* Aplicação das regras oficiais da FIVB: o vencedor do sorteio escolhe a bola (sacar/receber) OU o lado da quadra.
* Diagrama visual da quadra mostrando rede, linhas de 3 metros e quem inicia sacando.

### 4. Gestão de Presença & Estatísticas
* **Check-in de presença rápido**: Marque com 1 toque quem foi ao jogo hoje.
* **Panorama Tático**: Gráficos da distribuição de funções no grupo e médias táticas.
* **Backup & Compartilhamento**: Exportação e importação de arquivo JSON para salvar ou transferir os dados entre organizadores.
* **Compatível com GitHub Pages**: Totalmente estático, funcionando 100% offline via LocalStorage do navegador.

---

## 🚀 Como Executar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Abra no navegador em: `http://localhost:5173`

---

## 🌐 Publicação no GitHub Pages

O projeto já está configurado com caminhos relativos (`base: './'`) e workflow do GitHub Actions em `.github/workflows/deploy.yml`.

1. Suba o repositório para o GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: VolleyDraft app"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```
2. No seu repositório no GitHub:
   * Vá em **Settings** > **Pages**.
   * Em **Build and deployment** > **Source**, selecione **GitHub Actions**.
3. O deploy será feito automaticamente e o app estará disponível na sua URL do GitHub Pages!
