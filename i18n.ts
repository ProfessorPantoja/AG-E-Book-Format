import { Language } from "./types";

export const translations = {
  en: {
    navbar: {
      subtitle: "AI Publishing Studio",
      formatter: "Text Formatter",
      visual: "Visual Studio",
      pro: "Pro Edition"
    },
    formatter: {
      title: "Raw Content",
      placeholder: "Paste your raw manuscript or notes here... (Rich text from Word/Docs supported)",
      buttonStandard: "Format to Luxury E-book",
      buttonJuridical: "Elite Juridical Format",
      buttonSettings: "Book Settings",
      previewTitle: "Luxury Preview",
      export: "Export HTML",
      downloadPdf: "Download PDF",
      emptyState: "Your formatted masterpiece will appear here.",
      processing: "Designing layout...",
      thinking: "Analyzing structure & designing visuals...",
      error: "Failed to format text. Please try again.",
      selectFont: "Select Typography"
    },
    settings: {
      title: "Book Configuration",
      metadata: "Metadata",
      bookTitle: "Book Title",
      author: "Author",
      publisher: "Publisher",
      year: "Year",
      layout: "Header & Footer",
      headerText: "Header Text",
      footerText: "Footer Text",
      pageNumbers: "Show Page Numbers",
      numberCover: "Number Cover Page",
      close: "Close"
    }
  },
  pt: {
    navbar: {
      subtitle: "Estúdio de Publicação IA",
      formatter: "Formatador de Texto",
      visual: "Estúdio Visual",
      pro: "Edição Pro"
    },
    formatter: {
      title: "Conteúdo Bruto",
      placeholder: "Cole seu manuscrito ou notas aqui... (Suporta formatação do Word/Google Docs)",
      buttonStandard: "Formatar E-book de Luxo",
      buttonJuridical: "Formatação Jurídica Elite",
      buttonSettings: "Config. Livro",
      previewTitle: "Visualização de Luxo",
      export: "Exportar HTML",
      downloadPdf: "Baixar PDF",
      emptyState: "Sua obra-prima formatada aparecerá aqui.",
      processing: "Projetando layout...",
      thinking: "Analisando estrutura jurídica e visual...",
      error: "Falha ao formatar texto. Tente novamente.",
      selectFont: "Selecionar Tipografia"
    },
    settings: {
      title: "Configuração do Livro",
      metadata: "Metadados",
      bookTitle: "Título do Livro",
      author: "Autor",
      publisher: "Editora",
      year: "Ano",
      layout: "Cabeçalho e Rodapé",
      headerText: "Texto do Cabeçalho",
      footerText: "Texto do Rodapé",
      pageNumbers: "Mostrar Números de Página",
      numberCover: "Numerar Capa",
      close: "Fechar"
    }
  }
};

export const t = (lang: Language, key: string): string => {
  const keys = key.split('.');
  let value: any = translations[lang];
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key;
    }
  }
  return value as string;
};