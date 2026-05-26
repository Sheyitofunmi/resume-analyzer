import type { PdfConversionResult } from "./pdf2img";

export async function convertDocxToImage(
  file: File,
): Promise<PdfConversionResult> {
  try {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

    const container = document.createElement("div");
    Object.assign(container.style, {
      position: "fixed",
      top: "0",
      left: "-9999px",
      width: "816px",
      padding: "72px 96px",
      background: "#ffffff",
      color: "#000000",
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "12pt",
      lineHeight: "1.5",
      boxSizing: "border-box",
      zIndex: "-1",
    });
    container.innerHTML = html;
    document.body.appendChild(container);

    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(container, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: 816,
      windowWidth: 816,
    });

    document.body.removeChild(container);

    const originalName = file.name.replace(/\.docx?$/i, "");

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: new File([blob], `${originalName}.png`, {
                type: "image/png",
              }),
              pageCount: 1,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              pageCount: 1,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0,
      );
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      pageCount: 0,
      error: `Failed to convert DOCX: ${err}`,
    };
  }
}
