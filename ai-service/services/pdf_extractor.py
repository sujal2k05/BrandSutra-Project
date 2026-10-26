import fitz  # PyMuPDF
from typing import Dict, Any

class PdfExtractor:
    """
    Safely extract high-fidelity text from PDF brand guidelines and policy manuals.
    """

    @staticmethod
    def extract_text(file_bytes: bytes, filename: str) -> Dict[str, Any]:
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            page_count = len(doc)
            extracted_pages = []

            for page_num in range(page_count):
                page = doc.load_page(page_num)
                page_text = page.get_text("text")
                if page_text:
                    clean_page = page_text.strip()
                    if clean_page:
                        extracted_pages.append(f"--- Page {page_num + 1} ---\n{clean_page}")

            doc.close()
            full_text = "\n\n".join(extracted_pages)

            return {
                "filename": filename,
                "page_count": page_count,
                "extracted_text": full_text,
                "char_count": len(full_text)
            }
        except Exception as e:
            return {
                "filename": filename,
                "page_count": 0,
                "extracted_text": f"Error extracting text from PDF: {str(e)}",
                "char_count": 0
            }
