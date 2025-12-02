# Briefing Técnico e Lógica da Aplicação LuxeScript AI

Este documento descreve a lógica completa, arquitetura e prompts utilizados na aplicação atual para fins de reconstrução ou migração.

## 1. Visão Geral
O **LuxeScript AI** é uma aplicação React (Client-Side) que transforma texto cru em documentos HTML semanticamente ricos e esteticamente formatados (E-books/Documentos Jurídicos) utilizando a API do Google Gemini.

### Stack Tecnológica
*   **Frontend Framework:** React 19
*   **Linguagem:** TypeScript
*   **Estilização:** Tailwind CSS (com fontes Google Fonts injetadas)
*   **IA:** Google Gemini API (`@google/genai`)
    *   `gemini-2.5-flash`: Tarefas rápidas e simples.
    *   `gemini-3-pro-preview`: Tarefas complexas que exigem "Thinking Mode" (Raciocínio) e formatação pesada.
*   **Bibliotecas Auxiliares:**
    *   `mermaid.js`: Renderização de diagramas a partir de texto.
    *   `html2pdf.js`: Conversão do DOM/HTML para arquivo PDF paginado.
    *   `lucide-react`: Ícones.

---

## 2. Fluxo de Dados (Lógica Principal)

### A. Formatador de Texto (`TextFormatter.tsx` + `geminiService.ts`)

O usuário insere um texto cru. A lógica segue este fluxo:

1.  **Entrada:** Texto cru (`inputText`) + Modo selecionado (`standard` | `juridical` | `visual_enriched`) + Idioma.
2.  **Seleção de Modelo IA:**
    *   **Padrão:** Usa `gemini-2.5-flash`.
    *   **Jurídico/Visual:** Usa `gemini-3-pro-preview`.
3.  **Construção do Prompt de Sistema:**
    *   O prompt instrui a IA a atuar como um especialista (Designer de Livros ou Jurista).
    *   **Regra de Ouro:** A saída deve ser **apenas** o `<body>` do HTML, sem tags `<html>` ou markdown (```html).
    *   **Lógica de Thinking (Jurídico):** `thinkingBudget: 32768`. O modelo "pensa" na estrutura hierárquica das cláusulas antes de gerar o HTML.
    *   **Lógica de Thinking (Visual):** `thinkingBudget: 16000`. O modelo analisa o texto para identificar onde cabem diagramas Mermaid ou "Cards" de conceito.
4.  **Processamento da Resposta:**
    *   O texto retornado é HTML puro.
    *   Se houver diagramas Mermaid (código dentro de `<div class="mermaid">`), o script `mermaid.init()` é acionado no Frontend para renderizar o gráfico SVG.
5.  **Exportação (PDF/HTML):**
    *   O HTML gerado é injetado em um container temporário.
    *   CSS específico é injetado (fontes Serif como Garamond/Bodoni).
    *   **Metadados:** Uma capa (Title Page) é gerada dinamicamente via JS baseada nos dados do modal de configurações.
    *   `html2pdf` "tira fotos" do HTML renderizado e monta o PDF.

### B. Estúdio Visual (`ImageEditor.tsx`)
*   **Lógica:** Recebe uma imagem (Base64) + Prompt do usuário.
*   **Modelo:** `gemini-2.5-flash-image`.
*   **Ação:** Envia a imagem e o texto. O Gemini retorna uma nova imagem processada.
*   **Histórico:** Um array simples (`string[]`) armazena as versões Base64 para permitir Undo/Redo.

---

## 3. Estrutura de Prompts (O "Segredo")

Ao recriar, utilize estas estruturas de prompt no System Instruction:

### Modo Padrão
> "You are a world-class book designer. Structure content with h1, h2, h3. Use blockquotes for highlights. Generate a TOC automatically at the start."

### Modo Jurídico (Elite)
> "Target audience: High-level legal professionals. Tone: Sober, elegant, academic. Highlight Latin terms in italics. Use nested lists for clauses. Hierarchy must be perfect."
> *Configuração Vital:* Ativar `thinkingConfig` para garantir que ele planeje a estrutura lógica antes de escrever.

### Modo Visual (Enriched)
> "Goal: High-end educational material.
> 1. Identify processes and insert Mermaid diagrams: `<div class='mermaid'>graph TD...</div>`.
> 2. Wrap definitions in `<div class='concept-card'>`.
> 3. Use `<div class='callout-box'>` for tips."

---

## 4. Estilização (CSS Crítico)

Para obter o visual de "Luxo", o CSS injetado no HTML final deve conter:

1.  **Tipografia:** Importar `Playfair Display` (Títulos), `EB Garamond` ou `Bodoni Moda` (Corpo).
2.  **Cores:** Usar Tons de Dourado (`#d97706`) para detalhes (bordas, linhas horizontais) e Cinza Escuro (`#111`) para texto. Nunca preto puro (`#000`).
3.  **Espaçamento:** `line-height: 1.6` ou `1.8`. Margens generosas (2.5cm).

---

## 5. Passos para Recriar do Zero

1.  Inicie um projeto Vite + React + TypeScript.
2.  Instale `@google/genai`, `lucide-react`.
3.  Adicione `mermaid.min.js` e `html2pdf.bundle.min.js` via CDN no `index.html` (ou instale via npm, mas CDN é mais fácil para renderização dinâmica).
4.  Configure o Tailwind CSS com as fontes personalizadas.
5.  Copie o arquivo `geminiService.ts` - ele é o cérebro.
6.  Crie os componentes de UI focados na experiência de "Editor de Texto" (duas colunas: Input à esquerda, Preview à direita).
